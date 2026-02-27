import { createWorkletNode } from './base-node.ts';

export function createProbabilityGateNode(ctx: AudioContext, params: Record<string, number>): AudioWorkletNode {
  return createWorkletNode(ctx, {
    moduleType: 'probabilityGate',
    processorName: 'probability-gate-processor',
    numberOfInputs: 2,
    numberOfOutputs: 1,
    outputChannelCount: [1],
    parameterData: {
      probability: params.probability ?? 0.5,
      mode: params.mode ?? 0,
    },
  });
}
