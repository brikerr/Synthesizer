class ClockDividerProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors(): AudioParamDescriptor[] {
    return [
      { name: 'gateLength', defaultValue: 0.5, minValue: 0.1, maxValue: 0.9, automationRate: 'k-rate' },
    ];
  }

  private counter = 0;
  private prevClock = 0;
  private prevReset = 0;
  private lastClockTime = 0;
  private clockInterval = 0;
  private gateTimers: number[] = [0, 0, 0, 0]; // samples remaining for div2, div4, div8, div16

  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>,
  ): boolean {
    const clockIn = inputs[0]?.[0];
    const resetIn = inputs[1]?.[0];
    const div2 = outputs[0]?.[0];
    const div4 = outputs[1]?.[0];
    const div8 = outputs[2]?.[0];
    const div16 = outputs[3]?.[0];

    const gateLength = parameters.gateLength[0];
    const divisors = [2, 4, 8, 16];

    for (let i = 0; i < 128; i++) {
      const clock = clockIn ? clockIn[i] : 0;
      const reset = resetIn ? resetIn[i] : 0;

      // Detect reset rising edge
      if (reset > 0.5 && this.prevReset <= 0.5) {
        this.counter = 0;
      }
      this.prevReset = reset;

      // Detect clock rising edge
      if (clock > 0.5 && this.prevClock <= 0.5) {
        this.counter++;

        // Measure clock interval
        const now = currentTime * sampleRate + i;
        if (this.lastClockTime > 0) {
          this.clockInterval = now - this.lastClockTime;
        }
        this.lastClockTime = now;

        const gateSamples = this.clockInterval > 0
          ? Math.max(1, Math.floor(this.clockInterval * gateLength))
          : Math.floor(sampleRate * 0.05); // fallback 50ms

        // Check each division
        for (let d = 0; d < 4; d++) {
          if (this.counter % divisors[d] === 0) {
            this.gateTimers[d] = gateSamples;
          }
        }
      }
      this.prevClock = clock;

      // Output gates
      const outs = [div2, div4, div8, div16];
      for (let d = 0; d < 4; d++) {
        if (outs[d]) {
          outs[d][i] = this.gateTimers[d] > 0 ? 1 : 0;
          if (this.gateTimers[d] > 0) this.gateTimers[d]--;
        }
      }
    }

    return true;
  }
}

registerProcessor('clock-divider-processor', ClockDividerProcessor);
