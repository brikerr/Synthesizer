// Macro Knobs AudioWorkletProcessor
// No imports — runs in AudioWorkletGlobalScope

class MacroKnobsProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'macro1', defaultValue: 0, minValue: -1, maxValue: 1, automationRate: 'k-rate' as const },
      { name: 'macro2', defaultValue: 0, minValue: -1, maxValue: 1, automationRate: 'k-rate' as const },
      { name: 'macro3', defaultValue: 0, minValue: -1, maxValue: 1, automationRate: 'k-rate' as const },
      { name: 'macro4', defaultValue: 0, minValue: -1, maxValue: 1, automationRate: 'k-rate' as const },
    ];
  }

  process(
    _inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>,
  ): boolean {
    const v1 = parameters.macro1[0];
    const v2 = parameters.macro2[0];
    const v3 = parameters.macro3[0];
    const v4 = parameters.macro4[0];

    const out1 = outputs[0]?.[0];
    const out2 = outputs[1]?.[0];
    const out3 = outputs[2]?.[0];
    const out4 = outputs[3]?.[0];

    if (out1) for (let i = 0; i < out1.length; i++) out1[i] = v1;
    if (out2) for (let i = 0; i < out2.length; i++) out2[i] = v2;
    if (out3) for (let i = 0; i < out3.length; i++) out3[i] = v3;
    if (out4) for (let i = 0; i < out4.length; i++) out4[i] = v4;

    return true;
  }
}

registerProcessor('macro-knobs-processor', MacroKnobsProcessor);
