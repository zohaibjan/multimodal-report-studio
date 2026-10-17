// hooks/useMp3Recorder.js
import { useState, useRef } from 'react';
import { floatTo16BitPCM } from '../utils/audioHelpers';

/**
 * Hook: client-side MP3 recorder (uses lamejs to encode)
 * - lazy loads lamejs to avoid loading encoder for users who only upload files
 */
export function useMp3Recorder({ kbps = 128, maxDurationMs = 5 * 60 * 1000 } = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState(null);
  const [durationMs, setDurationMs] = useState(0);
  const [mp3Blob, setMp3Blob] = useState(null);
  const [level, setLevel] = useState(0);
  const streamRef = useRef(null);
  const ctxRef = useRef(null);
  const sourceRef = useRef(null);
  const procRef = useRef(null);
  const analyserRef = useRef(null);
  const encoderRef = useRef(null);
  const mp3ChunksRef = useRef([]);
  const timerRef = useRef(null);
  const startedAtRef = useRef(0);
  const mediaRecorderRef = useRef(null);
  const levelTimerRef = useRef(null);

  const start = async () => {
    try {
      setError(null);
      setMp3Blob(null);
      setDurationMs(0);
      mp3ChunksRef.current = [];
      // ask for audio permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const AudioContext = window.AudioContext ?? window.webkitAudioContext;
      if (!AudioContext) throw new Error('Web Audio API not supported in this browser');
      const audioCtx = new AudioContext();
      ctxRef.current = audioCtx;
      if (audioCtx.state === 'suspended') await audioCtx.resume();
      const source = audioCtx.createMediaStreamSource(stream);
      sourceRef.current = source;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;
      source.connect(analyser);
      // check for MediaRecorder
      const supportedMimeTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
      let mimeType = null;
      if (window.MediaRecorder) {
        for (const mt of supportedMimeTypes) {
          if (MediaRecorder.isTypeSupported(mt)) {
            mimeType = mt;
            break;
          }
        }
      }
      if (mimeType) {
        // use MediaRecorder
        const recorder = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current = recorder;
        const chunks = [];
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };
        recorder.onstop = async () => {
          try {
            const blob = new Blob(chunks, { type: mimeType });
            // decode to PCM
            const arrayBuffer = await blob.arrayBuffer();
            const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
            const pcm = audioBuffer.getChannelData(0);
            const pcm16 = floatTo16BitPCM(pcm);
            // lazy load lamejs
            const lameModule = await import('lamejs');
            const lamejs = lameModule.default ?? lameModule;
            const encoder = new lamejs.Mp3Encoder(1, audioBuffer.sampleRate, kbps);
            const mp3buf = encoder.encodeBuffer(pcm16);
            const mp3flush = encoder.flush();
            const mp3Blob = new Blob([mp3buf, mp3flush], { type: 'audio/mpeg' });
            setMp3Blob(mp3Blob);
          } catch (err) {
            console.error('MP3 encoding error', err);
            setError('Failed to encode MP3');
          }
        };
        recorder.start();
        // level meter for MediaRecorder
        levelTimerRef.current = setInterval(() => {
          if (analyserRef.current) {
            const bufferLength = analyserRef.current.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            analyserRef.current.getByteFrequencyData(dataArray);
            let peak = 0;
            for (let i = 0; i < bufferLength; i++) {
              peak = Math.max(peak, dataArray[i] / 255);
            }
            setLevel(peak);
          }
        }, 100);
      } else {
        // use ScriptProcessor method
        // lazy load encoder
        const lameModule = await import('lamejs');
        const lamejs = lameModule.default ?? lameModule;
        const sampleRate = audioCtx.sampleRate ?? 44100;
        const encoder = new lamejs.Mp3Encoder(1, sampleRate, kbps);
        encoderRef.current = encoder;
        const bufferSize = 4096;
        const processor = audioCtx.createScriptProcessor(bufferSize, 1, 1);
        procRef.current = processor;
        source.connect(processor);
        try {
          processor.connect(audioCtx.destination);
        } catch (e) {
          /* ignore */
        }
        processor.onaudioprocess = (e) => {
          const input = e.inputBuffer.getChannelData(0);
          // level meter
          let peak = 0;
          for (let i = 0; i < input.length; i++) peak = Math.max(peak, Math.abs(input[i]));
          setLevel(peak);
          // encode
          const pcm16 = floatTo16BitPCM(input);
          try {
            const mp3buf = encoderRef.current.encodeBuffer(pcm16);
            if (mp3buf && mp3buf.length > 0) mp3ChunksRef.current.push(new Uint8Array(mp3buf));
          } catch (err) {
            console.warn('MP3 encode error', err);
          }
        };
      }
      startedAtRef.current = Date.now();
      timerRef.current = setInterval(() => {
        const d = Date.now() - startedAtRef.current;
        setDurationMs(d);
        if (maxDurationMs && d >= maxDurationMs) {
          stop();
        }
      }, 200);
      setIsRecording(true);
    } catch (err) {
      console.error('Recorder start failure', err);
      setError(err?.message ?? String(err));
      stop(true);
    }
  };

  const stop = (silent = false) => {
    try {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      } else {
        // flush encoder
        if (encoderRef.current) {
          const mp3buf = encoderRef.current.flush();
          if (mp3buf && mp3buf.length > 0) mp3ChunksRef.current.push(new Uint8Array(mp3buf));
        }
        if (!silent && mp3ChunksRef.current.length > 0) {
          const blob = new Blob(mp3ChunksRef.current, { type: 'audio/mpeg' });
          setMp3Blob(blob);
        }
      }
    } catch (err) {
      console.error('Recorder stop error', err);
      setError(err?.message ?? String(err));
    } finally {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      if (levelTimerRef.current) clearInterval(levelTimerRef.current);
      levelTimerRef.current = null;
      try { procRef.current?.disconnect(); } catch (e) {}
      try { sourceRef.current?.disconnect(); } catch (e) {}
      try { analyserRef.current?.disconnect(); } catch (e) {}
      try { ctxRef.current?.close(); } catch (e) {}
      try { streamRef.current?.getTracks()?.forEach(t => t.stop()); } catch (e) {}
      procRef.current = null;
      sourceRef.current = null;
      analyserRef.current = null;
      encoderRef.current = null;
      mp3ChunksRef.current = [];
      ctxRef.current = null;
      streamRef.current = null;
      mediaRecorderRef.current = null;
      setLevel(0);
      setIsRecording(false);
    }
  };

  return { isRecording, start, stop, error, durationMs, mp3Blob, level };
}

