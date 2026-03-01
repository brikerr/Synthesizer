import { create } from 'zustand';

interface CableLevelState {
  /** Per-cable RMS levels (0–1), keyed by connection ID */
  levels: Record<string, number>;
  /** Waveform data for the hovered cable (512 samples) */
  hoveredWaveform: Float32Array | null;
  /** Currently hovered cable ID */
  hoveredCableId: string | null;
  /** Show cable glow (default on) */
  showCableGlow: boolean;
  /** Show VU meters on cables (default off) */
  showVuMeters: boolean;

  setLevels: (levels: Record<string, number>) => void;
  setHoveredCableId: (id: string | null) => void;
  setHoveredWaveform: (data: Float32Array | null) => void;
  toggleCableGlow: () => void;
  toggleVuMeters: () => void;
}

export const useCableLevelStore = create<CableLevelState>((set) => ({
  levels: {},
  hoveredWaveform: null,
  hoveredCableId: null,
  showCableGlow: true,
  showVuMeters: (() => {
    try { return localStorage.getItem('showVuMeters') === 'true'; } catch { return false; }
  })(),

  setLevels: (levels) => set({ levels }),
  setHoveredCableId: (id) => set({ hoveredCableId: id, hoveredWaveform: id ? undefined : null }),
  setHoveredWaveform: (data) => set({ hoveredWaveform: data }),
  toggleCableGlow: () => set((s) => ({ showCableGlow: !s.showCableGlow })),
  toggleVuMeters: () =>
    set((s) => {
      const next = !s.showVuMeters;
      try { localStorage.setItem('showVuMeters', String(next)); } catch {}
      return { showVuMeters: next };
    }),
}));
