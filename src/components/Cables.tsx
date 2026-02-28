import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSynthStore } from '../store/synth-store.ts';
import { useTheme } from '../store/theme-store.ts';
import { getSignalColor } from '../styles/theme-tokens.ts';
import type { CableConnection, SignalType } from '../types/index.ts';

interface Point {
  x: number;
  y: number;
}

// Spring physics constants
const SPRING_K = 0.06;
const SPRING_DAMP = 0.82;
const SETTLE_THRESHOLD = 0.15;
const IMPULSE_SCALE = 0.35;

function getPortPosition(
  moduleId: string,
  portId: string,
  containerEl: HTMLElement | null,
): Point | null {
  if (!containerEl) return null;

  const el = containerEl.querySelector<HTMLElement>(
    `[data-port-id="${moduleId}:${portId}"]`,
  );
  if (!el) return null;

  const portRect = el.getBoundingClientRect();
  const containerRect = containerEl.getBoundingClientRect();

  const style = window.getComputedStyle(containerEl);
  const matrix = new DOMMatrix(style.transform);
  const scale = matrix.a || 1;

  return {
    x: (portRect.left + portRect.width / 2 - containerRect.left) / scale,
    y: (portRect.top + portRect.height / 2 - containerRect.top) / scale,
  };
}

function cablePath(a: Point, b: Point, bounceY: number = 0): string {
  const dx = Math.abs(b.x - a.x);
  const offset = Math.max(80, dx * 0.4);
  const sag = Math.min(80, dx * 0.15 + 20) + bounceY;
  return `M ${a.x},${a.y} C ${a.x + offset},${a.y + sag} ${b.x - offset},${b.y + sag} ${b.x},${b.y}`;
}

interface CableProps {
  connection: CableConnection;
  containerEl: HTMLElement | null;
  tick: number;
  isHighlighted?: boolean;
}

function Cable({ connection, containerEl, tick: _tick, isHighlighted }: CableProps) {
  const removeConnection = useSynthStore((s) => s.removeConnection);
  const theme = useTheme();
  const pathRef = useRef<SVGPathElement>(null);
  const tex1Ref = useRef<SVGPathElement>(null);
  const tex2Ref = useRef<SVGPathElement>(null);
  const rafRef = useRef(0);

  const springRef = useRef({
    offset: 0,
    vel: 0,
    prevMidY: 0,
    init: false,
    active: false,
    lastSrc: null as Point | null,
    lastDst: null as Point | null,
  });

  const src = getPortPosition(
    connection.source.moduleId,
    connection.source.portId,
    containerEl,
  );
  const dst = getPortPosition(
    connection.dest.moduleId,
    connection.dest.portId,
    containerEl,
  );

  // Store latest positions so the rAF loop can access them
  const sp = springRef.current;
  sp.lastSrc = src;
  sp.lastDst = dst;

  // Detect endpoint movement, apply spring impulse
  useEffect(() => {
    if (!src || !dst) return;
    const midY = (src.y + dst.y) / 2;

    if (!sp.init) {
      sp.prevMidY = midY;
      sp.init = true;
      return;
    }

    const delta = midY - sp.prevMidY;
    sp.prevMidY = midY;

    if (Math.abs(delta) > 0.5) {
      sp.vel -= delta * IMPULSE_SCALE;

      if (!sp.active) {
        sp.active = true;
        const step = () => {
          sp.vel = (sp.vel - SPRING_K * sp.offset) * SPRING_DAMP;
          sp.offset += sp.vel;

          if (sp.lastSrc && sp.lastDst) {
            const d = cablePath(sp.lastSrc, sp.lastDst, sp.offset);
            pathRef.current?.setAttribute('d', d);
            tex1Ref.current?.setAttribute('d', d);
            tex2Ref.current?.setAttribute('d', d);
          }

          if (Math.abs(sp.vel) > SETTLE_THRESHOLD || Math.abs(sp.offset) > SETTLE_THRESHOLD) {
            rafRef.current = requestAnimationFrame(step);
          } else {
            sp.offset = 0;
            sp.vel = 0;
            sp.active = false;
            if (sp.lastSrc && sp.lastDst) {
              const d = cablePath(sp.lastSrc, sp.lastDst, 0);
              pathRef.current?.setAttribute('d', d);
              tex1Ref.current?.setAttribute('d', d);
            tex2Ref.current?.setAttribute('d', d);
            }
          }
        };
        rafRef.current = requestAnimationFrame(step);
      }
    }
  });

  // Cleanup rAF on unmount
  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  if (!src || !dst) return null;

  const color = getSignalColor(theme, connection.signalType);
  const d = cablePath(src, dst, sp.offset);

  return (
    <g
      style={{ cursor: 'pointer' }}
      onClick={(e) => {
        e.stopPropagation();
        removeConnection(connection.id);
      }}
    >
      {/* Base cable */}
      <path
        ref={pathRef}
        d={d}
        stroke={color}
        strokeWidth={isHighlighted === true ? theme.cableWidth + 0.5 : theme.cableWidth}
        fill="none"
        opacity={isHighlighted === false ? 0.15 : isHighlighted === true ? 1 : theme.cableOpacity}
        strokeLinecap="round"
        style={{ pointerEvents: 'stroke', transition: 'opacity 0.2s' }}
      />
      {/* Woven texture — lighter tint + darker shade, staggered */}
      {isHighlighted !== false && (
        <>
          <path
            ref={tex1Ref}
            d={d}
            stroke={`${color}88`}
            strokeWidth={theme.cableWidth - 0.5}
            fill="none"
            strokeLinecap="round"
            strokeDasharray="2 6"
            style={{ pointerEvents: 'none' }}
          />
          <path
            ref={tex2Ref}
            d={d}
            stroke="rgba(0,0,0,0.2)"
            strokeWidth={theme.cableWidth - 0.5}
            fill="none"
            strokeLinecap="round"
            strokeDasharray="2 6"
            strokeDashoffset={3}
            style={{ pointerEvents: 'none' }}
          />
        </>
      )}
    </g>
  );
}

interface PendingCableProps {
  containerEl: HTMLElement | null;
  tick: number;
}

function PendingCable({ containerEl, tick: _tick }: PendingCableProps) {
  const pendingCable = useSynthStore((s) => s.pendingCable);
  const theme = useTheme();
  const [mouse, setMouse] = useState<Point>({ x: 0, y: 0 });

  useEffect(() => {
    if (!pendingCable || !containerEl) return;

    function handleMove(e: MouseEvent) {
      const rect = containerEl!.getBoundingClientRect();
      const style = window.getComputedStyle(containerEl!);
      const matrix = new DOMMatrix(style.transform);
      const scale = matrix.a || 1;

      setMouse({
        x: (e.clientX - rect.left) / scale,
        y: (e.clientY - rect.top) / scale,
      });
    }

    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [pendingCable, containerEl]);

  if (!pendingCable || !containerEl) return null;

  const src = getPortPosition(
    pendingCable.source.moduleId,
    pendingCable.source.portId,
    containerEl,
  );
  if (!src) return null;

  const color = getSignalColor(theme, pendingCable.signalType);

  return (
    <path
      d={cablePath(src, mouse)}
      stroke={color}
      strokeWidth={theme.cableWidth}
      fill="none"
      opacity={0.5}
      strokeDasharray="8 4"
      style={{ pointerEvents: 'none' }}
    />
  );
}

interface CablesProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  highlightedConnectionIds?: Set<string>;
}

export function Cables({ containerRef, highlightedConnectionIds }: CablesProps) {
  const connections = useSynthStore((s) => s.connections);
  const modules = useSynthStore((s) => s.modules);

  const [tick, setTick] = useState(0);
  const rafRef = useRef(0);
  const prevModulesRef = useRef(modules);

  useEffect(() => {
    const changed =
      modules !== prevModulesRef.current ||
      Object.keys(modules).length !== Object.keys(prevModulesRef.current).length;

    prevModulesRef.current = modules;

    if (!changed) return;

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setTick((t) => t + 1);
    });

    return () => cancelAnimationFrame(rafRef.current);
  }, [modules]);

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setTick((t) => t + 1);
    });
    return () => cancelAnimationFrame(rafRef.current);
  }, [connections]);

  const containerEl = containerRef.current;
  const connectionList = Object.values(connections);

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      {connectionList.map((conn) => (
        <Cable
          key={conn.id}
          connection={conn}
          containerEl={containerEl}
          tick={tick}
          isHighlighted={highlightedConnectionIds ? highlightedConnectionIds.has(conn.id) : undefined}
        />
      ))}
      <PendingCable containerEl={containerEl} tick={tick} />
    </svg>
  );
}
