/** Encode stereo Float32 buffers as PCM16 WAV Blob */
export function encodeWav(leftChunks: Float32Array[], rightChunks: Float32Array[], sampleRate: number): Blob {
  // Calculate total samples
  let totalSamples = 0;
  for (const chunk of leftChunks) totalSamples += chunk.length;

  const numChannels = 2;
  const bytesPerSample = 2; // 16-bit PCM
  const dataSize = totalSamples * numChannels * bytesPerSample;
  const headerSize = 44;
  const buffer = new ArrayBuffer(headerSize + dataSize);
  const view = new DataView(buffer);

  // WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, headerSize + dataSize - 8, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * bytesPerSample, true); // byte rate
  view.setUint16(32, numChannels * bytesPerSample, true); // block align
  view.setUint16(34, bytesPerSample * 8, true); // bits per sample
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Interleaved PCM16 samples
  let offset = headerSize;
  for (let c = 0; c < leftChunks.length; c++) {
    const left = leftChunks[c];
    const right = rightChunks[c];
    for (let i = 0; i < left.length; i++) {
      view.setInt16(offset, floatToInt16(left[i]), true);
      offset += 2;
      view.setInt16(offset, floatToInt16(right[i]), true);
      offset += 2;
    }
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

function floatToInt16(sample: number): number {
  const clamped = Math.max(-1, Math.min(1, sample));
  return clamped < 0 ? clamped * 0x8000 : clamped * 0x7FFF;
}

function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
