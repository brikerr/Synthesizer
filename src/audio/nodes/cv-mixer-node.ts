import { createWorkletNode } from './base-node.ts';

export function createCvMixerNode(ctx: AudioContext, params: Record<string, number>): AudioWorkletNode {
  return createWorkletNode(ctx, {
    moduleType: 'cvMixer',
    processorName: 'cv-mixer-processor',
    numberOfInputs: 3,
    numberOfOutputs: 1,
    outputChannelCount: [1],
    parameterData: {
      gain1: params.gain1 ?? 1,
      gain2: params.gain2 ?? 1,
      gain3: params.gain3 ?? 1,
      offset: params.offset ?? 0,
    },
  });
}
