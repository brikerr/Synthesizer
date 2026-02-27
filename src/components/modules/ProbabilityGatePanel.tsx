import React, { useCallback } from 'react';
import { useSynthStore } from '../../store/synth-store.ts';
import ModulePanel from '../ModulePanel.tsx';
import Knob from '../controls/Knob.tsx';
import Select from '../controls/Select.tsx';

interface ProbabilityGatePanelProps {
  moduleId: string;
}

const modeOptions = [
  { value: 0, label: 'Pass' },
  { value: 1, label: 'Block' },
  { value: 2, label: 'Toggle' },
];

const ProbabilityGatePanel: React.FC<ProbabilityGatePanelProps> = ({ moduleId }) => {
  const params = useSynthStore((s) => s.modules[moduleId]?.params);
  const updateParam = useSynthStore((s) => s.updateParam);

  const set = useCallback(
    (name: string) => (value: number) => updateParam(moduleId, name, value),
    [moduleId, updateParam],
  );

  if (!params) return null;

  return (
    <ModulePanel moduleId={moduleId}>
      <Knob label="Probability" value={params.probability} min={0} max={1} step={0.01} onChange={set('probability')} />
      <Select label="Mode" value={params.mode} options={modeOptions} onChange={set('mode')} />
    </ModulePanel>
  );
};

export default ProbabilityGatePanel;
