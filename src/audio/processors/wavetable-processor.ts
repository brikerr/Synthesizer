// Wavetable Oscillator AudioWorkletProcessor
// No imports — runs in AudioWorkletGlobalScope

const WT_SIZE = 256;
const TWO_PI = 2 * Math.PI;
const C4_HZ = 261.625565;

// Pre-compute 7 wavetables
function generateWavetables(): Float32Array[] {
  const tables: Float32Array[] = [];

  // 0: Sine
  const sine = new Float32Array(WT_SIZE);
  for (let i = 0; i < WT_SIZE; i++) sine[i] = Math.sin(TWO_PI * i / WT_SIZE);
  tables.push(sine);

  // 1: Triangle
  const tri = new Float32Array(WT_SIZE);
  for (let i = 0; i < WT_SIZE; i++) {
    const p = i / WT_SIZE;
    tri[i] = p < 0.5 ? 4 * p - 1 : 3 - 4 * p;
  }
  tables.push(tri);

  // 2: Saw
  const saw = new Float32Array(WT_SIZE);
  for (let i = 0; i < WT_SIZE; i++) saw[i] = 2 * i / WT_SIZE - 1;
  tables.push(saw);

  // 3: Square
  const sq = new Float32Array(WT_SIZE);
  for (let i = 0; i < WT_SIZE; i++) sq[i] = i < WT_SIZE / 2 ? 1 : -1;
  tables.push(sq);

  // 4: Supersaw (sum of 7 detuned saws)
  const supersaw = new Float32Array(WT_SIZE);
  const detunes = [-0.03, -0.02, -0.01, 0, 0.01, 0.02, 0.03];
  for (let i = 0; i < WT_SIZE; i++) {
    let sum = 0;
    for (const d of detunes) {
      const p = ((i / WT_SIZE + d) % 1 + 1) % 1;
      sum += 2 * p - 1;
    }
    supersaw[i] = sum / detunes.length;
  }
  tables.push(supersaw);

  // 5: Organ (fundamental + 2nd + 3rd harmonics)
  const organ = new Float32Array(WT_SIZE);
  for (let i = 0; i < WT_SIZE; i++) {
    const p = TWO_PI * i / WT_SIZE;
    organ[i] = 0.5 * Math.sin(p) + 0.3 * Math.sin(2 * p) + 0.2 * Math.sin(3 * p);
  }
  tables.push(organ);

  // 6: Vocal (formant-like, odd harmonics with specific amplitudes)
  const vocal = new Float32Array(WT_SIZE);
  for (let i = 0; i < WT_SIZE; i++) {
    const p = TWO_PI * i / WT_SIZE;
    vocal[i] = 0.4 * Math.sin(p) + 0.3 * Math.sin(3 * p) + 0.15 * Math.sin(5 * p) +
               0.1 * Math.sin(7 * p) + 0.05 * Math.sin(9 * p);
  }
  tables.push(vocal);

  return tables;
}

class WavetableProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'frequency', defaultValue: 0, minValue: -5, maxValue: 5, automationRate: 'a-rate' as const },
      { name: 'wavetableIndex', defaultValue: 0, minValue: 0, maxValue: 1, automationRate: 'k-rate' as const },
      { name: 'octave', defaultValue: 0, minValue: -3, maxValue: 3, automationRate: 'k-rate' as const },
      { name: 'detune', defaultValue: 0, minValue: -1, maxValue: 1, automationRate: 'k-rate' as const },
    ];
  }

  private wavetables: Float32Array[];
  private phase = 0;

  constructor() {
    super();
    this.wavetables = generateWavetables();
  }

  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>,
  ): boolean {
    const pitchCv = inputs[0]?.[0];
    const morphCv = inputs[1]?.[0];
    const output = outputs[0]?.[0];
    if (!output) return true;

    const frequencyParam = parameters.frequency;
    const baseIndex = parameters.wavetableIndex[0];
    const octave = Math.round(parameters.octave[0]);
    const detune = parameters.detune[0];

    const invSR = 1.0 / sampleRate;
    const numTables = this.wavetables.length;

    let phase = this.phase;

    for (let i = 0; i < output.length; i++) {
      const freqParam = frequencyParam.length > 1 ? frequencyParam[i] : frequencyParam[0];

      // CV to frequency
      let cv = freqParam + octave + detune * (1 / 12);
      if (pitchCv) cv += pitchCv[i];

      const freq = C4_HZ * Math.pow(2.0, cv);
      const dt = Math.abs(freq) * invSR;

      // Wavetable index with morph CV
      let morphIndex = baseIndex;
      if (morphCv) morphIndex = Math.max(0, Math.min(1, morphIndex + morphCv[i] * 0.5));

      // Map 0-1 to table indices
      const tablePos = morphIndex * (numTables - 1);
      const tableA = Math.floor(tablePos);
      const tableB = Math.min(tableA + 1, numTables - 1);
      const tableMix = tablePos - tableA;

      // Read from wavetables with linear interpolation
      const phaseIdx = phase * WT_SIZE;
      const idx = Math.floor(phaseIdx);
      const frac = phaseIdx - idx;
      const idxNext = (idx + 1) % WT_SIZE;

      const sA = this.wavetables[tableA][idx] + frac * (this.wavetables[tableA][idxNext] - this.wavetables[tableA][idx]);
      const sB = this.wavetables[tableB][idx] + frac * (this.wavetables[tableB][idxNext] - this.wavetables[tableB][idx]);

      output[i] = sA + tableMix * (sB - sA);

      // Advance phase
      phase += dt;
      if (phase >= 1.0) phase -= Math.floor(phase);
    }

    this.phase = phase;
    return true;
  }
}

registerProcessor('wavetable-processor', WavetableProcessor);
