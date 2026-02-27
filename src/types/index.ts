export type ModuleType =
  | 'vco'
  | 'vcf'
  | 'vca'
  | 'envelope'
  | 'lfo'
  | 'mixer'
  | 'keyboard'
  | 'output'
  | 'noise'
  | 'delay'
  | 'reverb'
  | 'oscilloscope'
  | 'sampleHold'
  | 'ringMod'
  | 'quantizer'
  | 'wavefolder'
  | 'spectrum'
  | 'stepSequencer'
  | 'macroKnobs'
  | 'probabilityGate'
  | 'euclidean'
  | 'chorus'
  | 'compressor'
  | 'eq'
  | 'fmOperator'
  | 'wavetable'
  | 'arpeggiator'
  | 'granular'
  | 'looper';

export type SignalType = 'audio' | 'cv' | 'gate';

export interface PortDefinition {
  id: string;
  name: string;
  direction: 'input' | 'output';
  signal: SignalType;
  index: number;
  description?: string;
  suggestedSources?: string[];
  suggestedTargets?: string[];
}

export interface ModuleInstance {
  id: string;
  type: ModuleType;
  x: number;
  y: number;
  params: Record<string, number>;
}

export interface PortRef {
  moduleId: string;
  portId: string;
}

export interface CableConnection {
  id: string;
  source: PortRef;
  dest: PortRef;
  signalType: SignalType;
}

export interface ModuleDefinition {
  type: ModuleType;
  label: string;
  defaultParams: Record<string, number>;
  ports: PortDefinition[];
  description?: string;
  detailedDescription?: string;
  firstAddTip?: string;
}
