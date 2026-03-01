import type { Preset } from './types.ts';

export const factoryPresets: Preset[] = [
  // ───────────────────────────────────────────────────
  // 1. Classic Poly — clean 4-voice saw polysynth
  // ───────────────────────────────────────────────────
  {
    id: 'factory_classic_poly',
    name: 'Classic Poly',
    description: 'Clean 4-voice saw polysynth',
    category: 'keys',
    isFactory: true,
    version: 1,
    modules: [
      { id: 'm1', type: 'keyboard', x: 40, y: 160, params: { octave: 0 } },
      { id: 'm2', type: 'vco', x: 320, y: 40, params: { frequency: 0, waveform: 1, fmDepth: 0, pulseWidth: 0.5, pwmDepth: 0 } },
      { id: 'm3', type: 'vco', x: 320, y: 200, params: { frequency: 0, waveform: 1, fmDepth: 0, pulseWidth: 0.5, pwmDepth: 0 } },
      { id: 'm4', type: 'vco', x: 320, y: 360, params: { frequency: 0, waveform: 1, fmDepth: 0, pulseWidth: 0.5, pwmDepth: 0 } },
      { id: 'm5', type: 'vco', x: 320, y: 520, params: { frequency: 0, waveform: 1, fmDepth: 0, pulseWidth: 0.5, pwmDepth: 0 } },
      { id: 'm6', type: 'envelope', x: 560, y: 40, params: { attack: 0.01, decay: 0.3, sustain: 0.7, release: 0.5 } },
      { id: 'm7', type: 'envelope', x: 560, y: 200, params: { attack: 0.01, decay: 0.3, sustain: 0.7, release: 0.5 } },
      { id: 'm8', type: 'envelope', x: 560, y: 360, params: { attack: 0.01, decay: 0.3, sustain: 0.7, release: 0.5 } },
      { id: 'm9', type: 'envelope', x: 560, y: 520, params: { attack: 0.01, decay: 0.3, sustain: 0.7, release: 0.5 } },
      { id: 'm10', type: 'vca', x: 800, y: 40, params: { gain: 0.8 } },
      { id: 'm11', type: 'vca', x: 800, y: 200, params: { gain: 0.8 } },
      { id: 'm12', type: 'vca', x: 800, y: 360, params: { gain: 0.8 } },
      { id: 'm13', type: 'vca', x: 800, y: 520, params: { gain: 0.8 } },
      { id: 'm14', type: 'mixer', x: 1060, y: 200, params: { gain1: 0.8, gain2: 0.8, gain3: 0.8, gain4: 0.8, masterGain: 1.0 } },
      { id: 'm15', type: 'output', x: 1300, y: 200, params: { masterVolume: 0.5 } },
    ],
    connections: [
      // Voice 1
      { sourceModuleId: 'm1', sourcePortId: 'pitch_cv_1', destModuleId: 'm2', destPortId: 'pitch_cv' },
      { sourceModuleId: 'm1', sourcePortId: 'gate_1', destModuleId: 'm6', destPortId: 'gate_in' },
      { sourceModuleId: 'm2', sourcePortId: 'audio_out', destModuleId: 'm10', destPortId: 'audio_in' },
      { sourceModuleId: 'm6', sourcePortId: 'envelope_out', destModuleId: 'm10', destPortId: 'cv_in' },
      { sourceModuleId: 'm10', sourcePortId: 'audio_out', destModuleId: 'm14', destPortId: 'input_1' },
      // Voice 2
      { sourceModuleId: 'm1', sourcePortId: 'pitch_cv_2', destModuleId: 'm3', destPortId: 'pitch_cv' },
      { sourceModuleId: 'm1', sourcePortId: 'gate_2', destModuleId: 'm7', destPortId: 'gate_in' },
      { sourceModuleId: 'm3', sourcePortId: 'audio_out', destModuleId: 'm11', destPortId: 'audio_in' },
      { sourceModuleId: 'm7', sourcePortId: 'envelope_out', destModuleId: 'm11', destPortId: 'cv_in' },
      { sourceModuleId: 'm11', sourcePortId: 'audio_out', destModuleId: 'm14', destPortId: 'input_2' },
      // Voice 3
      { sourceModuleId: 'm1', sourcePortId: 'pitch_cv_3', destModuleId: 'm4', destPortId: 'pitch_cv' },
      { sourceModuleId: 'm1', sourcePortId: 'gate_3', destModuleId: 'm8', destPortId: 'gate_in' },
      { sourceModuleId: 'm4', sourcePortId: 'audio_out', destModuleId: 'm12', destPortId: 'audio_in' },
      { sourceModuleId: 'm8', sourcePortId: 'envelope_out', destModuleId: 'm12', destPortId: 'cv_in' },
      { sourceModuleId: 'm12', sourcePortId: 'audio_out', destModuleId: 'm14', destPortId: 'input_3' },
      // Voice 4
      { sourceModuleId: 'm1', sourcePortId: 'pitch_cv_4', destModuleId: 'm5', destPortId: 'pitch_cv' },
      { sourceModuleId: 'm1', sourcePortId: 'gate_4', destModuleId: 'm9', destPortId: 'gate_in' },
      { sourceModuleId: 'm5', sourcePortId: 'audio_out', destModuleId: 'm13', destPortId: 'audio_in' },
      { sourceModuleId: 'm9', sourcePortId: 'envelope_out', destModuleId: 'm13', destPortId: 'cv_in' },
      { sourceModuleId: 'm13', sourcePortId: 'audio_out', destModuleId: 'm14', destPortId: 'input_4' },
      // Mixer → Output
      { sourceModuleId: 'm14', sourcePortId: 'mix_out', destModuleId: 'm15', destPortId: 'audio_in_left' },
    ],
  },

  // ───────────────────────────────────────────────────
  // 2. Warm Pad — slow-attack filtered pad with reverb
  // ───────────────────────────────────────────────────
  {
    id: 'factory_warm_pad',
    name: 'Warm Pad',
    description: 'Slow-attack filtered pad with reverb',
    category: 'pad',
    isFactory: true,
    version: 1,
    modules: [
      { id: 'm1', type: 'keyboard', x: 40, y: 200, params: { octave: 0 } },
      { id: 'm2', type: 'vco', x: 280, y: 40, params: { frequency: 0, waveform: 1, fmDepth: 0, pulseWidth: 0.5, pwmDepth: 0 } },
      { id: 'm3', type: 'vco', x: 280, y: 200, params: { frequency: 0, waveform: 1, fmDepth: 0, pulseWidth: 0.5, pwmDepth: 0 } },
      { id: 'm4', type: 'vco', x: 280, y: 360, params: { frequency: 0, waveform: 1, fmDepth: 0, pulseWidth: 0.5, pwmDepth: 0 } },
      { id: 'm5', type: 'vco', x: 280, y: 520, params: { frequency: 0, waveform: 1, fmDepth: 0, pulseWidth: 0.5, pwmDepth: 0 } },
      { id: 'm6', type: 'envelope', x: 500, y: 40, params: { attack: 0.5, decay: 0.5, sustain: 0.8, release: 1.0 } },
      { id: 'm7', type: 'envelope', x: 500, y: 200, params: { attack: 0.5, decay: 0.5, sustain: 0.8, release: 1.0 } },
      { id: 'm8', type: 'envelope', x: 500, y: 360, params: { attack: 0.5, decay: 0.5, sustain: 0.8, release: 1.0 } },
      { id: 'm9', type: 'envelope', x: 500, y: 520, params: { attack: 0.5, decay: 0.5, sustain: 0.8, release: 1.0 } },
      { id: 'm10', type: 'vca', x: 720, y: 40, params: { gain: 0.8 } },
      { id: 'm11', type: 'vca', x: 720, y: 200, params: { gain: 0.8 } },
      { id: 'm12', type: 'vca', x: 720, y: 360, params: { gain: 0.8 } },
      { id: 'm13', type: 'vca', x: 720, y: 520, params: { gain: 0.8 } },
      { id: 'm14', type: 'mixer', x: 960, y: 200, params: { gain1: 0.8, gain2: 0.8, gain3: 0.8, gain4: 0.8, masterGain: 1.0 } },
      { id: 'm15', type: 'vcf', x: 1200, y: 200, params: { cutoff: 0.5, cutoffModDepth: 0.5, resonance: 0.2, resonanceModDepth: 0, mode: 0 } },
      { id: 'm16', type: 'lfo', x: 1200, y: 420, params: { rate: 0.5, depth: 0.3, waveform: 0, rateModDepth: 0 } },
      { id: 'm17', type: 'reverb', x: 1440, y: 200, params: { decay: 3.0, damping: 0.4, mix: 0.4 } },
      { id: 'm18', type: 'output', x: 1680, y: 200, params: { masterVolume: 0.5 } },
    ],
    connections: [
      // Voice 1
      { sourceModuleId: 'm1', sourcePortId: 'pitch_cv_1', destModuleId: 'm2', destPortId: 'pitch_cv' },
      { sourceModuleId: 'm1', sourcePortId: 'gate_1', destModuleId: 'm6', destPortId: 'gate_in' },
      { sourceModuleId: 'm2', sourcePortId: 'audio_out', destModuleId: 'm10', destPortId: 'audio_in' },
      { sourceModuleId: 'm6', sourcePortId: 'envelope_out', destModuleId: 'm10', destPortId: 'cv_in' },
      { sourceModuleId: 'm10', sourcePortId: 'audio_out', destModuleId: 'm14', destPortId: 'input_1' },
      // Voice 2
      { sourceModuleId: 'm1', sourcePortId: 'pitch_cv_2', destModuleId: 'm3', destPortId: 'pitch_cv' },
      { sourceModuleId: 'm1', sourcePortId: 'gate_2', destModuleId: 'm7', destPortId: 'gate_in' },
      { sourceModuleId: 'm3', sourcePortId: 'audio_out', destModuleId: 'm11', destPortId: 'audio_in' },
      { sourceModuleId: 'm7', sourcePortId: 'envelope_out', destModuleId: 'm11', destPortId: 'cv_in' },
      { sourceModuleId: 'm11', sourcePortId: 'audio_out', destModuleId: 'm14', destPortId: 'input_2' },
      // Voice 3
      { sourceModuleId: 'm1', sourcePortId: 'pitch_cv_3', destModuleId: 'm4', destPortId: 'pitch_cv' },
      { sourceModuleId: 'm1', sourcePortId: 'gate_3', destModuleId: 'm8', destPortId: 'gate_in' },
      { sourceModuleId: 'm4', sourcePortId: 'audio_out', destModuleId: 'm12', destPortId: 'audio_in' },
      { sourceModuleId: 'm8', sourcePortId: 'envelope_out', destModuleId: 'm12', destPortId: 'cv_in' },
      { sourceModuleId: 'm12', sourcePortId: 'audio_out', destModuleId: 'm14', destPortId: 'input_3' },
      // Voice 4
      { sourceModuleId: 'm1', sourcePortId: 'pitch_cv_4', destModuleId: 'm5', destPortId: 'pitch_cv' },
      { sourceModuleId: 'm1', sourcePortId: 'gate_4', destModuleId: 'm9', destPortId: 'gate_in' },
      { sourceModuleId: 'm5', sourcePortId: 'audio_out', destModuleId: 'm13', destPortId: 'audio_in' },
      { sourceModuleId: 'm9', sourcePortId: 'envelope_out', destModuleId: 'm13', destPortId: 'cv_in' },
      { sourceModuleId: 'm13', sourcePortId: 'audio_out', destModuleId: 'm14', destPortId: 'input_4' },
      // Mixer → VCF → Reverb → Output
      { sourceModuleId: 'm14', sourcePortId: 'mix_out', destModuleId: 'm15', destPortId: 'audio_in' },
      { sourceModuleId: 'm16', sourcePortId: 'lfo_out', destModuleId: 'm15', destPortId: 'cutoff_cv' },
      { sourceModuleId: 'm15', sourcePortId: 'audio_out', destModuleId: 'm17', destPortId: 'audio_in' },
      { sourceModuleId: 'm17', sourcePortId: 'audio_out', destModuleId: 'm18', destPortId: 'audio_in_left' },
    ],
  },

  // ───────────────────────────────────────────────────
  // 3. Fat Bass — dual-osc bass with resonant filter
  // ───────────────────────────────────────────────────
  {
    id: 'factory_fat_bass',
    name: 'Fat Bass',
    description: 'Dual-osc bass with resonant filter',
    category: 'bass',
    isFactory: true,
    version: 1,
    modules: [
      { id: 'm1', type: 'keyboard', x: 40, y: 160, params: { octave: 0 } },
      { id: 'm2', type: 'vco', x: 300, y: 60, params: { frequency: 0, waveform: 1, fmDepth: 0, pulseWidth: 0.5, pwmDepth: 0 } },
      { id: 'm3', type: 'vco', x: 300, y: 260, params: { frequency: -1, waveform: 1, fmDepth: 0, pulseWidth: 0.5, pwmDepth: 0 } },
      { id: 'm4', type: 'mixer', x: 540, y: 120, params: { gain1: 0.8, gain2: 0.8, gain3: 0.8, gain4: 0.8, masterGain: 1.0 } },
      { id: 'm5', type: 'vcf', x: 780, y: 120, params: { cutoff: 0.4, cutoffModDepth: 0.6, resonance: 0.5, resonanceModDepth: 0, mode: 0 } },
      { id: 'm6', type: 'envelope', x: 540, y: 340, params: { attack: 0.01, decay: 0.2, sustain: 0.6, release: 0.3 } },
      { id: 'm7', type: 'envelope', x: 780, y: 340, params: { attack: 0.005, decay: 0.3, sustain: 0.0, release: 0.2 } },
      { id: 'm8', type: 'vca', x: 1020, y: 120, params: { gain: 0.8 } },
      { id: 'm9', type: 'output', x: 1260, y: 120, params: { masterVolume: 0.5 } },
    ],
    connections: [
      // KB pitch → both VCOs
      { sourceModuleId: 'm1', sourcePortId: 'pitch_cv_1', destModuleId: 'm2', destPortId: 'pitch_cv' },
      { sourceModuleId: 'm1', sourcePortId: 'pitch_cv_1', destModuleId: 'm3', destPortId: 'pitch_cv' },
      // KB gate → both envelopes
      { sourceModuleId: 'm1', sourcePortId: 'gate_1', destModuleId: 'm6', destPortId: 'gate_in' },
      { sourceModuleId: 'm1', sourcePortId: 'gate_1', destModuleId: 'm7', destPortId: 'gate_in' },
      // VCOs → Mixer
      { sourceModuleId: 'm2', sourcePortId: 'audio_out', destModuleId: 'm4', destPortId: 'input_1' },
      { sourceModuleId: 'm3', sourcePortId: 'audio_out', destModuleId: 'm4', destPortId: 'input_2' },
      // Mixer → VCF
      { sourceModuleId: 'm4', sourcePortId: 'mix_out', destModuleId: 'm5', destPortId: 'audio_in' },
      // Filter envelope → VCF cutoff
      { sourceModuleId: 'm7', sourcePortId: 'envelope_out', destModuleId: 'm5', destPortId: 'cutoff_cv' },
      // VCF → VCA
      { sourceModuleId: 'm5', sourcePortId: 'audio_out', destModuleId: 'm8', destPortId: 'audio_in' },
      // Amp envelope → VCA
      { sourceModuleId: 'm6', sourcePortId: 'envelope_out', destModuleId: 'm8', destPortId: 'cv_in' },
      // VCA → Output
      { sourceModuleId: 'm8', sourcePortId: 'audio_out', destModuleId: 'm9', destPortId: 'audio_in_left' },
    ],
  },

  // ───────────────────────────────────────────────────
  // 4. Acid Lead — squelchy acid line with delay
  // ───────────────────────────────────────────────────
  {
    id: 'factory_acid_lead',
    name: 'Acid Lead',
    description: 'Squelchy acid line with delay',
    category: 'lead',
    isFactory: true,
    version: 1,
    modules: [
      { id: 'm1', type: 'keyboard', x: 40, y: 160, params: { octave: 0 } },
      { id: 'm2', type: 'vco', x: 300, y: 120, params: { frequency: 0, waveform: 1, fmDepth: 0, pulseWidth: 0.5, pwmDepth: 0 } },
      { id: 'm3', type: 'vcf', x: 540, y: 120, params: { cutoff: 0.3, cutoffModDepth: 0.8, resonance: 0.7, resonanceModDepth: 0, mode: 0 } },
      { id: 'm4', type: 'envelope', x: 300, y: 340, params: { attack: 0.01, decay: 0.2, sustain: 0.5, release: 0.3 } },
      { id: 'm5', type: 'envelope', x: 540, y: 340, params: { attack: 0.005, decay: 0.15, sustain: 0.0, release: 0.1 } },
      { id: 'm6', type: 'vca', x: 780, y: 120, params: { gain: 0.8 } },
      { id: 'm7', type: 'delay', x: 1020, y: 120, params: { time: 0.3, feedback: 0.4, mix: 0.35, timeModDepth: 0 } },
      { id: 'm8', type: 'output', x: 1260, y: 120, params: { masterVolume: 0.5 } },
    ],
    connections: [
      // KB → VCO + Envelopes
      { sourceModuleId: 'm1', sourcePortId: 'pitch_cv_1', destModuleId: 'm2', destPortId: 'pitch_cv' },
      { sourceModuleId: 'm1', sourcePortId: 'gate_1', destModuleId: 'm4', destPortId: 'gate_in' },
      { sourceModuleId: 'm1', sourcePortId: 'gate_1', destModuleId: 'm5', destPortId: 'gate_in' },
      // VCO → VCF
      { sourceModuleId: 'm2', sourcePortId: 'audio_out', destModuleId: 'm3', destPortId: 'audio_in' },
      // Filter envelope → VCF cutoff
      { sourceModuleId: 'm5', sourcePortId: 'envelope_out', destModuleId: 'm3', destPortId: 'cutoff_cv' },
      // VCF → VCA
      { sourceModuleId: 'm3', sourcePortId: 'audio_out', destModuleId: 'm6', destPortId: 'audio_in' },
      // Amp envelope → VCA
      { sourceModuleId: 'm4', sourcePortId: 'envelope_out', destModuleId: 'm6', destPortId: 'cv_in' },
      // VCA → Delay → Output
      { sourceModuleId: 'm6', sourcePortId: 'audio_out', destModuleId: 'm7', destPortId: 'audio_in' },
      { sourceModuleId: 'm7', sourcePortId: 'audio_out', destModuleId: 'm8', destPortId: 'audio_in_left' },
    ],
  },

  // ───────────────────────────────────────────────────
  // 5. Ambient Drone — self-playing evolving texture
  // ───────────────────────────────────────────────────
  {
    id: 'factory_ambient_drone',
    name: 'Ambient Drone',
    description: 'Self-playing evolving texture',
    category: 'pad',
    isFactory: true,
    version: 1,
    modules: [
      { id: 'm1', type: 'vco', x: 40, y: 80, params: { frequency: 0, waveform: 0, fmDepth: 0.1, pulseWidth: 0.5, pwmDepth: 0 } },
      { id: 'm2', type: 'lfo', x: 40, y: 320, params: { rate: 0.1, depth: 0.15, waveform: 0, rateModDepth: 0 } },
      { id: 'm3', type: 'lfo', x: 280, y: 320, params: { rate: 0.3, depth: 0.4, waveform: 0, rateModDepth: 0 } },
      { id: 'm4', type: 'wavefolder', x: 280, y: 80, params: { drive: 2, folds: 3, mix: 0.7, symmetry: 0.5, foldModDepth: 0.5 } },
      { id: 'm5', type: 'noise', x: 520, y: 320, params: { color: 0, level: 0.3 } },
      { id: 'm6', type: 'mixer', x: 520, y: 80, params: { gain1: 0.7, gain2: 0.3, gain3: 0.8, gain4: 0.8, masterGain: 0.8 } },
      { id: 'm7', type: 'vcf', x: 760, y: 80, params: { cutoff: 0.4, cutoffModDepth: 0.3, resonance: 0.3, resonanceModDepth: 0, mode: 0 } },
      { id: 'm8', type: 'reverb', x: 1000, y: 80, params: { decay: 6.0, damping: 0.3, mix: 0.6 } },
      { id: 'm9', type: 'output', x: 1240, y: 80, params: { masterVolume: 0.4 } },
    ],
    connections: [
      // LFO1 → VCO FM (slow pitch drift)
      { sourceModuleId: 'm2', sourcePortId: 'lfo_out', destModuleId: 'm1', destPortId: 'fm_cv' },
      // VCO → Wavefolder
      { sourceModuleId: 'm1', sourcePortId: 'audio_out', destModuleId: 'm4', destPortId: 'audio_in' },
      // LFO2 → Wavefolder fold CV
      { sourceModuleId: 'm3', sourcePortId: 'lfo_out', destModuleId: 'm4', destPortId: 'fold_cv' },
      // Wavefolder → Mixer in1
      { sourceModuleId: 'm4', sourcePortId: 'audio_out', destModuleId: 'm6', destPortId: 'input_1' },
      // Noise → Mixer in2
      { sourceModuleId: 'm5', sourcePortId: 'audio_out', destModuleId: 'm6', destPortId: 'input_2' },
      // Mixer → VCF → Reverb → Output
      { sourceModuleId: 'm6', sourcePortId: 'mix_out', destModuleId: 'm7', destPortId: 'audio_in' },
      { sourceModuleId: 'm3', sourcePortId: 'lfo_out', destModuleId: 'm7', destPortId: 'cutoff_cv' },
      { sourceModuleId: 'm7', sourcePortId: 'audio_out', destModuleId: 'm8', destPortId: 'audio_in' },
      { sourceModuleId: 'm8', sourcePortId: 'audio_out', destModuleId: 'm9', destPortId: 'audio_in_left' },
    ],
  },

  // ───────────────────────────────────────────────────
  // 6. Percussion — snappy noise burst for hats/snares
  // ───────────────────────────────────────────────────
  {
    id: 'factory_percussion',
    name: 'Percussion',
    description: 'Snappy noise burst for hats/snares',
    category: 'percussion',
    isFactory: true,
    version: 1,
    modules: [
      { id: 'm1', type: 'keyboard', x: 40, y: 160, params: { octave: 0 } },
      { id: 'm2', type: 'noise', x: 300, y: 80, params: { color: 0, level: 0.8 } },
      { id: 'm3', type: 'vcf', x: 540, y: 80, params: { cutoff: 0.6, cutoffModDepth: 0.5, resonance: 0.3, resonanceModDepth: 0, mode: 2 } },
      { id: 'm4', type: 'envelope', x: 300, y: 320, params: { attack: 0.001, decay: 0.1, sustain: 0.0, release: 0.05 } },
      { id: 'm5', type: 'envelope', x: 540, y: 320, params: { attack: 0.001, decay: 0.15, sustain: 0.0, release: 0.08 } },
      { id: 'm6', type: 'vca', x: 780, y: 80, params: { gain: 0.8 } },
      { id: 'm7', type: 'output', x: 1020, y: 80, params: { masterVolume: 0.5 } },
    ],
    connections: [
      // KB gate → both envelopes
      { sourceModuleId: 'm1', sourcePortId: 'gate_1', destModuleId: 'm4', destPortId: 'gate_in' },
      { sourceModuleId: 'm1', sourcePortId: 'gate_1', destModuleId: 'm5', destPortId: 'gate_in' },
      // Noise → VCF (bandpass)
      { sourceModuleId: 'm2', sourcePortId: 'audio_out', destModuleId: 'm3', destPortId: 'audio_in' },
      // Filter env → VCF cutoff
      { sourceModuleId: 'm5', sourcePortId: 'envelope_out', destModuleId: 'm3', destPortId: 'cutoff_cv' },
      // VCF → VCA
      { sourceModuleId: 'm3', sourcePortId: 'audio_out', destModuleId: 'm6', destPortId: 'audio_in' },
      // Amp env → VCA
      { sourceModuleId: 'm4', sourcePortId: 'envelope_out', destModuleId: 'm6', destPortId: 'cv_in' },
      // VCA → Output
      { sourceModuleId: 'm6', sourcePortId: 'audio_out', destModuleId: 'm7', destPortId: 'audio_in_left' },
    ],
  },

  // ───────────────────────────────────────────────────
  // 7. Step Sequence — 8-step filtered sequence with echo
  // ───────────────────────────────────────────────────
  {
    id: 'factory_step_sequence',
    name: 'Step Sequence',
    description: '8-step filtered sequence with echo',
    category: 'sequencer',
    isFactory: true,
    version: 1,
    modules: [
      { id: 'm1', type: 'lfo', x: 40, y: 120, params: { rate: 4, depth: 1.0, waveform: 3, rateModDepth: 0 } },
      { id: 'm2', type: 'stepSequencer', x: 280, y: 120, params: { step0: 0, step1: 0.2, step2: 0.4, step3: 0.3, step4: 0.5, step5: 0.7, step6: 0.4, step7: 0.6, gateLength: 0.5, steps: 8 } },
      { id: 'm3', type: 'vco', x: 520, y: 60, params: { frequency: 0, waveform: 1, fmDepth: 0, pulseWidth: 0.5, pwmDepth: 0 } },
      { id: 'm4', type: 'envelope', x: 520, y: 280, params: { attack: 0.01, decay: 0.15, sustain: 0.3, release: 0.1 } },
      { id: 'm5', type: 'vcf', x: 760, y: 60, params: { cutoff: 0.5, cutoffModDepth: 0.4, resonance: 0.4, resonanceModDepth: 0, mode: 0 } },
      { id: 'm6', type: 'vca', x: 1000, y: 60, params: { gain: 0.8 } },
      { id: 'm7', type: 'delay', x: 1240, y: 60, params: { time: 0.3, feedback: 0.35, mix: 0.3, timeModDepth: 0 } },
      { id: 'm8', type: 'output', x: 1480, y: 60, params: { masterVolume: 0.5 } },
    ],
    connections: [
      // LFO (square) → Sequencer clock
      { sourceModuleId: 'm1', sourcePortId: 'lfo_out', destModuleId: 'm2', destPortId: 'clock_in' },
      // Sequencer CV → VCO pitch
      { sourceModuleId: 'm2', sourcePortId: 'cv_out', destModuleId: 'm3', destPortId: 'pitch_cv' },
      // Sequencer Gate → Envelope
      { sourceModuleId: 'm2', sourcePortId: 'gate_out', destModuleId: 'm4', destPortId: 'gate_in' },
      // Envelope → VCF cutoff
      { sourceModuleId: 'm4', sourcePortId: 'envelope_out', destModuleId: 'm5', destPortId: 'cutoff_cv' },
      // VCO → VCF
      { sourceModuleId: 'm3', sourcePortId: 'audio_out', destModuleId: 'm5', destPortId: 'audio_in' },
      // VCF → VCA
      { sourceModuleId: 'm5', sourcePortId: 'audio_out', destModuleId: 'm6', destPortId: 'audio_in' },
      // Envelope → VCA
      { sourceModuleId: 'm4', sourcePortId: 'envelope_out', destModuleId: 'm6', destPortId: 'cv_in' },
      // VCA → Delay → Output
      { sourceModuleId: 'm6', sourcePortId: 'audio_out', destModuleId: 'm7', destPortId: 'audio_in' },
      { sourceModuleId: 'm7', sourcePortId: 'audio_out', destModuleId: 'm8', destPortId: 'audio_in_left' },
    ],
  },

  // ───────────────────────────────────────────────────
  // 8. Ring Mod Bells — metallic bell tones
  // ───────────────────────────────────────────────────
  {
    id: 'factory_ring_mod_bells',
    name: 'Ring Mod Bells',
    description: 'Metallic bell tones',
    category: 'fx',
    isFactory: true,
    version: 1,
    modules: [
      { id: 'm1', type: 'keyboard', x: 40, y: 160, params: { octave: 0 } },
      { id: 'm2', type: 'vco', x: 300, y: 60, params: { frequency: 0, waveform: 0, fmDepth: 0, pulseWidth: 0.5, pwmDepth: 0 } },
      { id: 'm3', type: 'vco', x: 300, y: 280, params: { frequency: 0.6, waveform: 0, fmDepth: 0, pulseWidth: 0.5, pwmDepth: 0 } },
      { id: 'm4', type: 'ringMod', x: 540, y: 120, params: { mix: 1.0 } },
      { id: 'm5', type: 'envelope', x: 540, y: 340, params: { attack: 0.005, decay: 0.8, sustain: 0.0, release: 1.0 } },
      { id: 'm6', type: 'vca', x: 780, y: 120, params: { gain: 0.8 } },
      { id: 'm7', type: 'reverb', x: 1020, y: 120, params: { decay: 4.0, damping: 0.3, mix: 0.5 } },
      { id: 'm8', type: 'output', x: 1260, y: 120, params: { masterVolume: 0.5 } },
    ],
    connections: [
      // KB → VCO1 pitch
      { sourceModuleId: 'm1', sourcePortId: 'pitch_cv_1', destModuleId: 'm2', destPortId: 'pitch_cv' },
      // KB gate → Envelope
      { sourceModuleId: 'm1', sourcePortId: 'gate_1', destModuleId: 'm5', destPortId: 'gate_in' },
      // VCO1 → Ring Mod carrier
      { sourceModuleId: 'm2', sourcePortId: 'audio_out', destModuleId: 'm4', destPortId: 'carrier_in' },
      // VCO2 → Ring Mod modulator
      { sourceModuleId: 'm3', sourcePortId: 'audio_out', destModuleId: 'm4', destPortId: 'modulator_in' },
      // Ring Mod → VCA
      { sourceModuleId: 'm4', sourcePortId: 'audio_out', destModuleId: 'm6', destPortId: 'audio_in' },
      // Envelope → VCA
      { sourceModuleId: 'm5', sourcePortId: 'envelope_out', destModuleId: 'm6', destPortId: 'cv_in' },
      // VCA → Reverb → Output
      { sourceModuleId: 'm6', sourcePortId: 'audio_out', destModuleId: 'm7', destPortId: 'audio_in' },
      { sourceModuleId: 'm7', sourcePortId: 'audio_out', destModuleId: 'm8', destPortId: 'audio_in_left' },
    ],
  },

  // ───────────────────────────────────────────────────
  // 9. Random Melody — random quantized notes
  // ───────────────────────────────────────────────────
  {
    id: 'factory_random_melody',
    name: 'Random Melody',
    description: 'Random quantized notes',
    category: 'sequencer',
    isFactory: true,
    version: 1,
    modules: [
      { id: 'm1', type: 'noise', x: 40, y: 60, params: { color: 0, level: 0.8 } },
      { id: 'm2', type: 'lfo', x: 40, y: 280, params: { rate: 3, depth: 1.0, waveform: 3, rateModDepth: 0 } },
      { id: 'm3', type: 'sampleHold', x: 280, y: 60, params: { threshold: 0.5 } },
      { id: 'm4', type: 'quantizer', x: 520, y: 60, params: { scale: 4, rootNote: 0 } },
      { id: 'm5', type: 'vco', x: 760, y: 60, params: { frequency: 0, waveform: 1, fmDepth: 0, pulseWidth: 0.5, pwmDepth: 0 } },
      { id: 'm6', type: 'envelope', x: 760, y: 280, params: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.15 } },
      { id: 'm7', type: 'vcf', x: 1000, y: 60, params: { cutoff: 0.6, cutoffModDepth: 0.3, resonance: 0.2, resonanceModDepth: 0, mode: 0 } },
      { id: 'm8', type: 'vca', x: 1240, y: 60, params: { gain: 0.8 } },
      { id: 'm9', type: 'delay', x: 1480, y: 60, params: { time: 0.35, feedback: 0.3, mix: 0.3, timeModDepth: 0 } },
      { id: 'm10', type: 'output', x: 1720, y: 60, params: { masterVolume: 0.5 } },
    ],
    connections: [
      // Noise → S&H signal
      { sourceModuleId: 'm1', sourcePortId: 'audio_out', destModuleId: 'm3', destPortId: 'signal_in' },
      // LFO (square) → S&H trigger
      { sourceModuleId: 'm2', sourcePortId: 'lfo_out', destModuleId: 'm3', destPortId: 'trigger_in' },
      // S&H → Quantizer
      { sourceModuleId: 'm3', sourcePortId: 'cv_out', destModuleId: 'm4', destPortId: 'cv_in' },
      // Quantizer → VCO pitch
      { sourceModuleId: 'm4', sourcePortId: 'cv_out', destModuleId: 'm5', destPortId: 'pitch_cv' },
      // LFO → Envelope gate (trigger notes)
      { sourceModuleId: 'm2', sourcePortId: 'lfo_out', destModuleId: 'm6', destPortId: 'gate_in' },
      // VCO → VCF
      { sourceModuleId: 'm5', sourcePortId: 'audio_out', destModuleId: 'm7', destPortId: 'audio_in' },
      // Envelope → VCF cutoff + VCA
      { sourceModuleId: 'm6', sourcePortId: 'envelope_out', destModuleId: 'm7', destPortId: 'cutoff_cv' },
      { sourceModuleId: 'm6', sourcePortId: 'envelope_out', destModuleId: 'm8', destPortId: 'cv_in' },
      // VCF → VCA
      { sourceModuleId: 'm7', sourcePortId: 'audio_out', destModuleId: 'm8', destPortId: 'audio_in' },
      // VCA → Delay → Output
      { sourceModuleId: 'm8', sourcePortId: 'audio_out', destModuleId: 'm9', destPortId: 'audio_in' },
      { sourceModuleId: 'm9', sourcePortId: 'audio_out', destModuleId: 'm10', destPortId: 'audio_in_left' },
    ],
  },

  // ───────────────────────────────────────────────────
  // 10. PWM Strings — ensemble strings with PWM chorus
  // ───────────────────────────────────────────────────
  {
    id: 'factory_pwm_strings',
    name: 'PWM Strings',
    description: 'Ensemble strings with PWM chorus',
    category: 'keys',
    isFactory: true,
    version: 1,
    modules: [
      { id: 'm1', type: 'keyboard', x: 40, y: 200, params: { octave: 0 } },
      { id: 'm2', type: 'lfo', x: 40, y: 440, params: { rate: 0.8, depth: 0.4, waveform: 0, rateModDepth: 0 } },
      { id: 'm3', type: 'vco', x: 300, y: 40, params: { frequency: 0, waveform: 2, fmDepth: 0, pulseWidth: 0.5, pwmDepth: 0.5 } },
      { id: 'm4', type: 'vco', x: 300, y: 200, params: { frequency: 0, waveform: 2, fmDepth: 0, pulseWidth: 0.5, pwmDepth: 0.5 } },
      { id: 'm5', type: 'vco', x: 300, y: 360, params: { frequency: 0, waveform: 2, fmDepth: 0, pulseWidth: 0.5, pwmDepth: 0.5 } },
      { id: 'm6', type: 'vco', x: 300, y: 520, params: { frequency: 0, waveform: 2, fmDepth: 0, pulseWidth: 0.5, pwmDepth: 0.5 } },
      { id: 'm7', type: 'envelope', x: 540, y: 40, params: { attack: 0.3, decay: 0.3, sustain: 0.8, release: 0.6 } },
      { id: 'm8', type: 'envelope', x: 540, y: 200, params: { attack: 0.3, decay: 0.3, sustain: 0.8, release: 0.6 } },
      { id: 'm9', type: 'envelope', x: 540, y: 360, params: { attack: 0.3, decay: 0.3, sustain: 0.8, release: 0.6 } },
      { id: 'm10', type: 'envelope', x: 540, y: 520, params: { attack: 0.3, decay: 0.3, sustain: 0.8, release: 0.6 } },
      { id: 'm11', type: 'vca', x: 780, y: 40, params: { gain: 0.8 } },
      { id: 'm12', type: 'vca', x: 780, y: 200, params: { gain: 0.8 } },
      { id: 'm13', type: 'vca', x: 780, y: 360, params: { gain: 0.8 } },
      { id: 'm14', type: 'vca', x: 780, y: 520, params: { gain: 0.8 } },
      { id: 'm15', type: 'mixer', x: 1020, y: 200, params: { gain1: 0.8, gain2: 0.8, gain3: 0.8, gain4: 0.8, masterGain: 1.0 } },
      { id: 'm16', type: 'output', x: 1260, y: 200, params: { masterVolume: 0.5 } },
    ],
    connections: [
      // LFO → all 4 VCOs PWM CV
      { sourceModuleId: 'm2', sourcePortId: 'lfo_out', destModuleId: 'm3', destPortId: 'pwm_cv' },
      { sourceModuleId: 'm2', sourcePortId: 'lfo_out', destModuleId: 'm4', destPortId: 'pwm_cv' },
      { sourceModuleId: 'm2', sourcePortId: 'lfo_out', destModuleId: 'm5', destPortId: 'pwm_cv' },
      { sourceModuleId: 'm2', sourcePortId: 'lfo_out', destModuleId: 'm6', destPortId: 'pwm_cv' },
      // Voice 1
      { sourceModuleId: 'm1', sourcePortId: 'pitch_cv_1', destModuleId: 'm3', destPortId: 'pitch_cv' },
      { sourceModuleId: 'm1', sourcePortId: 'gate_1', destModuleId: 'm7', destPortId: 'gate_in' },
      { sourceModuleId: 'm3', sourcePortId: 'audio_out', destModuleId: 'm11', destPortId: 'audio_in' },
      { sourceModuleId: 'm7', sourcePortId: 'envelope_out', destModuleId: 'm11', destPortId: 'cv_in' },
      { sourceModuleId: 'm11', sourcePortId: 'audio_out', destModuleId: 'm15', destPortId: 'input_1' },
      // Voice 2
      { sourceModuleId: 'm1', sourcePortId: 'pitch_cv_2', destModuleId: 'm4', destPortId: 'pitch_cv' },
      { sourceModuleId: 'm1', sourcePortId: 'gate_2', destModuleId: 'm8', destPortId: 'gate_in' },
      { sourceModuleId: 'm4', sourcePortId: 'audio_out', destModuleId: 'm12', destPortId: 'audio_in' },
      { sourceModuleId: 'm8', sourcePortId: 'envelope_out', destModuleId: 'm12', destPortId: 'cv_in' },
      { sourceModuleId: 'm12', sourcePortId: 'audio_out', destModuleId: 'm15', destPortId: 'input_2' },
      // Voice 3
      { sourceModuleId: 'm1', sourcePortId: 'pitch_cv_3', destModuleId: 'm5', destPortId: 'pitch_cv' },
      { sourceModuleId: 'm1', sourcePortId: 'gate_3', destModuleId: 'm9', destPortId: 'gate_in' },
      { sourceModuleId: 'm5', sourcePortId: 'audio_out', destModuleId: 'm13', destPortId: 'audio_in' },
      { sourceModuleId: 'm9', sourcePortId: 'envelope_out', destModuleId: 'm13', destPortId: 'cv_in' },
      { sourceModuleId: 'm13', sourcePortId: 'audio_out', destModuleId: 'm15', destPortId: 'input_3' },
      // Voice 4
      { sourceModuleId: 'm1', sourcePortId: 'pitch_cv_4', destModuleId: 'm6', destPortId: 'pitch_cv' },
      { sourceModuleId: 'm1', sourcePortId: 'gate_4', destModuleId: 'm10', destPortId: 'gate_in' },
      { sourceModuleId: 'm6', sourcePortId: 'audio_out', destModuleId: 'm14', destPortId: 'audio_in' },
      { sourceModuleId: 'm10', sourcePortId: 'envelope_out', destModuleId: 'm14', destPortId: 'cv_in' },
      { sourceModuleId: 'm14', sourcePortId: 'audio_out', destModuleId: 'm15', destPortId: 'input_4' },
      // Mixer → Output
      { sourceModuleId: 'm15', sourcePortId: 'mix_out', destModuleId: 'm16', destPortId: 'audio_in_left' },
    ],
  },

  // ───────────────────────────────────────────────────
  // 11. FM Electric Piano — two FM operators with chorus
  // ───────────────────────────────────────────────────
  {
    id: 'factory_fm_epiano',
    name: 'FM E-Piano',
    description: 'Classic FM electric piano with chorus and reverb',
    category: 'keys',
    isFactory: true,
    version: 1,
    modules: [
      { id: 'm1', type: 'keyboard', x: 40, y: 160, params: { octave: 0 } },
      // Carrier operator
      { id: 'm2', type: 'fmOperator', x: 540, y: 80, params: { frequency: 0, ratio: 1, fmIndex: 3, feedback: 0, waveform: 0 } },
      // Modulator operator (ratio 2 = classic DX e-piano)
      { id: 'm3', type: 'fmOperator', x: 300, y: 80, params: { frequency: 0, ratio: 2, fmIndex: 0, feedback: 0.1, waveform: 0 } },
      // FM index envelope — decaying brightness
      { id: 'm4', type: 'envelope', x: 300, y: 320, params: { attack: 0.001, decay: 0.6, sustain: 0.1, release: 0.4 } },
      // Amp envelope
      { id: 'm5', type: 'envelope', x: 540, y: 320, params: { attack: 0.001, decay: 1.2, sustain: 0.3, release: 0.8 } },
      { id: 'm6', type: 'vca', x: 780, y: 80, params: { gain: 0.8 } },
      { id: 'm7', type: 'chorus', x: 1020, y: 80, params: { rate: 1.2, depth: 0.4, mix: 0.35, voices: 2 } },
      { id: 'm8', type: 'reverb', x: 1260, y: 80, params: { decay: 2.5, damping: 0.4, mix: 0.25 } },
      { id: 'm9', type: 'output', x: 1500, y: 80, params: { masterVolume: 0.5 } },
    ],
    connections: [
      // KB pitch → both operators
      { sourceModuleId: 'm1', sourcePortId: 'pitch_cv_1', destModuleId: 'm2', destPortId: 'pitch_cv' },
      { sourceModuleId: 'm1', sourcePortId: 'pitch_cv_1', destModuleId: 'm3', destPortId: 'pitch_cv' },
      // KB gate → both envelopes
      { sourceModuleId: 'm1', sourcePortId: 'gate_1', destModuleId: 'm4', destPortId: 'gate_in' },
      { sourceModuleId: 'm1', sourcePortId: 'gate_1', destModuleId: 'm5', destPortId: 'gate_in' },
      // Modulator → Carrier mod input
      { sourceModuleId: 'm3', sourcePortId: 'modulator_out', destModuleId: 'm2', destPortId: 'modulator_in' },
      // FM index envelope → Carrier index CV
      { sourceModuleId: 'm4', sourcePortId: 'envelope_out', destModuleId: 'm2', destPortId: 'fm_index_cv' },
      // Carrier → VCA
      { sourceModuleId: 'm2', sourcePortId: 'audio_out', destModuleId: 'm6', destPortId: 'audio_in' },
      // Amp envelope → VCA
      { sourceModuleId: 'm5', sourcePortId: 'envelope_out', destModuleId: 'm6', destPortId: 'cv_in' },
      // VCA → Chorus → Reverb → Output
      { sourceModuleId: 'm6', sourcePortId: 'audio_out', destModuleId: 'm7', destPortId: 'audio_in' },
      { sourceModuleId: 'm7', sourcePortId: 'audio_out', destModuleId: 'm8', destPortId: 'audio_in' },
      { sourceModuleId: 'm8', sourcePortId: 'audio_out', destModuleId: 'm9', destPortId: 'audio_in_left' },
    ],
  },

  // ───────────────────────────────────────────────────
  // 12. Wavetable Pad — morphing wavetable with slow LFO
  // ───────────────────────────────────────────────────
  {
    id: 'factory_wavetable_pad',
    name: 'Wavetable Pad',
    description: 'Evolving wavetable pad with morph modulation',
    category: 'pad',
    isFactory: true,
    version: 1,
    modules: [
      { id: 'm1', type: 'keyboard', x: 40, y: 160, params: { octave: 0 } },
      { id: 'm2', type: 'wavetable', x: 300, y: 100, params: { frequency: 0, wavetableIndex: 0.3, octave: 0, detune: 0 } },
      { id: 'm3', type: 'wavetable', x: 300, y: 300, params: { frequency: 0, wavetableIndex: 0.6, octave: 0, detune: 0.15 } },
      // Slow morph LFO
      { id: 'm4', type: 'lfo', x: 40, y: 400, params: { rate: 0.15, depth: 0.4, waveform: 0, rateModDepth: 0 } },
      { id: 'm5', type: 'envelope', x: 540, y: 100, params: { attack: 0.6, decay: 0.5, sustain: 0.7, release: 1.2 } },
      { id: 'm6', type: 'envelope', x: 540, y: 300, params: { attack: 0.6, decay: 0.5, sustain: 0.7, release: 1.2 } },
      { id: 'm7', type: 'vca', x: 780, y: 100, params: { gain: 0.8 } },
      { id: 'm8', type: 'vca', x: 780, y: 300, params: { gain: 0.8 } },
      { id: 'm9', type: 'mixer', x: 1020, y: 160, params: { gain1: 0.7, gain2: 0.7, gain3: 0.8, gain4: 0.8, masterGain: 0.8 } },
      { id: 'm10', type: 'chorus', x: 1260, y: 160, params: { rate: 0.8, depth: 0.5, mix: 0.3, voices: 3 } },
      { id: 'm11', type: 'reverb', x: 1500, y: 160, params: { decay: 4.0, damping: 0.3, mix: 0.45 } },
      { id: 'm12', type: 'output', x: 1740, y: 160, params: { masterVolume: 0.45 } },
    ],
    connections: [
      // KB → wavetables
      { sourceModuleId: 'm1', sourcePortId: 'pitch_cv_1', destModuleId: 'm2', destPortId: 'pitch_cv' },
      { sourceModuleId: 'm1', sourcePortId: 'pitch_cv_1', destModuleId: 'm3', destPortId: 'pitch_cv' },
      { sourceModuleId: 'm1', sourcePortId: 'gate_1', destModuleId: 'm5', destPortId: 'gate_in' },
      { sourceModuleId: 'm1', sourcePortId: 'gate_1', destModuleId: 'm6', destPortId: 'gate_in' },
      // LFO → both wavetable morph CVs
      { sourceModuleId: 'm4', sourcePortId: 'lfo_out', destModuleId: 'm2', destPortId: 'morph_cv' },
      { sourceModuleId: 'm4', sourcePortId: 'lfo_out', destModuleId: 'm3', destPortId: 'morph_cv' },
      // Wavetables → VCAs → Mixer
      { sourceModuleId: 'm2', sourcePortId: 'audio_out', destModuleId: 'm7', destPortId: 'audio_in' },
      { sourceModuleId: 'm5', sourcePortId: 'envelope_out', destModuleId: 'm7', destPortId: 'cv_in' },
      { sourceModuleId: 'm3', sourcePortId: 'audio_out', destModuleId: 'm8', destPortId: 'audio_in' },
      { sourceModuleId: 'm6', sourcePortId: 'envelope_out', destModuleId: 'm8', destPortId: 'cv_in' },
      { sourceModuleId: 'm7', sourcePortId: 'audio_out', destModuleId: 'm9', destPortId: 'input_1' },
      { sourceModuleId: 'm8', sourcePortId: 'audio_out', destModuleId: 'm9', destPortId: 'input_2' },
      // Mixer → Chorus → Reverb → Output
      { sourceModuleId: 'm9', sourcePortId: 'mix_out', destModuleId: 'm10', destPortId: 'audio_in' },
      { sourceModuleId: 'm10', sourcePortId: 'audio_out', destModuleId: 'm11', destPortId: 'audio_in' },
      { sourceModuleId: 'm11', sourcePortId: 'audio_out', destModuleId: 'm12', destPortId: 'audio_in_left' },
    ],
  },

  // ───────────────────────────────────────────────────
  // 13. Euclidean Techno — euclidean rhythms driving a mono synth
  // ───────────────────────────────────────────────────
  {
    id: 'factory_euclidean_techno',
    name: 'Euclidean Techno',
    description: 'Euclidean rhythm driving a filtered sawtooth',
    category: 'sequencer',
    isFactory: true,
    version: 1,
    modules: [
      // Clock
      { id: 'm1', type: 'lfo', x: 40, y: 120, params: { rate: 6, depth: 1.0, waveform: 3, rateModDepth: 0 } },
      // Euclidean rhythm (5 hits in 8 steps)
      { id: 'm2', type: 'euclidean', x: 280, y: 120, params: { steps: 8, hits: 5, rotation: 0, gateLength: 0.4 } },
      // Random pitch via S&H
      { id: 'm3', type: 'noise', x: 40, y: 350, params: { color: 0, level: 0.5 } },
      { id: 'm4', type: 'sampleHold', x: 280, y: 350, params: { threshold: 0.5 } },
      { id: 'm5', type: 'quantizer', x: 520, y: 350, params: { scale: 1, rootNote: 0 } },
      // Synth voice
      { id: 'm6', type: 'vco', x: 520, y: 80, params: { frequency: 0, waveform: 1, fmDepth: 0, pulseWidth: 0.5, pwmDepth: 0 } },
      { id: 'm7', type: 'envelope', x: 760, y: 280, params: { attack: 0.005, decay: 0.15, sustain: 0.0, release: 0.1 } },
      { id: 'm8', type: 'vcf', x: 760, y: 80, params: { cutoff: 0.45, cutoffModDepth: 0.6, resonance: 0.5, resonanceModDepth: 0, mode: 0 } },
      { id: 'm9', type: 'vca', x: 1000, y: 80, params: { gain: 0.8 } },
      { id: 'm10', type: 'compressor', x: 1240, y: 80, params: { threshold: -15, ratio: 6, attack: 0.005, release: 0.08, makeupGain: 6 } },
      { id: 'm11', type: 'delay', x: 1480, y: 80, params: { time: 0.25, feedback: 0.3, mix: 0.25, timeModDepth: 0 } },
      { id: 'm12', type: 'output', x: 1720, y: 80, params: { masterVolume: 0.45 } },
    ],
    connections: [
      // LFO → Euclidean clock
      { sourceModuleId: 'm1', sourcePortId: 'lfo_out', destModuleId: 'm2', destPortId: 'clock_in' },
      // Euclidean gate → Envelope + S&H trigger
      { sourceModuleId: 'm2', sourcePortId: 'gate_out', destModuleId: 'm7', destPortId: 'gate_in' },
      { sourceModuleId: 'm2', sourcePortId: 'gate_out', destModuleId: 'm4', destPortId: 'trigger_in' },
      // Noise → S&H → Quantizer → VCO pitch
      { sourceModuleId: 'm3', sourcePortId: 'audio_out', destModuleId: 'm4', destPortId: 'signal_in' },
      { sourceModuleId: 'm4', sourcePortId: 'cv_out', destModuleId: 'm5', destPortId: 'cv_in' },
      { sourceModuleId: 'm5', sourcePortId: 'cv_out', destModuleId: 'm6', destPortId: 'pitch_cv' },
      // VCO → VCF
      { sourceModuleId: 'm6', sourcePortId: 'audio_out', destModuleId: 'm8', destPortId: 'audio_in' },
      // Envelope → VCF cutoff + VCA
      { sourceModuleId: 'm7', sourcePortId: 'envelope_out', destModuleId: 'm8', destPortId: 'cutoff_cv' },
      { sourceModuleId: 'm7', sourcePortId: 'envelope_out', destModuleId: 'm9', destPortId: 'cv_in' },
      // VCF → VCA → Compressor → Delay → Output
      { sourceModuleId: 'm8', sourcePortId: 'audio_out', destModuleId: 'm9', destPortId: 'audio_in' },
      { sourceModuleId: 'm9', sourcePortId: 'audio_out', destModuleId: 'm10', destPortId: 'audio_in' },
      { sourceModuleId: 'm10', sourcePortId: 'audio_out', destModuleId: 'm11', destPortId: 'audio_in' },
      { sourceModuleId: 'm11', sourcePortId: 'audio_out', destModuleId: 'm12', destPortId: 'audio_in_left' },
    ],
  },

  // ───────────────────────────────────────────────────
  // 14. Arp Synth — arpeggiator with filtered wavetable
  // ───────────────────────────────────────────────────
  {
    id: 'factory_arp_synth',
    name: 'Arp Synth',
    description: 'Keyboard arpeggiator with wavetable and delay',
    category: 'lead',
    isFactory: true,
    version: 1,
    modules: [
      // Arpeggiator (receives notes from keyboard)
      { id: 'm1', type: 'arpeggiator', x: 40, y: 120, params: { rate: 10, pattern: 0, octaveRange: 2, gateLength: 0.5 } },
      { id: 'm2', type: 'wavetable', x: 300, y: 80, params: { frequency: 0, wavetableIndex: 0.35, octave: 0, detune: 0 } },
      { id: 'm3', type: 'lfo', x: 40, y: 380, params: { rate: 0.25, depth: 0.3, waveform: 0, rateModDepth: 0 } },
      { id: 'm4', type: 'envelope', x: 300, y: 320, params: { attack: 0.005, decay: 0.2, sustain: 0.4, release: 0.15 } },
      { id: 'm5', type: 'vcf', x: 540, y: 80, params: { cutoff: 0.55, cutoffModDepth: 0.5, resonance: 0.3, resonanceModDepth: 0, mode: 0 } },
      { id: 'm6', type: 'vca', x: 780, y: 80, params: { gain: 0.8 } },
      { id: 'm7', type: 'delay', x: 1020, y: 80, params: { time: 0.3, feedback: 0.35, mix: 0.3, timeModDepth: 0 } },
      { id: 'm8', type: 'reverb', x: 1260, y: 80, params: { decay: 2.0, damping: 0.5, mix: 0.2 } },
      { id: 'm9', type: 'output', x: 1500, y: 80, params: { masterVolume: 0.5 } },
    ],
    connections: [
      // Arp pitch/gate → Wavetable + Envelope
      { sourceModuleId: 'm1', sourcePortId: 'pitch_cv_out', destModuleId: 'm2', destPortId: 'pitch_cv' },
      { sourceModuleId: 'm1', sourcePortId: 'gate_out', destModuleId: 'm4', destPortId: 'gate_in' },
      // LFO → Wavetable morph
      { sourceModuleId: 'm3', sourcePortId: 'lfo_out', destModuleId: 'm2', destPortId: 'morph_cv' },
      // Wavetable → VCF
      { sourceModuleId: 'm2', sourcePortId: 'audio_out', destModuleId: 'm5', destPortId: 'audio_in' },
      // Envelope → VCF cutoff + VCA
      { sourceModuleId: 'm4', sourcePortId: 'envelope_out', destModuleId: 'm5', destPortId: 'cutoff_cv' },
      { sourceModuleId: 'm4', sourcePortId: 'envelope_out', destModuleId: 'm6', destPortId: 'cv_in' },
      // VCF → VCA → Delay → Reverb → Output
      { sourceModuleId: 'm5', sourcePortId: 'audio_out', destModuleId: 'm6', destPortId: 'audio_in' },
      { sourceModuleId: 'm6', sourcePortId: 'audio_out', destModuleId: 'm7', destPortId: 'audio_in' },
      { sourceModuleId: 'm7', sourcePortId: 'audio_out', destModuleId: 'm8', destPortId: 'audio_in' },
      { sourceModuleId: 'm8', sourcePortId: 'audio_out', destModuleId: 'm9', destPortId: 'audio_in_left' },
    ],
  },

  // ───────────────────────────────────────────────────
  // 15. Granular Clouds — granular processing of a drone
  // ───────────────────────────────────────────────────
  {
    id: 'factory_granular_clouds',
    name: 'Granular Clouds',
    description: 'Self-playing granular texture with pitch shifting',
    category: 'pad',
    isFactory: true,
    version: 1,
    modules: [
      // Source: slow evolving VCO
      { id: 'm1', type: 'vco', x: 40, y: 100, params: { frequency: -1, waveform: 1, fmDepth: 0.05, pulseWidth: 0.5, pwmDepth: 0 } },
      { id: 'm2', type: 'lfo', x: 40, y: 350, params: { rate: 0.08, depth: 0.1, waveform: 0, rateModDepth: 0 } },
      // Granular processor
      { id: 'm3', type: 'granular', x: 300, y: 100, params: { grainDensity: 15, grainSize: 0.15, spread: 0.7, pitch: 1.0, mix: 0.8 } },
      // LFO to modulate grain density
      { id: 'm4', type: 'lfo', x: 300, y: 350, params: { rate: 0.2, depth: 0.5, waveform: 0, rateModDepth: 0 } },
      // EQ to shape the output
      { id: 'm5', type: 'eq', x: 560, y: 100, params: { lowGain: -3, midGain: 2, highGain: -2, lowFreq: 150, highFreq: 6000 } },
      { id: 'm6', type: 'reverb', x: 800, y: 100, params: { decay: 6.0, damping: 0.25, mix: 0.55 } },
      { id: 'm7', type: 'output', x: 1040, y: 100, params: { masterVolume: 0.4 } },
    ],
    connections: [
      // LFO1 → VCO FM (slow pitch drift)
      { sourceModuleId: 'm2', sourcePortId: 'lfo_out', destModuleId: 'm1', destPortId: 'fm_cv' },
      // VCO → Granular
      { sourceModuleId: 'm1', sourcePortId: 'audio_out', destModuleId: 'm3', destPortId: 'audio_in' },
      // LFO2 → Granular density CV
      { sourceModuleId: 'm4', sourcePortId: 'lfo_out', destModuleId: 'm3', destPortId: 'density_cv' },
      // Granular → EQ → Reverb → Output
      { sourceModuleId: 'm3', sourcePortId: 'audio_out', destModuleId: 'm5', destPortId: 'audio_in' },
      { sourceModuleId: 'm5', sourcePortId: 'audio_out', destModuleId: 'm6', destPortId: 'audio_in' },
      { sourceModuleId: 'm6', sourcePortId: 'audio_out', destModuleId: 'm7', destPortId: 'audio_in_left' },
    ],
  },

  // ───────────────────────────────────────────────────
  // 16. Probability Beats — euclidean + probability gate
  // ───────────────────────────────────────────────────
  {
    id: 'factory_probability_beats',
    name: 'Probability Beats',
    description: 'Euclidean rhythm filtered by probability gate',
    category: 'sequencer',
    isFactory: true,
    version: 1,
    modules: [
      // Clock
      { id: 'm1', type: 'lfo', x: 40, y: 120, params: { rate: 5, depth: 1.0, waveform: 3, rateModDepth: 0 } },
      // Two euclidean generators — melody + accent
      { id: 'm2', type: 'euclidean', x: 280, y: 60, params: { steps: 8, hits: 5, rotation: 0, gateLength: 0.4 } },
      { id: 'm3', type: 'euclidean', x: 280, y: 280, params: { steps: 8, hits: 3, rotation: 2, gateLength: 0.6 } },
      // Probability gate on the accent pattern
      { id: 'm4', type: 'probabilityGate', x: 520, y: 280, params: { probability: 0.6, mode: 0 } },
      // Sound source
      { id: 'm5', type: 'vco', x: 520, y: 60, params: { frequency: -0.5, waveform: 2, fmDepth: 0, pulseWidth: 0.5, pwmDepth: 0 } },
      { id: 'm6', type: 'envelope', x: 760, y: 60, params: { attack: 0.003, decay: 0.12, sustain: 0.0, release: 0.08 } },
      // Accent envelope (stronger + opens filter)
      { id: 'm7', type: 'envelope', x: 760, y: 280, params: { attack: 0.001, decay: 0.08, sustain: 0.0, release: 0.05 } },
      { id: 'm8', type: 'vcf', x: 1000, y: 60, params: { cutoff: 0.3, cutoffModDepth: 0.7, resonance: 0.6, resonanceModDepth: 0, mode: 0 } },
      { id: 'm9', type: 'vca', x: 1240, y: 60, params: { gain: 0.8 } },
      { id: 'm10', type: 'delay', x: 1480, y: 60, params: { time: 0.3, feedback: 0.3, mix: 0.2, timeModDepth: 0 } },
      { id: 'm11', type: 'output', x: 1720, y: 60, params: { masterVolume: 0.5 } },
    ],
    connections: [
      // LFO → both euclidean clocks
      { sourceModuleId: 'm1', sourcePortId: 'lfo_out', destModuleId: 'm2', destPortId: 'clock_in' },
      { sourceModuleId: 'm1', sourcePortId: 'lfo_out', destModuleId: 'm3', destPortId: 'clock_in' },
      // Euclidean 1 (melody) → main envelope
      { sourceModuleId: 'm2', sourcePortId: 'gate_out', destModuleId: 'm6', destPortId: 'gate_in' },
      // Euclidean 2 (accent) → probability gate → accent envelope
      { sourceModuleId: 'm3', sourcePortId: 'gate_out', destModuleId: 'm4', destPortId: 'gate_in' },
      { sourceModuleId: 'm4', sourcePortId: 'gate_out', destModuleId: 'm7', destPortId: 'gate_in' },
      // VCO → VCF
      { sourceModuleId: 'm5', sourcePortId: 'audio_out', destModuleId: 'm8', destPortId: 'audio_in' },
      // Main envelope → VCA, Accent envelope → VCF cutoff
      { sourceModuleId: 'm6', sourcePortId: 'envelope_out', destModuleId: 'm9', destPortId: 'cv_in' },
      { sourceModuleId: 'm7', sourcePortId: 'envelope_out', destModuleId: 'm8', destPortId: 'cutoff_cv' },
      // VCF → VCA → Delay → Output
      { sourceModuleId: 'm8', sourcePortId: 'audio_out', destModuleId: 'm9', destPortId: 'audio_in' },
      { sourceModuleId: 'm9', sourcePortId: 'audio_out', destModuleId: 'm10', destPortId: 'audio_in' },
      { sourceModuleId: 'm10', sourcePortId: 'audio_out', destModuleId: 'm11', destPortId: 'audio_in_left' },
    ],
  },

  // ───────────────────────────────────────────────────
  // 17. Mastered Mix — polyphonic through compressor + EQ chain
  // ───────────────────────────────────────────────────
  {
    id: 'factory_mastered_mix',
    name: 'Mastered Mix',
    description: 'Polyphonic saw with compressor and EQ mastering',
    category: 'keys',
    isFactory: true,
    version: 1,
    modules: [
      { id: 'm1', type: 'keyboard', x: 40, y: 200, params: { octave: 0 } },
      // 2 voices for simplicity
      { id: 'm2', type: 'vco', x: 300, y: 60, params: { frequency: 0, waveform: 1, fmDepth: 0, pulseWidth: 0.5, pwmDepth: 0 } },
      { id: 'm3', type: 'vco', x: 300, y: 260, params: { frequency: 0, waveform: 1, fmDepth: 0, pulseWidth: 0.5, pwmDepth: 0 } },
      { id: 'm4', type: 'envelope', x: 540, y: 60, params: { attack: 0.01, decay: 0.25, sustain: 0.6, release: 0.4 } },
      { id: 'm5', type: 'envelope', x: 540, y: 260, params: { attack: 0.01, decay: 0.25, sustain: 0.6, release: 0.4 } },
      { id: 'm6', type: 'vca', x: 780, y: 60, params: { gain: 0.8 } },
      { id: 'm7', type: 'vca', x: 780, y: 260, params: { gain: 0.8 } },
      { id: 'm8', type: 'mixer', x: 1020, y: 120, params: { gain1: 0.8, gain2: 0.8, gain3: 0.8, gain4: 0.8, masterGain: 1.0 } },
      // Master chain: EQ → Compressor → Output
      { id: 'm9', type: 'eq', x: 1260, y: 120, params: { lowGain: 2, midGain: -1, highGain: 3, lowFreq: 150, highFreq: 8000 } },
      { id: 'm10', type: 'compressor', x: 1500, y: 120, params: { threshold: -12, ratio: 4, attack: 0.01, release: 0.15, makeupGain: 4 } },
      { id: 'm11', type: 'output', x: 1740, y: 120, params: { masterVolume: 0.5 } },
    ],
    connections: [
      // Voice 1
      { sourceModuleId: 'm1', sourcePortId: 'pitch_cv_1', destModuleId: 'm2', destPortId: 'pitch_cv' },
      { sourceModuleId: 'm1', sourcePortId: 'gate_1', destModuleId: 'm4', destPortId: 'gate_in' },
      { sourceModuleId: 'm2', sourcePortId: 'audio_out', destModuleId: 'm6', destPortId: 'audio_in' },
      { sourceModuleId: 'm4', sourcePortId: 'envelope_out', destModuleId: 'm6', destPortId: 'cv_in' },
      { sourceModuleId: 'm6', sourcePortId: 'audio_out', destModuleId: 'm8', destPortId: 'input_1' },
      // Voice 2
      { sourceModuleId: 'm1', sourcePortId: 'pitch_cv_2', destModuleId: 'm3', destPortId: 'pitch_cv' },
      { sourceModuleId: 'm1', sourcePortId: 'gate_2', destModuleId: 'm5', destPortId: 'gate_in' },
      { sourceModuleId: 'm3', sourcePortId: 'audio_out', destModuleId: 'm7', destPortId: 'audio_in' },
      { sourceModuleId: 'm5', sourcePortId: 'envelope_out', destModuleId: 'm7', destPortId: 'cv_in' },
      { sourceModuleId: 'm7', sourcePortId: 'audio_out', destModuleId: 'm8', destPortId: 'input_2' },
      // Mixer → EQ → Compressor → Output
      { sourceModuleId: 'm8', sourcePortId: 'mix_out', destModuleId: 'm9', destPortId: 'audio_in' },
      { sourceModuleId: 'm9', sourcePortId: 'audio_out', destModuleId: 'm10', destPortId: 'audio_in' },
      { sourceModuleId: 'm10', sourcePortId: 'audio_out', destModuleId: 'm11', destPortId: 'audio_in_left' },
    ],
  },

  // ───────────────────────────────────────────────────
  // 18. Lo-Fi Crush — bitcrushed synth with LFO-modulated rate
  // ───────────────────────────────────────────────────
  {
    id: 'factory_lofi_crush',
    name: 'Lo-Fi Crush',
    description: 'Bitcrushed saw synth with retro digital grit',
    category: 'lead',
    isFactory: true,
    version: 1,
    modules: [
      { id: 'm1', type: 'keyboard', x: 40, y: 120, params: { octave: 0 } },
      { id: 'm2', type: 'vco', x: 300, y: 40, params: { frequency: 0, waveform: 1 } },
      { id: 'm3', type: 'envelope', x: 300, y: 240, params: { attack: 0.01, decay: 0.2, sustain: 0.6, release: 0.3 } },
      { id: 'm4', type: 'vca', x: 540, y: 40, params: { gain: 0.8 } },
      { id: 'm5', type: 'bitcrusher', x: 780, y: 40, params: { sampleRateReduction: 8, bitDepth: 8, mix: 0.7 } },
      { id: 'm6', type: 'vcf', x: 1020, y: 40, params: { cutoff: 0.55, cutoffModDepth: 0.3, resonance: 0.2, mode: 0 } },
      { id: 'm7', type: 'delay', x: 1260, y: 40, params: { time: 0.25, feedback: 0.3, mix: 0.25 } },
      { id: 'm8', type: 'output', x: 1500, y: 40, params: { masterVolume: 0.45 } },
    ],
    connections: [
      { sourceModuleId: 'm1', sourcePortId: 'pitch_cv_1', destModuleId: 'm2', destPortId: 'pitch_cv' },
      { sourceModuleId: 'm1', sourcePortId: 'gate_1', destModuleId: 'm3', destPortId: 'gate_in' },
      { sourceModuleId: 'm2', sourcePortId: 'audio_out', destModuleId: 'm4', destPortId: 'audio_in' },
      { sourceModuleId: 'm3', sourcePortId: 'envelope_out', destModuleId: 'm4', destPortId: 'cv_in' },
      { sourceModuleId: 'm4', sourcePortId: 'audio_out', destModuleId: 'm5', destPortId: 'audio_in' },
      { sourceModuleId: 'm5', sourcePortId: 'audio_out', destModuleId: 'm6', destPortId: 'audio_in' },
      { sourceModuleId: 'm3', sourcePortId: 'envelope_out', destModuleId: 'm6', destPortId: 'cutoff_cv' },
      { sourceModuleId: 'm6', sourcePortId: 'audio_out', destModuleId: 'm7', destPortId: 'audio_in' },
      { sourceModuleId: 'm7', sourcePortId: 'audio_out', destModuleId: 'm8', destPortId: 'audio_in_left' },
    ],
  },

  // ───────────────────────────────────────────────────
  // 19. Dirty Lead — distorted square lead with drive CV
  // ───────────────────────────────────────────────────
  {
    id: 'factory_dirty_lead',
    name: 'Dirty Lead',
    description: 'Overdriven square wave lead with tape saturation',
    category: 'lead',
    isFactory: true,
    version: 1,
    modules: [
      { id: 'm1', type: 'keyboard', x: 40, y: 120, params: { octave: 0 } },
      { id: 'm2', type: 'vco', x: 300, y: 40, params: { frequency: 0, waveform: 2 } },
      { id: 'm3', type: 'envelope', x: 300, y: 240, params: { attack: 0.01, decay: 0.15, sustain: 0.7, release: 0.2 } },
      { id: 'm4', type: 'vca', x: 540, y: 40, params: { gain: 0.8 } },
      { id: 'm5', type: 'distortion', x: 780, y: 40, params: { algorithm: 3, drive: 6, tone: 0.6, mix: 0.85, driveModDepth: 0.3 } },
      { id: 'm6', type: 'lfo', x: 540, y: 300, params: { rate: 3, depth: 0.4, waveform: 0 } },
      { id: 'm7', type: 'vcf', x: 1020, y: 40, params: { cutoff: 0.65, cutoffModDepth: 0.4, resonance: 0.3, mode: 0 } },
      { id: 'm8', type: 'reverb', x: 1260, y: 40, params: { decay: 1.5, damping: 0.6, mix: 0.2 } },
      { id: 'm9', type: 'output', x: 1500, y: 40, params: { masterVolume: 0.4 } },
    ],
    connections: [
      { sourceModuleId: 'm1', sourcePortId: 'pitch_cv_1', destModuleId: 'm2', destPortId: 'pitch_cv' },
      { sourceModuleId: 'm1', sourcePortId: 'gate_1', destModuleId: 'm3', destPortId: 'gate_in' },
      { sourceModuleId: 'm2', sourcePortId: 'audio_out', destModuleId: 'm4', destPortId: 'audio_in' },
      { sourceModuleId: 'm3', sourcePortId: 'envelope_out', destModuleId: 'm4', destPortId: 'cv_in' },
      { sourceModuleId: 'm4', sourcePortId: 'audio_out', destModuleId: 'm5', destPortId: 'audio_in' },
      { sourceModuleId: 'm6', sourcePortId: 'lfo_out', destModuleId: 'm5', destPortId: 'drive_cv' },
      { sourceModuleId: 'm5', sourcePortId: 'audio_out', destModuleId: 'm7', destPortId: 'audio_in' },
      { sourceModuleId: 'm3', sourcePortId: 'envelope_out', destModuleId: 'm7', destPortId: 'cutoff_cv' },
      { sourceModuleId: 'm7', sourcePortId: 'audio_out', destModuleId: 'm8', destPortId: 'audio_in' },
      { sourceModuleId: 'm8', sourcePortId: 'audio_out', destModuleId: 'm9', destPortId: 'audio_in_left' },
    ],
  },

  // ───────────────────────────────────────────────────
  // 20. Drum Machine — 3 drum synths with clock divider pattern
  // ───────────────────────────────────────────────────
  {
    id: 'factory_drum_machine',
    name: 'Drum Machine',
    description: 'Kick, snare, hihat with clock-divided rhythm',
    category: 'percussion',
    isFactory: true,
    version: 1,
    modules: [
      { id: 'm1', type: 'lfo', x: 40, y: 200, params: { rate: 6, depth: 1.0, waveform: 3 } },
      { id: 'm2', type: 'clockDivider', x: 280, y: 200, params: { gateLength: 0.4 } },
      { id: 'm3', type: 'drumSynth', x: 560, y: 40, params: { voice: 0, pitch: 55, decay: 0.4, pitchDecay: 0.06, pitchAmount: 3, noiseLevel: 0.15, tone: 0.4, level: 0.9 } },
      { id: 'm4', type: 'drumSynth', x: 560, y: 280, params: { voice: 1, pitch: 180, decay: 0.15, pitchDecay: 0.02, pitchAmount: 1, noiseLevel: 0.6, tone: 0.5, level: 0.7 } },
      { id: 'm5', type: 'drumSynth', x: 560, y: 480, params: { voice: 2, pitch: 300, decay: 0.06, pitchDecay: 0.01, pitchAmount: 0.5, noiseLevel: 0.9, tone: 0.7, level: 0.5 } },
      { id: 'm6', type: 'mixer', x: 840, y: 200, params: { gain1: 1.0, gain2: 0.8, gain3: 0.6, masterGain: 1.0 } },
      { id: 'm7', type: 'distortion', x: 1080, y: 200, params: { algorithm: 0, drive: 2, tone: 0.55, mix: 0.3 } },
      { id: 'm8', type: 'output', x: 1320, y: 200, params: { masterVolume: 0.5 } },
    ],
    connections: [
      // LFO → Clock Divider
      { sourceModuleId: 'm1', sourcePortId: 'lfo_out', destModuleId: 'm2', destPortId: 'clock_in' },
      // /2 → Kick (every other beat)
      { sourceModuleId: 'm2', sourcePortId: 'div2_out', destModuleId: 'm3', destPortId: 'gate_in' },
      // /4 → Snare (every 4th beat — backbeat)
      { sourceModuleId: 'm2', sourcePortId: 'div4_out', destModuleId: 'm4', destPortId: 'gate_in' },
      // Raw clock → Hihat (every beat)
      { sourceModuleId: 'm1', sourcePortId: 'lfo_out', destModuleId: 'm5', destPortId: 'gate_in' },
      // Drums → Mixer
      { sourceModuleId: 'm3', sourcePortId: 'audio_out', destModuleId: 'm6', destPortId: 'input_1' },
      { sourceModuleId: 'm4', sourcePortId: 'audio_out', destModuleId: 'm6', destPortId: 'input_2' },
      { sourceModuleId: 'm5', sourcePortId: 'audio_out', destModuleId: 'm6', destPortId: 'input_3' },
      // Mixer → subtle Distortion → Output
      { sourceModuleId: 'm6', sourcePortId: 'mix_out', destModuleId: 'm7', destPortId: 'audio_in' },
      { sourceModuleId: 'm7', sourcePortId: 'audio_out', destModuleId: 'm8', destPortId: 'audio_in_left' },
    ],
  },

  // ───────────────────────────────────────────────────
  // 21. Glide Sequence — slew-limited sequencer with portamento
  // ───────────────────────────────────────────────────
  {
    id: 'factory_glide_sequence',
    name: 'Glide Sequence',
    description: 'Smooth portamento sequence with slew limiter',
    category: 'sequencer',
    isFactory: true,
    version: 1,
    modules: [
      { id: 'm1', type: 'lfo', x: 40, y: 120, params: { rate: 3, depth: 1.0, waveform: 3 } },
      { id: 'm2', type: 'stepSequencer', x: 280, y: 120, params: { step0: 0, step1: 0.3, step2: 0.5, step3: 0.2, step4: 0.7, step5: 0.4, step6: 0.1, step7: 0.6, gateLength: 0.7, steps: 8 } },
      { id: 'm3', type: 'slewLimiter', x: 520, y: 40, params: { rise: 0.08, fall: 0.08, shape: 0.7 } },
      { id: 'm4', type: 'vco', x: 760, y: 40, params: { frequency: 0, waveform: 1 } },
      { id: 'm5', type: 'envelope', x: 520, y: 280, params: { attack: 0.02, decay: 0.2, sustain: 0.5, release: 0.15 } },
      { id: 'm6', type: 'vcf', x: 1000, y: 40, params: { cutoff: 0.45, cutoffModDepth: 0.5, resonance: 0.35, mode: 0 } },
      { id: 'm7', type: 'vca', x: 1240, y: 40, params: { gain: 0.8 } },
      { id: 'm8', type: 'delay', x: 1480, y: 40, params: { time: 0.375, feedback: 0.35, mix: 0.3 } },
      { id: 'm9', type: 'output', x: 1720, y: 40, params: { masterVolume: 0.5 } },
    ],
    connections: [
      // LFO → Sequencer clock
      { sourceModuleId: 'm1', sourcePortId: 'lfo_out', destModuleId: 'm2', destPortId: 'clock_in' },
      // Sequencer CV → Slew Limiter → VCO (smooth glide)
      { sourceModuleId: 'm2', sourcePortId: 'cv_out', destModuleId: 'm3', destPortId: 'cv_in' },
      { sourceModuleId: 'm3', sourcePortId: 'cv_out', destModuleId: 'm4', destPortId: 'pitch_cv' },
      // Sequencer gate → Envelope
      { sourceModuleId: 'm2', sourcePortId: 'gate_out', destModuleId: 'm5', destPortId: 'gate_in' },
      // VCO → VCF
      { sourceModuleId: 'm4', sourcePortId: 'audio_out', destModuleId: 'm6', destPortId: 'audio_in' },
      // Envelope → VCF cutoff + VCA
      { sourceModuleId: 'm5', sourcePortId: 'envelope_out', destModuleId: 'm6', destPortId: 'cutoff_cv' },
      { sourceModuleId: 'm5', sourcePortId: 'envelope_out', destModuleId: 'm7', destPortId: 'cv_in' },
      // VCF → VCA → Delay → Output
      { sourceModuleId: 'm6', sourcePortId: 'audio_out', destModuleId: 'm7', destPortId: 'audio_in' },
      { sourceModuleId: 'm7', sourcePortId: 'audio_out', destModuleId: 'm8', destPortId: 'audio_in' },
      { sourceModuleId: 'm8', sourcePortId: 'audio_out', destModuleId: 'm9', destPortId: 'audio_in_left' },
    ],
  },

  // ───────────────────────────────────────────────────
  // 22. Auto-Wah — envelope follower controlling filter cutoff
  // ───────────────────────────────────────────────────
  {
    id: 'factory_auto_wah',
    name: 'Auto-Wah',
    description: 'Envelope follower drives filter for dynamic wah',
    category: 'fx',
    isFactory: true,
    version: 1,
    modules: [
      { id: 'm1', type: 'keyboard', x: 40, y: 120, params: { octave: 0 } },
      { id: 'm2', type: 'vco', x: 300, y: 40, params: { frequency: 0, waveform: 1 } },
      { id: 'm3', type: 'envelope', x: 300, y: 280, params: { attack: 0.005, decay: 0.2, sustain: 0.7, release: 0.3 } },
      { id: 'm4', type: 'vca', x: 540, y: 40, params: { gain: 0.9 } },
      { id: 'm5', type: 'envelopeFollower', x: 540, y: 280, params: { attack: 0.005, release: 0.08, gain: 3, sensitivity: 0.7 } },
      { id: 'm6', type: 'vcf', x: 800, y: 40, params: { cutoff: 0.2, cutoffModDepth: 0.8, resonance: 0.5, mode: 0 } },
      { id: 'm7', type: 'delay', x: 1060, y: 40, params: { time: 0.2, feedback: 0.25, mix: 0.2 } },
      { id: 'm8', type: 'output', x: 1300, y: 40, params: { masterVolume: 0.5 } },
    ],
    connections: [
      { sourceModuleId: 'm1', sourcePortId: 'pitch_cv_1', destModuleId: 'm2', destPortId: 'pitch_cv' },
      { sourceModuleId: 'm1', sourcePortId: 'gate_1', destModuleId: 'm3', destPortId: 'gate_in' },
      { sourceModuleId: 'm2', sourcePortId: 'audio_out', destModuleId: 'm4', destPortId: 'audio_in' },
      { sourceModuleId: 'm3', sourcePortId: 'envelope_out', destModuleId: 'm4', destPortId: 'cv_in' },
      // VCA audio → Envelope Follower (detect amplitude)
      { sourceModuleId: 'm4', sourcePortId: 'audio_out', destModuleId: 'm5', destPortId: 'audio_in' },
      // VCA audio → VCF input
      { sourceModuleId: 'm4', sourcePortId: 'audio_out', destModuleId: 'm6', destPortId: 'audio_in' },
      // Envelope Follower CV → VCF cutoff (auto-wah)
      { sourceModuleId: 'm5', sourcePortId: 'cv_out', destModuleId: 'm6', destPortId: 'cutoff_cv' },
      { sourceModuleId: 'm6', sourcePortId: 'audio_out', destModuleId: 'm7', destPortId: 'audio_in' },
      { sourceModuleId: 'm7', sourcePortId: 'audio_out', destModuleId: 'm8', destPortId: 'audio_in_left' },
    ],
  },

  // ───────────────────────────────────────────────────
  // 23. CV Playground — CV mixer blending multiple modulation sources
  // ───────────────────────────────────────────────────
  {
    id: 'factory_cv_playground',
    name: 'CV Playground',
    description: 'CV mixer blends 3 LFOs for complex modulation',
    category: 'utility',
    isFactory: true,
    version: 1,
    modules: [
      { id: 'm1', type: 'keyboard', x: 40, y: 200, params: { octave: 0 } },
      { id: 'm2', type: 'lfo', x: 40, y: 420, params: { rate: 0.5, depth: 0.6, waveform: 0 } },
      { id: 'm3', type: 'lfo', x: 280, y: 420, params: { rate: 2.1, depth: 0.3, waveform: 1 } },
      { id: 'm4', type: 'lfo', x: 520, y: 420, params: { rate: 7, depth: 0.2, waveform: 3 } },
      { id: 'm5', type: 'cvMixer', x: 760, y: 420, params: { gain1: 0.5, gain2: 0.3, gain3: -0.2, offset: 0 } },
      { id: 'm6', type: 'vco', x: 300, y: 40, params: { frequency: 0, waveform: 1 } },
      { id: 'm7', type: 'envelope', x: 300, y: 200, params: { attack: 0.01, decay: 0.3, sustain: 0.6, release: 0.4 } },
      { id: 'm8', type: 'vcf', x: 560, y: 40, params: { cutoff: 0.4, cutoffModDepth: 0.6, resonance: 0.4, mode: 0 } },
      { id: 'm9', type: 'vca', x: 800, y: 40, params: { gain: 0.8 } },
      { id: 'm10', type: 'reverb', x: 1040, y: 40, params: { decay: 2.0, damping: 0.5, mix: 0.3 } },
      { id: 'm11', type: 'output', x: 1280, y: 40, params: { masterVolume: 0.45 } },
    ],
    connections: [
      { sourceModuleId: 'm1', sourcePortId: 'pitch_cv_1', destModuleId: 'm6', destPortId: 'pitch_cv' },
      { sourceModuleId: 'm1', sourcePortId: 'gate_1', destModuleId: 'm7', destPortId: 'gate_in' },
      // 3 LFOs → CV Mixer
      { sourceModuleId: 'm2', sourcePortId: 'lfo_out', destModuleId: 'm5', destPortId: 'cv_in_1' },
      { sourceModuleId: 'm3', sourcePortId: 'lfo_out', destModuleId: 'm5', destPortId: 'cv_in_2' },
      { sourceModuleId: 'm4', sourcePortId: 'lfo_out', destModuleId: 'm5', destPortId: 'cv_in_3' },
      // Mixed CV → VCF cutoff
      { sourceModuleId: 'm5', sourcePortId: 'cv_out', destModuleId: 'm8', destPortId: 'cutoff_cv' },
      // VCO → VCF → VCA → Reverb → Output
      { sourceModuleId: 'm6', sourcePortId: 'audio_out', destModuleId: 'm8', destPortId: 'audio_in' },
      { sourceModuleId: 'm7', sourcePortId: 'envelope_out', destModuleId: 'm9', destPortId: 'cv_in' },
      { sourceModuleId: 'm8', sourcePortId: 'audio_out', destModuleId: 'm9', destPortId: 'audio_in' },
      { sourceModuleId: 'm9', sourcePortId: 'audio_out', destModuleId: 'm10', destPortId: 'audio_in' },
      { sourceModuleId: 'm10', sourcePortId: 'audio_out', destModuleId: 'm11', destPortId: 'audio_in_left' },
    ],
  },

  // ───────────────────────────────────────────────────
  // 24. Drums & Bass — drum synth + sequenced bass with distortion
  // ───────────────────────────────────────────────────
  {
    id: 'factory_drums_and_bass',
    name: 'Drums & Bass',
    description: 'Drum machine with sequenced distorted bass line',
    category: 'sequencer',
    isFactory: true,
    version: 1,
    modules: [
      // Clock source
      { id: 'm1', type: 'lfo', x: 40, y: 240, params: { rate: 5, depth: 1.0, waveform: 3 } },
      // Clock divider for drums
      { id: 'm2', type: 'clockDivider', x: 280, y: 240, params: { gateLength: 0.4 } },
      // Kick drum on /4
      { id: 'm3', type: 'drumSynth', x: 520, y: 40, params: { voice: 0, pitch: 50, decay: 0.35, pitchDecay: 0.05, pitchAmount: 3.5, noiseLevel: 0.1, tone: 0.35, level: 0.9 } },
      // Hihat on every beat
      { id: 'm4', type: 'drumSynth', x: 520, y: 240, params: { voice: 2, pitch: 350, decay: 0.04, pitchDecay: 0.005, pitchAmount: 0.3, noiseLevel: 0.95, tone: 0.8, level: 0.35 } },
      // Bass sequencer
      { id: 'm5', type: 'stepSequencer', x: 280, y: 480, params: { step0: 0, step1: 0, step2: 0.3, step3: 0.3, step4: 0.5, step5: 0.5, step6: 0.2, step7: 0.7, gateLength: 0.6, steps: 8 } },
      { id: 'm6', type: 'vco', x: 520, y: 480, params: { frequency: -1, waveform: 1 } },
      { id: 'm7', type: 'envelope', x: 760, y: 480, params: { attack: 0.005, decay: 0.15, sustain: 0.4, release: 0.08 } },
      { id: 'm8', type: 'vca', x: 1000, y: 480, params: { gain: 0.8 } },
      { id: 'm9', type: 'distortion', x: 1240, y: 480, params: { algorithm: 0, drive: 3.5, tone: 0.4, mix: 0.5 } },
      // Drum mixer
      { id: 'm10', type: 'mixer', x: 800, y: 120, params: { gain1: 1.0, gain2: 0.5, gain3: 0.7, masterGain: 1.0 } },
      { id: 'm11', type: 'output', x: 1480, y: 240, params: { masterVolume: 0.45 } },
    ],
    connections: [
      // Clock → divider
      { sourceModuleId: 'm1', sourcePortId: 'lfo_out', destModuleId: 'm2', destPortId: 'clock_in' },
      // /4 → kick
      { sourceModuleId: 'm2', sourcePortId: 'div4_out', destModuleId: 'm3', destPortId: 'gate_in' },
      // Raw clock → hihat
      { sourceModuleId: 'm1', sourcePortId: 'lfo_out', destModuleId: 'm4', destPortId: 'gate_in' },
      // Drums → mixer channels 1+2
      { sourceModuleId: 'm3', sourcePortId: 'audio_out', destModuleId: 'm10', destPortId: 'input_1' },
      { sourceModuleId: 'm4', sourcePortId: 'audio_out', destModuleId: 'm10', destPortId: 'input_2' },
      // Bass: clock → sequencer
      { sourceModuleId: 'm1', sourcePortId: 'lfo_out', destModuleId: 'm5', destPortId: 'clock_in' },
      { sourceModuleId: 'm5', sourcePortId: 'cv_out', destModuleId: 'm6', destPortId: 'pitch_cv' },
      { sourceModuleId: 'm5', sourcePortId: 'gate_out', destModuleId: 'm7', destPortId: 'gate_in' },
      { sourceModuleId: 'm6', sourcePortId: 'audio_out', destModuleId: 'm8', destPortId: 'audio_in' },
      { sourceModuleId: 'm7', sourcePortId: 'envelope_out', destModuleId: 'm8', destPortId: 'cv_in' },
      { sourceModuleId: 'm8', sourcePortId: 'audio_out', destModuleId: 'm9', destPortId: 'audio_in' },
      // Bass → mixer channel 3
      { sourceModuleId: 'm9', sourcePortId: 'audio_out', destModuleId: 'm10', destPortId: 'input_3' },
      // Mixer → output
      { sourceModuleId: 'm10', sourcePortId: 'mix_out', destModuleId: 'm11', destPortId: 'audio_in_left' },
    ],
  },
];
