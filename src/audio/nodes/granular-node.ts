import { createWorkletNode } from './base-node.ts';

export function createGranularNode(ctx: AudioContext, params: Record<string, number>): AudioWorkletNode {
  return createWorkletNode(ctx, {
    moduleType: 'granular',
    processorName: 'granular-processor',
    numberOfInputs: 3,
    numberOfOutputs: 1,
    outputChannelCount: [1],
    parameterData: {
      grainDensity: params.grainDensity ?? 10,
      grainSize: params.grainSize ?? 0.1,
      spread: params.spread ?? 0.5,
      pitch: params.pitch ?? 1,
      mix: params.mix ?? 0.5,
    },
  });
}
