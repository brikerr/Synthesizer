import React, { useCallback, useRef, useState } from 'react';
import { useAccentColor } from './ModuleAccentContext.tsx';
import { useTheme } from '../../store/theme-store.ts';
import { useHistoryStore } from '../../store/history-store.ts';

interface KnobProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  size?: number;
}

function formatValue(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 100) return Math.round(value).toString();
  if (abs >= 1) return value.toFixed(1);
  return value.toFixed(2);
}

const Knob: React.FC<KnobProps> = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
  size,
}) => {
  const accent = useAccentColor();
  const theme = useTheme();
  const resolvedSize = size ?? theme.knobSize;
  const [isDragging, setIsDragging] = useState(false);
  const dragStateRef = useRef<{
    startY: number;
    startValue: number;
  } | null>(null);

  const clamp = useCallback(
    (v: number): number => {
      let clamped = Math.max(min, Math.min(max, v));
      if (step !== undefined && step > 0) {
        clamped = Math.round((clamped - min) / step) * step + min;
        clamped = Math.max(min, Math.min(max, clamped));
      }
      return clamped;
    },
    [min, max, step],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragStateRef.current) return;
      const dy = dragStateRef.current.startY - e.clientY;
      const range = max - min;
      const sensitivity = 200;
      const delta = (dy / sensitivity) * range;
      const newValue = clamp(dragStateRef.current.startValue + delta);
      onChange(newValue);
    },
    [max, min, clamp, onChange],
  );

  const handleMouseUp = useCallback(() => {
    dragStateRef.current = null;
    setIsDragging(false);
    useHistoryStore.getState().setDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, [handleMouseMove]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      useHistoryStore.getState().setDragging(true);
      dragStateRef.current = {
        startY: e.clientY,
        startValue: value,
      };
      setIsDragging(true);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';
    },
    [value, handleMouseMove, handleMouseUp],
  );

  // --- Arc geometry ---
  const startAngleDeg = 225;
  const endAngleDeg = -45;
  const totalSweepDeg = 270;

  const fraction = max !== min ? (value - min) / (max - min) : 0;
  const currentAngleDeg = startAngleDeg - fraction * totalSweepDeg;

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const cx = resolvedSize / 2;
  const cy = resolvedSize / 2;
  const radius = resolvedSize / 2 - 3;
  const arcRadius = radius - 2;
  const indicatorInner = radius - 8;
  const indicatorOuter = radius - 1;

  const angleToXY = (deg: number, r: number) => ({
    x: cx + r * Math.cos(toRad(deg)),
    y: cy - r * Math.sin(toRad(deg)),
  });

  const arcStart = angleToXY(startAngleDeg, arcRadius);
  const arcEnd = angleToXY(currentAngleDeg, arcRadius);
  const sweepDeg = startAngleDeg - currentAngleDeg;
  const largeArc = sweepDeg > 180 ? 1 : 0;
  const arcPath =
    sweepDeg > 0.5
      ? `M ${arcStart.x} ${arcStart.y} A ${arcRadius} ${arcRadius} 0 ${largeArc} 1 ${arcEnd.x} ${arcEnd.y}`
      : '';

  const indInner = angleToXY(currentAngleDeg, indicatorInner);
  const indOuter = angleToXY(currentAngleDeg, indicatorOuter);

  const tickCount = 11;
  const tickInner = radius - 1;
  const tickOuter = radius + 1;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        userSelect: 'none',
      }}
    >
      <span style={{
        color: theme.textSecondary,
        fontSize: theme.fontSizeLabel,
        fontFamily: theme.fontBase,
        textAlign: 'center',
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
      }}>{label}</span>
      <svg
        width={resolvedSize}
        height={resolvedSize}
        onMouseDown={handleMouseDown}
        style={{ cursor: 'ns-resize' }}
      >
        <circle cx={cx} cy={cy} r={radius} fill={theme.bgControl} />
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke={theme.knobRing} strokeWidth={1} />

        {Array.from({ length: tickCount }, (_, ti) => {
          const tickFrac = ti / (tickCount - 1);
          const tickAngle = startAngleDeg - tickFrac * totalSweepDeg;
          const p1 = angleToXY(tickAngle, tickInner);
          const p2 = angleToXY(tickAngle, tickOuter);
          return (
            <line
              key={ti}
              x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
              stroke={theme.knobTick}
              strokeWidth={1}
              strokeLinecap="round"
            />
          );
        })}

        {(() => {
          const trackStart = angleToXY(startAngleDeg, arcRadius);
          const trackEnd = angleToXY(endAngleDeg, arcRadius);
          return (
            <path
              d={`M ${trackStart.x} ${trackStart.y} A ${arcRadius} ${arcRadius} 0 1 1 ${trackEnd.x} ${trackEnd.y}`}
              fill="none"
              stroke={theme.knobTrack}
              strokeWidth={2}
              strokeLinecap="round"
            />
          );
        })()}

        {arcPath && (
          <path
            d={arcPath}
            fill="none"
            stroke={accent.primary}
            strokeWidth={2}
            strokeLinecap="round"
          />
        )}

        <line
          x1={indInner.x} y1={indInner.y}
          x2={indOuter.x} y2={indOuter.y}
          stroke={isDragging ? accent.primary : theme.textPrimary}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </svg>
      <span style={{
        color: theme.textPrimary,
        fontSize: theme.fontSizeLabel,
        fontFamily: theme.fontMono,
        textAlign: 'center',
        lineHeight: 1.2,
      }}>{formatValue(value)}</span>
    </div>
  );
};

export default Knob;
