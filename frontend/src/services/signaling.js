// frontend/src/services/signaling.js
let socket = null;
let messageHandlers = new Map();
let pendingMessages = [];
let reconnectTimer = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

export function connectSignaling(token, sessionId) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    console.warn('Signaling already connected, closing old');
    socket.close();
  }
  
  const wsUrl = `/ws/signal?token=${token}`;
  console.log('Connecting to signaling:', wsUrl);
  socket = new WebSocket(wsUrl);
  
  socket.onopen = () => {
    console.log('✅ Signaling connected');
    reconnectAttempts = 0;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    // Flush pending messages
    if (pendingMessages.length) {
      console.log(`📤 Flushing ${pendingMessages.length} pending signals`);
      pendingMessages.forEach(msg => {
        socket.send(JSON.stringify(msg));
        console.log('📤 Signaling sent (flushed):', msg.type);
      });
      pendingMessages = [];
    }
  };
  
  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('📨 Signaling received:', data.type);
      const handler = messageHandlers.get(data.type);
      if (handler) handler(data);
      else console.warn('No handler for signal type:', data.type);
    } catch (err) {
      console.error('Failed to parse signaling message:', err);
    }
  };
  
  socket.onerror = (err) => {
    console.error('Signaling error:', err);
  };
  
  socket.onclose = () => {
    console.warn('Signaling closed');
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectTimer = setTimeout(() => {
        reconnectAttempts++;
        console.log(`Reconnecting signaling (attempt ${reconnectAttempts})...`);
        connectSignaling(token, sessionId);
      }, 2000 * reconnectAttempts);
    } else {
      console.error('Max reconnect attempts reached');
    }
  };
}

export function sendSignal(message) {
  if (!socket) {
    console.warn('No signaling socket, queueing message:', message.type);
    pendingMessages.push(message);
    return;
  }
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
    console.log('📤 Signaling sent:', message.type);
  } else {
    console.warn(`Socket not open (state ${socket.readyState}), queueing message:`, message.type);
    pendingMessages.push(message);
  }
}

export function onSignal(type, handler) {
  messageHandlers.set(type, handler);
}

export function offSignal(type) {
  messageHandlers.delete(type);
}

export function disconnectSignaling() {
  if (socket) {
    socket.close();
    socket = null;
  }
  if (reconnectTimer) clearTimeout(reconnectTimer);
  messageHandlers.clear();
  pendingMessages = [];
}