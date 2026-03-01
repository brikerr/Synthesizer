import { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useTheme } from '../store/theme-store.ts';
import { useCableLevelStore } from '../store/cable-level-store.ts';
import { getSignalColor } from '../styles/theme-tokens.ts';
import type { SignalType } from '../types/index.ts';

interface CableMiniScopeProps {
  mouseX: number;
  mouseY: number;
  signalType: SignalType;
}

const SCOPE_W = 120;
const SCOPE_H = 60;

export function CableMiniScope({ mouseX, mouseY, signalType }: CableMiniScopeProps) {
  const theme = useTheme();
  const waveform = useCableLevelStore((s) => s.hoveredWaveform);
  const cableLevel = useCableLevelStore((s) => {
    const hovId = s.hoveredCableId;
    return hovId ? (s.levels[hovId] ?? 0) : 0;
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const color = getSignalColor(theme, signalType);

  // Draw waveform on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !waveform || waveform.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, SCOPE_W, SCOPE_H);

    // Grid center line
    ctx.strokeStyle = `${theme.textMuted}40`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, SCOPE_H / 2);
    ctx.lineTo(SCOPE_W, SCOPE_H / 2);
    ctx.stroke();

    // Find trigger point (zero crossing, rising) for stable display
    let triggerIndex = 0;
    for (let i = 1; i < waveform.length - 1; i++) {
      if (waveform[i - 1] <= 0 && waveform[i] > 0) {
        triggerIndex = i;
        break;
      }
    }

    // Draw waveform from trigger point
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    const samplesToShow = Math.min(waveform.length - triggerIndex, 256);
    for (let i = 0; i < samplesToShow; i++) {
      const x = (i / samplesToShow) * SCOPE_W;
      const sample = waveform[triggerIndex + i] ?? 0;
      const y = SCOPE_H / 2 - sample * (SCOPE_H / 2) * 0.9;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }, [waveform, color, theme.textMuted]);

  // Convert dB
  const db = cableLevel > 0 ? (20 * Math.log10(cableLevel)).toFixed(1) : '-inf';

  return ReactDOM.createPortal(
    <div
      style={{
        position: 'fixed',
        left: mouseX + 16,
        top: mouseY - SCOPE_H - 12,
        width: SCOPE_W,
        pointerEvents: 'none',
        zIndex: 10000,
        background: theme.glassBg,
        border: `1px solid ${theme.glassBorder}`,
        borderRadius: 10,
        boxShadow: theme.glassShadow,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        overflow: 'hidden',
      }}
    >
      <canvas
        ref={canvasRef}
        width={SCOPE_W}
        height={SCOPE_H}
        style={{ display: 'block', width: SCOPE_W, height: SCOPE_H }}
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '2px 6px 3px',
          fontSize: 8,
          fontFamily: theme.fontMono,
          color: theme.textSecondary,
        }}
      >
        <span style={{ color }}>{signalType}</span>
        <span>{db} dB</span>
      </div>
    </div>,
    document.body,
  );
}
