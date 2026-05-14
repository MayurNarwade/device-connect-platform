import { useUIStore } from '../stores/useUIStore';
import { WS_BASE } from '../utils/constants';

let ws = null;
let messageHandlers = {};
let currentToken = null;
let currentSessionId = null;
let reconnectTimer = null;

export function connectSignaling(token, sessionId) {
  // Store for reconnection
  currentToken = token;
  currentSessionId = sessionId;

  // Build WebSocket URL using WS_BASE (relative or absolute)
  const wsUrl = `${WS_BASE}/signal?token=${token}`;
  console.log('Connecting to signaling:', wsUrl);
  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log('✅ Signaling connected');
    if (reconnectTimer) clearTimeout(reconnectTimer);
    // Send join message with device name
    sendSignal({
      type: 'join',
      payload: {
        deviceName: /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop'
      }
    });
  };

  ws.onmessage = (event) => {
    let data;
    try {
      data = JSON.parse(event.data);
    } catch (err) {
      return;
    }

    if (data.type === 'pong') return;

    // Forward to registered handlers
    if (messageHandlers[data.type]) {
      messageHandlers[data.type].forEach(handler => handler(data));
    }

    // Also dispatch as DOM event (used by WebRTC manager)
    window.dispatchEvent(new CustomEvent('signal', { detail: data }));
  };

  ws.onclose = (event) => {
    console.warn('Signaling closed', event.code, event.reason);
    useUIStore.getState().addToast('Connection lost. Reconnecting...', 'error');
    // Attempt reconnect after delay
    if (reconnectTimer) clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(() => {
      if (ws.readyState === WebSocket.CLOSED && currentSessionId) {
        console.log('Attempting to reconnect signaling...');
        connectSignaling(currentToken, currentSessionId);
      }
    }, 2000);
  };

  ws.onerror = (err) => {
    console.error('Signaling error', err);
  };
}

export function sendSignal(message) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
    console.log('📤 Signaling sent:', message.type);
  } else {
    console.warn('Cannot send signal, socket not open');
  }
}

export function onSignal(type, handler) {
  if (!messageHandlers[type]) messageHandlers[type] = [];
  messageHandlers[type].push(handler);
}

export function offSignal(type, handler) {
  if (messageHandlers[type]) {
    messageHandlers[type] = messageHandlers[type].filter(h => h !== handler);
  }
}

export function disconnectSignaling() {
  if (reconnectTimer) clearTimeout(reconnectTimer);
  if (ws) {
    ws.close();
    ws = null;
  }
  currentToken = null;
  currentSessionId = null;
  messageHandlers = {};
}
