import React, { useCallback } from 'react';
import { useSynthStore } from '../../store/synth-store.ts';
import ModulePanel from '../ModulePanel.tsx';
import Knob from '../controls/Knob.tsx';
import Select from '../controls/Select.tsx';

interface DrumSynthPanelProps {
  moduleId: string;
}

const voiceOptions = [
  { value: 0, label: 'Kick' },
  { value: 1, label: 'Snare' },
  { value: 2, label: 'Hihat' },
];

const DrumSynthPanel: React.FC<DrumSynthPanelProps> = ({ moduleId }) => {
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
        label="Voice"
        value={params.voice}
        options={voiceOptions}
        onChange={set('voice')}
      />
      <div style={rowStyle}>
        <Knob label="Pitch" value={params.pitch} min={20} max={500} step={1} onChange={set('pitch')} />
        <Knob label="Decay" value={params.decay} min={0.01} max={2} step={0.01} onChange={set('decay')} />
      </div>
      <div style={rowStyle}>
        <Knob label="P.Decay" value={params.pitchDecay} min={0.001} max={0.5} step={0.001} onChange={set('pitchDecay')} />
        <Knob label="P.Amount" value={params.pitchAmount} min={0} max={8} step={0.1} onChange={set('pitchAmount')} />
      </div>
      <div style={rowStyle}>
        <Knob label="Noise" value={params.noiseLevel} min={0} max={1} step={0.01} onChange={set('noiseLevel')} />
        <Knob label="Tone" value={params.tone} min={0} max={1} step={0.01} onChange={set('tone')} />
      </div>
      <Knob label="Level" value={params.level} min={0} max={1} step={0.01} onChange={set('level')} />
    </ModulePanel>
  );
};

export default DrumSynthPanel;
