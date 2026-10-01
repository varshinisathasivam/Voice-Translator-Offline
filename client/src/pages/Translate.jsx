import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, MicOff, Volume2, Copy, Download, ArrowLeftRight,
  Loader2, CheckCheck, Type, RotateCcw, Wifi, WifiOff
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { LANGUAGES, getLang, speakText } from '../utils/languages';
import LanguageSelect from '../components/ui/LanguageSelect';
import ConfidenceBadge from '../components/ui/ConfidenceBadge';
import Waveform from '../components/ui/Waveform';
import api from '../utils/api';

export default function Translate() {
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('ta');
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [inputMode, setInputMode] = useState('voice'); // 'voice' | 'text'
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const { isRecording, audioBlob, audioUrl, duration, error: recErr, start, stop, reset } = useVoiceRecorder();
  const { transcript, interimTranscript, isListening, supported, startListening, stopListening, setTranscript } = useSpeechRecognition();

  const wasRecordingRef = useRef(false);

  // When we get a final transcript, fill inputText
  useEffect(() => {
    if (transcript) setInputText(transcript);
  }, [transcript]);

  // Auto-translate only when recording actually finishes and we have transcribed text
  useEffect(() => {
    if (isRecording) {
      wasRecordingRef.current = true;
    } else if (wasRecordingRef.current) {
      wasRecordingRef.current = false;
      if (inputText.trim() && inputMode === 'voice') {
        handleTranslate(inputText, 'voice');
      }
    }
  }, [isRecording, inputText, inputMode]);

  const startVoice = async () => {
    reset();
    setInputText('');
    setTranscript('');
    setResult(null);
    const speechLang = getLang(sourceLang)?.speechCode || 'en-US';
    await start();
    if (supported) startListening(speechLang);
  };

  const stopVoice = () => {
    stop();
    if (supported) stopListening();
  };

  const swapLangs = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setInputText(result?.translatedText || '');
    setResult(null);
  };

  const handleTranslate = async (text = inputText, type = inputMode) => {
    const txt = (text || inputText).trim();
    if (!txt) return toast.error('Nothing to translate');
    if (sourceLang === targetLang) return toast.error('Source and target language must differ');
    setTranslating(true);

    let serverAudioUrl = null;
    if (audioBlob && type === 'voice') {
      try {
        const formData = new FormData();
        formData.append('audio', audioBlob, `voice-${Date.now()}.webm`);
        const { data: uploadRes } = await api.post('/audio/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        serverAudioUrl = uploadRes?.data?.url;
      } catch (_) {
        // Audio upload is non-blocking; proceed even if upload fails
      }
    }

    try {
      const { data } = await api.post('/translate', {
        text: txt,
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
        inputType: type,
        audioUrl: serverAudioUrl,
        duration: duration || 0,
      });
      setResult(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Translation failed');
    } finally {
      setTranslating(false);
    }
  };

  const speak = () => {
    if (!result) return;
    setSpeaking(true);
    speakText(result.translatedText, result.targetLanguage);
    setTimeout(() => setSpeaking(false), 3000);
  };

  const copyText = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.translatedText);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadAudio = () => {
    if (!audioUrl) return;
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `recording-${Date.now()}.webm`;
    a.click();
  };

  const reset_all = () => {
    setInputText('');
    setTranscript('');
    setResult(null);
    reset();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Translate</h1>
          <p className="text-sm text-gray-500 mt-1">Record your voice or type text below</p>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
          isOnline
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
            : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
        }`}>
          {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          {isOnline ? 'Online' : 'Offline Mode (Local Engine)'}
        </div>
      </div>

      {/* Offline banner notification if disconnected */}
      {!isOnline && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
          <span>⚡ <strong>Offline Mode:</strong> Translates instantly using the built-in multi-language dictionary. Audio playback is supported offline.</span>
        </div>
      )}

      {/* Mode toggle */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
        {[{ id: 'voice', icon: Mic, label: 'Voice' }, { id: 'text', icon: Type, label: 'Text' }].map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => setInputMode(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              inputMode === id ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500'
            }`}>
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {/* Language selectors */}
      <div className="card p-4 flex items-end gap-3">
        <div className="flex-1">
          <LanguageSelect value={sourceLang} onChange={setSourceLang} label="From" disabled={isRecording || isListening} />
        </div>
        <button onClick={swapLangs} disabled={isRecording}
          className="btn-secondary p-2.5 flex-shrink-0 mb-0.5">
          <ArrowLeftRight className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <LanguageSelect value={targetLang} onChange={setTargetLang} label="To" disabled={isRecording || isListening} />
        </div>
      </div>

      {/* Voice recording */}
      {inputMode === 'voice' && (
        <div className="card p-6 text-center space-y-4">
          <div className="flex items-center justify-center h-12">
            <Waveform active={isRecording || isListening} bars={9} />
            {!isRecording && !isListening && (
              <p className="text-gray-400 text-sm">Press the button below to start recording</p>
            )}
          </div>

          {(isRecording || isListening) && (
            <p className="text-xs text-indigo-500 font-medium">{duration}s recording…</p>
          )}

          {interimTranscript && (
            <p className="text-sm text-gray-500 italic">"{interimTranscript}"</p>
          )}

          {inputText && !isRecording && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-left">
              <p className="text-xs font-medium text-gray-500 mb-1">Heard:</p>
              <p className="text-sm text-gray-900 dark:text-white">"{inputText}"</p>
            </div>
          )}

          <div className="flex items-center justify-center gap-3">
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={isRecording ? stopVoice : startVoice}
              className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 shadow-red-200 dark:shadow-red-900/40'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 dark:shadow-indigo-900/40'
              }`}
            >
              {isRecording
                ? <MicOff className="w-7 h-7 text-white" />
                : <Mic className="w-7 h-7 text-white" />}
            </motion.button>
            {(inputText || audioUrl) && (
              <button onClick={reset_all} className="btn-secondary p-3">
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>

          {recErr && <p className="text-xs text-red-500">{recErr}</p>}
          {!supported && (
            <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/40 rounded-lg p-2">
              ⚠️ Speech recognition not supported — recording works but text won't be auto-filled.
            </p>
          )}
        </div>
      )}

      {/* Text input */}
      {inputMode === 'text' && (
        <div className="card p-4 space-y-3">
          <textarea
            className="input resize-none text-sm"
            rows={4}
            placeholder="Type or paste text to translate…"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            {inputText && (
              <button onClick={reset_all} className="btn-secondary text-sm flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5" /> Clear
              </button>
            )}
            <button
              onClick={() => handleTranslate(inputText, 'text')}
              disabled={translating || !inputText.trim()}
              className="btn-primary text-sm flex items-center gap-1.5"
            >
              {translating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowLeftRight className="w-3.5 h-3.5" />}
              {translating ? 'Translating…' : 'Translate'}
            </button>
          </div>
        </div>
      )}

      {/* Translation result */}
      <AnimatePresence>
        {translating && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="card p-6 flex items-center justify-center gap-3 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
            <span className="text-sm">Translating…</span>
          </motion.div>
        )}

        {result && !translating && (
          <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getLang(result.targetLanguage)?.flag}</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{result.targetLanguageName}</span>
              </div>
              <ConfidenceBadge score={result.confidence} />
            </div>

            <div
              className="text-xl font-medium text-gray-900 dark:text-white leading-relaxed"
              dir={getLang(result.targetLanguage)?.rtl ? 'rtl' : 'ltr'}
            >
              {result.translatedText}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <button onClick={speak} className="btn-secondary text-sm flex items-center gap-1.5 flex-1">
                <Volume2 className={`w-3.5 h-3.5 ${speaking ? 'text-indigo-500 animate-pulse' : ''}`} />
                {speaking ? 'Speaking…' : 'Play'}
              </button>
              <button onClick={copyText} className="btn-secondary text-sm flex items-center gap-1.5 flex-1">
                {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              {audioUrl && (
                <button onClick={downloadAudio} className="btn-secondary text-sm flex items-center gap-1.5 flex-1">
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              )}
            </div>

            <p className="text-xs text-gray-400">
              {getLang(result.sourceLanguage)?.flag} {result.originalText} → {getLang(result.targetLanguage)?.flag} {result.translatedText}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
