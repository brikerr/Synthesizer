import { createWorkletNode } from './base-node.ts';

export function createEnvelopeFollowerNode(ctx: AudioContext, params: Record<string, number>): AudioWorkletNode {
  return createWorkletNode(ctx, {
    moduleType: 'envelopeFollower',
    processorName: 'envelope-follower-processor',
    numberOfInputs: 1,
    numberOfOutputs: 1,
    outputChannelCount: [1],
    parameterData: {
      attack: params.attack ?? 0.01,
      release: params.release ?? 0.1,
      gain: params.gain ?? 1,
      sensitivity: params.sensitivity ?? 0.5,
    },
  });
}
