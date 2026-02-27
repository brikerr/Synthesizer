import { createWorkletNode } from './base-node.ts';

export function createLooperNode(ctx: AudioContext, params: Record<string, number>): AudioWorkletNode {
  return createWorkletNode(ctx, {
    moduleType: 'looper',
    processorName: 'looper-processor',
    numberOfInputs: 3,
    numberOfOutputs: 1,
    outputChannelCount: [1],
    parameterData: {
      playbackSpeed: params.playbackSpeed ?? 1,
      mix: params.mix ?? 0.5,
      reverse: params.reverse ?? 0,
    },
  });
}
