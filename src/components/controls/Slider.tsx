import React, { useCallback, useRef, useState } from 'react';
import { useAccentColor } from './ModuleAccentContext.tsx';
import { useTheme } from '../../store/theme-store.ts';
import { useHistoryStore } from '../../store/history-store.ts';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  height?: number;
}

function formatValue(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 100) return Math.round(value).toString();
  if (abs >= 1) return value.toFixed(1);
  return value.toFixed(2);
}

const Slider: React.FC<SliderProps> = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
  height = 80,
}) => {
  const accent = useAccentColor();
  const theme = useTheme();
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

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

  const valueFromMouseY = useCallback(
    (clientY: number): number => {
      if (!trackRef.current) return value;
      const rect = trackRef.current.getBoundingClientRect();
      const fraction = 1 - (clientY - rect.top) / rect.height;
      const clampedFraction = Math.max(0, Math.min(1, fraction));
      return clamp(min + clampedFraction * (max - min));
    },
    [value, min, max, clamp],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      onChange(valueFromMouseY(e.clientY));
    },
    [onChange, valueFromMouseY],
  );

  const handleMouseUp = useCallback(() => {
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
      setIsDragging(true);
      onChange(valueFromMouseY(e.clientY));
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';
    },
    [onChange, valueFromMouseY, handleMouseMove, handleMouseUp],
  );

  const fraction = max !== min ? (value - min) / (max - min) : 0;
  const trackWidth = 4;
  const thumbWidth = 16;
  const thumbHeight = 4;
  const totalWidth = Math.max(thumbWidth, trackWidth) + 4;

  const fillHeight = fraction * height;
  const thumbY = (1 - fraction) * height;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 3,
      userSelect: 'none',
    }}>
      <span style={{
        color: theme.textSecondary,
        fontSize: theme.fontSizeLabel,
        fontFamily: theme.fontBase,
        textAlign: 'center',
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
      }}>{label}</span>
      <div
        ref={trackRef}
        style={{
          position: 'relative',
          width: totalWidth,
          height,
          cursor: 'ns-resize',
          display: 'flex',
          justifyContent: 'center',
        }}
        onMouseDown={handleMouseDown}
      >
        <div style={{
          position: 'absolute',
          width: trackWidth,
          height: '100%',
          backgroundColor: theme.sliderTrack,
          borderRadius: trackWidth / 2,
          left: '50%',
          transform: 'translateX(-50%)',
        }} />
        <div style={{
          position: 'absolute',
          width: trackWidth,
          height: fillHeight,
          backgroundColor: accent.primary,
          borderRadius: trackWidth / 2,
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
        }} />
        <div style={{
          position: 'absolute',
          width: thumbWidth,
          height: thumbHeight,
          backgroundColor: theme.sliderThumb,
          borderRadius: theme.borderRadius,
          top: thumbY - thumbHeight / 2,
          left: '50%',
          transform: 'translateX(-50%)',
        }} />
        {isDragging && (
          <div style={{
            position: 'absolute',
            top: thumbY - thumbHeight / 2 - 16,
            left: '50%',
            transform: 'translateX(-50%)',
            background: theme.tooltipBg,
            color: theme.textPrimary,
            fontSize: 9,
            fontFamily: theme.fontMono,
            padding: '1px 4px',
            borderRadius: theme.borderRadius,
            border: `1px solid ${theme.borderSubtle}`,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}>{formatValue(value)}</div>
        )}
      </div>
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

export default Slider;
