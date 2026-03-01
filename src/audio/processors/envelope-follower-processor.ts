class EnvelopeFollowerProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors(): AudioParamDescriptor[] {
    return [
      { name: 'attack', defaultValue: 0.01, minValue: 0.001, maxValue: 0.5, automationRate: 'k-rate' },
      { name: 'release', defaultValue: 0.1, minValue: 0.01, maxValue: 2, automationRate: 'k-rate' },
      { name: 'gain', defaultValue: 1, minValue: 0.1, maxValue: 10, automationRate: 'k-rate' },
      { name: 'sensitivity', defaultValue: 0.5, minValue: 0, maxValue: 1, automationRate: 'k-rate' },
    ];
  }

  private envelope = 0;

  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>,
  ): boolean {
    const audioIn = inputs[0]?.[0];
    const output = outputs[0]?.[0];
    if (!output) return true;

    const attack = parameters.attack[0];
    const release = parameters.release[0];
    const gain = parameters.gain[0];
    const sensitivity = parameters.sensitivity[0];

    // Compute one-pole coefficients
    const attackCoeff = Math.exp(-1 / (attack * sampleRate));
    const releaseCoeff = Math.exp(-1 / (release * sampleRate));

    for (let i = 0; i < output.length; i++) {
      const input = audioIn ? audioIn[i] : 0;

      // Rectify and apply gain
      const rectified = Math.abs(input) * gain;

      // Asymmetric peak detector
      if (rectified > this.envelope) {
        this.envelope = attackCoeff * this.envelope + (1 - attackCoeff) * rectified;
      } else {
        this.envelope = releaseCoeff * this.envelope + (1 - releaseCoeff) * rectified;
      }

      // Scale by sensitivity and clamp
      let cv = this.envelope * (sensitivity * 4 + 0.5);
      if (cv > 1) cv = 1;
      if (cv < 0) cv = 0;

      output[i] = cv;
    }

    // Denormal flush
    if (this.envelope < 1e-15) this.envelope = 0;

    return true;
  }
}

registerProcessor('envelope-follower-processor', EnvelopeFollowerProcessor);
