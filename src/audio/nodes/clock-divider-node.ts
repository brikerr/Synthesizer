import { createWorkletNode } from './base-node.ts';

export function createClockDividerNode(ctx: AudioContext, params: Record<string, number>): AudioWorkletNode {
  return createWorkletNode(ctx, {
    moduleType: 'clockDivider',
    processorName: 'clock-divider-processor',
    numberOfInputs: 2,
    numberOfOutputs: 4,
    outputChannelCount: [1, 1, 1, 1],
    parameterData: {
      gateLength: params.gateLength ?? 0.5,
    },
  });
}
