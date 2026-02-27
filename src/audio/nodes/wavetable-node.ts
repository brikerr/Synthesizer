import { createWorkletNode } from './base-node.ts';

export function createWavetableNode(ctx: AudioContext, params: Record<string, number>): AudioWorkletNode {
  return createWorkletNode(ctx, {
    moduleType: 'wavetable',
    processorName: 'wavetable-processor',
    numberOfInputs: 2,
    numberOfOutputs: 1,
    outputChannelCount: [1],
    parameterData: {
      frequency: params.frequency ?? 0,
      wavetableIndex: params.wavetableIndex ?? 0,
      octave: params.octave ?? 0,
      detune: params.detune ?? 0,
    },
  });
}
