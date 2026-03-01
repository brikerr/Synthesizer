import type { ModuleType } from '../types/index.ts';
import { getModuleDefinition } from '../audio/graph/port-registry.ts';

export interface ModuleGroupItem {
  type: ModuleType;
  label: string;
}

export interface ModuleGroup {
  label: string;
  modules: ModuleGroupItem[];
}

export const MODULE_GROUPS: ModuleGroup[] = [
  {
    label: 'Sources',
    modules: [
      { type: 'vco', label: 'VCO' },
      { type: 'fmOperator', label: 'FM Operator' },
      { type: 'wavetable', label: 'Wavetable' },
      { type: 'noise', label: 'Noise' },
      { type: 'lfo', label: 'LFO' },
      { type: 'keyboard', label: 'Keyboard' },
      { type: 'stepSequencer', label: 'Sequencer' },
      { type: 'euclidean', label: 'Euclidean' },
      { type: 'arpeggiator', label: 'Arpeggiator' },
      { type: 'drumSynth', label: 'Drum Synth' },
    ],
  },
  {
    label: 'Processing',
    modules: [
      { type: 'vcf', label: 'VCF' },
      { type: 'vca', label: 'VCA' },
      { type: 'mixer', label: 'Mixer' },
      { type: 'envelope', label: 'Envelope' },
      { type: 'compressor', label: 'Compressor' },
      { type: 'eq', label: 'EQ' },
      { type: 'quantizer', label: 'Quantizer' },
      { type: 'sampleHold', label: 'S&H' },
      { type: 'probabilityGate', label: 'Prob Gate' },
      { type: 'slewLimiter', label: 'Slew Limiter' },
      { type: 'envelopeFollower', label: 'Env Follower' },
      { type: 'clockDivider', label: 'Clock Div' },
    ],
  },
  {
    label: 'Effects',
    modules: [
      { type: 'delay', label: 'Delay' },
      { type: 'reverb', label: 'Reverb' },
      { type: 'chorus', label: 'Chorus' },
      { type: 'ringMod', label: 'Ring Mod' },
      { type: 'wavefolder', label: 'Wavefolder' },
      { type: 'granular', label: 'Granular' },
      { type: 'looper', label: 'Looper' },
      { type: 'bitcrusher', label: 'Bitcrusher' },
      { type: 'distortion', label: 'Distortion' },
    ],
  },
  {
    label: 'Utility',
    modules: [
      { type: 'oscilloscope', label: 'Scope' },
      { type: 'spectrum', label: 'Spectrum' },
      { type: 'macroKnobs', label: 'Macro Knobs' },
      { type: 'output', label: 'Output' },
      { type: 'cvMixer', label: 'CV Mixer' },
    ],
  },
];

/** Flat list of all modules with descriptions from port-registry */
export function getAllModulesFlat() {
  return MODULE_GROUPS.flatMap((group) =>
    group.modules.map((m) => {
      const def = getModuleDefinition(m.type);
      return {
        ...m,
        category: group.label,
        description: def.description ?? '',
      };
    }),
  );
}
