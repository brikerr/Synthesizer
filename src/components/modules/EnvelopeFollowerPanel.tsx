import React, { useCallback } from 'react';
import { useSynthStore } from '../../store/synth-store.ts';
import ModulePanel from '../ModulePanel.tsx';
import Knob from '../controls/Knob.tsx';

interface EnvelopeFollowerPanelProps {
  moduleId: string;
}

const EnvelopeFollowerPanel: React.FC<EnvelopeFollowerPanelProps> = ({ moduleId }) => {
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
        <Knob label="Attack" value={params.attack} min={0.001} max={0.5} step={0.001} onChange={set('attack')} />
        <Knob label="Release" value={params.release} min={0.01} max={2} step={0.01} onChange={set('release')} />
      </div>
      <div style={rowStyle}>
        <Knob label="Gain" value={params.gain} min={0.1} max={10} step={0.1} onChange={set('gain')} />
        <Knob label="Sensitivity" value={params.sensitivity} min={0} max={1} step={0.01} onChange={set('sensitivity')} />
      </div>
    </ModulePanel>
  );
};

export default EnvelopeFollowerPanel;
