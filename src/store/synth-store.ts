import { create } from 'zustand';
import type { ModuleType, ModuleInstance, CableConnection, PortRef, SignalType } from '../types/index.ts';
import { audioEngine } from '../audio/engine.ts';
import { getModuleDefinition } from '../audio/graph/port-registry.ts';
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
    set((state) => ({
      modules: {
        ...state.modules,
        [id]: { ...state.modules[id], ...pos },
      },
    }));
  },

  updateParam: (moduleId: string, paramName: string, value: number) => {
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

    // Track active preset
    set({ activePresetId: preset.id });
    setActivePresetId(preset.id);
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
