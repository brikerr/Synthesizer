import React, { useCallback } from 'react';
import { useSynthStore } from '../../store/synth-store.ts';
import ModulePanel from '../ModulePanel.tsx';
import Knob from '../controls/Knob.tsx';
import Select from '../controls/Select.tsx';

interface ArpeggiatorPanelProps {
  moduleId: string;
}

const patternOptions = [
  { value: 0, label: 'Up' },
  { value: 1, label: 'Down' },
  { value: 2, label: 'Up/Down' },
  { value: 3, label: 'Random' },
];

const octaveOptions = [
  { value: 1, label: '1 Oct' },
  { value: 2, label: '2 Oct' },
  { value: 3, label: '3 Oct' },
  { value: 4, label: '4 Oct' },
];

const ArpeggiatorPanel: React.FC<ArpeggiatorPanelProps> = ({ moduleId }) => {
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
        <Knob label="Rate" value={params.rate} min={1} max={30} step={0.5} onChange={set('rate')} />
        <Knob label="Gate Len" value={params.gateLength} min={0.1} max={0.9} step={0.01} onChange={set('gateLength')} />
      </div>
      <Select label="Pattern" value={params.pattern} options={patternOptions} onChange={set('pattern')} />
      <Select label="Octaves" value={params.octaveRange} options={octaveOptions} onChange={set('octaveRange')} />
    </ModulePanel>
  );
};

export default ArpeggiatorPanel;
