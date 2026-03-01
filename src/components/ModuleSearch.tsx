import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { useTheme } from '../store/theme-store.ts';
import { moduleColors } from '../styles/module-colors.ts';
import { getAllModulesFlat } from '../data/module-groups.ts';
import type { ModuleType } from '../types/index.ts';

interface ModuleSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (type: ModuleType) => void;
}

export function ModuleSearch({ open, onClose, onSelect }: ModuleSearchProps) {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const allModules = useMemo(() => getAllModulesFlat(), []);

  const filtered = useMemo(() => {
    if (!query.trim()) return allModules;
    const q = query.toLowerCase();
    return allModules.filter(
      (m) =>
        m.label.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q),
    );
  }, [query, allModules]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      // Defer focus to next frame so the portal is mounted
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const items = listRef.current.children;
    const item = items[selectedIndex] as HTMLElement | undefined;
    item?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filtered[selectedIndex]) {
            onSelect(filtered[selectedIndex].type);
            onClose();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    },
    [filtered, selectedIndex, onSelect, onClose],
  );

  if (!open) return null;

  return ReactDOM.createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '15vh',
      }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
        }}
      />

      {/* Modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: 420,
          maxHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          background: theme.glassBg,
          border: `1px solid ${theme.glassBorder}`,
          borderRadius: theme.panelRadius,
          boxShadow: theme.glassShadow,
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          overflow: 'hidden',
        }}
      >
        {/* Search input */}
        <div
          style={{
            padding: '14px 16px',
            borderBottom: `1px solid ${theme.glassBorder}`,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 20, color: theme.textMuted }}
          >
            search
          </span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search modules..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: theme.textPrimary,
              fontSize: 14,
              fontFamily: theme.fontBase,
            }}
          />
          <kbd
            style={{
              fontSize: 9,
              fontFamily: theme.fontBase,
              color: theme.textMuted,
              background: theme.bgControl,
              padding: '2px 6px',
              borderRadius: 4,
              border: `1px solid ${theme.borderSubtle}`,
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div
          ref={listRef}
          style={{
            overflowY: 'auto',
            padding: 6,
          }}
        >
          {filtered.length === 0 && (
            <div
              style={{
                padding: '16px',
                textAlign: 'center',
                color: theme.textMuted,
                fontSize: 12,
                fontFamily: theme.fontBase,
              }}
            >
              No modules found
            </div>
          )}
          {filtered.map((m, i) => {
            const isSelected = i === selectedIndex;
            const color = moduleColors[m.type];
            return (
              <button
                key={m.type}
                onClick={() => {
                  onSelect(m.type);
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(i)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '8px 12px',
                  background: isSelected ? `${theme.borderControl}66` : 'transparent',
                  border: 'none',
                  borderRadius: 10,
                  cursor: 'pointer',
                  color: theme.textPrimary,
                  fontSize: 12,
                  fontFamily: theme.fontBase,
                  transition: 'background 0.1s ease',
                  textAlign: 'left',
                }}
              >
                {/* Color dot */}
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: color.primary,
                    flexShrink: 0,
                  }}
                />
                {/* Label */}
                <span style={{ fontWeight: 600, minWidth: 90 }}>{m.label}</span>
                {/* Category tag */}
                <span
                  style={{
                    fontSize: 9,
                    color: theme.textMuted,
                    background: theme.bgControl,
                    padding: '1px 6px',
                    borderRadius: 4,
                    flexShrink: 0,
                  }}
                >
                  {m.category}
                </span>
                {/* Description */}
                <span
                  style={{
                    flex: 1,
                    color: theme.textSecondary,
                    fontSize: 10,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {m.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>,
    document.body,
  );
}
