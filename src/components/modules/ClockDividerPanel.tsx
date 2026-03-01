import React, { useCallback } from 'react';
import { useSynthStore } from '../../store/synth-store.ts';
import ModulePanel from '../ModulePanel.tsx';
import Knob from '../controls/Knob.tsx';

interface ClockDividerPanelProps {
  moduleId: string;
}

const ClockDividerPanel: React.FC<ClockDividerPanelProps> = ({ moduleId }) => {
  const params = useSynthStore((s) => s.modules[moduleId]?.params);
  const updateParam = useSynthStore((s) => s.updateParam);

  const set = useCallback(
    (name: string) => (value: number) => updateParam(moduleId, name, value),
    [moduleId, updateParam],
  );

  if (!params) return null;

  return (
    <ModulePanel moduleId={moduleId}>
      <Knob label="Gate Len" value={params.gateLength} min={0.1} max={0.9} step={0.01} onChange={set('gateLength')} />
    </ModulePanel>
  );
};

export default ClockDividerPanel;
