import React, { useCallback } from 'react';
import { useSynthStore } from '../../store/synth-store.ts';
import ModulePanel from '../ModulePanel.tsx';
import Knob from '../controls/Knob.tsx';

interface WavetablePanelProps {
  moduleId: string;
}

const WavetablePanel: React.FC<WavetablePanelProps> = ({ moduleId }) => {
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
        <Knob label="Morph" value={params.wavetableIndex} min={0} max={1} step={0.01} onChange={set('wavetableIndex')} />
      </div>
      <div style={rowStyle}>
        <Knob label="Octave" value={params.octave} min={-3} max={3} step={1} onChange={set('octave')} />
        <Knob label="Detune" value={params.detune} min={-1} max={1} step={0.01} onChange={set('detune')} />
      </div>
    </ModulePanel>
  );
};

export default WavetablePanel;
