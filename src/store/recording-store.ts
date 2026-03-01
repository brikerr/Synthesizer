import { create } from 'zustand';

interface RecordingState {
  isRecording: boolean;
  startTime: number;
  elapsed: number;
  setRecording: (recording: boolean) => void;
  setElapsed: (elapsed: number) => void;
}

export const useRecordingStore = create<RecordingState>((set) => ({
  isRecording: false,
  startTime: 0,
  elapsed: 0,
  setRecording: (recording) =>
    set({
      isRecording: recording,
      startTime: recording ? Date.now() : 0,
      elapsed: 0,
    }),
  setElapsed: (elapsed) => set({ elapsed }),
}));
