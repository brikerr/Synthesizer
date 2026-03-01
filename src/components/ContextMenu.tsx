import { useCallback, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { useContextMenuStore } from '../store/context-menu-store.ts';
import { useTheme } from '../store/theme-store.ts';

export function ContextMenu() {
  const { isOpen, x, y, items, close } = useContextMenuStore();
  const theme = useTheme();
  const menuRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState(-1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Clamp to viewport boundaries
  useEffect(() => {
    if (!isOpen || !menuRef.current) {
      setPosition({ x, y });
      return;
    }
    const rect = menuRef.current.getBoundingClientRect();
    const clampedX = Math.min(x, window.innerWidth - rect.width - 8);
    const clampedY = Math.min(y, window.innerHeight - rect.height - 8);
    setPosition({ x: Math.max(8, clampedX), y: Math.max(8, clampedY) });
  }, [isOpen, x, y, items]);

  // Close on outside click or Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    const handleClick = () => close();
    window.addEventListener('keydown', handleKey);
    window.addEventListener('pointerdown', handleClick);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('pointerdown', handleClick);
    };
  }, [isOpen, close]);

  const handleItemClick = useCallback(
    (action: () => void) => {
      close();
      action();
    },
    [close],
  );

  if (!isOpen || items.length === 0) return null;

  return ReactDOM.createPortal(
    <div
      ref={menuRef}
      onPointerDown={(e) => e.stopPropagation()}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 10001,
        minWidth: 160,
        background: theme.glassBg,
        border: `1px solid ${theme.glassBorder}`,
        borderRadius: 12,
        boxShadow: theme.glassShadow,
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        padding: 4,
      }}
    >
      {items.map((item, i) => {
        const isHovered = hoveredIndex === i;
        return (
          <button
            key={i}
            onClick={() => handleItemClick(item.action)}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(-1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: '100%',
              padding: '7px 12px',
              background: isHovered ? `${theme.borderControl}66` : 'transparent',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              color: item.danger ? '#FF5555' : theme.textPrimary,
              fontSize: 12,
              fontFamily: theme.fontBase,
              transition: 'background 0.1s ease',
              textAlign: 'left',
            }}
          >
            {item.icon && (
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 16, opacity: 0.8 }}
              >
                {item.icon}
              </span>
            )}
            {item.label}
          </button>
        );
      })}
    </div>,
    document.body,
  );
}
