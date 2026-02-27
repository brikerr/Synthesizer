import React, { useCallback, useRef, useState } from 'react';
import { useSynthStore } from '../store/synth-store.ts';
import { useTheme } from '../store/theme-store.ts';
import type { ModuleType } from '../types/index.ts';
import { Cables } from './Cables.tsx';
import { AmbientBackground } from './AmbientBackground.tsx';

import VCOPanel from './modules/VCOPanel.tsx';
import VCFPanel from './modules/VCFPanel.tsx';
import VCAPanel from './modules/VCAPanel.tsx';
import EnvelopePanel from './modules/EnvelopePanel.tsx';
import LFOPanel from './modules/LFOPanel.tsx';
import MixerPanel from './modules/MixerPanel.tsx';
import KeyboardPanel from './modules/KeyboardPanel.tsx';
import OutputPanel from './modules/OutputPanel.tsx';
import NoisePanel from './modules/NoisePanel.tsx';
import DelayPanel from './modules/DelayPanel.tsx';
import ReverbPanel from './modules/ReverbPanel.tsx';
import OscilloscopePanel from './modules/OscilloscopePanel.tsx';
import SampleHoldPanel from './modules/SampleHoldPanel.tsx';
import RingModPanel from './modules/RingModPanel.tsx';
import QuantizerPanel from './modules/QuantizerPanel.tsx';
import WavefolderPanel from './modules/WavefolderPanel.tsx';
import SpectrumPanel from './modules/SpectrumPanel.tsx';
import StepSequencerPanel from './modules/StepSequencerPanel.tsx';
import MacroKnobsPanel from './modules/MacroKnobsPanel.tsx';
import ProbabilityGatePanel from './modules/ProbabilityGatePanel.tsx';
import EuclideanPanel from './modules/EuclideanPanel.tsx';
import ChorusPanel from './modules/ChorusPanel.tsx';
import CompressorPanel from './modules/CompressorPanel.tsx';
import EQPanel from './modules/EQPanel.tsx';
import FMOperatorPanel from './modules/FMOperatorPanel.tsx';
import WavetablePanel from './modules/WavetablePanel.tsx';
import ArpeggiatorPanel from './modules/ArpeggiatorPanel.tsx';
import GranularPanel from './modules/GranularPanel.tsx';
import LooperPanel from './modules/LooperPanel.tsx';

const PANEL_MAP: Record<ModuleType, React.ComponentType<{ moduleId: string }>> = {
  vco: VCOPanel,
  vcf: VCFPanel,
  vca: VCAPanel,
  envelope: EnvelopePanel,
  lfo: LFOPanel,
  mixer: MixerPanel,
  keyboard: KeyboardPanel,
  output: OutputPanel,
  noise: NoisePanel,
  delay: DelayPanel,
  reverb: ReverbPanel,
  oscilloscope: OscilloscopePanel,
  sampleHold: SampleHoldPanel,
  ringMod: RingModPanel,
  quantizer: QuantizerPanel,
  wavefolder: WavefolderPanel,
  spectrum: SpectrumPanel,
  stepSequencer: StepSequencerPanel,
  macroKnobs: MacroKnobsPanel,
  probabilityGate: ProbabilityGatePanel,
  euclidean: EuclideanPanel,
  chorus: ChorusPanel,
  compressor: CompressorPanel,
  eq: EQPanel,
  fmOperator: FMOperatorPanel,
  wavetable: WavetablePanel,
  arpeggiator: ArpeggiatorPanel,
  granular: GranularPanel,
  looper: LooperPanel,
};

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 2.0;
const ZOOM_SENSITIVITY = 0.001;

const canvasStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  transformOrigin: '0 0',
};

export function Rack() {
  const modules = useSynthStore((s) => s.modules);
  const pendingCable = useSynthStore((s) => s.pendingCable);
  const cancelCable = useSynthStore((s) => s.cancelCable);
  const theme = useTheme();

  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [zoom, setZoom] = useState(1);

  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const innerRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button === 1) {
        e.preventDefault();
        isPanning.current = true;
        panStart.current = { x: e.clientX, y: e.clientY, panX, panY };
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      }
      if (e.button === 0 && pendingCable) {
        const target = e.target as HTMLElement;
        if (target === e.currentTarget || target === innerRef.current) {
          cancelCable();
        }
      }
    },
    [panX, panY, pendingCable, cancelCable],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (isPanning.current) {
        const dx = e.clientX - panStart.current.x;
        const dy = e.clientY - panStart.current.y;
        setPanX(panStart.current.panX + dx);
        setPanY(panStart.current.panY + dy);
      }
    },
    [],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (isPanning.current) {
        isPanning.current = false;
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      }
    },
    [],
  );

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * ZOOM_SENSITIVITY;
    setZoom((prev) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev + delta * prev)));
  }, []);

  const zoomIn = useCallback(() => {
    setZoom((prev) => Math.min(MAX_ZOOM, prev * 1.25));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((prev) => Math.max(MIN_ZOOM, prev / 1.25));
  }, []);

  const zoomReset = useCallback(() => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
  }, []);

  const moduleList = Object.values(modules);

  return (
    <div
      style={{
        flex: 1,
        overflow: 'hidden',
        position: 'relative',
        background: theme.gridBg,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      onContextMenu={(e) => e.preventDefault()}
    >
      <AmbientBackground />
      <div
        ref={innerRef}
        style={{
          ...canvasStyle,
          transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
        }}
      >
        {moduleList.map((mod) => {
          const Panel = PANEL_MAP[mod.type];
          if (!Panel) return null;
          return (
            <div
              key={mod.id}
              style={{ position: 'absolute', left: mod.x, top: mod.y }}
            >
              <Panel moduleId={mod.id} />
            </div>
          );
        })}
        <Cables containerRef={innerRef} />
      </div>

      {/* Zoom controls */}
      <div style={{
        position: 'absolute',
        bottom: 16,
        right: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        alignItems: 'center',
        zIndex: 100,
        background: theme.glassBg,
        border: `1px solid ${theme.glassBorder}`,
        borderRadius: 14,
        padding: 4,
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: theme.glassShadow,
      }}>
        <button
          onClick={zoomIn}
          title="Zoom in"
          style={{
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            borderRadius: 10,
            color: theme.textPrimary,
            cursor: 'pointer',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add</span>
        </button>
        <div style={{ width: 20, height: 1, background: theme.glassBorder }} />
        <button
          onClick={zoomReset}
          title="Reset view"
          style={{
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            borderRadius: 10,
            color: theme.textSecondary,
            cursor: 'pointer',
            fontFamily: theme.fontBase,
            fontSize: 9,
            padding: 0,
          }}
        >
          {Math.round(zoom * 100)}%
        </button>
        <div style={{ width: 20, height: 1, background: theme.glassBorder }} />
        <button
          onClick={zoomOut}
          title="Zoom out"
          style={{
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            borderRadius: 10,
            color: theme.textPrimary,
            cursor: 'pointer',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>remove</span>
        </button>
      </div>
    </div>
  );
}
