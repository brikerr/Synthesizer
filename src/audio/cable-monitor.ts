import { getAudioContext } from './context.ts';
import { useCableLevelStore } from '../store/cable-level-store.ts';

interface CableTap {
  analyser: AnalyserNode;
  sourceNode: AudioNode;
  sourceOutput: number;
}

/** Singleton service that creates AnalyserNode taps on connections for signal visualization */
class CableMonitorService {
  private taps = new Map<string, CableTap>();
  private rafId = 0;
  private running = false;
  private timeDomainBuffer = new Uint8Array(512);

  /** Create a parallel AnalyserNode tap for a connection */
  tap(connectionId: string, sourceNode: AudioNode, sourceOutput: number): void {
    if (this.taps.has(connectionId)) return;

    const ctx = getAudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.6;

    try {
      sourceNode.connect(analyser, sourceOutput, 0);
    } catch {
      // Source output index may not be connectable
      return;
    }

    this.taps.set(connectionId, { analyser, sourceNode, sourceOutput });

    if (!this.running && this.taps.size > 0) {
      this.startLoop();
    }
  }

  /** Remove a tap */
  untap(connectionId: string): void {
    const tap = this.taps.get(connectionId);
    if (!tap) return;

    try {
      tap.sourceNode.disconnect(tap.analyser, tap.sourceOutput, 0);
    } catch {
      // Already disconnected
    }

    this.taps.delete(connectionId);

    if (this.taps.size === 0) {
      this.stopLoop();
    }
  }

  /** Remove all taps */
  clearAll(): void {
    for (const [id] of this.taps) {
      this.untap(id);
    }
    this.taps.clear();
    this.stopLoop();
    useCableLevelStore.getState().setLevels({});
  }

  private startLoop(): void {
    this.running = true;
    let lastUpdate = 0;

    const step = (now: number) => {
      if (!this.running) return;

      // Throttle to ~30fps
      if (now - lastUpdate < 33) {
        this.rafId = requestAnimationFrame(step);
        return;
      }
      lastUpdate = now;

      const levels: Record<string, number> = {};
      const store = useCableLevelStore.getState();
      const hoveredId = store.hoveredCableId;

      for (const [id, tap] of this.taps) {
        tap.analyser.getByteTimeDomainData(this.timeDomainBuffer);

        // Compute RMS
        let sumSq = 0;
        for (let i = 0; i < this.timeDomainBuffer.length; i++) {
          const sample = (this.timeDomainBuffer[i] - 128) / 128;
          sumSq += sample * sample;
        }
        levels[id] = Math.sqrt(sumSq / this.timeDomainBuffer.length);

        // Capture waveform for hovered cable
        if (id === hoveredId) {
          const waveform = new Float32Array(this.timeDomainBuffer.length);
          for (let i = 0; i < this.timeDomainBuffer.length; i++) {
            waveform[i] = (this.timeDomainBuffer[i] - 128) / 128;
          }
          store.setHoveredWaveform(waveform);
        }
      }

      store.setLevels(levels);
      this.rafId = requestAnimationFrame(step);
    };

    this.rafId = requestAnimationFrame(step);
  }

  private stopLoop(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }
}

export const cableMonitor = new CableMonitorService();
