import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe, Mic, Zap, Shield, ArrowRight, Volume2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const features = [
  { icon: Mic, title: 'Voice Input', desc: 'Speak naturally and watch your words transform in real time.' },
  { icon: Globe, title: '7 Languages', desc: 'English, Tamil, Hindi, French, Spanish, German and Arabic.' },
  { icon: Zap, title: 'Instant Results', desc: 'Translations appear as you speak — no waiting.' },
  { icon: Volume2, title: 'Audio Playback', desc: 'Hear the translation spoken aloud in the target language.' },
  { icon: Shield, title: 'Offline-ready', desc: 'Core translation engine works without a live internet connection.' },
];

export default function Landing() {
  const { dark, toggle } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Globe className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white">VoiceTranslate</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggle} className="p-2 rounded-lg hover:bg-white/60 dark:hover:bg-gray-800/60 transition-all">
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <Link to="/login" className="text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600 font-medium">Sign in</Link>
          <Link to="/register" className="btn-primary text-sm">Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto text-center px-6 py-24">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1.5 rounded-full mb-6 border border-indigo-100 dark:border-indigo-900">
            <Zap className="w-3 h-3" /> Offline-capable voice translation
          </span>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
            Speak in one language.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Be heard in seven.</span>
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-xl mx-auto mb-10">
            Record your voice, get an instant translation with audio playback — even without a reliable internet connection.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="btn-primary flex items-center justify-center gap-2 text-base px-6 py-3">
              Start translating free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login" className="btn-secondary flex items-center justify-center gap-2 text-base px-6 py-3">
              Sign in
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map(({ icon: Icon, title, desc }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="card p-6 hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center mb-4">
              <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-sm text-gray-400 border-t border-gray-100 dark:border-gray-800">
        © {new Date().getFullYear()} VoiceTranslate — built with ♥ for global communication
      </footer>
    </div>
  );
}
