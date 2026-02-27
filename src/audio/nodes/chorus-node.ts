import { createWorkletNode } from './base-node.ts';

export function createChorusNode(ctx: AudioContext, params: Record<string, number>): AudioWorkletNode {
  return createWorkletNode(ctx, {
    moduleType: 'chorus',
    processorName: 'chorus-processor',
    numberOfInputs: 2,
    numberOfOutputs: 1,
    outputChannelCount: [1],
    parameterData: {
      rate: params.rate ?? 1.5,
      depth: params.depth ?? 0.5,
      mix: params.mix ?? 0.5,
      voices: params.voices ?? 2,
    },
  });
}
