import { createWorkletNode } from './base-node.ts';

export function createBitcrusherNode(ctx: AudioContext, params: Record<string, number>): AudioWorkletNode {
  return createWorkletNode(ctx, {
    moduleType: 'bitcrusher',
    processorName: 'bitcrusher-processor',
    numberOfInputs: 1,
    numberOfOutputs: 1,
    outputChannelCount: [1],
    parameterData: {
      sampleRateReduction: params.sampleRateReduction ?? 1,
      bitDepth: params.bitDepth ?? 16,
      mix: params.mix ?? 1,
    },
  });
}
