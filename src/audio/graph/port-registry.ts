import type { ModuleDefinition, ModuleType } from '../../types/index.ts';

const moduleDefinitions: Record<ModuleType, ModuleDefinition> = {
  vco: {
    type: 'vco',
    label: 'VCO',
    description: 'Voltage-controlled oscillator — generates pitched waveforms',
    detailedDescription:
      'Generates audio waveforms (sine, saw, square, triangle) at a pitch controlled by CV input. The core sound source of most patches. Use FM CV for vibrato or complex timbres, and PWM CV to animate pulse width.',
    firstAddTip: 'VCO generates pitched waveforms. Connect a Keyboard\'s Pitch CV to control its pitch!',
    defaultParams: {
      frequency: 0,
      waveform: 0,
      fmDepth: 0,
      pulseWidth: 0.5,
      pwmDepth: 0,
    },
    ports: [
      { id: 'pitch_cv', name: 'Pitch CV', direction: 'input', signal: 'cv', index: 0, description: 'Control pitch via CV (1V/oct)', suggestedSources: ['Keyboard', 'LFO'] },
      { id: 'fm_cv', name: 'FM CV', direction: 'input', signal: 'cv', index: 1, description: 'Frequency modulation input for vibrato or FM synthesis', suggestedSources: ['LFO', 'Envelope'] },
      { id: 'pwm_cv', name: 'PWM CV', direction: 'input', signal: 'cv', index: 2, description: 'Pulse width modulation — animates square wave timbre', suggestedSources: ['LFO'] },
      { id: 'audio_out', name: 'Audio Out', direction: 'output', signal: 'audio', index: 0, description: 'Main audio output signal', suggestedTargets: ['VCF', 'VCA', 'Mixer'] },
    ],
  },
  vcf: {
    type: 'vcf',
    label: 'VCF',
    description: 'Voltage-controlled filter — shapes tone by removing frequencies',
    detailedDescription:
      'Removes frequencies above (lowpass), below (highpass), or around (bandpass) a cutoff point. Resonance adds emphasis at the cutoff. Modulate the cutoff with an envelope for classic filter sweeps.',
    firstAddTip: 'VCF shapes tone. Connect a VCO\'s audio out to its input, then modulate cutoff with an Envelope!',
    defaultParams: {
      cutoff: 0.7,
      cutoffModDepth: 0.5,
      resonance: 0.1,
      resonanceModDepth: 0,
      mode: 0,
    },
    ports: [
      { id: 'audio_in', name: 'Audio In', direction: 'input', signal: 'audio', index: 0, description: 'Audio signal to be filtered', suggestedSources: ['VCO', 'Noise', 'Mixer'] },
      { id: 'cutoff_cv', name: 'Cutoff CV', direction: 'input', signal: 'cv', index: 1, description: 'Modulate filter cutoff frequency', suggestedSources: ['Envelope', 'LFO', 'Keyboard'] },
      { id: 'resonance_cv', name: 'Res CV', direction: 'input', signal: 'cv', index: 2, description: 'Modulate filter resonance amount', suggestedSources: ['LFO', 'Envelope'] },
      { id: 'audio_out', name: 'Audio Out', direction: 'output', signal: 'audio', index: 0, description: 'Filtered audio output', suggestedTargets: ['VCA', 'Mixer', 'Delay'] },
    ],
  },
  vca: {
    type: 'vca',
    label: 'VCA',
    description: 'Voltage-controlled amplifier — controls signal volume',
    detailedDescription:
      'Controls the amplitude (volume) of an audio signal using CV. Typically driven by an envelope to shape notes — without a VCA+Envelope, sounds play continuously.',
    firstAddTip: 'VCA controls volume. Connect an Envelope to its CV input to shape note dynamics!',
    defaultParams: {
      gain: 0.8,
    },
    ports: [
      { id: 'audio_in', name: 'Audio In', direction: 'input', signal: 'audio', index: 0, description: 'Audio signal whose volume will be controlled', suggestedSources: ['VCO', 'VCF', 'Mixer'] },
      { id: 'cv_in', name: 'CV In', direction: 'input', signal: 'cv', index: 1, description: 'Control voltage for amplitude — typically from an Envelope', suggestedSources: ['Envelope', 'LFO'] },
      { id: 'audio_out', name: 'Audio Out', direction: 'output', signal: 'audio', index: 0, description: 'Volume-controlled audio output', suggestedTargets: ['Mixer', 'Output', 'Delay'] },
    ],
  },
  envelope: {
    type: 'envelope',
    label: 'Envelope',
    description: 'ADSR envelope generator — shapes notes over time',
    detailedDescription:
      'Generates an Attack-Decay-Sustain-Release contour triggered by a gate signal. Use it to control VCA volume for note shaping, or VCF cutoff for filter sweeps.',
    firstAddTip: 'Envelope shapes notes over time. Connect Keyboard\'s Gate to its input, then send it to a VCA or VCF!',
    defaultParams: {
      attack: 0.01,
      decay: 0.3,
      sustain: 0.7,
      release: 0.5,
    },
    ports: [
      { id: 'gate_in', name: 'Gate In', direction: 'input', signal: 'gate', index: 0, description: 'Trigger signal — starts envelope on high, releases on low', suggestedSources: ['Keyboard'] },
      { id: 'envelope_out', name: 'Env Out', direction: 'output', signal: 'cv', index: 0, description: 'Envelope CV output contour', suggestedTargets: ['VCA', 'VCF'] },
    ],
  },
  lfo: {
    type: 'lfo',
    label: 'LFO',
    description: 'Low-frequency oscillator — adds movement and modulation',
    detailedDescription:
      'Generates slow, repeating waveforms used to modulate other parameters. Use it for vibrato (pitch), tremolo (volume), filter wobble, or any cyclic motion.',
    firstAddTip: 'LFO adds movement. Try connecting it to a VCO\'s FM CV for vibrato, or a VCF\'s cutoff for wobble!',
    defaultParams: {
      rate: 2,
      depth: 0.5,
      waveform: 0,
      rateModDepth: 0,
    },
    ports: [
      { id: 'rate_cv', name: 'Rate CV', direction: 'input', signal: 'cv', index: 0, description: 'Modulate LFO speed from an external source', suggestedSources: ['LFO', 'Envelope'] },
      { id: 'lfo_out', name: 'LFO Out', direction: 'output', signal: 'cv', index: 0, description: 'Low-frequency modulation signal', suggestedTargets: ['VCO', 'VCF', 'VCA'] },
    ],
  },
  mixer: {
    type: 'mixer',
    label: 'Mixer',
    description: 'Combines up to 4 audio signals into one',
    detailedDescription:
      'Sums up to four audio inputs into a single output with individual gain controls. Use it to blend multiple oscillators, or to combine signals before sending to a filter or output.',
    firstAddTip: 'Mixer blends signals together. Connect multiple VCOs or audio sources to its inputs!',
    defaultParams: {
      gain1: 0.8,
      gain2: 0.8,
      gain3: 0.8,
      gain4: 0.8,
      masterGain: 1.0,
    },
    ports: [
      { id: 'input_1', name: 'In 1', direction: 'input', signal: 'audio', index: 0, description: 'Audio input channel 1', suggestedSources: ['VCO', 'Noise'] },
      { id: 'input_2', name: 'In 2', direction: 'input', signal: 'audio', index: 1, description: 'Audio input channel 2', suggestedSources: ['VCO', 'Noise'] },
      { id: 'input_3', name: 'In 3', direction: 'input', signal: 'audio', index: 2, description: 'Audio input channel 3', suggestedSources: ['VCO', 'Noise'] },
      { id: 'input_4', name: 'In 4', direction: 'input', signal: 'audio', index: 3, description: 'Audio input channel 4', suggestedSources: ['VCO', 'Noise'] },
      { id: 'mix_out', name: 'Mix Out', direction: 'output', signal: 'audio', index: 0, description: 'Combined audio output', suggestedTargets: ['VCF', 'VCA', 'Output'] },
    ],
  },
  keyboard: {
    type: 'keyboard',
    label: 'Keyboard',
    description: 'Pitch CV and gate source — play notes from your keyboard',
    detailedDescription:
      'Converts key presses into pitch CV (1V/oct) and gate signals. The pitch CV controls oscillator frequency, while the gate triggers envelopes for note shaping.',
    firstAddTip: 'Keyboard converts key presses to CV. Connect Pitch CV to a VCO and Gate to an Envelope!',
    defaultParams: {
      octave: 0,
    },
    ports: [
      { id: 'pitch_cv_1', name: 'Pitch 1', direction: 'output', signal: 'cv', index: 0, description: 'Voice 1 pitch CV (1V/oct)', suggestedTargets: ['VCO'] },
      { id: 'gate_1', name: 'Gate 1', direction: 'output', signal: 'gate', index: 1, description: 'Voice 1 gate — high while key held', suggestedTargets: ['Envelope'] },
      { id: 'pitch_cv_2', name: 'Pitch 2', direction: 'output', signal: 'cv', index: 2, description: 'Voice 2 pitch CV (1V/oct)', suggestedTargets: ['VCO'] },
      { id: 'gate_2', name: 'Gate 2', direction: 'output', signal: 'gate', index: 3, description: 'Voice 2 gate — high while key held', suggestedTargets: ['Envelope'] },
      { id: 'pitch_cv_3', name: 'Pitch 3', direction: 'output', signal: 'cv', index: 4, description: 'Voice 3 pitch CV (1V/oct)', suggestedTargets: ['VCO'] },
      { id: 'gate_3', name: 'Gate 3', direction: 'output', signal: 'gate', index: 5, description: 'Voice 3 gate — high while key held', suggestedTargets: ['Envelope'] },
      { id: 'pitch_cv_4', name: 'Pitch 4', direction: 'output', signal: 'cv', index: 6, description: 'Voice 4 pitch CV (1V/oct)', suggestedTargets: ['VCO'] },
      { id: 'gate_4', name: 'Gate 4', direction: 'output', signal: 'gate', index: 7, description: 'Voice 4 gate — high while key held', suggestedTargets: ['Envelope'] },
    ],
  },
  output: {
    type: 'output',
    label: 'Output',
    description: 'Final audio output to your speakers',
    detailedDescription:
      'Sends audio to your speakers or headphones. Connect the final stage of your signal chain here. Has left and right inputs for stereo.',
    firstAddTip: 'Output sends audio to your speakers. Connect your final audio signal to its inputs!',
    defaultParams: {
      masterVolume: 0.5,
    },
    ports: [
      { id: 'audio_in_left', name: 'Left In', direction: 'input', signal: 'audio', index: 0, description: 'Left channel audio input', suggestedSources: ['VCA', 'Mixer', 'Reverb'] },
      { id: 'audio_in_right', name: 'Right In', direction: 'input', signal: 'audio', index: 1, description: 'Right channel audio input', suggestedSources: ['VCA', 'Mixer', 'Reverb'] },
    ],
  },
  noise: {
    type: 'noise',
    label: 'Noise',
    description: 'Noise generator — white, pink, and other noise colors',
    detailedDescription:
      'Generates random noise signals useful for percussion, wind effects, or adding texture. White noise has equal energy at all frequencies; pink noise rolls off at higher frequencies.',
    firstAddTip: 'Noise generates random signals — great for percussion or texture. Send it through a VCF to shape it!',
    defaultParams: {
      color: 0,
      level: 0.8,
    },
    ports: [
      { id: 'audio_out', name: 'Audio Out', direction: 'output', signal: 'audio', index: 0, description: 'Noise signal output', suggestedTargets: ['VCF', 'Mixer', 'VCA'] },
    ],
  },
  delay: {
    type: 'delay',
    label: 'Delay',
    description: 'Echo effect — repeats audio with adjustable time and feedback',
    detailedDescription:
      'Creates echoes by repeating the input signal after a delay time. Feedback controls how many repeats occur. Mix blends dry and wet signals. Modulate time with CV for chorus-like effects.',
    firstAddTip: 'Delay creates echoes. Connect audio to its input and adjust time and feedback for rhythmic repeats!',
    defaultParams: {
      time: 0.3,
      feedback: 0.4,
      mix: 0.5,
      timeModDepth: 0,
    },
    ports: [
      { id: 'audio_in', name: 'Audio In', direction: 'input', signal: 'audio', index: 0, description: 'Audio signal to be delayed', suggestedSources: ['VCA', 'VCF', 'Mixer'] },
      { id: 'time_cv', name: 'Time CV', direction: 'input', signal: 'cv', index: 1, description: 'Modulate delay time for chorus or warping effects', suggestedSources: ['LFO'] },
      { id: 'feedback_cv', name: 'FB CV', direction: 'input', signal: 'cv', index: 2, description: 'Modulate feedback amount', suggestedSources: ['LFO', 'Envelope'] },
      { id: 'audio_out', name: 'Audio Out', direction: 'output', signal: 'audio', index: 0, description: 'Delayed audio output (dry + wet mix)', suggestedTargets: ['Reverb', 'Mixer', 'Output'] },
    ],
  },
  reverb: {
    type: 'reverb',
    label: 'Reverb',
    description: 'Reverb effect — adds space and ambience',
    detailedDescription:
      'Simulates the reflections of a room or hall. Decay controls how long the reverb tail lasts. Damping reduces high-frequency content in the tail. Mix blends dry and wet signals.',
    firstAddTip: 'Reverb adds space to your sound. Place it at the end of your chain before the Output!',
    defaultParams: {
      decay: 2.0,
      damping: 0.5,
      mix: 0.3,
    },
    ports: [
      { id: 'audio_in', name: 'Audio In', direction: 'input', signal: 'audio', index: 0, description: 'Audio signal to add reverb to', suggestedSources: ['VCA', 'Delay', 'Mixer'] },
      { id: 'audio_out', name: 'Audio Out', direction: 'output', signal: 'audio', index: 0, description: 'Reverb-processed audio output', suggestedTargets: ['Mixer', 'Output'] },
    ],
  },
  oscilloscope: {
    type: 'oscilloscope',
    label: 'Scope',
    description: 'Visual display — see your waveforms in real time',
    detailedDescription:
      'Displays the waveform of any signal passing through it. Use it to visualize audio or CV signals for debugging or learning. Signal passes through unchanged.',
    firstAddTip: 'Scope visualizes signals. Patch any audio or CV signal through it to see the waveform!',
    defaultParams: {
      timeDiv: 5,
      triggerLevel: 0,
      freeze: 0,
    },
    ports: [
      { id: 'signal_in', name: 'Signal In', direction: 'input', signal: 'audio', index: 0, description: 'Signal to visualize on the display', suggestedSources: ['VCO', 'LFO', 'VCF'] },
      { id: 'signal_out', name: 'Signal Out', direction: 'output', signal: 'audio', index: 0, description: 'Pass-through output — signal is unchanged', suggestedTargets: ['VCF', 'VCA', 'Output'] },
    ],
  },
  sampleHold: {
    type: 'sampleHold',
    label: 'S&H',
    description: 'Sample & Hold — snapshots a signal on trigger',
    detailedDescription:
      'Captures the value of an input signal whenever a trigger fires, and holds that value until the next trigger. Classic use: Noise → S&H (triggered by LFO) → VCO pitch for random melodies.',
    firstAddTip: 'S&H grabs a snapshot of a signal each time it\'s triggered. Try Noise → Signal In, LFO (square) → Trigger, Output → VCO pitch!',
    defaultParams: {
      threshold: 0.5,
    },
    ports: [
      { id: 'signal_in', name: 'Signal In', direction: 'input', signal: 'audio', index: 0, description: 'Signal to sample when triggered', suggestedSources: ['Noise', 'LFO', 'VCO'] },
      { id: 'trigger_in', name: 'Trigger In', direction: 'input', signal: 'gate', index: 1, description: 'Trigger source — samples on rising edge', suggestedSources: ['LFO', 'Keyboard'] },
      { id: 'cv_out', name: 'CV Out', direction: 'output', signal: 'cv', index: 0, description: 'Held CV value output', suggestedTargets: ['VCO', 'VCF', 'VCA'] },
    ],
  },
  ringMod: {
    type: 'ringMod',
    label: 'Ring Mod',
    description: 'Ring modulator — multiplies two signals for metallic tones',
    detailedDescription:
      'Multiplies two audio signals together, producing sum-and-difference frequencies. Creates metallic, bell-like, or robotic tones. Mix blends between dry carrier and ring-modulated output.',
    firstAddTip: 'Ring Mod multiplies two signals for metallic tones. Connect two VCOs — one as carrier, one as modulator!',
    defaultParams: {
      mix: 1.0,
    },
    ports: [
      { id: 'carrier_in', name: 'Carrier In', direction: 'input', signal: 'audio', index: 0, description: 'Carrier signal (main audio)', suggestedSources: ['VCO', 'Noise'] },
      { id: 'modulator_in', name: 'Mod In', direction: 'input', signal: 'audio', index: 1, description: 'Modulator signal (multiplied with carrier)', suggestedSources: ['VCO', 'LFO'] },
      { id: 'audio_out', name: 'Audio Out', direction: 'output', signal: 'audio', index: 0, description: 'Ring-modulated audio output', suggestedTargets: ['VCF', 'VCA', 'Mixer'] },
    ],
  },
  quantizer: {
    type: 'quantizer',
    label: 'Quantizer',
    description: 'Snaps CV to musical scale notes',
    detailedDescription:
      'Snaps a continuous CV signal to the nearest note in a selected musical scale. Turns random or gliding voltages into melodic patterns. Choose from chromatic, major, minor, pentatonic, or blues scales.',
    firstAddTip: 'Quantizer snaps CV to scale notes. Try LFO (saw, slow) → Quantizer → VCO for stepped melodies!',
    defaultParams: {
      scale: 0,
      rootNote: 0,
    },
    ports: [
      { id: 'cv_in', name: 'CV In', direction: 'input', signal: 'cv', index: 0, description: 'Continuous CV input to quantize', suggestedSources: ['LFO', 'S&H', 'Envelope'] },
      { id: 'cv_out', name: 'CV Out', direction: 'output', signal: 'cv', index: 0, description: 'Quantized CV snapped to scale', suggestedTargets: ['VCO', 'VCF'] },
    ],
  },
  wavefolder: {
    type: 'wavefolder',
    label: 'Wavefolder',
    description: 'Folds and distorts audio for harmonic richness',
    detailedDescription:
      'Folds or clips audio waveforms to add harmonics and grit. At mild settings adds warmth; at extreme settings creates complex harmonic content. Drive controls input gain, folds sets the number of folding stages.',
    firstAddTip: 'Wavefolder adds harmonics by folding waveforms. Connect a VCO and turn up Drive to hear the effect!',
    defaultParams: {
      drive: 1,
      folds: 1,
      mix: 1.0,
      symmetry: 0.5,
      foldModDepth: 0,
    },
    ports: [
      { id: 'audio_in', name: 'Audio In', direction: 'input', signal: 'audio', index: 0, description: 'Audio signal to fold/distort', suggestedSources: ['VCO', 'Noise', 'Mixer'] },
      { id: 'fold_cv', name: 'Fold CV', direction: 'input', signal: 'cv', index: 1, description: 'Modulate fold amount via CV', suggestedSources: ['LFO', 'Envelope'] },
      { id: 'audio_out', name: 'Audio Out', direction: 'output', signal: 'audio', index: 0, description: 'Folded/distorted audio output', suggestedTargets: ['VCF', 'VCA', 'Mixer'] },
    ],
  },
  spectrum: {
    type: 'spectrum',
    label: 'Spectrum',
    description: 'Frequency spectrum display — see your sound\'s harmonics',
    detailedDescription:
      'Displays the frequency spectrum of a signal (frequency domain view), complementing the time-domain oscilloscope. Shows which frequencies are present and their relative levels.',
    firstAddTip: 'Spectrum shows frequency content. Patch any audio through it to see the harmonics!',
    defaultParams: {
      freeze: 0,
    },
    ports: [
      { id: 'signal_in', name: 'Signal In', direction: 'input', signal: 'audio', index: 0, description: 'Signal to analyze', suggestedSources: ['VCO', 'VCF', 'Mixer'] },
      { id: 'signal_out', name: 'Signal Out', direction: 'output', signal: 'audio', index: 0, description: 'Pass-through output — signal is unchanged', suggestedTargets: ['VCF', 'VCA', 'Output'] },
    ],
  },
  stepSequencer: {
    type: 'stepSequencer',
    label: 'Sequencer',
    description: '8-step sequencer — creates repeating melodic patterns',
    detailedDescription:
      'An 8-step pattern that outputs pitch CV and gate signals in sequence, triggered by a clock input. Creates repeating melodic patterns. Each step has an adjustable CV value.',
    firstAddTip: 'Sequencer creates patterns! Connect LFO (square) → Clock, then CV Out → VCO and Gate Out → Envelope!',
    defaultParams: {
      step0: 0, step1: 0, step2: 0, step3: 0,
      step4: 0, step5: 0, step6: 0, step7: 0,
      gateLength: 0.5,
      steps: 8,
    },
    ports: [
      { id: 'clock_in', name: 'Clock In', direction: 'input', signal: 'gate', index: 0, description: 'Clock trigger — advances to next step', suggestedSources: ['LFO'] },
      { id: 'reset_in', name: 'Reset In', direction: 'input', signal: 'gate', index: 1, description: 'Reset to step 1', suggestedSources: ['LFO', 'Keyboard'] },
      { id: 'cv_out', name: 'CV Out', direction: 'output', signal: 'cv', index: 0, description: 'Step pitch CV output', suggestedTargets: ['VCO', 'VCF', 'Quantizer'] },
      { id: 'gate_out', name: 'Gate Out', direction: 'output', signal: 'gate', index: 1, description: 'Step gate output', suggestedTargets: ['Envelope', 'VCA'] },
    ],
  },
  macroKnobs: {
    type: 'macroKnobs',
    label: 'Macro Knobs',
    description: 'Four knobs outputting CV — control anything',
    detailedDescription:
      'Four general-purpose knobs that output CV signals. Use them to manually control any CV-accepting parameter on other modules. Great for performance control and macro assignments.',
    defaultParams: {
      macro1: 0,
      macro2: 0,
      macro3: 0,
      macro4: 0,
    },
    ports: [
      { id: 'cv_out_1', name: 'CV 1', direction: 'output', signal: 'cv', index: 0, description: 'CV output from Macro 1 knob', suggestedTargets: ['VCO', 'VCF', 'VCA'] },
      { id: 'cv_out_2', name: 'CV 2', direction: 'output', signal: 'cv', index: 1, description: 'CV output from Macro 2 knob', suggestedTargets: ['VCO', 'VCF', 'VCA'] },
      { id: 'cv_out_3', name: 'CV 3', direction: 'output', signal: 'cv', index: 2, description: 'CV output from Macro 3 knob', suggestedTargets: ['VCO', 'VCF', 'VCA'] },
      { id: 'cv_out_4', name: 'CV 4', direction: 'output', signal: 'cv', index: 3, description: 'CV output from Macro 4 knob', suggestedTargets: ['VCO', 'VCF', 'VCA'] },
    ],
  },
  probabilityGate: {
    type: 'probabilityGate',
    label: 'Prob Gate',
    description: 'Random gate filtering — adds probability to triggers',
    detailedDescription:
      'Filters gate signals based on a probability setting. In Pass mode, gates pass through randomly. In Block mode, gates are randomly blocked. In Toggle mode, random chance flips the output state.',
    defaultParams: {
      probability: 0.5,
      mode: 0,
    },
    ports: [
      { id: 'gate_in', name: 'Gate In', direction: 'input', signal: 'gate', index: 0, description: 'Gate signal to filter', suggestedSources: ['LFO', 'Keyboard', 'Sequencer'] },
      { id: 'probability_cv', name: 'Prob CV', direction: 'input', signal: 'cv', index: 1, description: 'Modulate probability via CV', suggestedSources: ['LFO', 'Envelope'] },
      { id: 'gate_out', name: 'Gate Out', direction: 'output', signal: 'gate', index: 0, description: 'Filtered gate output', suggestedTargets: ['Envelope', 'VCA'] },
    ],
  },
  euclidean: {
    type: 'euclidean',
    label: 'Euclidean',
    description: 'Euclidean rhythm generator — mathematically optimal patterns',
    detailedDescription:
      'Generates rhythmic patterns using the Bjorklund/Euclidean algorithm. Distributes a number of hits as evenly as possible across a number of steps. Rotation shifts the pattern start point.',
    defaultParams: {
      steps: 8,
      hits: 4,
      rotation: 0,
      gateLength: 0.5,
    },
    ports: [
      { id: 'clock_in', name: 'Clock In', direction: 'input', signal: 'gate', index: 0, description: 'Clock trigger — advances to next step', suggestedSources: ['LFO'] },
      { id: 'reset_in', name: 'Reset In', direction: 'input', signal: 'gate', index: 1, description: 'Reset to step 1', suggestedSources: ['LFO', 'Keyboard'] },
      { id: 'gate_out', name: 'Gate Out', direction: 'output', signal: 'gate', index: 0, description: 'Euclidean gate pattern output', suggestedTargets: ['Envelope', 'VCA'] },
    ],
  },
  chorus: {
    type: 'chorus',
    label: 'Chorus',
    description: 'Chorus effect — adds richness with modulated delays',
    detailedDescription:
      'Creates a thicker sound by mixing the dry signal with multiple LFO-modulated short delays. Adjustable number of voices, rate, and depth for subtle shimmer to extreme detuning effects.',
    defaultParams: {
      rate: 1.5,
      depth: 0.5,
      mix: 0.5,
      voices: 2,
    },
    ports: [
      { id: 'audio_in', name: 'Audio In', direction: 'input', signal: 'audio', index: 0, description: 'Audio signal to process', suggestedSources: ['VCA', 'VCF', 'Mixer'] },
      { id: 'rate_cv', name: 'Rate CV', direction: 'input', signal: 'cv', index: 1, description: 'Modulate chorus rate via CV', suggestedSources: ['LFO'] },
      { id: 'audio_out', name: 'Audio Out', direction: 'output', signal: 'audio', index: 0, description: 'Chorus-processed audio output', suggestedTargets: ['Reverb', 'Mixer', 'Output'] },
    ],
  },
  compressor: {
    type: 'compressor',
    label: 'Compressor',
    description: 'Compressor/limiter — controls dynamics',
    detailedDescription:
      'Reduces dynamic range by attenuating loud signals. Features adjustable threshold, ratio, attack/release times, and makeup gain. Optional sidechain input for ducking effects.',
    defaultParams: {
      threshold: -20,
      ratio: 4,
      attack: 0.01,
      release: 0.1,
      makeupGain: 0,
    },
    ports: [
      { id: 'audio_in', name: 'Audio In', direction: 'input', signal: 'audio', index: 0, description: 'Audio signal to compress', suggestedSources: ['VCA', 'Mixer'] },
      { id: 'sidechain_in', name: 'Sidechain', direction: 'input', signal: 'audio', index: 1, description: 'External sidechain input for keyed compression', suggestedSources: ['VCO', 'Noise'] },
      { id: 'audio_out', name: 'Audio Out', direction: 'output', signal: 'audio', index: 0, description: 'Compressed audio output', suggestedTargets: ['Mixer', 'Output'] },
    ],
  },
  eq: {
    type: 'eq',
    label: 'EQ',
    description: '3-band equalizer — shape the frequency spectrum',
    detailedDescription:
      'Three-band parametric EQ with low shelf, peaking mid, and high shelf filters. Each band has +/-12dB gain. Low and high crossover frequencies are adjustable.',
    defaultParams: {
      lowGain: 0,
      midGain: 0,
      highGain: 0,
      lowFreq: 200,
      highFreq: 4000,
    },
    ports: [
      { id: 'audio_in', name: 'Audio In', direction: 'input', signal: 'audio', index: 0, description: 'Audio signal to equalize', suggestedSources: ['VCA', 'Mixer', 'VCF'] },
      { id: 'audio_out', name: 'Audio Out', direction: 'output', signal: 'audio', index: 0, description: 'EQ-processed audio output', suggestedTargets: ['Compressor', 'Mixer', 'Output'] },
    ],
  },
  fmOperator: {
    type: 'fmOperator',
    label: 'FM Op',
    description: 'FM synthesis operator — sine oscillator with modulation I/O',
    detailedDescription:
      'A single FM synthesis operator with pitch CV, modulator input, self-feedback, and dual outputs (audio + modulator). Chain multiple operators for complex FM synthesis. Ratio sets the frequency multiplier relative to the base pitch.',
    defaultParams: {
      frequency: 0,
      ratio: 1,
      fmIndex: 0,
      feedback: 0,
      waveform: 0,
    },
    ports: [
      { id: 'pitch_cv', name: 'Pitch CV', direction: 'input', signal: 'cv', index: 0, description: 'Control pitch via CV (1V/oct)', suggestedSources: ['Keyboard', 'LFO'] },
      { id: 'modulator_in', name: 'Mod In', direction: 'input', signal: 'audio', index: 1, description: 'Modulator input from another FM operator', suggestedSources: ['FM Op'] },
      { id: 'fm_index_cv', name: 'Index CV', direction: 'input', signal: 'cv', index: 2, description: 'Modulate FM index via CV', suggestedSources: ['Envelope', 'LFO'] },
      { id: 'audio_out', name: 'Audio Out', direction: 'output', signal: 'audio', index: 0, description: 'Main audio output', suggestedTargets: ['VCF', 'VCA', 'Mixer'] },
      { id: 'modulator_out', name: 'Mod Out', direction: 'output', signal: 'audio', index: 1, description: 'Modulator output to chain to another FM operator', suggestedTargets: ['FM Op'] },
    ],
  },
  wavetable: {
    type: 'wavetable',
    label: 'Wavetable',
    description: 'Wavetable oscillator — morph between 7 waveforms',
    detailedDescription:
      'Oscillator with 7 pre-computed wavetables (sine, triangle, saw, square, supersaw, organ, vocal). Smoothly morph between adjacent tables using the Morph control. Features octave and detune controls.',
    defaultParams: {
      frequency: 0,
      wavetableIndex: 0,
      octave: 0,
      detune: 0,
    },
    ports: [
      { id: 'pitch_cv', name: 'Pitch CV', direction: 'input', signal: 'cv', index: 0, description: 'Control pitch via CV (1V/oct)', suggestedSources: ['Keyboard', 'LFO'] },
      { id: 'morph_cv', name: 'Morph CV', direction: 'input', signal: 'cv', index: 1, description: 'Modulate wavetable morph position', suggestedSources: ['LFO', 'Envelope'] },
      { id: 'audio_out', name: 'Audio Out', direction: 'output', signal: 'audio', index: 0, description: 'Wavetable audio output', suggestedTargets: ['VCF', 'VCA', 'Mixer'] },
    ],
  },
  arpeggiator: {
    type: 'arpeggiator',
    label: 'Arpeggiator',
    description: 'Arpeggiator — cycles through held notes in patterns',
    detailedDescription:
      'Receives notes from the keyboard and cycles through them in various patterns (up, down, up/down, random). Outputs pitch CV and gate signals. Can use internal clock or external clock input. Octave range expands the pattern across multiple octaves.',
    defaultParams: {
      rate: 8,
      pattern: 0,
      octaveRange: 1,
      gateLength: 0.5,
    },
    ports: [
      { id: 'clock_in', name: 'Clock In', direction: 'input', signal: 'gate', index: 0, description: 'External clock input (overrides internal clock)', suggestedSources: ['LFO'] },
      { id: 'gate_in', name: 'Gate In', direction: 'input', signal: 'gate', index: 1, description: 'Gate input for triggering', suggestedSources: ['Keyboard'] },
      { id: 'pitch_cv_out', name: 'Pitch CV', direction: 'output', signal: 'cv', index: 0, description: 'Arpeggiated pitch CV output (1V/oct)', suggestedTargets: ['VCO', 'FM Op', 'Wavetable'] },
      { id: 'gate_out', name: 'Gate Out', direction: 'output', signal: 'gate', index: 1, description: 'Arpeggiated gate output', suggestedTargets: ['Envelope', 'VCA'] },
    ],
  },
  granular: {
    type: 'granular',
    label: 'Granular',
    description: 'Granular processor — time-stretches and pitch-shifts audio',
    detailedDescription:
      'Records incoming audio into a 4-second buffer and replays it as many small overlapping grains. Control grain density, size, spread, and pitch for time-stretching, texture creation, and pitch-shifting effects.',
    defaultParams: {
      grainDensity: 10,
      grainSize: 0.1,
      spread: 0.5,
      pitch: 1,
      mix: 0.5,
    },
    ports: [
      { id: 'audio_in', name: 'Audio In', direction: 'input', signal: 'audio', index: 0, description: 'Audio signal to granulate', suggestedSources: ['VCA', 'VCF', 'Mixer'] },
      { id: 'density_cv', name: 'Density CV', direction: 'input', signal: 'cv', index: 1, description: 'Modulate grain density', suggestedSources: ['LFO', 'Envelope'] },
      { id: 'size_cv', name: 'Size CV', direction: 'input', signal: 'cv', index: 2, description: 'Modulate grain size', suggestedSources: ['LFO'] },
      { id: 'audio_out', name: 'Audio Out', direction: 'output', signal: 'audio', index: 0, description: 'Granular-processed audio output', suggestedTargets: ['Reverb', 'Mixer', 'Output'] },
    ],
  },
  looper: {
    type: 'looper',
    label: 'Looper',
    description: 'Looper/recorder — record and loop up to 10 seconds of audio',
    detailedDescription:
      'Records up to 10 seconds of audio and plays it back in a loop. Features variable speed, reverse playback, and dry/wet mix. Can be controlled via UI buttons or CV gate triggers.',
    defaultParams: {
      playbackSpeed: 1,
      mix: 0.5,
      reverse: 0,
    },
    ports: [
      { id: 'audio_in', name: 'Audio In', direction: 'input', signal: 'audio', index: 0, description: 'Audio signal to record', suggestedSources: ['VCA', 'Mixer'] },
      { id: 'record_trigger', name: 'Rec Trig', direction: 'input', signal: 'gate', index: 1, description: 'Gate trigger to start/stop recording', suggestedSources: ['LFO', 'Keyboard'] },
      { id: 'play_trigger', name: 'Play Trig', direction: 'input', signal: 'gate', index: 2, description: 'Gate trigger to start/stop playback', suggestedSources: ['LFO', 'Keyboard'] },
      { id: 'audio_out', name: 'Audio Out', direction: 'output', signal: 'audio', index: 0, description: 'Looped audio output', suggestedTargets: ['Mixer', 'Output', 'Reverb'] },
    ],
  },
};

export function getModuleDefinition(type: ModuleType): ModuleDefinition {
  return moduleDefinitions[type];
}

export function getAllModuleDefinitions(): ModuleDefinition[] {
  return Object.values(moduleDefinitions);
}
