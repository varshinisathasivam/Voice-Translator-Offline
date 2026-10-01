import { useState, useRef, useCallback } from 'react';

/**
 * Custom hook for browser microphone recording.
 * Returns controls and state for recording audio.
 */
export const useVoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(null);

  const mediaRecorder = useRef(null);
  const chunks = useRef([]);
  const startTime = useRef(null);
  const timer = useRef(null);

  const start = useCallback(async () => {
    setError(null);
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    chunks.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const options = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? { mimeType: 'audio/webm;codecs=opus' }
        : {};
      mediaRecorder.current = new MediaRecorder(stream, options);

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        // Stop all tracks
        stream.getTracks().forEach((t) => t.stop());
      };

      startTime.current = Date.now();
      mediaRecorder.current.start(100);
      setIsRecording(true);

      // Update duration every second
      timer.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTime.current) / 1000));
      }, 1000);
    } catch (err) {
      setError(err.message || 'Microphone access denied');
    }
  }, []);

  const stop = useCallback(() => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      clearInterval(timer.current);
      setIsRecording(false);
    }
  }, [isRecording]);

  const reset = useCallback(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    setError(null);
    chunks.current = [];
  }, [audioUrl]);

  return { isRecording, audioBlob, audioUrl, duration, error, start, stop, reset };
};
