import { createWorkletNode } from './base-node.ts';

export function createDistortionNode(ctx: AudioContext, params: Record<string, number>): AudioWorkletNode {
  return createWorkletNode(ctx, {
    moduleType: 'distortion',
    processorName: 'distortion-processor',
    numberOfInputs: 2,
    numberOfOutputs: 1,
    outputChannelCount: [1],
    parameterData: {
      algorithm: params.algorithm ?? 0,
      drive: params.drive ?? 1,
      tone: params.tone ?? 0.5,
      mix: params.mix ?? 1,
      driveModDepth: params.driveModDepth ?? 0,
    },
  });
}
