import vcoUrl from './processors/vco-processor.ts?url';
import vcfUrl from './processors/vcf-processor.ts?url';
import vcaUrl from './processors/vca-processor.ts?url';
import envelopeUrl from './processors/envelope-processor.ts?url';
import lfoUrl from './processors/lfo-processor.ts?url';
import mixerUrl from './processors/mixer-processor.ts?url';
import keyboardUrl from './processors/keyboard-processor.ts?url';
import outputUrl from './processors/output-processor.ts?url';
import noiseUrl from './processors/noise-processor.ts?url';
import delayUrl from './processors/delay-processor.ts?url';
import reverbUrl from './processors/reverb-processor.ts?url';
import oscilloscopeUrl from './processors/oscilloscope-processor.ts?url';
import sampleHoldUrl from './processors/sample-hold-processor.ts?url';
import ringModUrl from './processors/ring-mod-processor.ts?url';
import quantizerUrl from './processors/quantizer-processor.ts?url';
import wavefolderUrl from './processors/wavefolder-processor.ts?url';
import spectrumUrl from './processors/spectrum-processor.ts?url';
import stepSequencerUrl from './processors/step-sequencer-processor.ts?url';
import macroKnobsUrl from './processors/macro-knobs-processor.ts?url';
import probabilityGateUrl from './processors/probability-gate-processor.ts?url';
import euclideanUrl from './processors/euclidean-processor.ts?url';
import chorusUrl from './processors/chorus-processor.ts?url';
import compressorUrl from './processors/compressor-processor.ts?url';
import eqUrl from './processors/eq-processor.ts?url';
import fmOperatorUrl from './processors/fm-operator-processor.ts?url';
import wavetableUrl from './processors/wavetable-processor.ts?url';
import arpeggiatorUrl from './processors/arpeggiator-processor.ts?url';
import granularUrl from './processors/granular-processor.ts?url';
import looperUrl from './processors/looper-processor.ts?url';
import bitcrusherUrl from './processors/bitcrusher-processor.ts?url';
import cvMixerUrl from './processors/cv-mixer-processor.ts?url';
import slewLimiterUrl from './processors/slew-limiter-processor.ts?url';
import distortionUrl from './processors/distortion-processor.ts?url';
import envelopeFollowerUrl from './processors/envelope-follower-processor.ts?url';
import clockDividerUrl from './processors/clock-divider-processor.ts?url';
import drumSynthUrl from './processors/drum-synth-processor.ts?url';

const processorUrls = [
  vcoUrl,
  vcfUrl,
  vcaUrl,
  envelopeUrl,
  lfoUrl,
  mixerUrl,
  keyboardUrl,
  outputUrl,
  noiseUrl,
  delayUrl,
  reverbUrl,
  oscilloscopeUrl,
  sampleHoldUrl,
  ringModUrl,
  quantizerUrl,
  wavefolderUrl,
  spectrumUrl,
  stepSequencerUrl,
  macroKnobsUrl,
  probabilityGateUrl,
  euclideanUrl,
  chorusUrl,
  compressorUrl,
  eqUrl,
  fmOperatorUrl,
  wavetableUrl,
  arpeggiatorUrl,
  granularUrl,
  looperUrl,
  bitcrusherUrl,
  cvMixerUrl,
  slewLimiterUrl,
  distortionUrl,
  envelopeFollowerUrl,
  clockDividerUrl,
  drumSynthUrl,
];

export async function loadAllProcessors(ctx: AudioContext): Promise<void> {
  await Promise.all(processorUrls.map((url) => ctx.audioWorklet.addModule(url)));
}
