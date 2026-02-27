import { createWorkletNode } from './base-node.ts';

export function createArpeggiatorNode(ctx: AudioContext, params: Record<string, number>): AudioWorkletNode {
  return createWorkletNode(ctx, {
    moduleType: 'arpeggiator',
    processorName: 'arpeggiator-processor',
    numberOfInputs: 2,
    numberOfOutputs: 2,
    outputChannelCount: [1, 1],
    parameterData: {
      rate: params.rate ?? 8,
      pattern: params.pattern ?? 0,
      octaveRange: params.octaveRange ?? 1,
      gateLength: params.gateLength ?? 0.5,
    },
  });
}
