// 3-Band EQ AudioWorkletProcessor
// Robert Bristow-Johnson Audio EQ Cookbook biquad formulas
// No imports — runs in AudioWorkletGlobalScope

class EQProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'lowGain', defaultValue: 0, minValue: -12, maxValue: 12, automationRate: 'k-rate' as const },
      { name: 'midGain', defaultValue: 0, minValue: -12, maxValue: 12, automationRate: 'k-rate' as const },
      { name: 'highGain', defaultValue: 0, minValue: -12, maxValue: 12, automationRate: 'k-rate' as const },
      { name: 'lowFreq', defaultValue: 200, minValue: 40, maxValue: 1000, automationRate: 'k-rate' as const },
      { name: 'highFreq', defaultValue: 4000, minValue: 1000, maxValue: 16000, automationRate: 'k-rate' as const },
    ];
  }

  // Biquad state for 3 filters (low shelf, peaking mid, high shelf)
  // Each filter: x1, x2, y1, y2
  private lowState = { x1: 0, x2: 0, y1: 0, y2: 0 };
  private midState = { x1: 0, x2: 0, y1: 0, y2: 0 };
  private highState = { x1: 0, x2: 0, y1: 0, y2: 0 };

  // Cached coefficients
  private lowCoeffs = { b0: 1, b1: 0, b2: 0, a1: 0, a2: 0 };
  private midCoeffs = { b0: 1, b1: 0, b2: 0, a1: 0, a2: 0 };
  private highCoeffs = { b0: 1, b1: 0, b2: 0, a1: 0, a2: 0 };

  private lastLowGain = NaN;
  private lastMidGain = NaN;
  private lastHighGain = NaN;
  private lastLowFreq = NaN;
  private lastHighFreq = NaN;

  private computeLowShelf(freq: number, gainDb: number) {
    const A = Math.pow(10, gainDb / 40);
    const w0 = 2 * Math.PI * freq / sampleRate;
    const cosw0 = Math.cos(w0);
    const sinw0 = Math.sin(w0);
    const alpha = sinw0 / 2 * Math.sqrt(2); // Q = 0.707
    const sqrtA2alpha = 2 * Math.sqrt(A) * alpha;

    const a0 = (A + 1) + (A - 1) * cosw0 + sqrtA2alpha;
    this.lowCoeffs.b0 = (A * ((A + 1) - (A - 1) * cosw0 + sqrtA2alpha)) / a0;
    this.lowCoeffs.b1 = (2 * A * ((A - 1) - (A + 1) * cosw0)) / a0;
    this.lowCoeffs.b2 = (A * ((A + 1) - (A - 1) * cosw0 - sqrtA2alpha)) / a0;
    this.lowCoeffs.a1 = (-2 * ((A - 1) + (A + 1) * cosw0)) / a0;
    this.lowCoeffs.a2 = ((A + 1) + (A - 1) * cosw0 - sqrtA2alpha) / a0;
  }

  private computePeaking(freq: number, gainDb: number) {
    const A = Math.pow(10, gainDb / 40);
    const w0 = 2 * Math.PI * freq / sampleRate;
    const cosw0 = Math.cos(w0);
    const sinw0 = Math.sin(w0);
    const alpha = sinw0 / (2 * 1.0); // Q = 1.0

    const a0 = 1 + alpha / A;
    this.midCoeffs.b0 = (1 + alpha * A) / a0;
    this.midCoeffs.b1 = (-2 * cosw0) / a0;
    this.midCoeffs.b2 = (1 - alpha * A) / a0;
    this.midCoeffs.a1 = (-2 * cosw0) / a0;
    this.midCoeffs.a2 = (1 - alpha / A) / a0;
  }

  private computeHighShelf(freq: number, gainDb: number) {
    const A = Math.pow(10, gainDb / 40);
    const w0 = 2 * Math.PI * freq / sampleRate;
    const cosw0 = Math.cos(w0);
    const sinw0 = Math.sin(w0);
    const alpha = sinw0 / 2 * Math.sqrt(2);
    const sqrtA2alpha = 2 * Math.sqrt(A) * alpha;

    const a0 = (A + 1) - (A - 1) * cosw0 + sqrtA2alpha;
    this.highCoeffs.b0 = (A * ((A + 1) + (A - 1) * cosw0 + sqrtA2alpha)) / a0;
    this.highCoeffs.b1 = (-2 * A * ((A - 1) + (A + 1) * cosw0)) / a0;
    this.highCoeffs.b2 = (A * ((A + 1) + (A - 1) * cosw0 - sqrtA2alpha)) / a0;
    this.highCoeffs.a1 = (2 * ((A - 1) - (A + 1) * cosw0)) / a0;
    this.highCoeffs.a2 = ((A + 1) - (A - 1) * cosw0 - sqrtA2alpha) / a0;
  }

  private processBiquad(
    x: number,
    state: { x1: number; x2: number; y1: number; y2: number },
    c: { b0: number; b1: number; b2: number; a1: number; a2: number },
  ): number {
    const y = c.b0 * x + c.b1 * state.x1 + c.b2 * state.x2 - c.a1 * state.y1 - c.a2 * state.y2;
    state.x2 = state.x1;
    state.x1 = x;
    state.y2 = state.y1;
    state.y1 = y;
    return y;
  }

  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>,
  ): boolean {
    const audioIn = inputs[0]?.[0];
    const output = outputs[0]?.[0];
    if (!output) return true;

    const lowGain = parameters.lowGain[0];
    const midGain = parameters.midGain[0];
    const highGain = parameters.highGain[0];
    const lowFreq = parameters.lowFreq[0];
    const highFreq = parameters.highFreq[0];

    // Recompute coefficients only when params change
    if (lowGain !== this.lastLowGain || lowFreq !== this.lastLowFreq) {
      this.computeLowShelf(lowFreq, lowGain);
      this.lastLowGain = lowGain;
      this.lastLowFreq = lowFreq;
    }
    if (midGain !== this.lastMidGain || lowFreq !== this.lastLowFreq || highFreq !== this.lastHighFreq) {
      const midFreq = Math.sqrt(lowFreq * highFreq);
      this.computePeaking(midFreq, midGain);
      this.lastMidGain = midGain;
    }
    if (highGain !== this.lastHighGain || highFreq !== this.lastHighFreq) {
      this.computeHighShelf(highFreq, highGain);
      this.lastHighGain = highGain;
      this.lastHighFreq = highFreq;
    }

    for (let i = 0; i < output.length; i++) {
      let sample = audioIn ? audioIn[i] : 0;

      // Process through 3 filters in series
      sample = this.processBiquad(sample, this.lowState, this.lowCoeffs);
      sample = this.processBiquad(sample, this.midState, this.midCoeffs);
      sample = this.processBiquad(sample, this.highState, this.highCoeffs);

      output[i] = sample;
    }

    // Denormal flush
    const flush = (s: { x1: number; x2: number; y1: number; y2: number }) => {
      if (Math.abs(s.x1) < 1e-15) s.x1 = 0;
      if (Math.abs(s.x2) < 1e-15) s.x2 = 0;
      if (Math.abs(s.y1) < 1e-15) s.y1 = 0;
      if (Math.abs(s.y2) < 1e-15) s.y2 = 0;
    };
    flush(this.lowState);
    flush(this.midState);
    flush(this.highState);

    return true;
  }
}

registerProcessor('eq-processor', EQProcessor);
