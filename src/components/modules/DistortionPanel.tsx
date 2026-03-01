import React, { useCallback } from 'react';
import { useSynthStore } from '../../store/synth-store.ts';
import ModulePanel from '../ModulePanel.tsx';
import Knob from '../controls/Knob.tsx';
import Select from '../controls/Select.tsx';

interface DistortionPanelProps {
  moduleId: string;
}

const algorithmOptions = [
  { value: 0, label: 'Soft Clip' },
  { value: 1, label: 'Hard Clip' },
  { value: 2, label: 'Foldback' },
  { value: 3, label: 'Tape' },
];

const DistortionPanel: React.FC<DistortionPanelProps> = ({ moduleId }) => {
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
      <Select
        label="Algorithm"
        value={params.algorithm}
        options={algorithmOptions}
        onChange={set('algorithm')}
      />
      <div style={rowStyle}>
        <Knob label="Drive" value={params.drive} min={1} max={20} step={0.1} onChange={set('drive')} />
        <Knob label="Tone" value={params.tone} min={0} max={1} step={0.01} onChange={set('tone')} />
      </div>
      <Knob label="Mix" value={params.mix} min={0} max={1} step={0.01} onChange={set('mix')} />
    </ModulePanel>
  );
};

export default DistortionPanel;
