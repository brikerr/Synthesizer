import React, { useCallback } from 'react';
import { useSynthStore } from '../../store/synth-store.ts';
import ModulePanel from '../ModulePanel.tsx';
import Knob from '../controls/Knob.tsx';

interface CvMixerPanelProps {
  moduleId: string;
}

const CvMixerPanel: React.FC<CvMixerPanelProps> = ({ moduleId }) => {
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
        <Knob label="Gain 1" value={params.gain1} min={-2} max={2} step={0.01} onChange={set('gain1')} />
        <Knob label="Gain 2" value={params.gain2} min={-2} max={2} step={0.01} onChange={set('gain2')} />
      </div>
      <div style={rowStyle}>
        <Knob label="Gain 3" value={params.gain3} min={-2} max={2} step={0.01} onChange={set('gain3')} />
        <Knob label="Offset" value={params.offset} min={-1} max={1} step={0.01} onChange={set('offset')} />
      </div>
    </ModulePanel>
  );
};

export default CvMixerPanel;
