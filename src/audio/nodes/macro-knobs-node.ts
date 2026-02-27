import { createWorkletNode } from './base-node.ts';

export function createMacroKnobsNode(ctx: AudioContext, params: Record<string, number>): AudioWorkletNode {
  return createWorkletNode(ctx, {
    moduleType: 'macroKnobs',
    processorName: 'macro-knobs-processor',
    numberOfInputs: 0,
    numberOfOutputs: 4,
    outputChannelCount: [1, 1, 1, 1],
    parameterData: {
      macro1: params.macro1 ?? 0,
      macro2: params.macro2 ?? 0,
      macro3: params.macro3 ?? 0,
      macro4: params.macro4 ?? 0,
    },
  });
}
