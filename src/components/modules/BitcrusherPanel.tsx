import React, { useCallback } from 'react';
import { useSynthStore } from '../../store/synth-store.ts';
import ModulePanel from '../ModulePanel.tsx';
import Knob from '../controls/Knob.tsx';

interface BitcrusherPanelProps {
  moduleId: string;
}

const BitcrusherPanel: React.FC<BitcrusherPanelProps> = ({ moduleId }) => {
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
        <Knob label="Rate" value={params.sampleRateReduction} min={1} max={40} step={1} onChange={set('sampleRateReduction')} />
        <Knob label="Bits" value={params.bitDepth} min={1} max={16} step={1} onChange={set('bitDepth')} />
      </div>
      <Knob label="Mix" value={params.mix} min={0} max={1} step={0.01} onChange={set('mix')} />
    </ModulePanel>
  );
};

export default BitcrusherPanel;
