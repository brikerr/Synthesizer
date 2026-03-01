// Output (Master) AudioWorkletProcessor
// Master volume stage — passes audio to destination
// Supports recording via MessagePort
// No imports — runs in AudioWorkletGlobalScope

class OutputProcessor extends AudioWorkletProcessor {
  private recording = false;
  private leftChunks: Float32Array[] = [];
  private rightChunks: Float32Array[] = [];

  static get parameterDescriptors() {
    return [
      { name: 'masterVolume', defaultValue: 0.5, minValue: 0, maxValue: 1, automationRate: 'a-rate' as const },
    ];
  }

  constructor(options: AudioWorkletNodeOptions) {
    super(options);
    this.port.onmessage = (e) => {
      if (e.data.type === 'startRecording') {
        this.recording = true;
        this.leftChunks = [];
        this.rightChunks = [];
      } else if (e.data.type === 'stopRecording') {
        this.recording = false;
        this.port.postMessage({
          type: 'recordingData',
          leftChunks: this.leftChunks,
          rightChunks: this.rightChunks,
        });
        this.leftChunks = [];
        this.rightChunks = [];
      }
    };
  }

  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>,
  ): boolean {
    const leftIn = inputs[0]?.[0];
    const rightIn = inputs[1]?.[0];
    const leftOut = outputs[0]?.[0];
    const rightOut = outputs[0]?.[1]; // stereo output on single output bus

    const volumeParam = parameters.masterVolume;
    const volumeIsConstant = volumeParam.length === 1;

    if (leftOut) {
      for (let i = 0; i < leftOut.length; i++) {
        const vol = volumeIsConstant ? volumeParam[0] : volumeParam[i];
        leftOut[i] = (leftIn ? leftIn[i] : 0) * vol;
      }
    }

    if (rightOut) {
      for (let i = 0; i < rightOut.length; i++) {
        const vol = volumeIsConstant ? volumeParam[0] : volumeParam[i];
        // If no right input, mirror left
        const sample = rightIn ? rightIn[i] : (leftIn ? leftIn[i] : 0);
        rightOut[i] = sample * vol;
      }
    }

    // Buffer output for recording
    if (this.recording && leftOut) {
      this.leftChunks.push(new Float32Array(leftOut));
      this.rightChunks.push(rightOut ? new Float32Array(rightOut) : new Float32Array(leftOut));
    }

    return true;
  }
}

registerProcessor('output-processor', OutputProcessor);
