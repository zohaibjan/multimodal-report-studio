// utils/audioHelpers.js
/**
 * Convert Float32Array PCM to Int16Array
 */
export function floatTo16BitPCM(float32) {
  const len = float32.length;
  const int16 = new Int16Array(len);
  for (let i = 0; i < len; i++) {
    let s = Math.max(-1, Math.min(1, float32[i]));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return int16;
}

