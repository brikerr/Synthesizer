// Probability Gate AudioWorkletProcessor
// No imports — runs in AudioWorkletGlobalScope

class ProbabilityGateProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'probability', defaultValue: 0.5, minValue: 0, maxValue: 1, automationRate: 'k-rate' as const },
      { name: 'mode', defaultValue: 0, minValue: 0, maxValue: 2, automationRate: 'k-rate' as const },
    ];
  }

  private prevGate = 0;
  private gateOpen = false; // current toggle state for mode 2

  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>,
  ): boolean {
    const gateIn = inputs[0]?.[0];
    const probCv = inputs[1]?.[0];
    const gateOut = outputs[0]?.[0];
    if (!gateOut) return true;

    const baseProbability = parameters.probability[0];
    const mode = Math.round(parameters.mode[0]);

    for (let i = 0; i < gateOut.length; i++) {
      const gate = gateIn ? gateIn[i] : 0;

      // Rising edge detection
      if (this.prevGate < 0.5 && gate >= 0.5) {
        const prob = Math.max(0, Math.min(1, baseProbability + (probCv ? probCv[i] * 0.5 : 0)));
        const roll = Math.random() < prob;

        switch (mode) {
          case 0: // pass: gate passes if roll succeeds
            this.gateOpen = roll;
            break;
          case 1: // block: gate passes if roll fails
            this.gateOpen = !roll;
            break;
          case 2: // toggle: flip state on roll success
            if (roll) this.gateOpen = !this.gateOpen;
            break;
        }
      }

      // On falling edge, close gate
      if (this.prevGate >= 0.5 && gate < 0.5) {
        if (mode !== 2) {
          this.gateOpen = false;
        }
      }

      this.prevGate = gate;
      gateOut[i] = this.gateOpen && gate >= 0.5 ? 1.0 : (mode === 2 && this.gateOpen ? 1.0 : 0.0);
    }

    return true;
  }
}

registerProcessor('probability-gate-processor', ProbabilityGateProcessor);
