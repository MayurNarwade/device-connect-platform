import { create } from 'zustand';

export const useClipboardStore = create((set) => ({
  enabled: false,
  lastSync: null,
  toggle: () => set((state) => ({ enabled: !state.enabled })),
  setLastSync: (text) => set({ lastSync: text }),
}));