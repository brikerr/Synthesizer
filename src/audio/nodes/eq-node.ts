import { createWorkletNode } from './base-node.ts';

export function createEQNode(ctx: AudioContext, params: Record<string, number>): AudioWorkletNode {
  return createWorkletNode(ctx, {
    moduleType: 'eq',
    processorName: 'eq-processor',
    numberOfInputs: 1,
    numberOfOutputs: 1,
    outputChannelCount: [1],
    parameterData: {
      lowGain: params.lowGain ?? 0,
      midGain: params.midGain ?? 0,
      highGain: params.highGain ?? 0,
      lowFreq: params.lowFreq ?? 200,
      highFreq: params.highFreq ?? 4000,
    },
  });
}
