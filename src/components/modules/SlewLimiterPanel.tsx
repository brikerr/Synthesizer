import React, { useCallback } from 'react';
import { useSynthStore } from '../../store/synth-store.ts';
import ModulePanel from '../ModulePanel.tsx';
import Knob from '../controls/Knob.tsx';

interface SlewLimiterPanelProps {
  moduleId: string;
}

const SlewLimiterPanel: React.FC<SlewLimiterPanelProps> = ({ moduleId }) => {
  const params = useSynthStore((s) => s.modules[moduleId]?.params);
  const updateParam = useSynthStore((s) => s.updateParam);

  const set = useCallback(
    (name: string) => (value: number) => updateParam(moduleId, name, value),
    [moduleId, updateParam],
  );

  if (!params) return null;

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
    justifyContent: 'center',
  };

  return (
    <ModulePanel moduleId={moduleId}>
      <div style={rowStyle}>
        <Knob label="Rise" value={params.rise} min={0.001} max={5} step={0.001} onChange={set('rise')} />
        <Knob label="Fall" value={params.fall} min={0.001} max={5} step={0.001} onChange={set('fall')} />
      </div>
      <Knob label="Shape" value={params.shape} min={0} max={1} step={0.01} onChange={set('shape')} />
    </ModulePanel>
  );
};

export default SlewLimiterPanel;
