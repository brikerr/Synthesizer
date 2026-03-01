import { createWorkletNode } from './base-node.ts';

export function createDrumSynthNode(ctx: AudioContext, params: Record<string, number>): AudioWorkletNode {
  return createWorkletNode(ctx, {
    moduleType: 'drumSynth',
    processorName: 'drum-synth-processor',
    numberOfInputs: 3,
    numberOfOutputs: 1,
    outputChannelCount: [1],
    parameterData: {
      voice: params.voice ?? 0,
      pitch: params.pitch ?? 60,
      decay: params.decay ?? 0.3,
      pitchDecay: params.pitchDecay ?? 0.05,
      pitchAmount: params.pitchAmount ?? 2,
      noiseLevel: params.noiseLevel ?? 0.3,
      tone: params.tone ?? 0.5,
      level: params.level ?? 0.8,
    },
  });
}
