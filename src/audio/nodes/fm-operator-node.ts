import { createWorkletNode } from './base-node.ts';

export function createFMOperatorNode(ctx: AudioContext, params: Record<string, number>): AudioWorkletNode {
  return createWorkletNode(ctx, {
    moduleType: 'fmOperator',
    processorName: 'fm-operator-processor',
    numberOfInputs: 3,
    numberOfOutputs: 2,
    outputChannelCount: [1, 1],
    parameterData: {
      frequency: params.frequency ?? 0,
      ratio: params.ratio ?? 1,
      fmIndex: params.fmIndex ?? 0,
      feedback: params.feedback ?? 0,
      waveform: params.waveform ?? 0,
    },
  });
}
