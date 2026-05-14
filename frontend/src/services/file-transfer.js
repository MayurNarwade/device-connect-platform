import { CHUNK_SIZE, BUFFERED_AMOUNT_THRESHOLD } from '../utils/constants';
import { useTransferStore } from '../stores/useTransferStore';
import { computeSHA256 } from './integrity';

/**
 * Multiplexed file transfer over a single data channel.
 * Sends file metadata, chunks, and end marker.
 * Plain text messages are forwarded to a callback.
 */
export class FileTransferOverTextChannel {
  constructor(dataChannel, onFileComplete, onFileProgress, onTextMessage) {
    this.channel = dataChannel;
    this.onFileComplete = onFileComplete;
    this.onFileProgress = onFileProgress;
    this.onTextMessage = onTextMessage;
    this.receiveBuffer = new Map(); // transferId -> { chunks, totalChunks, meta, receivedSize }
  }

  async sendFile(file, transferId, onSendProgress) {
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const meta = {
      type: 'file_meta',
      transferId,
      name: file.name,
      size: file.size,
      totalChunks,
    };
    this.channel.send(JSON.stringify(meta));

    let lastProgressTime = 0;
    const THROTTLE_MS = 100;

    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const blob = file.slice(start, end);
      const buffer = await blob.arrayBuffer();
      const hash = await computeSHA256(buffer);

      const chunkHeader = {
        type: 'file_chunk',
        transferId,
        index: i,
        total: totalChunks,
        hash: Array.from(new Uint8Array(hash)),
      };
      const headerStr = JSON.stringify(chunkHeader);
      const headerBytes = new TextEncoder().encode(headerStr);
      const payload = new Uint8Array(buffer);

      const totalLen = 4 + headerBytes.length + payload.length;
      const msg = new Uint8Array(totalLen);
      const dv = new DataView(msg.buffer);
      dv.setUint32(0, headerBytes.length);
      msg.set(headerBytes, 4);
      msg.set(payload, 4 + headerBytes.length);

      this.channel.send(msg.buffer);

      // Throttled progress update
      const now = Date.now();
      if (now - lastProgressTime >= THROTTLE_MS || i === totalChunks - 1) {
        lastProgressTime = now;
        const progress = Math.round(((i + 1) / totalChunks) * 100);
        if (onSendProgress) onSendProgress(transferId, progress);
        if (this.onFileProgress) this.onFileProgress(transferId, progress);
      }

      // Flow control
      while (this.channel.bufferedAmount > BUFFERED_AMOUNT_THRESHOLD) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }

    this.channel.send(JSON.stringify({ type: 'file_end', transferId }));
    if (onSendProgress) onSendProgress(transferId, 100);
  }

  handleMessage(data, isBinary) {
    if (isBinary) {
      const view = new DataView(data);
      const headerLen = view.getUint32(0);
      const headerBytes = new Uint8Array(data, 4, headerLen);
      const headerStr = new TextDecoder().decode(headerBytes);
      const header = JSON.parse(headerStr);
      const payload = new Uint8Array(data, 4 + headerLen);

      if (header.type === 'file_chunk') {
        const { transferId, index, total } = header;
        let transfer = this.receiveBuffer.get(transferId);
        if (!transfer) {
          transfer = { chunks: [], totalChunks: total, receivedSize: 0, meta: null };
          this.receiveBuffer.set(transferId, transfer);
        }
        transfer.chunks[index] = payload;
        transfer.receivedSize += payload.length;

        const progress = Math.round(((index + 1) / total) * 100);
        if (this.onFileProgress) this.onFileProgress(transferId, progress);

        const receivedCount = transfer.chunks.filter(c => c !== undefined).length;
        if (receivedCount === total) {
          const complete = new Uint8Array(transfer.receivedSize);
          let offset = 0;
          for (let i = 0; i < total; i++) {
            if (transfer.chunks[i]) {
              complete.set(transfer.chunks[i], offset);
              offset += transfer.chunks[i].length;
            }
          }
          const blob = new Blob([complete]);
          const meta = transfer.meta;
          if (meta && this.onFileComplete) {
            this.onFileComplete(transferId, blob, meta.name);
          }
          this.receiveBuffer.delete(transferId);
        }
      }
    } else {
      // Text message: could be file meta, file end, or plain chat
      try {
        const obj = JSON.parse(data);
        if (obj.type === 'file_meta') {
          const { transferId, name, size, totalChunks } = obj;
          let transfer = this.receiveBuffer.get(transferId);
          if (!transfer) {
            transfer = { chunks: [], totalChunks, receivedSize: 0, meta: { name, size } };
            this.receiveBuffer.set(transferId, transfer);
          } else {
            transfer.meta = { name, size };
          }
          useTransferStore.getState().addTransfer(transferId, { name, size, type: 'file' });
        } else if (obj.type === 'file_end') {
          // optional finalization
        } else {
          // Not a file message → normal text
          if (this.onTextMessage) this.onTextMessage(data);
        }
      } catch (err) {
        // Not JSON → normal text
        if (this.onTextMessage) this.onTextMessage(data);
      }
    }
  }
}

// ---------- Sender wrapper (compatible with existing code) ----------
export class FileTransferSender {
  constructor(channel, file, onFinish, onProgress) {
    this.channel = channel;
    this.file = file;
    this.onFinish = onFinish;
    this.onProgress = onProgress;
    this.transferId = `file-${Date.now()}-${Math.random().toString(36)}`;
  }

  async start() {
    const manager = new FileTransferOverTextChannel(this.channel, null, null, null);
    await manager.sendFile(this.file, this.transferId, (id, prog) => {
      if (this.onProgress) this.onProgress(id, prog);
    });
    if (this.onFinish) this.onFinish();
  }
}

// ---------- Receiver wrapper (for backward compatibility, though not used in new code) ----------
export class FileTransferReceiver {
  constructor(channel, onComplete) {
    const onFileComplete = (transferId, blob, fileName) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      if (onComplete) onComplete(blob);
      useTransferStore.getState().setStatus(transferId, 'completed');
    };
    const onProgress = (transferId, progress) => {
      useTransferStore.getState().updateProgress(transferId, progress, 0);
    };
    this.manager = new FileTransferOverTextChannel(channel, onFileComplete, onProgress, null);
    // Intercept the channel's onmessage
    const originalOnMessage = channel.onmessage;
    channel.onmessage = (e) => {
      const isBinary = e.data instanceof ArrayBuffer;
      this.manager.handleMessage(isBinary ? e.data : e.data, isBinary);
      if (originalOnMessage && !isBinary) originalOnMessage(e);
    };
  }
}