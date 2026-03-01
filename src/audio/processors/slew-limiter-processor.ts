class SlewLimiterProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors(): AudioParamDescriptor[] {
    return [
      { name: 'rise', defaultValue: 0.01, minValue: 0.001, maxValue: 5, automationRate: 'k-rate' },
      { name: 'fall', defaultValue: 0.01, minValue: 0.001, maxValue: 5, automationRate: 'k-rate' },
      { name: 'shape', defaultValue: 0, minValue: 0, maxValue: 1, automationRate: 'k-rate' },
    ];
  }

  private current = 0;

  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>,
  ): boolean {
    const input = inputs[0]?.[0];
    const output = outputs[0]?.[0];
    if (!output) return true;

    const rise = parameters.rise[0];
    const fall = parameters.fall[0];
    const shape = parameters.shape[0];

    const invSr = 1 / sampleRate;

    // Linear slew: step per sample
    const riseStep = invSr / rise;
    const fallStep = invSr / fall;

    // Exponential slew: one-pole coefficients
    const riseCoeff = 1 - Math.exp(-invSr / rise);
    const fallCoeff = 1 - Math.exp(-invSr / fall);

    for (let i = 0; i < output.length; i++) {
      const target = input ? input[i] : 0;
      const diff = target - this.current;

      if (shape < 0.01) {
        // Pure linear
        if (diff > 0) {
          this.current += Math.min(diff, riseStep);
        } else {
          this.current += Math.max(diff, -fallStep);
        }
      } else if (shape > 0.99) {
        // Pure exponential
        const coeff = diff > 0 ? riseCoeff : fallCoeff;
        this.current += diff * coeff;
      } else {
        // Blend between linear and exponential
        if (diff > 0) {
          const lin = Math.min(diff, riseStep);
          const exp = diff * riseCoeff;
          this.current += lin * (1 - shape) + exp * shape;
        } else {
          const lin = Math.max(diff, -fallStep);
          const exp = diff * fallCoeff;
          this.current += lin * (1 - shape) + exp * shape;
        }
      }

      output[i] = this.current;
    }

    // Denormal flush
    if (Math.abs(this.current) < 1e-15) this.current = 0;

    return true;
  }
}

registerProcessor('slew-limiter-processor', SlewLimiterProcessor);
