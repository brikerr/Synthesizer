// Granular Processor AudioWorkletProcessor
// No imports — runs in AudioWorkletGlobalScope

interface Grain {
  active: boolean;
  startPos: number;  // Start position in the record buffer
  readPos: number;   // Current read position (fractional)
  length: number;    // Grain length in samples
  elapsed: number;   // Samples elapsed
  rate: number;      // Playback rate (for pitch shifting)
}

class GranularProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'grainDensity', defaultValue: 10, minValue: 1, maxValue: 50, automationRate: 'k-rate' as const },
      { name: 'grainSize', defaultValue: 0.1, minValue: 0.01, maxValue: 0.5, automationRate: 'k-rate' as const },
      { name: 'spread', defaultValue: 0.5, minValue: 0, maxValue: 1, automationRate: 'k-rate' as const },
      { name: 'pitch', defaultValue: 1, minValue: 0.25, maxValue: 4, automationRate: 'k-rate' as const },
      { name: 'mix', defaultValue: 0.5, minValue: 0, maxValue: 1, automationRate: 'k-rate' as const },
    ];
  }

  private recordBuffer: Float32Array;
  private recordPos = 0;
  private bufferLength: number;
  private grains: Grain[];
  private grainTimer = 0;
  private hannWindow: Float32Array;
  private hannSize = 4096;

  constructor() {
    super();
    // 4 second circular record buffer
    this.bufferLength = Math.ceil(4 * sampleRate);
    this.recordBuffer = new Float32Array(this.bufferLength);

    // Grain pool (32 max)
    this.grains = [];
    for (let i = 0; i < 32; i++) {
      this.grains.push({ active: false, startPos: 0, readPos: 0, length: 0, elapsed: 0, rate: 1 });
    }

    // Pre-compute Hann window
    this.hannWindow = new Float32Array(this.hannSize);
    for (let i = 0; i < this.hannSize; i++) {
      this.hannWindow[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / (this.hannSize - 1)));
    }
  }

  private getHann(phase: number): number {
    // phase is 0..1
    const idx = phase * (this.hannSize - 1);
    const i = Math.floor(idx);
    const frac = idx - i;
    const a = this.hannWindow[i];
    const b = this.hannWindow[Math.min(i + 1, this.hannSize - 1)];
    return a + frac * (b - a);
  }

  private spawnGrain(grainSize: number, spread: number, pitch: number) {
    // Find an inactive grain
    for (const grain of this.grains) {
      if (!grain.active) {
        const lengthSamples = Math.floor(grainSize * sampleRate);
        // Random start offset based on spread
        const maxOffset = Math.floor(spread * this.bufferLength * 0.5);
        const offset = Math.floor(Math.random() * maxOffset * 2 - maxOffset);
        let startPos = this.recordPos - lengthSamples + offset;
        startPos = ((startPos % this.bufferLength) + this.bufferLength) % this.bufferLength;

        grain.active = true;
        grain.startPos = startPos;
        grain.readPos = startPos;
        grain.length = lengthSamples;
        grain.elapsed = 0;
        grain.rate = pitch;
        return;
      }
    }
  }

  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>,
  ): boolean {
    const audioIn = inputs[0]?.[0];
    const densityCv = inputs[1]?.[0];
    const sizeCv = inputs[2]?.[0];
    const output = outputs[0]?.[0];
    if (!output) return true;

    const baseDensity = parameters.grainDensity[0];
    const baseSize = parameters.grainSize[0];
    const spread = parameters.spread[0];
    const pitch = parameters.pitch[0];
    const mix = parameters.mix[0];

    const density = Math.max(1, baseDensity + (densityCv ? densityCv[0] * 25 : 0));
    const grainSize = Math.max(0.01, Math.min(0.5, baseSize + (sizeCv ? sizeCv[0] * 0.25 : 0)));
    const spawnInterval = sampleRate / density;

    for (let i = 0; i < output.length; i++) {
      const dry = audioIn ? audioIn[i] : 0;

      // Record into circular buffer
      this.recordBuffer[this.recordPos] = dry;
      this.recordPos = (this.recordPos + 1) % this.bufferLength;

      // Spawn grains at density rate
      this.grainTimer++;
      if (this.grainTimer >= spawnInterval) {
        this.grainTimer = 0;
        this.spawnGrain(grainSize, spread, pitch);
      }

      // Sum active grains
      let wet = 0;
      let activeCount = 0;
      for (const grain of this.grains) {
        if (!grain.active) continue;

        // Hann window envelope
        const phase = grain.elapsed / grain.length;
        const env = this.getHann(phase);

        // Read from buffer with linear interpolation
        const readIdx = Math.floor(grain.readPos);
        const frac = grain.readPos - readIdx;
        const wrappedIdx = ((readIdx % this.bufferLength) + this.bufferLength) % this.bufferLength;
        const nextIdx = (wrappedIdx + 1) % this.bufferLength;

        const s = this.recordBuffer[wrappedIdx] + frac * (this.recordBuffer[nextIdx] - this.recordBuffer[wrappedIdx]);
        wet += s * env;
        activeCount++;

        // Advance grain
        grain.readPos += grain.rate;
        grain.elapsed++;

        if (grain.elapsed >= grain.length) {
          grain.active = false;
        }
      }

      // Normalize by a reasonable amount
      if (activeCount > 0) wet /= Math.max(1, Math.sqrt(activeCount));

      output[i] = dry * (1 - mix) + wet * mix;
    }

    return true;
  }
}

registerProcessor('granular-processor', GranularProcessor);
