// frontend/src/utils/constants.js
export const OTP_LENGTH = 6;
export const CHUNK_SIZE = 64 * 1024; // 64KB
export const BUFFERED_AMOUNT_THRESHOLD = 1024 * 1024; // 1MB
export const ROUTE_PRIORITY = ['LAN_HOST', 'LAN_SRFLX', 'WAN_SRFLX', 'TURN', 'CLOUD_RELAY'];

// API base URL – can be overridden by Vite env variable VITE_API_BASE
export const API_BASE = import.meta.env.VITE_API_BASE || '/api';

// WebSocket base URL – can be overridden by Vite env variable VITE_WS_BASE
export const WS_BASE = import.meta.env.VITE_WS_BASE || '/ws';
