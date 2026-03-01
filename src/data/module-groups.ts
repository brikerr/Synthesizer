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
    ],
  },
  {
    label: 'Utility',
    modules: [
      { type: 'oscilloscope', label: 'Scope' },
      { type: 'spectrum', label: 'Spectrum' },
      { type: 'macroKnobs', label: 'Macro Knobs' },
      { type: 'output', label: 'Output' },
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
