import React, { useCallback } from 'react';
import { useSynthStore } from '../../store/synth-store.ts';
import ModulePanel from '../ModulePanel.tsx';
import Knob from '../controls/Knob.tsx';

interface MacroKnobsPanelProps {
  moduleId: string;
}

const MacroKnobsPanel: React.FC<MacroKnobsPanelProps> = ({ moduleId }) => {
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
        <Knob label="Macro 1" value={params.macro1} min={-1} max={1} step={0.01} onChange={set('macro1')} />
        <Knob label="Macro 2" value={params.macro2} min={-1} max={1} step={0.01} onChange={set('macro2')} />
      </div>
      <div style={rowStyle}>
        <Knob label="Macro 3" value={params.macro3} min={-1} max={1} step={0.01} onChange={set('macro3')} />
        <Knob label="Macro 4" value={params.macro4} min={-1} max={1} step={0.01} onChange={set('macro4')} />
      </div>
    </ModulePanel>
  );
};

export default MacroKnobsPanel;
