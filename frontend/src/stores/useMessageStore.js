import { create } from 'zustand';

export const useMessageStore = create((set) => ({
  messages: [],
  addMessage: (text, isLocal = true) =>
    set((state) => ({
      messages: [...state.messages, { id: Date.now(), text, isLocal, time: Date.now() }],
    })),
  clear: () => set({ messages: [] }),
}));