import React, { useCallback } from 'react';
import { useSynthStore } from '../../store/synth-store.ts';
import ModulePanel from '../ModulePanel.tsx';
import Knob from '../controls/Knob.tsx';

interface CompressorPanelProps {
  moduleId: string;
}

const CompressorPanel: React.FC<CompressorPanelProps> = ({ moduleId }) => {
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
        <Knob label="Thresh" value={params.threshold} min={-60} max={0} step={0.5} onChange={set('threshold')} />
        <Knob label="Ratio" value={params.ratio} min={1} max={20} step={0.5} onChange={set('ratio')} />
      </div>
      <div style={rowStyle}>
        <Knob label="Attack" value={params.attack} min={0.001} max={0.5} step={0.001} onChange={set('attack')} />
        <Knob label="Release" value={params.release} min={0.01} max={2} step={0.01} onChange={set('release')} />
      </div>
      <Knob label="Makeup" value={params.makeupGain} min={0} max={30} step={0.5} onChange={set('makeupGain')} />
    </ModulePanel>
  );
};

export default CompressorPanel;
