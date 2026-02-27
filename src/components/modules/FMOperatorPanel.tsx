import React, { useCallback } from 'react';
import { useSynthStore } from '../../store/synth-store.ts';
import ModulePanel from '../ModulePanel.tsx';
import Knob from '../controls/Knob.tsx';
import Select from '../controls/Select.tsx';

interface FMOperatorPanelProps {
  moduleId: string;
}

const waveformOptions = [
  { value: 0, label: 'Sine' },
  { value: 1, label: 'Saw' },
  { value: 2, label: 'Square' },
  { value: 3, label: 'Triangle' },
];

const FMOperatorPanel: React.FC<FMOperatorPanelProps> = ({ moduleId }) => {
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
        <Knob label="Pitch" value={params.frequency} min={-5} max={5} step={0.01} onChange={set('frequency')} />
        <Knob label="Ratio" value={params.ratio} min={0.25} max={16} step={0.25} onChange={set('ratio')} />
      </div>
      <div style={rowStyle}>
        <Knob label="FM Index" value={params.fmIndex} min={0} max={10} step={0.1} onChange={set('fmIndex')} />
        <Knob label="Feedback" value={params.feedback} min={0} max={1} step={0.01} onChange={set('feedback')} />
      </div>
      <Select label="Waveform" value={params.waveform} options={waveformOptions} onChange={set('waveform')} />
    </ModulePanel>
  );
};

export default FMOperatorPanel;
