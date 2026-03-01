import { create } from 'zustand';
import type { ModuleType, ModuleInstance, CableConnection, PortRef, SignalType } from '../types/index.ts';
import { audioEngine } from '../audio/engine.ts';
import { getModuleDefinition } from '../audio/graph/port-registry.ts';
import { useHistoryStore, type HistorySnapshot } from './history-store.ts';
import type { Preset } from '../presets/types.ts';
import { setActivePresetId } from '../presets/preset-storage.ts';

let nextModuleId = 1;
let nextConnectionId = 1;
let nextModuleX = 60;
let _skipDefaultPatch = false;

function generateModuleId(): string {
  return `mod_${nextModuleId++}`;
}

function generateConnectionId(): string {
  return `conn_${nextConnectionId++}`;
}

/** Take a snapshot of current state for undo history */
function takeSnapshot(state: { modules: Record<string, ModuleInstance>; connections: Record<string, CableConnection> }): HistorySnapshot {
  return {
    modules: JSON.parse(JSON.stringify(state.modules)),
    connections: JSON.parse(JSON.stringify(state.connections)),
  };
}

/** Push a snapshot before a mutating action (skipped during drag gestures) */
function pushSnapshotIfNeeded(state: { modules: Record<string, ModuleInstance>; connections: Record<string, CableConnection> }): void {
  if (useHistoryStore.getState().isDragging) return;
  useHistoryStore.getState().pushSnapshot(takeSnapshot(state));
}

/** Reconcile audio engine to match a restored snapshot */
function restoreAudioState(
  current: { modules: Record<string, ModuleInstance>; connections: Record<string, CableConnection>; isAudioReady: boolean },
  target: HistorySnapshot,
): void {
  if (!current.isAudioReady) return;

  const currentModuleIds = new Set(Object.keys(current.modules));
  const targetModuleIds = new Set(Object.keys(target.modules));
  const currentConnIds = new Set(Object.keys(current.connections));
  const targetConnIds = new Set(Object.keys(target.connections));

  // 1. Remove connections that no longer exist
  for (const connId of currentConnIds) {
    if (!targetConnIds.has(connId)) {
      try { audioEngine.disconnect(connId); } catch {}
    }
  }

  // 2. Remove modules that no longer exist
  for (const modId of currentModuleIds) {
    if (!targetModuleIds.has(modId)) {
      try { audioEngine.destroyModule(modId); } catch {}
    }
  }

  // 3. Add modules that are new
  for (const modId of targetModuleIds) {
    if (!currentModuleIds.has(modId)) {
      const mod = target.modules[modId];
      audioEngine.createModule(modId, mod.type, mod.params);
    }
  }

  // 4. Update params for modules that exist in both
  for (const modId of targetModuleIds) {
    if (currentModuleIds.has(modId)) {
      const targetMod = target.modules[modId];
      const currentMod = current.modules[modId];
      for (const [key, value] of Object.entries(targetMod.params)) {
        if (currentMod.params[key] !== value) {
          audioEngine.setParam(modId, key, value);
        }
      }
    }
  }

  // 5. Add connections that are new
  for (const connId of targetConnIds) {
    if (!currentConnIds.has(connId)) {
      const conn = target.connections[connId];
      try { audioEngine.connect(connId, conn.source, conn.dest); } catch {}
    }
  }
}

/** Reset ID counters to prevent collisions after undo/redo */
function resetIdCounters(snapshot: HistorySnapshot): void {
  let maxModId = 0;
  let maxConnId = 0;
  for (const id of Object.keys(snapshot.modules)) {
    const n = parseInt(id.replace('mod_', ''), 10);
    if (n > maxModId) maxModId = n;
  }
  for (const id of Object.keys(snapshot.connections)) {
    const n = parseInt(id.replace('conn_', ''), 10);
    if (n > maxConnId) maxConnId = n;
  }
  nextModuleId = maxModId + 1;
  nextConnectionId = maxConnId + 1;
}

interface PendingCable {
  source: PortRef;
  signalType: SignalType;
}

interface SynthStore {
  modules: Record<string, ModuleInstance>;
  connections: Record<string, CableConnection>;
  isAudioReady: boolean;
  pendingCable: PendingCable | null;
  activePresetId: string | null;

  initAudio: () => Promise<void>;
  shutdownAudio: () => Promise<void>;
  addModule: (type: ModuleType) => string;
  addModuleAt: (type: ModuleType, x: number, y: number) => string;
  removeModule: (id: string) => void;
  moveModule: (id: string, pos: { x: number; y: number }) => void;
  updateParam: (moduleId: string, paramName: string, value: number) => void;
  addConnection: (source: PortRef, dest: PortRef) => string;
  removeConnection: (id: string) => void;
  startCable: (source: PortRef, signalType: SignalType) => void;
  cancelCable: () => void;
  completeCable: (dest: PortRef) => string | null;
  setupDefaultPatch: () => void;
  loadPreset: (preset: Preset) => Promise<void>;
  duplicateModule: (id: string) => string | null;
  undo: () => void;
  redo: () => void;
  noteOn: (midiNote: number) => void;
  noteOff: (midiNote: number) => void;
}

export const useSynthStore = create<SynthStore>((set, get) => ({
  modules: {},
  connections: {},
  isAudioReady: false,
  pendingCable: null,
  activePresetId: null,

  initAudio: async () => {
    try {
      await audioEngine.init();
      set({ isAudioReady: true });
      // Auto-setup default patch if no modules exist (unless loading a preset)
      if (Object.keys(get().modules).length === 0 && !_skipDefaultPatch) {
        get().setupDefaultPatch();
      }
    } catch (err) {
      console.error('Failed to initialize audio:', err);
    }
  },

  shutdownAudio: async () => {
    try {
      await audioEngine.shutdown();
      set({ isAudioReady: false, modules: {}, connections: {}, pendingCable: null });
      nextModuleId = 1;
      nextConnectionId = 1;
      nextModuleX = 60;
    } catch (err) {
      console.error('Failed to shutdown audio:', err);
    }
  },

  addModule: (type: ModuleType): string => {
    pushSnapshotIfNeeded(get());
    const id = generateModuleId();
    const def = getModuleDefinition(type);
    const instance: ModuleInstance = {
      id,
      type,
      x: nextModuleX,
      y: 80,
      params: { ...def.defaultParams },
    };
    nextModuleX += 240;
    if (nextModuleX > 1200) nextModuleX = 60;

    set((state) => ({
      modules: { ...state.modules, [id]: instance },
    }));

    if (get().isAudioReady) {
      audioEngine.createModule(id, type, instance.params);
    }

    return id;
  },

  addModuleAt: (type: ModuleType, x: number, y: number): string => {
    pushSnapshotIfNeeded(get());
    const id = generateModuleId();
    const def = getModuleDefinition(type);
    const instance: ModuleInstance = {
      id,
      type,
      x,
      y,
      params: { ...def.defaultParams },
    };

    set((state) => ({
      modules: { ...state.modules, [id]: instance },
    }));

    if (get().isAudioReady) {
      audioEngine.createModule(id, type, instance.params);
    }

    return id;
  },

  removeModule: (id: string) => {
    pushSnapshotIfNeeded(get());
    // Remove connections for this module
    const state = get();
    const removedConnectionIds = audioEngine.destroyModule(id);

    const newConnections = { ...state.connections };
    for (const connId of removedConnectionIds) {
      delete newConnections[connId];
    }
    // Also remove any store-side connections
    for (const [connId, conn] of Object.entries(newConnections)) {
      if (conn.source.moduleId === id || conn.dest.moduleId === id) {
        delete newConnections[connId];
      }
    }

    const newModules = { ...state.modules };
    delete newModules[id];

    set({
      modules: newModules,
      connections: newConnections,
      pendingCable: state.pendingCable?.source.moduleId === id ? null : state.pendingCable,
    });
  },

  moveModule: (id: string, pos: { x: number; y: number }) => {
    pushSnapshotIfNeeded(get());
    set((state) => ({
      modules: {
        ...state.modules,
        [id]: { ...state.modules[id], ...pos },
      },
    }));
  },

  updateParam: (moduleId: string, paramName: string, value: number) => {
    pushSnapshotIfNeeded(get());
    set((state) => ({
      modules: {
        ...state.modules,
        [moduleId]: {
          ...state.modules[moduleId],
          params: { ...state.modules[moduleId].params, [paramName]: value },
        },
      },
    }));

    if (get().isAudioReady) {
      audioEngine.setParam(moduleId, paramName, value);
    }
  },

  addConnection: (source: PortRef, dest: PortRef): string => {
    pushSnapshotIfNeeded(get());
    const id = generateConnectionId();
    // Get signal type from source port
    const state = get();
    const sourceModule = state.modules[source.moduleId];
    const sourceDef = getModuleDefinition(sourceModule.type);
    const sourcePort = sourceDef.ports.find((p) => p.id === source.portId);
    const signalType: SignalType = sourcePort?.signal ?? 'audio';

    const connection: CableConnection = { id, source, dest, signalType };

    if (get().isAudioReady) {
      audioEngine.connect(id, source, dest);
    }

    set((state) => ({
      connections: { ...state.connections, [id]: connection },
    }));

    return id;
  },

  removeConnection: (id: string) => {
    pushSnapshotIfNeeded(get());
    if (get().isAudioReady) {
      audioEngine.disconnect(id);
    }

    set((state) => {
      const newConnections = { ...state.connections };
      delete newConnections[id];
      return { connections: newConnections };
    });
  },

  startCable: (source: PortRef, signalType: SignalType) => {
    set({ pendingCable: { source, signalType } });
  },

  cancelCable: () => {
    set({ pendingCable: null });
  },

  completeCable: (dest: PortRef): string | null => {
    const { pendingCable } = get();
    if (!pendingCable) return null;

    // Don't connect to same module
    if (pendingCable.source.moduleId === dest.moduleId) {
      set({ pendingCable: null });
      return null;
    }

    // Check if connection already exists
    const existing = Object.values(get().connections).find(
      (c) =>
        c.source.moduleId === pendingCable.source.moduleId &&
        c.source.portId === pendingCable.source.portId &&
        c.dest.moduleId === dest.moduleId &&
        c.dest.portId === dest.portId,
    );
    if (existing) {
      set({ pendingCable: null });
      return null;
    }

    set({ pendingCable: null });
    return get().addConnection(pendingCable.source, dest);
  },

  setupDefaultPatch: () => {
    const s = get();
    // 4-voice polyphonic patch:
    //   Keyboard (4 voice pairs) → 4x (VCO → VCA) → Mixer → Output
    //   Each voice: Pitch CV → VCO, Gate → Envelope → VCA

    const kbd = s.addModuleAt('keyboard', 40, 160);

    // Voice chains — 4 rows
    const voiceY = [40, 200, 360, 520];
    const vcos: string[] = [];
    const envs: string[] = [];
    const vcas: string[] = [];

    for (let v = 0; v < 4; v++) {
      const y = voiceY[v];
      vcos.push(s.addModuleAt('vco', 320, y));
      envs.push(s.addModuleAt('envelope', 560, y));
      vcas.push(s.addModuleAt('vca', 800, y));
    }

    const mixer = s.addModuleAt('mixer', 1060, 200);
    const out = s.addModuleAt('output', 1300, 200);

    // Wire up each voice
    for (let v = 0; v < 4; v++) {
      const voiceNum = v + 1;
      // Keyboard pitch → VCO pitch
      s.addConnection(
        { moduleId: kbd, portId: `pitch_cv_${voiceNum}` },
        { moduleId: vcos[v], portId: 'pitch_cv' },
      );
      // Keyboard gate → Envelope gate
      s.addConnection(
        { moduleId: kbd, portId: `gate_${voiceNum}` },
        { moduleId: envs[v], portId: 'gate_in' },
      );
      // VCO → VCA audio
      s.addConnection(
        { moduleId: vcos[v], portId: 'audio_out' },
        { moduleId: vcas[v], portId: 'audio_in' },
      );
      // Envelope → VCA CV
      s.addConnection(
        { moduleId: envs[v], portId: 'envelope_out' },
        { moduleId: vcas[v], portId: 'cv_in' },
      );
      // VCA → Mixer input
      s.addConnection(
        { moduleId: vcas[v], portId: 'audio_out' },
        { moduleId: mixer, portId: `input_${voiceNum}` },
      );
    }

    // Mixer → Output
    s.addConnection(
      { moduleId: mixer, portId: 'mix_out' },
      { moduleId: out, portId: 'audio_in_left' },
    );

    nextModuleX = 40;
  },

  loadPreset: async (preset: Preset) => {
    const s = get();

    // 1. Cancel pending cable
    s.cancelCable();

    // 2. Shutdown audio — clears modules, connections, resets ID counters
    await s.shutdownAudio();

    // 3-5. Re-init audio without creating default patch
    _skipDefaultPatch = true;
    await s.initAudio();
    _skipDefaultPatch = false;

    // 6. Add modules and build symbolic→real ID map
    const idMap: Record<string, string> = {};
    for (const pm of preset.modules) {
      const realId = get().addModuleAt(pm.type, pm.x, pm.y);
      idMap[pm.id] = realId;
    }

    // 7. Apply non-default params
    for (const pm of preset.modules) {
      const realId = idMap[pm.id];
      const def = getModuleDefinition(pm.type);
      for (const [key, value] of Object.entries(pm.params)) {
        if (def.defaultParams[key] !== value) {
          get().updateParam(realId, key, value);
        }
      }
    }

    // 8. Add connections using remapped IDs
    for (const pc of preset.connections) {
      const sourceId = idMap[pc.sourceModuleId];
      const destId = idMap[pc.destModuleId];
      if (sourceId && destId) {
        get().addConnection(
          { moduleId: sourceId, portId: pc.sourcePortId },
          { moduleId: destId, portId: pc.destPortId },
        );
      }
    }

    // Track active preset and clear undo history
    set({ activePresetId: preset.id });
    setActivePresetId(preset.id);
    useHistoryStore.getState().clear();
  },

  undo: () => {
    const state = get();
    if (!state.isAudioReady) return;
    const currentSnapshot = takeSnapshot(state);
    const history = useHistoryStore.getState();
    const previous = history.undo();
    if (!previous) return;
    // Push current state to future
    useHistoryStore.setState((s) => ({
      future: [...s.future, currentSnapshot],
    }));
    // Reconcile audio engine with restored snapshot
    restoreAudioState(state, previous);
    set({
      modules: previous.modules,
      connections: previous.connections,
      pendingCable: null,
    });
    // Reset ID counters to avoid collisions
    resetIdCounters(previous);
  },

  redo: () => {
    const state = get();
    if (!state.isAudioReady) return;
    const currentSnapshot = takeSnapshot(state);
    const history = useHistoryStore.getState();
    const next = history.redo();
    if (!next) return;
    // Push current state to past
    useHistoryStore.setState((s) => ({
      past: [...s.past, currentSnapshot],
    }));
    // Reconcile audio engine with restored snapshot
    restoreAudioState(state, next);
    set({
      modules: next.modules,
      connections: next.connections,
      pendingCable: null,
    });
    resetIdCounters(next);
  },

  duplicateModule: (id: string): string | null => {
    const state = get();
    const source = state.modules[id];
    if (!source) return null;
    const newId = get().addModuleAt(source.type, source.x + 30, source.y + 30);
    // Copy params
    for (const [key, value] of Object.entries(source.params)) {
      get().updateParam(newId, key, value);
    }
    return newId;
  },

  noteOn: (midiNote: number) => {
    const state = get();
    // Find all keyboard and arpeggiator modules and send noteOn
    for (const mod of Object.values(state.modules)) {
      if (mod.type === 'keyboard' || mod.type === 'arpeggiator') {
        audioEngine.noteOn(mod.id, midiNote);
      }
    }
  },

  noteOff: (midiNote: number) => {
    const state = get();
    for (const mod of Object.values(state.modules)) {
      if (mod.type === 'keyboard' || mod.type === 'arpeggiator') {
        audioEngine.noteOff(mod.id, midiNote);
      }
    }
  },
}));
