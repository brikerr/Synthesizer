// Looper/Recorder AudioWorkletProcessor
// No imports — runs in AudioWorkletGlobalScope

const STATE_IDLE = 0;
const STATE_RECORDING = 1;
const STATE_PLAYING = 2;

class LooperProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'playbackSpeed', defaultValue: 1, minValue: -2, maxValue: 2, automationRate: 'k-rate' as const },
      { name: 'mix', defaultValue: 0.5, minValue: 0, maxValue: 1, automationRate: 'k-rate' as const },
      { name: 'reverse', defaultValue: 0, minValue: 0, maxValue: 1, automationRate: 'k-rate' as const },
    ];
  }

  private buffer: Float32Array;
  private bufferLength: number;
  private maxLength: number;
  private recordLength = 0; // How many samples were recorded
  private playPos = 0;     // Fractional playback position
  private state = STATE_IDLE;
  private prevRecordTrigger = 0;
  private prevPlayTrigger = 0;
  private messageCounter = 0;

  constructor() {
    super();
    // 10 second buffer
    this.maxLength = Math.ceil(10 * sampleRate);
    this.buffer = new Float32Array(this.maxLength);
    this.bufferLength = this.maxLength;

    this.port.onmessage = (e) => {
      const data = e.data;
      if (data.type === 'record') {
        if (this.state === STATE_RECORDING) {
          // Stop recording, switch to idle
          this.state = STATE_IDLE;
        } else {
          // Start recording
          this.state = STATE_RECORDING;
          this.recordLength = 0;
          this.playPos = 0;
        }
      } else if (data.type === 'play') {
        if (this.state === STATE_PLAYING) {
          this.state = STATE_IDLE;
        } else if (this.recordLength > 0) {
          this.state = STATE_PLAYING;
          this.playPos = 0;
        }
      } else if (data.type === 'clear') {
        this.state = STATE_IDLE;
        this.recordLength = 0;
        this.playPos = 0;
      }
    };
  }

  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>,
  ): boolean {
    const audioIn = inputs[0]?.[0];
    const recordTrigger = inputs[1]?.[0];
    const playTrigger = inputs[2]?.[0];
    const output = outputs[0]?.[0];
    if (!output) return true;

    const speed = parameters.playbackSpeed[0];
    const mix = parameters.mix[0];
    const reverse = Math.round(parameters.reverse[0]);

    // Handle gate triggers from CV inputs
    for (let i = 0; i < Math.min(output.length, 16); i++) {
      if (recordTrigger) {
        const rt = recordTrigger[i];
        if (this.prevRecordTrigger < 0.5 && rt >= 0.5) {
          if (this.state === STATE_RECORDING) {
            this.state = STATE_IDLE;
          } else {
            this.state = STATE_RECORDING;
            this.recordLength = 0;
            this.playPos = 0;
          }
        }
        this.prevRecordTrigger = rt;
      }
      if (playTrigger) {
        const pt = playTrigger[i];
        if (this.prevPlayTrigger < 0.5 && pt >= 0.5) {
          if (this.state === STATE_PLAYING) {
            this.state = STATE_IDLE;
          } else if (this.recordLength > 0) {
            this.state = STATE_PLAYING;
            this.playPos = 0;
          }
        }
        this.prevPlayTrigger = pt;
      }
    }

    for (let i = 0; i < output.length; i++) {
      const dry = audioIn ? audioIn[i] : 0;

      if (this.state === STATE_RECORDING) {
        // Record input
        if (this.recordLength < this.maxLength) {
          this.buffer[this.recordLength] = dry;
          this.recordLength++;
        } else {
          // Buffer full, auto-stop recording
          this.state = STATE_PLAYING;
          this.playPos = 0;
        }
        output[i] = dry; // Pass through while recording
      } else if (this.state === STATE_PLAYING && this.recordLength > 0) {
        // Playback with speed and reverse
        let readPos = reverse ? (this.recordLength - 1 - this.playPos) : this.playPos;
        readPos = ((readPos % this.recordLength) + this.recordLength) % this.recordLength;

        // Linear interpolation
        const idx = Math.floor(readPos);
        const frac = readPos - idx;
        const s0 = this.buffer[idx % this.recordLength];
        const s1 = this.buffer[(idx + 1) % this.recordLength];
        const playback = s0 + frac * (s1 - s0);

        output[i] = dry * (1 - mix) + playback * mix;

        // Advance play position
        this.playPos += Math.abs(speed);
        if (this.playPos >= this.recordLength) {
          this.playPos -= this.recordLength;
        }
      } else {
        output[i] = dry;
      }
    }

    // Send UI state ~10Hz
    this.messageCounter += output.length;
    if (this.messageCounter >= sampleRate / 10) {
      this.messageCounter = 0;
      this.port.postMessage({
        type: 'looperState',
        state: this.state === STATE_RECORDING ? 'recording' : this.state === STATE_PLAYING ? 'playing' : 'idle',
        progress: this.recordLength > 0
          ? (this.state === STATE_RECORDING ? this.recordLength / this.maxLength : this.playPos / this.recordLength)
          : 0,
        recordLength: this.recordLength,
      });
    }

    return true;
  }
}

registerProcessor('looper-processor', LooperProcessor);
