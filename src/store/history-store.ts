import { create } from 'zustand';
import type { ModuleInstance, CableConnection } from '../types/index.ts';

export interface HistorySnapshot {
  modules: Record<string, ModuleInstance>;
  connections: Record<string, CableConnection>;
}

const MAX_HISTORY = 50;

interface HistoryState {
  past: HistorySnapshot[];
  future: HistorySnapshot[];
  /** Whether we're currently in a drag gesture (suppress snapshots for intermediate param updates) */
  isDragging: boolean;

  pushSnapshot: (snapshot: HistorySnapshot) => void;
  undo: () => HistorySnapshot | null;
  redo: () => HistorySnapshot | null;
  clear: () => void;
  setDragging: (dragging: boolean) => void;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  future: [],
  isDragging: false,

  pushSnapshot: (snapshot) => {
    set((s) => ({
      past: [...s.past.slice(-(MAX_HISTORY - 1)), snapshot],
      future: [], // Clear redo stack on new action
    }));
  },

  undo: () => {
    const { past } = get();
    if (past.length === 0) return null;
    const previous = past[past.length - 1];
    set((s) => ({
      past: s.past.slice(0, -1),
      // Current state will be pushed to future by the caller
    }));
    return previous;
  },

  redo: () => {
    const { future } = get();
    if (future.length === 0) return null;
    const next = future[future.length - 1];
    set((s) => ({
      future: s.future.slice(0, -1),
      // Current state will be pushed to past by the caller
    }));
    return next;
  },

  clear: () => set({ past: [], future: [] }),
  setDragging: (dragging) => set({ isDragging: dragging }),
}));
