import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSynthStore } from '../../store/synth-store.ts';
import { audioEngine } from '../../audio/engine.ts';
import { useTheme } from '../../store/theme-store.ts';
import { moduleColors } from '../../styles/module-colors.ts';
import ModulePanel from '../ModulePanel.tsx';
import Knob from '../controls/Knob.tsx';

interface EuclideanPanelProps {
  moduleId: string;
}

const EuclideanPanel: React.FC<EuclideanPanelProps> = ({ moduleId }) => {
  const params = useSynthStore((s) => s.modules[moduleId]?.params);
  const updateParam = useSynthStore((s) => s.updateParam);
  const theme = useTheme();
  const color = moduleColors.euclidean;

  const [pattern, setPattern] = useState<boolean[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  const set = useCallback(
    (name: string) => (value: number) => updateParam(moduleId, name, value),
    [moduleId, updateParam],
  );

  // Listen for pattern updates from processor
  useEffect(() => {
    const node = audioEngine.getNode(moduleId);
    if (!node) return;
    const handler = (e: MessageEvent) => {
      if (e.data.type === 'euclidean') {
        setPattern(e.data.pattern);
        setCurrentStep(e.data.currentStep);
      }
    };
    node.port.addEventListener('message', handler);
    node.port.start();
    return () => node.port.removeEventListener('message', handler);
  }, [moduleId]);

  if (!params) return null;

  const steps = Math.round(params.steps);

  return (
    <ModulePanel moduleId={moduleId}>
      {/* Ring display */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
        <svg width={80} height={80} viewBox="0 0 80 80">
          {Array.from({ length: steps }, (_, i) => {
            const angle = (i / steps) * Math.PI * 2 - Math.PI / 2;
            const cx = 40 + Math.cos(angle) * 30;
            const cy = 40 + Math.sin(angle) * 30;
            const isHit = pattern[i] ?? false;
            const isCurrent = i === currentStep;
            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={isCurrent ? 6 : 4}
                fill={isHit ? color.primary : `${theme.textMuted}44`}
                stroke={isCurrent ? '#fff' : 'none'}
                strokeWidth={isCurrent ? 1.5 : 0}
              />
            );
          })}
        </svg>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 14, alignItems: 'flex-start', justifyContent: 'center' }}>
        <Knob label="Steps" value={params.steps} min={1} max={16} step={1} onChange={set('steps')} />
        <Knob label="Hits" value={params.hits} min={0} max={16} step={1} onChange={set('hits')} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 14, alignItems: 'flex-start', justifyContent: 'center' }}>
        <Knob label="Rotation" value={params.rotation} min={0} max={15} step={1} onChange={set('rotation')} />
        <Knob label="Gate Len" value={params.gateLength} min={0.1} max={0.9} step={0.01} onChange={set('gateLength')} />
      </div>
    </ModulePanel>
  );
};

export default EuclideanPanel;
