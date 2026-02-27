// Chorus AudioWorkletProcessor
// No imports — runs in AudioWorkletGlobalScope

class ChorusProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'rate', defaultValue: 1.5, minValue: 0.1, maxValue: 10, automationRate: 'k-rate' as const },
      { name: 'depth', defaultValue: 0.5, minValue: 0, maxValue: 1, automationRate: 'k-rate' as const },
      { name: 'mix', defaultValue: 0.5, minValue: 0, maxValue: 1, automationRate: 'k-rate' as const },
      { name: 'voices', defaultValue: 2, minValue: 1, maxValue: 4, automationRate: 'k-rate' as const },
    ];
  }

  private buffer: Float32Array;
  private writePos = 0;
  private bufferSize: number;
  private phases = [0, 0, 0, 0]; // LFO phases for 4 voices

  constructor() {
    super();
    // ~40ms max delay at 48kHz = ~1920 samples, but allow headroom
    this.bufferSize = Math.ceil(0.05 * sampleRate);
    this.buffer = new Float32Array(this.bufferSize);
  }

  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>,
  ): boolean {
    const audioIn = inputs[0]?.[0];
    const rateCv = inputs[1]?.[0];
    const output = outputs[0]?.[0];
    if (!output) return true;

    const baseRate = parameters.rate[0];
    const depth = parameters.depth[0];
    const mix = parameters.mix[0];
    const voiceCount = Math.round(parameters.voices[0]);

    const maxDelaySamples = 0.04 * sampleRate; // 40ms
    const minDelaySamples = 0.005 * sampleRate; // 5ms center
    const invSR = 1.0 / sampleRate;

    for (let i = 0; i < output.length; i++) {
      const dry = audioIn ? audioIn[i] : 0;
      const rCv = rateCv ? rateCv[i] : 0;
      const rate = Math.max(0.1, baseRate + rCv * 5);

      // Write input to buffer
      this.buffer[this.writePos] = dry;

      // Sum delayed voices
      let wet = 0;
      for (let v = 0; v < voiceCount; v++) {
        // LFO for this voice (phases offset by 1/voiceCount)
        const lfo = Math.sin(2 * Math.PI * this.phases[v]);

        // Delay time modulated by LFO
        const delaySamples = minDelaySamples + (maxDelaySamples - minDelaySamples) * 0.5 * (1 + lfo * depth);

        // Read with linear interpolation
        const readPosFloat = this.writePos - delaySamples;
        const readPosWrapped = ((readPosFloat % this.bufferSize) + this.bufferSize) % this.bufferSize;
        const readIdx = Math.floor(readPosWrapped);
        const frac = readPosWrapped - readIdx;
        const s0 = this.buffer[readIdx];
        const s1 = this.buffer[(readIdx + 1) % this.bufferSize];
        wet += s0 + frac * (s1 - s0);

        // Advance LFO phase
        this.phases[v] += rate * invSR;
        if (this.phases[v] >= 1.0) this.phases[v] -= 1.0;
      }

      wet /= voiceCount;

      // Advance write position
      this.writePos = (this.writePos + 1) % this.bufferSize;

      output[i] = dry * (1 - mix) + wet * mix;
    }

    // Keep voice phases offset
    if (this.phases[0] === 0) {
      for (let v = 0; v < 4; v++) {
        this.phases[v] = v / 4;
      }
    }

    return true;
  }
}

registerProcessor('chorus-processor', ChorusProcessor);
