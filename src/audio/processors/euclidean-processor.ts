// Euclidean Rhythm AudioWorkletProcessor
// No imports — runs in AudioWorkletGlobalScope

// Bjorklund algorithm — generates a Euclidean rhythm pattern
function bjorklund(steps: number, hits: number): boolean[] {
  if (steps <= 0) return [];
  if (hits <= 0) return new Array(steps).fill(false);
  if (hits >= steps) return new Array(steps).fill(true);

  let pattern: number[][] = [];
  let remainder: number[][] = [];

  for (let i = 0; i < hits; i++) pattern.push([1]);
  for (let i = 0; i < steps - hits; i++) remainder.push([0]);

  while (remainder.length > 1) {
    const newPattern: number[][] = [];
    const minLen = Math.min(pattern.length, remainder.length);
    for (let i = 0; i < minLen; i++) {
      newPattern.push([...pattern[i], ...remainder[i]]);
    }
    const leftover = pattern.length > remainder.length
      ? pattern.slice(minLen)
      : remainder.slice(minLen);
    pattern = newPattern;
    remainder = leftover;
  }

  // Flatten
  const flat = [...pattern, ...remainder].flat();
  return flat.map((v) => v === 1);
}

class EuclideanProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'steps', defaultValue: 8, minValue: 1, maxValue: 16, automationRate: 'k-rate' as const },
      { name: 'hits', defaultValue: 4, minValue: 0, maxValue: 16, automationRate: 'k-rate' as const },
      { name: 'rotation', defaultValue: 0, minValue: 0, maxValue: 15, automationRate: 'k-rate' as const },
      { name: 'gateLength', defaultValue: 0.5, minValue: 0.1, maxValue: 0.9, automationRate: 'k-rate' as const },
    ];
  }

  private prevClock = 0;
  private prevReset = 0;
  private currentStep = 0;
  private gateSamplesRemaining = 0;
  private lastClockTime = 0;
  private clockInterval = 0.25 * sampleRate;
  private cachedPattern: boolean[] = [];
  private cachedSteps = -1;
  private cachedHits = -1;
  private cachedRotation = -1;
  private messageCounter = 0;

  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>,
  ): boolean {
    const clockIn = inputs[0]?.[0];
    const resetIn = inputs[1]?.[0];
    const gateOut = outputs[0]?.[0];
    if (!gateOut) return true;

    const steps = Math.round(parameters.steps[0]);
    const hits = Math.min(Math.round(parameters.hits[0]), steps);
    const rotation = Math.round(parameters.rotation[0]) % steps;
    const gateLength = parameters.gateLength[0];

    // Recompute pattern if params changed
    if (steps !== this.cachedSteps || hits !== this.cachedHits || rotation !== this.cachedRotation) {
      const base = bjorklund(steps, hits);
      // Apply rotation
      if (rotation > 0) {
        this.cachedPattern = [...base.slice(rotation), ...base.slice(0, rotation)];
      } else {
        this.cachedPattern = base;
      }
      this.cachedSteps = steps;
      this.cachedHits = hits;
      this.cachedRotation = rotation;
    }

    for (let i = 0; i < gateOut.length; i++) {
      const clock = clockIn ? clockIn[i] : 0;
      const reset = resetIn ? resetIn[i] : 0;

      // Reset rising edge
      if (this.prevReset < 0.5 && reset >= 0.5) {
        this.currentStep = 0;
      }

      // Clock rising edge
      if (this.prevClock < 0.5 && clock >= 0.5) {
        const now = this.lastClockTime + i;
        if (this.lastClockTime > 0) {
          this.clockInterval = now - this.lastClockTime;
        }
        this.lastClockTime = now;

        // Check pattern for current step
        if (this.cachedPattern[this.currentStep % this.cachedPattern.length]) {
          this.gateSamplesRemaining = Math.floor(this.clockInterval * gateLength);
        }

        this.currentStep = (this.currentStep + 1) % steps;
      }

      this.prevClock = clock;
      this.prevReset = reset;

      gateOut[i] = this.gateSamplesRemaining > 0 ? 1.0 : 0.0;

      if (this.gateSamplesRemaining > 0) {
        this.gateSamplesRemaining--;
      }
    }

    this.lastClockTime += gateOut.length;

    // Send step info to UI periodically (~10Hz)
    this.messageCounter += gateOut.length;
    if (this.messageCounter >= sampleRate / 10) {
      this.messageCounter = 0;
      this.port.postMessage({
        type: 'euclidean',
        pattern: this.cachedPattern,
        currentStep: this.currentStep,
      });
    }

    return true;
  }
}

registerProcessor('euclidean-processor', EuclideanProcessor);
