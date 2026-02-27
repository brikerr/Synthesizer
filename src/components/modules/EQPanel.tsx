import React, { useCallback } from 'react';
import { useSynthStore } from '../../store/synth-store.ts';
import ModulePanel from '../ModulePanel.tsx';
import Knob from '../controls/Knob.tsx';

interface EQPanelProps {
  moduleId: string;
}

const EQPanel: React.FC<EQPanelProps> = ({ moduleId }) => {
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
        <Knob label="Low" value={params.lowGain} min={-12} max={12} step={0.5} onChange={set('lowGain')} />
        <Knob label="Mid" value={params.midGain} min={-12} max={12} step={0.5} onChange={set('midGain')} />
        <Knob label="High" value={params.highGain} min={-12} max={12} step={0.5} onChange={set('highGain')} />
      </div>
      <div style={rowStyle}>
        <Knob label="Low Freq" value={params.lowFreq} min={40} max={1000} step={10} onChange={set('lowFreq')} />
        <Knob label="High Freq" value={params.highFreq} min={1000} max={16000} step={100} onChange={set('highFreq')} />
      </div>
    </ModulePanel>
  );
};

export default EQPanel;
