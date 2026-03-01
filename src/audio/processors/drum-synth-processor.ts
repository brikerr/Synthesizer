class DrumSynthProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors(): AudioParamDescriptor[] {
    return [
      { name: 'voice', defaultValue: 0, minValue: 0, maxValue: 2, automationRate: 'k-rate' },
      { name: 'pitch', defaultValue: 60, minValue: 20, maxValue: 500, automationRate: 'k-rate' },
      { name: 'decay', defaultValue: 0.3, minValue: 0.01, maxValue: 2, automationRate: 'k-rate' },
      { name: 'pitchDecay', defaultValue: 0.05, minValue: 0.001, maxValue: 0.5, automationRate: 'k-rate' },
      { name: 'pitchAmount', defaultValue: 2, minValue: 0, maxValue: 8, automationRate: 'k-rate' },
      { name: 'noiseLevel', defaultValue: 0.3, minValue: 0, maxValue: 1, automationRate: 'k-rate' },
      { name: 'tone', defaultValue: 0.5, minValue: 0, maxValue: 1, automationRate: 'k-rate' },
      { name: 'level', defaultValue: 0.8, minValue: 0, maxValue: 1, automationRate: 'k-rate' },
    ];
  }

  private phase = 0;
  private ampEnv = 0;
  private pitchEnv = 0;
  private prevGate = 0;
  private noiseLpState = 0;
  private noiseHpState = 0;
  private noiseBpState = 0;

  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>,
  ): boolean {
    const gateIn = inputs[0]?.[0];
    const pitchCv = inputs[1]?.[0];
    const accentCv = inputs[2]?.[0];
    const output = outputs[0]?.[0];
    if (!output) return true;

    const voice = Math.round(parameters.voice[0]);
    const basePitch = parameters.pitch[0];
    const decay = parameters.decay[0];
    const pitchDecayTime = parameters.pitchDecay[0];
    const pitchAmount = parameters.pitchAmount[0];
    const noiseLevel = parameters.noiseLevel[0];
    const tone = parameters.tone[0];
    const level = parameters.level[0];

    const invSr = 1 / sampleRate;
    const ampDecayCoeff = Math.exp(-invSr / decay);
    const pitchDecayCoeff = Math.exp(-invSr / pitchDecayTime);

    // Tone filter coefficient
    const toneFreq = 200 + tone * 15800;
    const toneLpCoeff = Math.exp(-2 * Math.PI * toneFreq * invSr);

    // Hihat HP filter
    const hpFreq = 4000 + tone * 8000;
    const hpCoeff = Math.exp(-2 * Math.PI * hpFreq * invSr);

    for (let i = 0; i < output.length; i++) {
      const gate = gateIn ? gateIn[i] : 0;

      // Detect gate rising edge — retrigger
      if (gate > 0.5 && this.prevGate <= 0.5) {
        this.ampEnv = 1;
        this.pitchEnv = 1;
        this.phase = 0;
      }
      this.prevGate = gate;

      // Apply accent
      const accent = accentCv ? (1 + accentCv[i] * 0.5) : 1;

      // Pitch with CV and envelope sweep
      let freq = basePitch;
      if (pitchCv) freq += pitchCv[i] * 100; // CV modulation
      freq *= (1 + this.pitchEnv * pitchAmount * 2); // pitch envelope sweep up

      // Advance phase
      this.phase += freq * invSr;
      if (this.phase >= 1) this.phase -= 1;

      // Generate sine oscillator
      const sine = Math.sin(2 * Math.PI * this.phase);

      // Generate noise
      const white = Math.random() * 2 - 1;

      let sample: number;

      switch (voice) {
        case 0: {
          // Kick: sine with pitch sweep + subtle noise click
          const noiseClick = this.pitchEnv > 0.5 ? white * noiseLevel * this.pitchEnv : 0;
          const raw = sine * this.ampEnv + noiseClick * this.ampEnv;
          // Tone LP filter
          this.noiseLpState = raw * (1 - toneLpCoeff) + this.noiseLpState * toneLpCoeff;
          sample = this.noiseLpState;
          break;
        }
        case 1: {
          // Snare: sine body + bandpass noise
          const body = sine * this.ampEnv * (1 - noiseLevel);
          // Bandpass noise via LP then HP
          this.noiseLpState = white * (1 - toneLpCoeff) + this.noiseLpState * toneLpCoeff;
          this.noiseBpState = this.noiseLpState - this.noiseHpState;
          this.noiseHpState += this.noiseBpState * 0.15;
          const noise = this.noiseBpState * noiseLevel * this.ampEnv * 2;
          sample = body + noise;
          break;
        }
        case 2: {
          // Hihat: highpass noise, shorter decay
          const hpNoise = white - this.noiseHpState;
          this.noiseHpState += hpNoise * (1 - hpCoeff);
          sample = hpNoise * this.ampEnv * noiseLevel * 2;
          // Add metallic sine component
          sample += sine * this.ampEnv * (1 - noiseLevel) * 0.3;
          break;
        }
        default:
          sample = sine * this.ampEnv;
      }

      // Decay envelopes
      this.ampEnv *= ampDecayCoeff;
      this.pitchEnv *= pitchDecayCoeff;

      output[i] = sample * level * accent;
    }

    // Denormal flush
    if (this.ampEnv < 1e-15) this.ampEnv = 0;
    if (this.pitchEnv < 1e-15) this.pitchEnv = 0;
    if (Math.abs(this.noiseLpState) < 1e-15) this.noiseLpState = 0;
    if (Math.abs(this.noiseHpState) < 1e-15) this.noiseHpState = 0;
    if (Math.abs(this.noiseBpState) < 1e-15) this.noiseBpState = 0;

    return true;
  }
}

registerProcessor('drum-synth-processor', DrumSynthProcessor);
