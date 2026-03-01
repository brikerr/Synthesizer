class DistortionProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors(): AudioParamDescriptor[] {
    return [
      { name: 'algorithm', defaultValue: 0, minValue: 0, maxValue: 3, automationRate: 'k-rate' },
      { name: 'drive', defaultValue: 1, minValue: 1, maxValue: 20, automationRate: 'a-rate' },
      { name: 'tone', defaultValue: 0.5, minValue: 0, maxValue: 1, automationRate: 'k-rate' },
      { name: 'mix', defaultValue: 1, minValue: 0, maxValue: 1, automationRate: 'k-rate' },
      { name: 'driveModDepth', defaultValue: 0, minValue: 0, maxValue: 1, automationRate: 'k-rate' },
    ];
  }

  private lpState = 0;

  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>,
  ): boolean {
    const audioIn = inputs[0]?.[0];
    const driveCv = inputs[1]?.[0];
    const output = outputs[0]?.[0];
    if (!output) return true;

    const algo = Math.round(parameters.algorithm[0]);
    const driveParam = parameters.drive;
    const driveIsConstant = driveParam.length === 1;
    const tone = parameters.tone[0];
    const mix = parameters.mix[0];
    const driveModDepth = parameters.driveModDepth[0];

    // One-pole LP coefficient for tone control
    const lpCoeff = Math.exp(-2 * Math.PI * (200 + tone * 19800) / sampleRate);

    for (let i = 0; i < output.length; i++) {
      const dry = audioIn ? audioIn[i] : 0;
      let baseDrive = driveIsConstant ? driveParam[0] : driveParam[i];

      // Apply drive CV modulation
      if (driveCv && driveModDepth > 0) {
        baseDrive += driveCv[i] * driveModDepth * 19; // scale to drive range
      }
      baseDrive = Math.max(1, Math.min(20, baseDrive));

      const driven = dry * baseDrive;
      let wet: number;

      switch (algo) {
        case 0: // Soft clip (tanh)
          wet = Math.tanh(driven);
          break;
        case 1: // Hard clip
          wet = Math.max(-1, Math.min(1, driven));
          break;
        case 2: { // Foldback
          let s = driven;
          while (s > 1 || s < -1) {
            if (s > 1) s = 2 - s;
            if (s < -1) s = -2 - s;
          }
          wet = s;
          break;
        }
        case 3: { // Tape saturation (asymmetric)
          if (driven >= 0) {
            wet = 1 - Math.exp(-driven);
          } else {
            wet = -1 + Math.exp(driven);
          }
          wet *= 0.9; // slight compression
          break;
        }
        default:
          wet = Math.tanh(driven);
      }

      // Tone filter (one-pole LP)
      this.lpState = wet * (1 - lpCoeff) + this.lpState * lpCoeff;
      const filtered = this.lpState;

      output[i] = dry * (1 - mix) + filtered * mix;
    }

    // Denormal flush
    if (Math.abs(this.lpState) < 1e-15) this.lpState = 0;

    return true;
  }
}

registerProcessor('distortion-processor', DistortionProcessor);
