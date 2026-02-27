// Arpeggiator AudioWorkletProcessor
// No imports — runs in AudioWorkletGlobalScope

class ArpeggiatorProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'rate', defaultValue: 8, minValue: 1, maxValue: 30, automationRate: 'k-rate' as const },
      { name: 'pattern', defaultValue: 0, minValue: 0, maxValue: 3, automationRate: 'k-rate' as const },
      { name: 'octaveRange', defaultValue: 1, minValue: 1, maxValue: 4, automationRate: 'k-rate' as const },
      { name: 'gateLength', defaultValue: 0.5, minValue: 0.1, maxValue: 0.9, automationRate: 'k-rate' as const },
    ];
  }

  private heldNotes: number[] = []; // MIDI note numbers
  private noteIndex = 0;
  private direction = 1; // 1 = up, -1 = down (for upDown pattern)
  private phase = 0;
  private prevClock = 0;
  private gateSamplesRemaining = 0;
  private currentPitchCv = 0;
  private useExternalClock = false;

  constructor() {
    super();
    this.port.onmessage = (e) => {
      const data = e.data;
      if (data.type === 'noteOn') {
        const note = data.note as number;
        if (!this.heldNotes.includes(note)) {
          this.heldNotes.push(note);
          this.heldNotes.sort((a, b) => a - b);
        }
      } else if (data.type === 'noteOff') {
        const note = data.note as number;
        const idx = this.heldNotes.indexOf(note);
        if (idx >= 0) this.heldNotes.splice(idx, 1);
      }
    };
  }

  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>,
  ): boolean {
    const clockIn = inputs[0]?.[0];
    const gateIn = inputs[1]?.[0];
    const pitchCvOut = outputs[0]?.[0];
    const gateOut = outputs[1]?.[0];

    const rate = parameters.rate[0];
    const pattern = Math.round(parameters.pattern[0]);
    const octaveRange = Math.round(parameters.octaveRange[0]);
    const gateLength = parameters.gateLength[0];

    // Check if external clock is connected (has non-zero values)
    if (clockIn) {
      let hasSignal = false;
      for (let i = 0; i < Math.min(clockIn.length, 16); i++) {
        if (Math.abs(clockIn[i]) > 0.01) { hasSignal = true; break; }
      }
      this.useExternalClock = hasSignal;
    }

    const invSR = 1.0 / sampleRate;
    const stepInterval = 1.0 / rate;
    const stepSamples = Math.floor(stepInterval * sampleRate);

    // Build expanded note list with octave range
    const expandedNotes: number[] = [];
    for (let oct = 0; oct < octaveRange; oct++) {
      for (const note of this.heldNotes) {
        expandedNotes.push(note + oct * 12);
      }
    }

    const blockSize = pitchCvOut?.length ?? gateOut?.length ?? 128;

    for (let i = 0; i < blockSize; i++) {
      let trigger = false;

      if (this.useExternalClock && clockIn) {
        // External clock: rising edge detection
        const clock = clockIn[i];
        if (this.prevClock < 0.5 && clock >= 0.5) {
          trigger = true;
        }
        this.prevClock = clock;
      } else {
        // Internal clock
        this.phase += invSR;
        if (this.phase >= stepInterval) {
          this.phase -= stepInterval;
          trigger = true;
        }
      }

      if (trigger && expandedNotes.length > 0) {
        // Advance to next note based on pattern
        switch (pattern) {
          case 0: // Up
            this.noteIndex = (this.noteIndex + 1) % expandedNotes.length;
            break;
          case 1: // Down
            this.noteIndex--;
            if (this.noteIndex < 0) this.noteIndex = expandedNotes.length - 1;
            break;
          case 2: // Up-Down
            this.noteIndex += this.direction;
            if (this.noteIndex >= expandedNotes.length - 1) {
              this.noteIndex = expandedNotes.length - 1;
              this.direction = -1;
            } else if (this.noteIndex <= 0) {
              this.noteIndex = 0;
              this.direction = 1;
            }
            break;
          case 3: // Random
            this.noteIndex = Math.floor(Math.random() * expandedNotes.length);
            break;
        }

        // Clamp index
        this.noteIndex = Math.max(0, Math.min(this.noteIndex, expandedNotes.length - 1));

        // Set pitch CV: convert MIDI note to 1V/oct (60 = 0V = C4)
        const midiNote = expandedNotes[this.noteIndex];
        this.currentPitchCv = (midiNote - 60) / 12;

        // Set gate duration
        this.gateSamplesRemaining = Math.floor(stepSamples * gateLength);
      }

      if (pitchCvOut) {
        pitchCvOut[i] = expandedNotes.length > 0 ? this.currentPitchCv : 0;
      }
      if (gateOut) {
        gateOut[i] = this.gateSamplesRemaining > 0 ? 1.0 : 0.0;
      }

      if (this.gateSamplesRemaining > 0) this.gateSamplesRemaining--;
    }

    return true;
  }
}

registerProcessor('arpeggiator-processor', ArpeggiatorProcessor);
