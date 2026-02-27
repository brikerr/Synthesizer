import { createWorkletNode } from './base-node.ts';

export function createEuclideanNode(ctx: AudioContext, params: Record<string, number>): AudioWorkletNode {
  return createWorkletNode(ctx, {
    moduleType: 'euclidean',
    processorName: 'euclidean-processor',
    numberOfInputs: 2,
    numberOfOutputs: 1,
    outputChannelCount: [1],
    parameterData: {
      steps: params.steps ?? 8,
      hits: params.hits ?? 4,
      rotation: params.rotation ?? 0,
      gateLength: params.gateLength ?? 0.5,
    },
  });
}
