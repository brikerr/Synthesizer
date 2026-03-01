class CvMixerProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors(): AudioParamDescriptor[] {
    return [
      { name: 'gain1', defaultValue: 1, minValue: -2, maxValue: 2, automationRate: 'k-rate' },
      { name: 'gain2', defaultValue: 1, minValue: -2, maxValue: 2, automationRate: 'k-rate' },
      { name: 'gain3', defaultValue: 1, minValue: -2, maxValue: 2, automationRate: 'k-rate' },
      { name: 'offset', defaultValue: 0, minValue: -1, maxValue: 1, automationRate: 'a-rate' },
    ];
  }

  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>,
  ): boolean {
    const cv1 = inputs[0]?.[0];
    const cv2 = inputs[1]?.[0];
    const cv3 = inputs[2]?.[0];
    const output = outputs[0]?.[0];
    if (!output) return true;

    const g1 = parameters.gain1[0];
    const g2 = parameters.gain2[0];
    const g3 = parameters.gain3[0];
    const offsetParam = parameters.offset;
    const offsetIsConstant = offsetParam.length === 1;

    for (let i = 0; i < output.length; i++) {
      const in1 = cv1 ? cv1[i] : 0;
      const in2 = cv2 ? cv2[i] : 0;
      const in3 = cv3 ? cv3[i] : 0;
      const offset = offsetIsConstant ? offsetParam[0] : offsetParam[i];

      output[i] = in1 * g1 + in2 * g2 + in3 * g3 + offset;
    }

    return true;
  }
}

registerProcessor('cv-mixer-processor', CvMixerProcessor);
