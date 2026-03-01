class BitcrusherProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors(): AudioParamDescriptor[] {
    return [
      { name: 'sampleRateReduction', defaultValue: 1, minValue: 1, maxValue: 40, automationRate: 'k-rate' },
      { name: 'bitDepth', defaultValue: 16, minValue: 1, maxValue: 16, automationRate: 'k-rate' },
      { name: 'mix', defaultValue: 1, minValue: 0, maxValue: 1, automationRate: 'k-rate' },
    ];
  }

  private holdSample = 0;
  private holdCounter = 0;

  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>,
  ): boolean {
    const input = inputs[0]?.[0];
    const output = outputs[0]?.[0];
    if (!output) return true;

    const rateReduction = Math.round(parameters.sampleRateReduction[0]);
    const bitDepth = Math.round(parameters.bitDepth[0]);
    const mix = parameters.mix[0];
    const steps = Math.pow(2, bitDepth);

    for (let i = 0; i < output.length; i++) {
      const dry = input ? input[i] : 0;

      this.holdCounter++;
      if (this.holdCounter >= rateReduction) {
        this.holdCounter = 0;
        // Quantize to bit depth
        this.holdSample = Math.round(dry * steps) / steps;
      }

      output[i] = dry * (1 - mix) + this.holdSample * mix;
    }

    return true;
  }
}

registerProcessor('bitcrusher-processor', BitcrusherProcessor);
