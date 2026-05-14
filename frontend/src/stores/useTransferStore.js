import { create } from 'zustand';

export const useTransferStore = create((set) => ({
  activeTransfers: [],
  addTransfer: (id, meta, fileBlob = null) => set((state) => ({
    activeTransfers: [
      ...state.activeTransfers,
      { id, ...meta, progress: 0, speed: 0, status: 'transferring', file: fileBlob }
    ]
  })),
  updateProgress: (id, progress, speed) => set((state) => ({
    activeTransfers: state.activeTransfers.map(t =>
      t.id === id ? { ...t, progress, speed } : t
    )
  })),
  setStatus: (id, status) => set((state) => ({
    activeTransfers: state.activeTransfers.map(t =>
      t.id === id ? { ...t, status } : t
    )
  })),
  removeTransfer: (id) => set((state) => ({
    activeTransfers: state.activeTransfers.filter(t => t.id !== id)
  })),
}));