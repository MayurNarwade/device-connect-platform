import { create } from 'zustand';

export const useSessionStore = create((set, get) => ({
  sessionId: null,
  otp: null,
  role: null,
  partnerDevice: null,
  status: 'idle',
  networkMode: null,
  connectionQuality: { rtt: null, throughput: null },
  webrtcReady: false,
  iceState: null,

  // Alias for Dashboard compatibility
  get isWebRTCReady() {
    return get().webrtcReady;
  },

  setSession: (id, otp) => set({ sessionId: id, otp, status: 'pairing' }),
  setConnected: (role, partner) => set({ role, partnerDevice: partner, status: 'connected' }),
  setNetworkMode: (mode) => set({ networkMode: mode }),
  updateQuality: (rtt, throughput) => set({ connectionQuality: { rtt, throughput } }),
  updateIceState: (state) => set({ iceState: state }),
  setWebRTCReady: (ready) => set({ webrtcReady: ready }),
  reset: () => set({
    sessionId: null, otp: null, role: null, partnerDevice: null,
    status: 'idle', networkMode: null, webrtcReady: false, iceState: null,
  }),
  setReconnecting: () => set({ status: 'reconnecting' }),
  setClosed: () => set({ status: 'closed' }),
}));