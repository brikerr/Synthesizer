// Compressor/Limiter AudioWorkletProcessor
// No imports — runs in AudioWorkletGlobalScope

class CompressorProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'threshold', defaultValue: -20, minValue: -60, maxValue: 0, automationRate: 'k-rate' as const },
      { name: 'ratio', defaultValue: 4, minValue: 1, maxValue: 20, automationRate: 'k-rate' as const },
      { name: 'attack', defaultValue: 0.01, minValue: 0.001, maxValue: 0.5, automationRate: 'k-rate' as const },
      { name: 'release', defaultValue: 0.1, minValue: 0.01, maxValue: 2, automationRate: 'k-rate' as const },
      { name: 'makeupGain', defaultValue: 0, minValue: 0, maxValue: 30, automationRate: 'k-rate' as const },
    ];
  }

  private envelope = 0; // Peak envelope level in dB

  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>,
  ): boolean {
    const audioIn = inputs[0]?.[0];
    const sidechainIn = inputs[1]?.[0];
    const output = outputs[0]?.[0];
    if (!output) return true;

    const threshold = parameters.threshold[0];
    const ratio = parameters.ratio[0];
    const attack = parameters.attack[0];
    const release = parameters.release[0];
    const makeupGain = parameters.makeupGain[0];

    // Compute attack/release coefficients
    const attackCoeff = Math.exp(-1 / (attack * sampleRate));
    const releaseCoeff = Math.exp(-1 / (release * sampleRate));

    // Makeup gain in linear
    const makeupLinear = Math.pow(10, makeupGain / 20);

    for (let i = 0; i < output.length; i++) {
      const input = audioIn ? audioIn[i] : 0;
      // Use sidechain input for detection if available, otherwise use main input
      const detector = sidechainIn ? sidechainIn[i] : input;

      // Peak level in dB
      const absLevel = Math.abs(detector);
      const levelDb = absLevel > 0.000001 ? 20 * Math.log10(absLevel) : -120;

      // Envelope follower
      const coeff = levelDb > this.envelope ? attackCoeff : releaseCoeff;
      this.envelope = coeff * this.envelope + (1 - coeff) * levelDb;

      // Gain reduction
      let gainReduction = 0;
      if (this.envelope > threshold) {
        gainReduction = (this.envelope - threshold) * (1 - 1 / ratio);
      }

      // Apply gain reduction + makeup
      const gainDb = -gainReduction + makeupGain;
      const gainLinear = Math.pow(10, gainDb / 20);

      output[i] = input * gainLinear;
    }

    // Denormal flush
    if (Math.abs(this.envelope) < 1e-15) this.envelope = 0;

    return true;
  }
}

registerProcessor('compressor-processor', CompressorProcessor);
