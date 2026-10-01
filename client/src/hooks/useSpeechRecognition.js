import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Hook wrapping the Web Speech API for speech-to-text.
 */
export const useSpeechRecognition = () => {
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  const supported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, []);

  const startListening = useCallback((lang = 'en-US') => {
    if (!supported) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }
    setError(null);
    setTranscript('');
    setInterimTranscript('');

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = lang;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => { setIsListening(false); setInterimTranscript(''); };
    recognition.onerror = (e) => {
      let msg = `Error: ${e.error}`;
      if (e.error === 'not-allowed') {
        msg = 'Microphone permission denied.';
      } else if (e.error === 'network') {
        msg = 'Speech recognition network error: In Chrome, speech-to-text requires internet. Switch to "Text" mode to translate offline.';
      }
      setError(msg);
      setIsListening(false);
    };
    recognition.onresult = (e) => {
      let interim = '';
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else interim += t;
      }
      if (final) setTranscript((prev) => prev + final);
      setInterimTranscript(interim);
    };

    recognition.start();
  }, [supported]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  return { transcript, interimTranscript, isListening, error, supported, startListening, stopListening, setTranscript };
};
