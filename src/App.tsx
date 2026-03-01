import { useCallback, useEffect, useState } from 'react';
import { Toolbar } from './components/Toolbar.tsx';
import { Rack } from './components/Rack.tsx';
import { Keyboard } from './components/Keyboard.tsx';
import { PasswordGate } from './components/PasswordGate.tsx';
import { ModuleSearch } from './components/ModuleSearch.tsx';
import { ContextMenu } from './components/ContextMenu.tsx';
import { useSynthStore } from './store/synth-store.ts';
import type { ModuleType } from './types/index.ts';

export default function App() {
  const [searchOpen, setSearchOpen] = useState(false);
  const isAudioReady = useSynthStore((s) => s.isAudioReady);
  const addModule = useSynthStore((s) => s.addModule);

  const undo = useSynthStore((s) => s.undo);
  const redo = useSynthStore((s) => s.redo);

  // Keyboard shortcuts: Cmd+K (search), Cmd+Z (undo), Cmd+Shift+Z (redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === 'k') {
        e.preventDefault();
        if (isAudioReady) setSearchOpen((prev) => !prev);
      } else if (mod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (mod && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAudioReady, undo, redo]);

  // Listen for context menu → "Add Module..." action
  useEffect(() => {
    const handler = () => setSearchOpen(true);
    window.addEventListener('open-module-search', handler);
    return () => window.removeEventListener('open-module-search', handler);
  }, []);

  const handleSearchSelect = useCallback(
    (type: ModuleType) => {
      addModule(type);
    },
    [addModule],
  );

  return (
    <PasswordGate>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
      }}>
        <Toolbar />
        <Rack />
        <Keyboard />
      </div>
      <ModuleSearch
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelect={handleSearchSelect}
      />
      <ContextMenu />
    </PasswordGate>
  );
}
