import React from 'react';
import { useSynthStore } from '../store/synth-store.ts';
import { useTheme, useThemeStore } from '../store/theme-store.ts';
import { useRecordingStore } from '../store/recording-store.ts';
import { moduleColors } from '../styles/module-colors.ts';
import type { ModuleType } from '../types/index.ts';
import { midiManager } from '../audio/midi-manager.ts';
import { audioEngine } from '../audio/engine.ts';
import { encodeWav } from '../audio/wav-encoder.ts';
import { PresetSelector } from './PresetSelector.tsx';
import { MODULE_GROUPS } from '../data/module-groups.ts';
import { useCableLevelStore } from '../store/cable-level-store.ts';

export function Toolbar() {
  const isAudioReady = useSynthStore((s) => s.isAudioReady);
  const initAudio = useSynthStore((s) => s.initAudio);
  const shutdownAudio = useSynthStore((s) => s.shutdownAudio);
  const addModule = useSynthStore((s) => s.addModule);
  const theme = useTheme();
  const themeName = useThemeStore((s) => s.themeName);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  const showVuMeters = useCableLevelStore((s) => s.showVuMeters);
  const toggleVuMeters = useCableLevelStore((s) => s.toggleVuMeters);

  const [openGroup, setOpenGroup] = React.useState<string | null>(null);
  const [hoveredKey, setHoveredKey] = React.useState<string | null>(null);
  const toolbarRef = React.useRef<HTMLDivElement>(null);

  // Recording state
  const isRecording = useRecordingStore((s) => s.isRecording);
  const recordingElapsed = useRecordingStore((s) => s.elapsed);
  const setRecording = useRecordingStore((s) => s.setRecording);
  const setRecordingElapsed = useRecordingStore((s) => s.setElapsed);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const handleToggleRecording = React.useCallback(() => {
    if (isRecording) {
      // Stop recording
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      setRecording(false);
      audioEngine.stopRecording((leftChunks, rightChunks) => {
        const blob = encodeWav(leftChunks, rightChunks, 44100);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mod-synth-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.wav`;
        a.click();
        URL.revokeObjectURL(url);
      });
    } else {
      // Start recording
      setRecording(true);
      audioEngine.startRecording();
      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        setRecordingElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
  }, [isRecording, setRecording, setRecordingElapsed]);

  // Cleanup timer on unmount
  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatRecordingTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // MIDI connection state
  const [midiConnected, setMidiConnected] = React.useState(midiManager.connected);
  const [midiDeviceName, setMidiDeviceName] = React.useState(midiManager.deviceName);

  React.useEffect(() => {
    const unsub = midiManager.subscribe(() => {
      setMidiConnected(midiManager.connected);
      setMidiDeviceName(midiManager.deviceName);
    });
    return unsub;
  }, []);

  // Close dropdown on outside click
  React.useEffect(() => {
    if (!openGroup) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setOpenGroup(null);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [openGroup]);

  const handlePowerToggle = React.useCallback(async () => {
    if (isAudioReady) {
      const audio = new Audio('/power-down.wav');
      audio.volume = 0.5;
      audio.play().catch(() => {});
      await shutdownAudio();
    } else {
      await initAudio();
      const audio = new Audio('/power-up.wav');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    }
  }, [isAudioReady, initAudio, shutdownAudio]);

  const handleAddModule = React.useCallback((type: ModuleType) => {
    addModule(type);
    setOpenGroup(null);
  }, [addModule]);

  const handleToggleGroup = React.useCallback((label: string) => {
    setOpenGroup((prev) => (prev === label ? null : label));
  }, []);

  const categoryBtnStyle = (label: string): React.CSSProperties => {
    const isOpen = openGroup === label;
    const isHovered = hoveredKey === `group-${label}`;
    const disabled = !isAudioReady;
    return {
      background: disabled
        ? `${theme.bgControl}66`
        : isOpen
          ? theme.borderControl
          : isHovered
            ? `${theme.borderControl}88`
            : theme.bgControl,
      color: disabled ? theme.textMuted : theme.textPrimary,
      border: `1px solid ${isOpen ? theme.textMuted : theme.borderSubtle}`,
      padding: '6px 12px',
      borderRadius: 10,
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: 12,
      fontFamily: theme.fontBase,
      whiteSpace: 'nowrap',
      transition: 'all 0.15s ease',
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      opacity: disabled ? 0.3 : 1,
    };
  };

  const iconBtnStyle: React.CSSProperties = {
    background: theme.bgControl,
    color: theme.textPrimary,
    border: `1px solid ${theme.borderSubtle}`,
    padding: '4px 8px',
    borderRadius: 10,
    cursor: 'pointer',
    fontSize: 12,
    fontFamily: theme.fontBase,
    whiteSpace: 'nowrap',
    transition: 'all 0.15s ease',
    lineHeight: 1,
    display: 'flex',
    alignItems: 'center',
  };

  return (
    <div
      ref={toolbarRef}
      style={{
        height: 56,
        background: theme.bgToolbar,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: '0 20px',
        flexShrink: 0,
        borderBottom: `1px solid ${theme.borderSubtle}`,
        position: 'relative',
      }}
    >
      {/* Power button */}
      <button
        style={{
          width: 36,
          height: 36,
          minWidth: 36,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isAudioReady ? `${theme.audioReady}20` : theme.bgControl,
          border: `2px solid ${isAudioReady ? theme.audioReady : theme.borderSubtle}`,
          borderRadius: '50%',
          color: isAudioReady ? theme.audioReady : theme.textMuted,
          cursor: 'pointer',
          padding: 0,
          transition: 'all 0.2s',
        }}
        onClick={handlePowerToggle}
        title={isAudioReady ? 'Power off — stop audio engine' : 'Power on — start audio engine'}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 22 }}>power_settings_new</span>
      </button>

      <div style={{ width: 1, height: 28, background: theme.borderSubtle, marginLeft: 4, marginRight: 4, flexShrink: 0 }} />

      {/* Preset selector */}
      <PresetSelector />

      <div style={{ width: 1, height: 28, background: theme.borderSubtle, marginLeft: 4, marginRight: 4, flexShrink: 0 }} />

      {/* Category dropdown buttons */}
      {MODULE_GROUPS.map((group) => (
        <div key={group.label} style={{ position: 'relative' }}>
          <button
            disabled={!isAudioReady}
            style={categoryBtnStyle(group.label)}
            onMouseEnter={() => setHoveredKey(`group-${group.label}`)}
            onMouseLeave={() => setHoveredKey(null)}
            onClick={() => isAudioReady && handleToggleGroup(group.label)}
          >
            {group.label}
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: 16,
                transition: 'transform 0.2s ease',
                transform: openGroup === group.label ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            >
              expand_more
            </span>
          </button>

          {/* Dropdown menu */}
          {openGroup === group.label && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                background: theme.glassBg,
                border: `1px solid ${theme.glassBorder}`,
                borderRadius: theme.panelRadius,
                boxShadow: theme.glassShadow,
                padding: '6px',
                zIndex: 1000,
                minWidth: 150,
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
              }}
            >
              {group.modules.map((m) => {
                const isItemHovered = hoveredKey === m.type;
                const color = moduleColors[m.type];
                return (
                  <button
                    key={m.type}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      width: '100%',
                      padding: '8px 12px',
                      background: isItemHovered ? `${theme.borderControl}66` : 'transparent',
                      border: 'none',
                      borderRadius: 8,
                      cursor: 'pointer',
                      color: theme.textPrimary,
                      fontSize: 12,
                      fontFamily: theme.fontBase,
                      transition: 'background 0.1s ease',
                      textAlign: 'left',
                    }}
                    onMouseEnter={() => setHoveredKey(m.type)}
                    onMouseLeave={() => setHoveredKey(null)}
                    onClick={() => handleAddModule(m.type)}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: color.primary,
                        flexShrink: 0,
                      }}
                    />
                    {m.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Record button */}
      {isAudioReady && (
        <button
          style={{
            ...iconBtnStyle,
            gap: 4,
            color: isRecording ? '#FF4444' : theme.textMuted,
            borderColor: isRecording ? '#FF4444' : theme.borderSubtle,
          }}
          onClick={handleToggleRecording}
          title={isRecording ? 'Stop recording' : 'Record to WAV'}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: isRecording ? '#FF4444' : theme.textMuted,
              flexShrink: 0,
              animation: isRecording ? 'pulse-recording 1.5s ease-in-out infinite' : 'none',
            }}
          />
          {isRecording && (
            <span style={{ fontSize: 9, fontFamily: theme.fontMono }}>
              {formatRecordingTime(recordingElapsed)}
            </span>
          )}
        </button>
      )}

      {/* VU Meters toggle */}
      {isAudioReady && (
        <button
          style={{
            ...iconBtnStyle,
            color: showVuMeters ? theme.accent : theme.textMuted,
            borderColor: showVuMeters ? theme.accent : theme.borderSubtle,
          }}
          onClick={toggleVuMeters}
          title={showVuMeters ? 'Hide cable VU meters' : 'Show cable VU meters'}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>equalizer</span>
        </button>
      )}

      {/* MIDI indicator */}
      <button
        style={{
          ...iconBtnStyle,
          gap: 4,
          color: midiConnected ? theme.audioReady : theme.textMuted,
          borderColor: midiConnected ? theme.audioReady : theme.borderSubtle,
        }}
        title={midiConnected ? `MIDI: ${midiDeviceName}` : 'No MIDI device connected'}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>piano</span>
        {midiConnected && (
          <span style={{ fontSize: 9, fontFamily: theme.fontBase }}>MIDI</span>
        )}
      </button>

      {/* Theme toggle */}
      <button
        style={iconBtnStyle}
        onClick={toggleTheme}
        title={`Switch to ${themeName === 'dark' ? 'light' : 'dark'} mode`}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
          {themeName === 'dark' ? 'light_mode' : 'dark_mode'}
        </span>
      </button>
    </div>
  );
}
