// FM Operator AudioWorkletProcessor
// No imports — runs in AudioWorkletGlobalScope

const TWO_PI = 2 * Math.PI;
const C4_HZ = 261.625565;

class FMOperatorProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'frequency', defaultValue: 0, minValue: -5, maxValue: 5, automationRate: 'a-rate' as const },
      { name: 'ratio', defaultValue: 1, minValue: 0.25, maxValue: 16, automationRate: 'k-rate' as const },
      { name: 'fmIndex', defaultValue: 0, minValue: 0, maxValue: 10, automationRate: 'k-rate' as const },
      { name: 'feedback', defaultValue: 0, minValue: 0, maxValue: 1, automationRate: 'k-rate' as const },
      { name: 'waveform', defaultValue: 0, minValue: 0, maxValue: 3, automationRate: 'k-rate' as const },
    ];
  }

  private phase = 0;
  private prevOutput = 0; // For self-feedback

  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>,
  ): boolean {
    const pitchCv = inputs[0]?.[0];
    const modulatorIn = inputs[1]?.[0];
    const fmIndexCv = inputs[2]?.[0];
    const audioOut = outputs[0]?.[0];
    const modulatorOut = outputs[1]?.[0];
    if (!audioOut) return true;

    const frequencyParam = parameters.frequency;
    const ratio = parameters.ratio[0];
    const fmIndex = parameters.fmIndex[0];
    const feedback = parameters.feedback[0];
    const waveform = Math.round(parameters.waveform[0]);

    const invSR = 1.0 / sampleRate;

    let phase = this.phase;
    let prevOut = this.prevOutput;

    for (let i = 0; i < audioOut.length; i++) {
      const freqParam = frequencyParam.length > 1 ? frequencyParam[i] : frequencyParam[0];

      // Base CV + pitch CV input
      let cv = freqParam;
      if (pitchCv) cv += pitchCv[i];

      // Convert to frequency with ratio
      const baseFreq = C4_HZ * Math.pow(2.0, cv);
      const freq = baseFreq * ratio;
      const dt = Math.abs(freq) * invSR;

      // FM modulation: external modulator + self-feedback
      const effectiveIndex = fmIndex + (fmIndexCv ? fmIndexCv[i] * 5 : 0);
      let modulation = 0;
      if (modulatorIn) modulation += modulatorIn[i] * effectiveIndex;
      modulation += prevOut * feedback * effectiveIndex;

      // Phase with modulation
      const modPhase = phase + modulation;

      // Waveform generation
      let sample: number;
      switch (waveform) {
        case 0: // Sine
          sample = Math.sin(TWO_PI * modPhase);
          break;
        case 1: // Saw
          sample = 2 * ((modPhase % 1 + 1) % 1) - 1;
          break;
        case 2: // Square
          sample = ((modPhase % 1 + 1) % 1) < 0.5 ? 1 : -1;
          break;
        case 3: // Triangle
          {
            const p = ((modPhase % 1 + 1) % 1);
            sample = p < 0.5 ? 4 * p - 1 : 3 - 4 * p;
          }
          break;
        default:
          sample = Math.sin(TWO_PI * modPhase);
      }

      audioOut[i] = sample;
      if (modulatorOut) modulatorOut[i] = sample;
      prevOut = sample;

      // Advance phase
      phase += dt;
      if (phase >= 1.0) phase -= Math.floor(phase);
    }

    this.phase = phase;
    this.prevOutput = prevOut;

    return true;
  }
}

registerProcessor('fm-operator-processor', FMOperatorProcessor);
