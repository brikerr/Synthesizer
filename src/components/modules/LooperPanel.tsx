import React, { useCallback, useEffect, useState } from 'react';
import { useSynthStore } from '../../store/synth-store.ts';
import { audioEngine } from '../../audio/engine.ts';
import { useTheme } from '../../store/theme-store.ts';
import { moduleColors } from '../../styles/module-colors.ts';
import ModulePanel from '../ModulePanel.tsx';
import Knob from '../controls/Knob.tsx';
import Select from '../controls/Select.tsx';

interface LooperPanelProps {
  moduleId: string;
}

const reverseOptions = [
  { value: 0, label: 'Forward' },
  { value: 1, label: 'Reverse' },
];

const LooperPanel: React.FC<LooperPanelProps> = ({ moduleId }) => {
  const params = useSynthStore((s) => s.modules[moduleId]?.params);
  const updateParam = useSynthStore((s) => s.updateParam);
  const theme = useTheme();
  const color = moduleColors.looper;

  const [looperState, setLooperState] = useState<'idle' | 'recording' | 'playing'>('idle');
  const [progress, setProgress] = useState(0);

  const set = useCallback(
    (name: string) => (value: number) => updateParam(moduleId, name, value),
    [moduleId, updateParam],
  );

  // Listen for state updates from processor
  useEffect(() => {
    const node = audioEngine.getNode(moduleId);
    if (!node) return;
    const handler = (e: MessageEvent) => {
      if (e.data.type === 'looperState') {
        setLooperState(e.data.state);
        setProgress(e.data.progress);
      }
    };
    node.port.addEventListener('message', handler);
    node.port.start();
    return () => node.port.removeEventListener('message', handler);
  }, [moduleId]);

  const sendCommand = useCallback((cmd: string) => {
    const node = audioEngine.getNode(moduleId);
    if (node) node.port.postMessage({ type: cmd });
  }, [moduleId]);

  if (!params) return null;

  const btnStyle = (active: boolean, activeColor: string): React.CSSProperties => ({
    padding: '6px 14px',
    borderRadius: 8,
    border: `1px solid ${active ? activeColor : theme.borderSubtle}`,
    background: active ? `${activeColor}30` : theme.bgControl,
    color: active ? activeColor : theme.textPrimary,
    cursor: 'pointer',
    fontSize: 11,
    fontFamily: theme.fontBase,
    fontWeight: active ? 600 : 400,
  });

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <ModulePanel moduleId={moduleId}>
      {/* Transport buttons */}
      <div style={rowStyle}>
        <button style={btnStyle(looperState === 'recording', '#e05050')} onClick={() => sendCommand('record')}>
          REC
        </button>
        <button style={btnStyle(looperState === 'playing', color.primary)} onClick={() => sendCommand('play')}>
          PLAY
        </button>
      </div>

      {/* Progress bar */}
      <div style={{
        height: 6,
        borderRadius: 3,
        background: `${theme.textMuted}22`,
        overflow: 'hidden',
        margin: '0 4px',
      }}>
        <div style={{
          height: '100%',
          width: `${progress * 100}%`,
          background: looperState === 'recording' ? '#e05050' : color.primary,
          borderRadius: 3,
          transition: 'width 0.1s linear',
        }} />
      </div>

      <div style={rowStyle}>
        <Knob label="Speed" value={params.playbackSpeed} min={-2} max={2} step={0.05} onChange={set('playbackSpeed')} />
        <Knob label="Mix" value={params.mix} min={0} max={1} step={0.01} onChange={set('mix')} />
      </div>
      <Select label="Direction" value={params.reverse} options={reverseOptions} onChange={set('reverse')} />
    </ModulePanel>
  );
};

export default LooperPanel;
