import type { ModuleType, PortRef } from '../types/index.ts';
import { getAudioContext, initAudioContext } from './context.ts';
import { loadAllProcessors } from './worklet-loader.ts';
import { ConnectionManager } from './graph/connection-manager.ts';
import { getModuleDefinition } from './graph/port-registry.ts';
import { createVCONode } from './nodes/vco-node.ts';
import { createVCFNode } from './nodes/vcf-node.ts';
import { createVCANode } from './nodes/vca-node.ts';
import { createEnvelopeNode } from './nodes/envelope-node.ts';
import { createLFONode } from './nodes/lfo-node.ts';
import { createMixerNode } from './nodes/mixer-node.ts';
import { createKeyboardNode } from './nodes/keyboard-node.ts';
import { createOutputNode } from './nodes/output-node.ts';
import { createNoiseNode } from './nodes/noise-node.ts';
import { createDelayNode } from './nodes/delay-node.ts';
import { createReverbNode } from './nodes/reverb-node.ts';
import { createOscilloscopeNode } from './nodes/oscilloscope-node.ts';
import { createSampleHoldNode } from './nodes/sample-hold-node.ts';
import { createRingModNode } from './nodes/ring-mod-node.ts';
import { createQuantizerNode } from './nodes/quantizer-node.ts';
import { createWavefolderNode } from './nodes/wavefolder-node.ts';
import { createSpectrumNode } from './nodes/spectrum-node.ts';
import { createStepSequencerNode } from './nodes/step-sequencer-node.ts';
import { createMacroKnobsNode } from './nodes/macro-knobs-node.ts';
import { createProbabilityGateNode } from './nodes/probability-gate-node.ts';
import { createEuclideanNode } from './nodes/euclidean-node.ts';
import { createChorusNode } from './nodes/chorus-node.ts';
import { createCompressorNode } from './nodes/compressor-node.ts';
import { createEQNode } from './nodes/eq-node.ts';
import { createFMOperatorNode } from './nodes/fm-operator-node.ts';
import { createWavetableNode } from './nodes/wavetable-node.ts';
import { createArpeggiatorNode } from './nodes/arpeggiator-node.ts';
import { createGranularNode } from './nodes/granular-node.ts';
import { createLooperNode } from './nodes/looper-node.ts';
import { midiManager } from './midi-manager.ts';

export class AudioEngine {
  private nodes = new Map<string, AudioWorkletNode>();
  private connectionManager: ConnectionManager;
  private initialized = false;

  constructor() {
    this.connectionManager = new ConnectionManager(this.nodes);
  }

  async init(): Promise<void> {
    if (this.initialized) return;
    const ctx = await initAudioContext();
    await loadAllProcessors(ctx);
    await midiManager.init();
    this.initialized = true;
  }

  async shutdown(): Promise<void> {
    if (!this.initialized) return;
    // Disconnect and remove all nodes
    for (const [id, node] of this.nodes) {
      this.connectionManager.disconnectAllForModule(id);
      node.disconnect();
    }
    this.nodes.clear();
    midiManager.shutdown();
    // Suspend the audio context
    const ctx = getAudioContext();
    await ctx.suspend();
    this.initialized = false;
  }

  isReady(): boolean {
    return this.initialized;
  }

  createModule(id: string, type: ModuleType, params: Record<string, number>): void {
    const ctx = getAudioContext();
    let node: AudioWorkletNode;

    switch (type) {
      case 'vco':
        node = createVCONode(ctx, params);
        break;
      case 'vcf':
        node = createVCFNode(ctx, params);
        break;
      case 'vca':
        node = createVCANode(ctx, params);
        break;
      case 'envelope':
        node = createEnvelopeNode(ctx, params);
        break;
      case 'lfo':
        node = createLFONode(ctx, params);
        break;
      case 'mixer':
        node = createMixerNode(ctx, params);
        break;
      case 'keyboard':
        node = createKeyboardNode(ctx, params);
        break;
      case 'output':
        node = createOutputNode(ctx, params);
        break;
      case 'noise':
        node = createNoiseNode(ctx, params);
        break;
      case 'delay':
        node = createDelayNode(ctx, params);
        break;
      case 'reverb':
        node = createReverbNode(ctx, params);
        break;
      case 'oscilloscope':
        node = createOscilloscopeNode(ctx, params);
        break;
      case 'sampleHold':
        node = createSampleHoldNode(ctx, params);
        break;
      case 'ringMod':
        node = createRingModNode(ctx, params);
        break;
      case 'quantizer':
        node = createQuantizerNode(ctx, params);
        break;
      case 'wavefolder':
        node = createWavefolderNode(ctx, params);
        break;
      case 'spectrum':
        node = createSpectrumNode(ctx, params);
        break;
      case 'stepSequencer':
        node = createStepSequencerNode(ctx, params);
        break;
      case 'macroKnobs':
        node = createMacroKnobsNode(ctx, params);
        break;
      case 'probabilityGate':
        node = createProbabilityGateNode(ctx, params);
        break;
      case 'euclidean':
        node = createEuclideanNode(ctx, params);
        break;
      case 'chorus':
        node = createChorusNode(ctx, params);
        break;
      case 'compressor':
        node = createCompressorNode(ctx, params);
        break;
      case 'eq':
        node = createEQNode(ctx, params);
        break;
      case 'fmOperator':
        node = createFMOperatorNode(ctx, params);
        break;
      case 'wavetable':
        node = createWavetableNode(ctx, params);
        break;
      case 'arpeggiator':
        node = createArpeggiatorNode(ctx, params);
        break;
      case 'granular':
        node = createGranularNode(ctx, params);
        break;
      case 'looper':
        node = createLooperNode(ctx, params);
        break;
      default:
        throw new Error(`Unknown module type: ${type}`);
    }

    this.nodes.set(id, node);
  }

  destroyModule(id: string): string[] {
    const removedConnections = this.connectionManager.disconnectAllForModule(id);
    const node = this.nodes.get(id);
    if (node) {
      node.disconnect();
      this.nodes.delete(id);
    }
    return removedConnections;
  }

  setParam(moduleId: string, paramName: string, value: number): void {
    const node = this.nodes.get(moduleId);
    if (!node) return;
    const param = node.parameters.get(paramName);
    if (param) {
      const ctx = getAudioContext();
      param.setValueAtTime(value, ctx.currentTime);
    }
  }

  connect(connectionId: string, source: PortRef, dest: PortRef): string {
    const signalType = this.connectionManager.connect(connectionId, source, dest);
    return signalType;
  }

  disconnect(connectionId: string): void {
    this.connectionManager.disconnect(connectionId);
  }

  getNode(moduleId: string): AudioWorkletNode | undefined {
    return this.nodes.get(moduleId);
  }

  noteOn(keyboardModuleId: string, midiNote: number): void {
    const node = this.nodes.get(keyboardModuleId);
    if (node) {
      node.port.postMessage({ type: 'noteOn', note: midiNote });
    }
  }

  noteOff(keyboardModuleId: string, midiNote: number): void {
    const node = this.nodes.get(keyboardModuleId);
    if (node) {
      node.port.postMessage({ type: 'noteOff', note: midiNote });
    }
  }
}

export const audioEngine = new AudioEngine();
