import React, { useCallback } from 'react';
import { useSynthStore } from '../../store/synth-store.ts';
import ModulePanel from '../ModulePanel.tsx';
import Knob from '../controls/Knob.tsx';
import Select from '../controls/Select.tsx';

interface ChorusPanelProps {
  moduleId: string;
}

const voiceOptions = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
];

const ChorusPanel: React.FC<ChorusPanelProps> = ({ moduleId }) => {
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
        <Knob label="Rate" value={params.rate} min={0.1} max={10} step={0.1} onChange={set('rate')} />
        <Knob label="Depth" value={params.depth} min={0} max={1} step={0.01} onChange={set('depth')} />
      </div>
      <Knob label="Mix" value={params.mix} min={0} max={1} step={0.01} onChange={set('mix')} />
      <Select label="Voices" value={params.voices} options={voiceOptions} onChange={set('voices')} />
    </ModulePanel>
  );
};

export default ChorusPanel;
