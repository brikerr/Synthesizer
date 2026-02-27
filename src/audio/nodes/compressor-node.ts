import { createWorkletNode } from './base-node.ts';

export function createCompressorNode(ctx: AudioContext, params: Record<string, number>): AudioWorkletNode {
  return createWorkletNode(ctx, {
    moduleType: 'compressor',
    processorName: 'compressor-processor',
    numberOfInputs: 2,
    numberOfOutputs: 1,
    outputChannelCount: [1],
    parameterData: {
      threshold: params.threshold ?? -20,
      ratio: params.ratio ?? 4,
      attack: params.attack ?? 0.01,
      release: params.release ?? 0.1,
      makeupGain: params.makeupGain ?? 0,
    },
  });
}
