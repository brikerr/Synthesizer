import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSynthStore } from '../store/synth-store.ts';
import { useTheme } from '../store/theme-store.ts';
import { useContextMenuStore } from '../store/context-menu-store.ts';
import type { ModuleType } from '../types/index.ts';
import { Cables } from './Cables.tsx';
import { AmbientBackground } from './AmbientBackground.tsx';
import { HighlightContext, DeferredRemoveContext } from './ModulePanel.tsx';

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
import BitcrusherPanel from './modules/BitcrusherPanel.tsx';
import CvMixerPanel from './modules/CvMixerPanel.tsx';
import SlewLimiterPanel from './modules/SlewLimiterPanel.tsx';
import DistortionPanel from './modules/DistortionPanel.tsx';
import EnvelopeFollowerPanel from './modules/EnvelopeFollowerPanel.tsx';
import ClockDividerPanel from './modules/ClockDividerPanel.tsx';
import DrumSynthPanel from './modules/DrumSynthPanel.tsx';

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
  bitcrusher: BitcrusherPanel,
  cvMixer: CvMixerPanel,
  slewLimiter: SlewLimiterPanel,
  distortion: DistortionPanel,
  envelopeFollower: EnvelopeFollowerPanel,
  clockDivider: ClockDividerPanel,
  drumSynth: DrumSynthPanel,
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
  const removeModule = useSynthStore((s) => s.removeModule);
  const isAudioReady = useSynthStore((s) => s.isAudioReady);
  const connections = useSynthStore((s) => s.connections);
  const pendingCable = useSynthStore((s) => s.pendingCable);
  const cancelCable = useSynthStore((s) => s.cancelCable);
  const openContextMenu = useContextMenuStore((s) => s.open);
  const theme = useTheme();

  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);

  // --- Module add/remove animations ---
  const [enteringIds, setEnteringIds] = useState<Set<string>>(new Set());
  const [exitingModules, setExitingModules] = useState<Map<string, typeof modules[string]>>(new Map());
  const prevModuleIdsRef = useRef<Set<string>>(new Set());

  // Detect newly added modules
  useEffect(() => {
    const currentIds = new Set(Object.keys(modules));
    const prevIds = prevModuleIdsRef.current;
    const newIds = new Set<string>();
    for (const id of currentIds) {
      if (!prevIds.has(id)) newIds.add(id);
    }
    prevModuleIdsRef.current = currentIds;
    if (newIds.size > 0) {
      setEnteringIds(newIds);
      // Double-rAF: first frame paints initial state, second triggers transition
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setEnteringIds(new Set());
        });
      });
    }
  }, [modules]);

  // Deferred remove: animate out, then actually remove
  const handleDeferredRemove = useCallback((id: string) => {
    const mod = modules[id];
    if (!mod) return;
    setExitingModules((prev) => new Map(prev).set(id, mod));
    setTimeout(() => {
      setExitingModules((prev) => {
        const next = new Map(prev);
        next.delete(id);
        return next;
      });
      removeModule(id);
    }, 200);
  }, [modules, removeModule]);

  // BFS: compute highlighted module + connection sets from selected module
  const { highlightedModuleIds, highlightedConnectionIds } = useMemo(() => {
    if (!selectedModuleId) return { highlightedModuleIds: null, highlightedConnectionIds: null };

    const connList = Object.values(connections);
    const moduleSet = new Set<string>([selectedModuleId]);
    const queue: string[] = [selectedModuleId];

    // BFS upstream (follow dest → source)
    const upQueue = [...queue];
    while (upQueue.length > 0) {
      const current = upQueue.shift()!;
      for (const conn of connList) {
        if (conn.dest.moduleId === current && !moduleSet.has(conn.source.moduleId)) {
          moduleSet.add(conn.source.moduleId);
          upQueue.push(conn.source.moduleId);
        }
      }
    }

    // BFS downstream (follow source → dest)
    const downQueue = [selectedModuleId];
    while (downQueue.length > 0) {
      const current = downQueue.shift()!;
      for (const conn of connList) {
        if (conn.source.moduleId === current && !moduleSet.has(conn.dest.moduleId)) {
          moduleSet.add(conn.dest.moduleId);
          downQueue.push(conn.dest.moduleId);
        }
      }
    }

    // Connections where both endpoints are in the highlighted set
    const connSet = new Set<string>();
    for (const conn of connList) {
      if (moduleSet.has(conn.source.moduleId) && moduleSet.has(conn.dest.moduleId)) {
        connSet.add(conn.id);
      }
    }

    return { highlightedModuleIds: moduleSet, highlightedConnectionIds: connSet };
  }, [selectedModuleId, connections]);

  const handleSelectModule = useCallback((moduleId: string) => {
    setSelectedModuleId((prev) => (prev === moduleId ? null : moduleId));
  }, []);

  const highlightContextValue = useMemo(() => ({
    highlightedModuleIds: highlightedModuleIds,
    onSelectModule: handleSelectModule,
  }), [highlightedModuleIds, handleSelectModule]);

  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const innerRef = useRef<HTMLDivElement>(null);
  const spaceDown = useRef(false);
  const [spaceHeld, setSpaceHeld] = useState(false);

  // Track spacebar for space+drag panning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        spaceDown.current = true;
        setSpaceHeld(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        spaceDown.current = false;
        setSpaceHeld(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Middle-click drag: always pan
      if (e.button === 1) {
        e.preventDefault();
        isPanning.current = true;
        panStart.current = { x: e.clientX, y: e.clientY, panX, panY };
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        return;
      }

      if (e.button === 0) {
        const target = e.target as HTMLElement;
        const isEmptySpace = target === e.currentTarget || target === innerRef.current;

        // Space + left-click: pan from anywhere
        if (spaceDown.current) {
          e.preventDefault();
          isPanning.current = true;
          panStart.current = { x: e.clientX, y: e.clientY, panX, panY };
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          return;
        }

        // Left-click on empty space
        if (isEmptySpace) {
          setSelectedModuleId(null);
          if (pendingCable) {
            cancelCable();
          } else {
            // Pan by dragging empty canvas
            e.preventDefault();
            isPanning.current = true;
            panStart.current = { x: e.clientX, y: e.clientY, panX, panY };
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          }
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
    // Pinch-to-zoom on trackpad (ctrlKey) or mouse wheel with no horizontal component
    if (e.ctrlKey || (Math.abs(e.deltaX) < 1 && Math.abs(e.deltaY) > 0)) {
      const delta = -e.deltaY * (e.ctrlKey ? ZOOM_SENSITIVITY * 3 : ZOOM_SENSITIVITY);
      setZoom((prev) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev + delta * prev)));
    } else {
      // Two-finger trackpad scroll → pan
      setPanX((prev) => prev - e.deltaX);
      setPanY((prev) => prev - e.deltaY);
    }
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
        cursor: spaceHeld ? 'grab' : undefined,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      onContextMenu={(e) => {
        e.preventDefault();
        // Only show "Add Module..." on empty canvas right-click
        const target = e.target as HTMLElement;
        const isEmptySpace = target === e.currentTarget || target === innerRef.current;
        if (isEmptySpace && isAudioReady) {
          openContextMenu(e.clientX, e.clientY, [
            {
              label: 'Add Module...',
              icon: 'add_circle',
              action: () => window.dispatchEvent(new CustomEvent('open-module-search')),
            },
          ]);
        }
      }}
    >
      <AmbientBackground />
      <DeferredRemoveContext.Provider value={handleDeferredRemove}>
      <HighlightContext.Provider value={highlightContextValue}>
        <div
          ref={innerRef}
          style={{
            ...canvasStyle,
            transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
          }}
        >
          {moduleList.filter((mod) => !exitingModules.has(mod.id)).map((mod) => {
            const Panel = PANEL_MAP[mod.type];
            if (!Panel) return null;
            const isEntering = enteringIds.has(mod.id);
            return (
              <div
                key={mod.id}
                style={{
                  position: 'absolute',
                  left: mod.x,
                  top: mod.y,
                  transform: isEntering ? 'scale(0.85)' : 'scale(1)',
                  opacity: isEntering ? 0 : 1,
                  transition: 'transform 0.2s ease-out, opacity 0.2s ease-out',
                }}
              >
                <Panel moduleId={mod.id} />
              </div>
            );
          })}
          {/* Exiting modules — animating out */}
          {Array.from(exitingModules.values()).map((mod) => {
            const Panel = PANEL_MAP[mod.type];
            if (!Panel) return null;
            return (
              <div
                key={mod.id}
                style={{
                  position: 'absolute',
                  left: mod.x,
                  top: mod.y,
                  transform: 'scale(0.95)',
                  opacity: 0,
                  transition: 'transform 0.2s ease-in, opacity 0.2s ease-in',
                  pointerEvents: 'none',
                }}
              >
                <Panel moduleId={mod.id} />
              </div>
            );
          })}
          <Cables containerRef={innerRef} highlightedConnectionIds={highlightedConnectionIds ?? undefined} />
        </div>
      </HighlightContext.Provider>
      </DeferredRemoveContext.Provider>

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
