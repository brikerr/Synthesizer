import { createWorkletNode } from './base-node.ts';

export function createSlewLimiterNode(ctx: AudioContext, params: Record<string, number>): AudioWorkletNode {
  return createWorkletNode(ctx, {
    moduleType: 'slewLimiter',
    processorName: 'slew-limiter-processor',
    numberOfInputs: 1,
    numberOfOutputs: 1,
    outputChannelCount: [1],
    parameterData: {
      rise: params.rise ?? 0.01,
      fall: params.fall ?? 0.01,
      shape: params.shape ?? 0,
    },
  });
}
