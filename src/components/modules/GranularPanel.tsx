import React, { useCallback } from 'react';
import { useSynthStore } from '../../store/synth-store.ts';
import ModulePanel from '../ModulePanel.tsx';
import Knob from '../controls/Knob.tsx';

interface GranularPanelProps {
  moduleId: string;
}

const GranularPanel: React.FC<GranularPanelProps> = ({ moduleId }) => {
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
        <Knob label="Density" value={params.grainDensity} min={1} max={50} step={1} onChange={set('grainDensity')} />
        <Knob label="Size" value={params.grainSize} min={0.01} max={0.5} step={0.01} onChange={set('grainSize')} />
      </div>
      <div style={rowStyle}>
        <Knob label="Spread" value={params.spread} min={0} max={1} step={0.01} onChange={set('spread')} />
        <Knob label="Pitch" value={params.pitch} min={0.25} max={4} step={0.05} onChange={set('pitch')} />
      </div>
      <Knob label="Mix" value={params.mix} min={0} max={1} step={0.01} onChange={set('mix')} />
    </ModulePanel>
  );
};

export default GranularPanel;
