export const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸', speechCode: 'en-US', rtl: false },
  { code: 'ta', name: 'Tamil', flag: '🇮🇳', speechCode: 'ta-IN', rtl: false },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳', speechCode: 'hi-IN', rtl: false },
  { code: 'fr', name: 'French', flag: '🇫🇷', speechCode: 'fr-FR', rtl: false },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', speechCode: 'es-ES', rtl: false },
  { code: 'de', name: 'German', flag: '🇩🇪', speechCode: 'de-DE', rtl: false },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦', speechCode: 'ar-SA', rtl: true },
];

export const getLang = (code) => LANGUAGES.find((l) => l.code === code) || LANGUAGES[0];

export const speakText = (text, langCode = 'en') => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  const lang = getLang(langCode);
  utter.lang = lang.speechCode || 'en-US';
  utter.rate = 0.95;
  utter.pitch = 1;

  try {
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const matched = voices.find(
        (v) => v.lang === lang.speechCode || v.lang.startsWith(lang.code)
      );
      if (matched) utter.voice = matched;
    }
  } catch (_) {}

  window.speechSynthesis.speak(utter);
};
