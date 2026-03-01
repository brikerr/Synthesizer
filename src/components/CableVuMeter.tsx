interface Point {
  x: number;
  y: number;
}

interface CableVuMeterProps {
  start: Point;
  end: Point;
  level: number; // 0–1
}

/** Compute point on cubic Bezier at parameter t using De Casteljau */
function bezierMidpoint(start: Point, end: Point, t: number = 0.5): Point {
  const dx = Math.abs(end.x - start.x);
  const offset = Math.max(80, dx * 0.4);
  const sag = Math.min(80, dx * 0.15 + 20);

  // Control points matching cablePath()
  const p0 = start;
  const p1 = { x: start.x + offset, y: start.y + sag };
  const p2 = { x: end.x - offset, y: end.y + sag };
  const p3 = end;

  const it = 1 - t;
  const it2 = it * it;
  const it3 = it2 * it;
  const t2 = t * t;
  const t3 = t2 * t;

  return {
    x: it3 * p0.x + 3 * it2 * t * p1.x + 3 * it * t2 * p2.x + t3 * p3.x,
    y: it3 * p0.y + 3 * it2 * t * p1.y + 3 * it * t2 * p2.y + t3 * p3.y,
  };
}

function levelColor(level: number): string {
  if (level > 0.8) return '#FF4444';
  if (level > 0.5) return '#FFAA22';
  return '#44CC66';
}

export function CableVuMeter({ start, end, level }: CableVuMeterProps) {
  const mid = bezierMidpoint(start, end);
  const w = 16;
  const h = 6;
  const fillW = Math.min(w, level * w);

  return (
    <g style={{ pointerEvents: 'none' }}>
      {/* Background */}
      <rect
        x={mid.x - w / 2}
        y={mid.y - h / 2}
        width={w}
        height={h}
        rx={2}
        ry={2}
        fill="rgba(0,0,0,0.5)"
      />
      {/* Fill */}
      {fillW > 0.5 && (
        <rect
          x={mid.x - w / 2}
          y={mid.y - h / 2}
          width={fillW}
          height={h}
          rx={2}
          ry={2}
          fill={levelColor(level)}
          opacity={0.9}
        />
      )}
    </g>
  );
}
