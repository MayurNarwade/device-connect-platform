import { useSessionStore } from '../stores/useSessionStore';
import { useClipboardStore } from '../stores/useClipboardStore';
import { useMessageStore } from '../stores/useMessageStore';
import { useTransferStore } from '../stores/useTransferStore';
import { sendSignal, onSignal, offSignal } from './signaling';
import { FileTransferSender, FileTransferOverTextChannel } from './file-transfer';

const MAX_FILE_SIZE_MB = 1024;
const KEEPALIVE_INTERVAL = 15000;

export class WebRTCManager {
  constructor() {
    if (WebRTCManager.instance) return WebRTCManager.instance;
    WebRTCManager.instance = this;

    this.pc = null;
    this.isInitiator = false;
    this._textChannel = null;
    this._clipboardChannel = null;
    this._ready = false;
    this._messageQueue = [];
    this._clipboardQueue = [];
    this._sdpHandled = false;
    this._initialized = false;
    this._keepaliveInterval = null;
    this._cleanupFns = [];
    this._role = null;
    this._fileTransferManager = null;
  }
  reset() {
  console.log('🔄 Resetting WebRTCManager for new session');
  this.destroy();
  // Ensure all flags are cleared
  this._initialized = false;
  this._role = null;
  this._sdpHandled = false;
  this._ready = false;
  this._textChannel = null;
  this._clipboardChannel = null;
  this._messageQueue = [];
  this._clipboardQueue = [];
  this._fileTransferManager = null;
}

  async initialize(role, forceNew = false) {
  if (forceNew) this.reset();
  if (this._initialized && this._role === role) {
    console.log('WebRTCManager already initialized, skipping');
    return;
  }
  // rest of the method unchanged

    if (this._initialized && this._role !== role) {
      this.destroy();
    }

    this._initialized = true;
    this._role = role;
    this.isInitiator = role === 'host';

    const iceServers = [{ urls: 'stun:stun.l.google.com:19302' }];
    this.pc = new RTCPeerConnection({ iceServers });

    this.pc.onicecandidate = (e) => {
      if (e.candidate) {
        console.log('📡 Sending ICE candidate');
        sendSignal({ type: 'ice_candidate', payload: e.candidate });
      }
    };

    const iceHandler = (data) => {
      if (!this.pc || this.pc.signalingState === 'closed') return;
      console.log('📡 Received ICE candidate');
      this.pc.addIceCandidate(new RTCIceCandidate(data.payload)).catch(e => console.warn(e));
    };
    onSignal('ice_candidate', iceHandler);
    this._cleanupFns.push(() => offSignal('ice_candidate', iceHandler));

    this.pc.oniceconnectionstatechange = () => {
      const state = this.pc.iceConnectionState;
      console.log('🔥 ICE connection state:', state);
      if (state === 'connected') {
        this._ready = true;
        useSessionStore.getState().setWebRTCReady(true);
      } else if (state === 'failed' || state === 'disconnected') {
        this._ready = false;
        useSessionStore.getState().setWebRTCReady(false);
      }
    };

    this.pc.ondatachannel = (event) => {
      const ch = event.channel;
      console.log(`📨 Incoming data channel: ${ch.label}`);
      if (ch.label === 'text') {
        this._setupTextChannel(ch);
      } else if (ch.label === 'clipboard') {
        this._setupClipboardChannel(ch);
      }
    };

    if (this.isInitiator) {
      const textChannel = this.pc.createDataChannel('text');
      const clipChannel = this.pc.createDataChannel('clipboard');
      this._setupTextChannel(textChannel);
      this._setupClipboardChannel(clipChannel);

      const answerHandler = async (data) => {
        if (this._sdpHandled || !this.pc || this.pc.signalingState === 'closed') return;
        this._sdpHandled = true;
        console.log('📩 Received answer');
        await this.pc.setRemoteDescription(new RTCSessionDescription(data.payload));
      };
      onSignal('answer', answerHandler);
      this._cleanupFns.push(() => offSignal('answer', answerHandler));

      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);
      console.log('📤 Sending offer');
      sendSignal({ type: 'offer', payload: offer });
    } else {
      const offerHandler = async (data) => {
        if (this._sdpHandled || !this.pc || this.pc.signalingState === 'closed') return;
        this._sdpHandled = true;
        console.log('📩 Received offer');
        await this.pc.setRemoteDescription(new RTCSessionDescription(data.payload));
        const answer = await this.pc.createAnswer();
        await this.pc.setLocalDescription(answer);
        console.log('📤 Sending answer');
        sendSignal({ type: 'answer', payload: answer });
      };
      onSignal('offer', offerHandler);
      this._cleanupFns.push(() => offSignal('offer', offerHandler));
    }

    this._startKeepAlive();
  }

  _setupTextChannel(ch) {
    this._textChannel = ch;
    ch.binaryType = 'arraybuffer';

    // Create file transfer manager that handles both files and plain text
    const onFileComplete = (transferId, blob, fileName) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      useTransferStore.getState().setStatus(transferId, 'completed');
    };
    const onFileProgress = (transferId, progress) => {
      useTransferStore.getState().updateProgress(transferId, progress, 0);
    };
    const onTextMessage = (text) => {
      if (text !== '__ping__') {
        console.log('📥 Received text:', text);
        useMessageStore.getState().addMessage(text, false);
      }
    };

    this._fileTransferManager = new FileTransferOverTextChannel(
      ch,
      onFileComplete,
      onFileProgress,
      onTextMessage
    );

    // Replace the channel's onmessage
    ch.onmessage = (e) => {
      const isBinary = e.data instanceof ArrayBuffer;
      this._fileTransferManager.handleMessage(isBinary ? e.data : e.data, isBinary);
    };

    ch.onopen = () => {
      console.log('✅ Text channel OPEN');
      this._ready = true;
      useSessionStore.getState().setWebRTCReady(true);
      if (this._messageQueue.length) {
        const queue = [...this._messageQueue];
        this._messageQueue = [];
        queue.forEach(msg => {
          if (ch.readyState === 'open') {
            ch.send(msg);
            useMessageStore.getState().addMessage(msg, true);
          } else {
            this._messageQueue.push(msg);
          }
        });
      }
    };
    ch.onclose = () => {
      console.warn('❌ Text channel CLOSED');
      this._textChannel = null;
      this._ready = false;
      useSessionStore.getState().setWebRTCReady(false);
    };
    ch.onerror = (err) => console.error('Text channel error:', err);
  }

  _setupClipboardChannel(ch) {
    this._clipboardChannel = ch;
    ch.onopen = () => {
      console.log('✅ Clipboard channel OPEN');
      if (this._clipboardQueue.length) {
        const queue = [...this._clipboardQueue];
        this._clipboardQueue = [];
        queue.forEach(content => {
          if (ch.readyState === 'open') {
            ch.send(JSON.stringify({ type: 'clipboard_update', content }));
          } else {
            this._clipboardQueue.push(content);
          }
        });
      }
    };
    ch.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === 'clipboard_update') {
          useClipboardStore.getState().setLastSync(msg.content);
        }
      } catch (err) {}
    };
  }

  _startKeepAlive() {
    if (this._keepaliveInterval) clearInterval(this._keepaliveInterval);
    this._keepaliveInterval = setInterval(() => {
      if (this._textChannel && this._textChannel.readyState === 'open') {
        try {
          this._textChannel.send('__ping__');
        } catch (e) {}
      }
    }, KEEPALIVE_INTERVAL);
  }

  isReady() {
    return this._textChannel && this._textChannel.readyState === 'open';
  }

  sendText(text) {
    if (this.isReady()) {
      this._textChannel.send(text);
      useMessageStore.getState().addMessage(text, true);
      console.log('📤 Sent text:', text);
    } else {
      this._messageQueue.push(text);
    }
  }

  sendClipboard(content) {
    if (this._clipboardChannel?.readyState === 'open') {
      this._clipboardChannel.send(JSON.stringify({ type: 'clipboard_update', content }));
    } else if (this._clipboardChannel) {
      this._clipboardQueue.push(content);
    }
  }

  sendFile(file) {
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      alert(`File too large (max ${MAX_FILE_SIZE_MB}MB)`);
      return;
    }
    if (!this.isReady()) {
      alert('WebRTC not ready yet.');
      return;
    }

    const transferId = `file-${Date.now()}-${Math.random().toString(36)}`;
    // Store file object in transfer store for possible retry
    useTransferStore.getState().addTransfer(transferId, {
      name: file.name,
      size: file.size,
      type: 'file',
    }, file);

    const sender = new FileTransferSender(
      this._textChannel,
      file,
      () => {
        useTransferStore.getState().setStatus(transferId, 'completed');
      },
      (id, progress) => {
        useTransferStore.getState().updateProgress(id, progress, 0);
      }
    );
    sender.start();
  }

  destroy() {
    if (this._keepaliveInterval) clearInterval(this._keepaliveInterval);
    this._cleanupFns.forEach(fn => fn());
    this._cleanupFns = [];
    if (this._textChannel) {
      try { this._textChannel.close(); } catch(e) {}
      this._textChannel = null;
    }
    if (this._clipboardChannel) {
      try { this._clipboardChannel.close(); } catch(e) {}
      this._clipboardChannel = null;
    }
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
    this._ready = false;
    this._initialized = false;
    this._role = null;
    this._sdpHandled = false;
    useSessionStore.getState().setWebRTCReady(false);
    console.log('🧹 WebRTCManager destroyed');
  }
}

const webrtcManager = new WebRTCManager();
export default webrtcManager;