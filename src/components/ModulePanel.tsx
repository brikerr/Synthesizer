import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { useSynthStore } from '../store/synth-store.ts';
import { getModuleDefinition } from '../audio/graph/port-registry.ts';
import { getModuleColor } from '../styles/module-colors.ts';
import { useTheme } from '../store/theme-store.ts';
import { useHistoryStore } from '../store/history-store.ts';
import { ModuleAccentContext } from './controls/ModuleAccentContext.tsx';
import { useContextMenuStore } from '../store/context-menu-store.ts';
import Port from './controls/Port.tsx';
import Tooltip from './hints/Tooltip.tsx';
import type { PortDefinition } from '../types/index.ts';

// Context for signal flow highlighting — provided by Rack, consumed by ModulePanel
interface HighlightContextValue {
  highlightedModuleIds: Set<string> | null;
  onSelectModule: (moduleId: string) => void;
}
export const HighlightContext = createContext<HighlightContextValue>({
  highlightedModuleIds: null,
  onSelectModule: () => {},
});

// Context for deferred module removal (animated delete) — provided by Rack
export const DeferredRemoveContext = createContext<((id: string) => void) | null>(null);

interface ModulePanelProps {
  moduleId: string;
  children: React.ReactNode;
  isHighlighted?: boolean;
  onSelect?: () => void;
}

const ModulePanel: React.FC<ModulePanelProps> = ({ moduleId, children, isHighlighted: isHighlightedProp, onSelect: onSelectProp }) => {
  const module = useSynthStore((s) => s.modules[moduleId]);
  const { highlightedModuleIds, onSelectModule } = useContext(HighlightContext);
  const deferredRemove = useContext(DeferredRemoveContext);
  const openContextMenu = useContextMenuStore((s) => s.open);
  const duplicateModule = useSynthStore((s) => s.duplicateModule);

  // Derive highlight state: props override context
  const isHighlighted = isHighlightedProp !== undefined
    ? isHighlightedProp
    : highlightedModuleIds === null
      ? undefined
      : highlightedModuleIds.has(moduleId);
  const onSelect = onSelectProp ?? (() => onSelectModule(moduleId));
  const removeModule = useSynthStore((s) => s.removeModule);
  const moveModule = useSynthStore((s) => s.moveModule);
  const startCable = useSynthStore((s) => s.startCable);
  const completeCable = useSynthStore((s) => s.completeCable);
  const theme = useTheme();

  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(
    null,
  );
  const labelRef = useRef<HTMLSpanElement>(null);
  const [labelHoverRect, setLabelHoverRect] = useState<DOMRect | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      moveModule(moduleId, {
        x: dragRef.current.origX + dx,
        y: dragRef.current.origY + dy,
      });
    },
    [moduleId, moveModule],
  );

  const handleMouseUp = useCallback(() => {
    dragRef.current = null;
    setIsDragging(false);
    useHistoryStore.getState().setDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, [handleMouseMove]);

  const handleHeaderMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      useHistoryStore.getState().setDragging(true);
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        origX: module.x,
        origY: module.y,
      };
      setIsDragging(true);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    },
    [module.x, module.y, handleMouseMove, handleMouseUp],
  );

  const handleDelete = useCallback(() => {
    if (deferredRemove) {
      deferredRemove(moduleId);
    } else {
      removeModule(moduleId);
    }
  }, [moduleId, removeModule, deferredRemove]);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      openContextMenu(e.clientX, e.clientY, [
        {
          label: 'Duplicate',
          icon: 'content_copy',
          action: () => duplicateModule(moduleId),
        },
        {
          label: 'Delete',
          icon: 'delete',
          danger: true,
          action: handleDelete,
        },
      ]);
    },
    [moduleId, openContextMenu, duplicateModule, handleDelete],
  );

  const handlePortClick = useCallback(
    (_moduleId: string, portId: string, direction: 'input' | 'output', signal: PortDefinition['signal'], _element: HTMLDivElement) => {
      if (direction === 'output') {
        startCable({ moduleId, portId }, signal);
      } else {
        completeCable({ moduleId, portId });
      }
    },
    [moduleId, startCable, completeCable],
  );

  if (!module) return null;

  const definition = getModuleDefinition(module.type);
  const colors = getModuleColor(module.type);
  const inputPorts = definition.ports.filter((p) => p.direction === 'input');
  const outputPorts = definition.ports.filter((p) => p.direction === 'output');

  return (
    <ModuleAccentContext.Provider value={colors}>
      <div
        onContextMenu={handleContextMenu}
        onClick={(e) => {
          if (!isDragging && onSelect) {
            e.stopPropagation();
            onSelect();
          }
        }}
        style={{
        minWidth: 220,
        background: theme.glassBg,
        borderRadius: theme.panelRadius,
        border: `1px solid ${isDragging || isHighlighted === true ? colors.primary : theme.glassBorder}`,
        boxShadow: isDragging
          ? `${theme.glassShadow}, 0 0 16px ${colors.primary}30`
          : isHighlighted === true
            ? `${theme.glassShadow}, 0 0 20px ${colors.primary}25`
            : theme.glassShadow,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'border-color 0.15s, box-shadow 0.15s, opacity 0.2s, filter 0.2s',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        ...(isHighlighted === false ? { opacity: 0.3, filter: 'grayscale(0.5)' } : {}),
      }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: theme.glassHeaderBg,
            borderBottom: `1px solid ${theme.glassBorder}`,
            padding: '8px 14px',
            cursor: 'grab',
            userSelect: 'none',
          }}
          onMouseDown={handleHeaderMouseDown}
        >
          <span
            ref={labelRef}
            style={{
              color: theme.textPrimary,
              fontSize: theme.fontSize,
              fontWeight: 600,
              fontFamily: theme.fontBase,
              letterSpacing: 0.5,
              textTransform: 'uppercase',
              cursor: 'help',
            }}
            onMouseEnter={() => {
              if (labelRef.current && definition.description) {
                setLabelHoverRect(labelRef.current.getBoundingClientRect());
              }
            }}
            onMouseLeave={() => setLabelHoverRect(null)}
          >
            {definition.label}
            {labelHoverRect && definition.description && (
              <Tooltip anchorRect={labelHoverRect} maxWidth={260}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{definition.label}</div>
                <div style={{ color: theme.textSecondary, fontSize: theme.fontSizeLabel }}>
                  {definition.detailedDescription || definition.description}
                </div>
              </Tooltip>
            )}
          </span>
          <button
            style={{
              background: 'none',
              border: 'none',
              color: theme.deleteButton,
              cursor: 'pointer',
              padding: 0,
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
            }}
            onClick={handleDelete}
            title="Remove module"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close_small</span>
          </button>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'row',
          padding: '12px 14px',
          gap: 12,
          alignItems: 'flex-start',
        }}>
          {inputPorts.length > 0 && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              alignItems: 'flex-start',
              minWidth: 40,
            }}>
              {inputPorts.map((port) => (
                <Port
                  key={port.id}
                  portId={port.id}
                  moduleId={moduleId}
                  label={port.name}
                  direction={port.direction}
                  signal={port.signal}
                  portDef={port}
                  onPortClick={handlePortClick}
                />
              ))}
            </div>
          )}

          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
          }}>{children}</div>

          {outputPorts.length > 0 && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              alignItems: 'flex-end',
              minWidth: 40,
            }}>
              {outputPorts.map((port) => (
                <Port
                  key={port.id}
                  portId={port.id}
                  moduleId={moduleId}
                  label={port.name}
                  direction={port.direction}
                  signal={port.signal}
                  portDef={port}
                  onPortClick={handlePortClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </ModuleAccentContext.Provider>
  );
};

export default ModulePanel;
