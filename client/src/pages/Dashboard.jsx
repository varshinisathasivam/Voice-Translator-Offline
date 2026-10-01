import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic, History, Globe, TrendingUp, ArrowRight, Clock, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { getLang } from '../utils/languages';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="card p-5 flex items-center gap-4">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, histRes] = await Promise.all([
          api.get('/history/stats'),
          api.get('/history?limit=5'),
        ]);
        setStats(statsRes.data.data);
        setRecent(histRes.data.data || []);
      } catch (_) {}
      setLoading(false);
    };
    load();
  }, []);

  const topLang = stats?.byLang?.[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
          {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">Here's your translation activity at a glance.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Globe} label="Total translations" value={stats?.total ?? '—'} color="bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400" />
        <StatCard icon={Mic} label="Voice inputs" value={stats?.byType?.find(t => t._id === 'voice')?.count ?? 0} color="bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400" />
        <StatCard icon={TrendingUp} label="Top language" value={topLang ? getLang(topLang._id)?.name : '—'} color="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400" />
        <StatCard icon={Star} label="Favorites" value={stats?.favorites ?? 0} color="bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400" />
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link to="/translate"
          className="card p-5 flex items-center justify-between hover:shadow-md transition-shadow group">
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center mb-3">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">New translation</h3>
            <p className="text-sm text-gray-500 mt-0.5">Record voice or type text</p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 transition-colors" />
        </Link>
        <Link to="/history"
          className="card p-5 flex items-center justify-between hover:shadow-md transition-shadow group">
          <div>
            <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center mb-3">
              <History className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Translation history</h3>
            <p className="text-sm text-gray-500 mt-0.5">View and manage past translations</p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-violet-500 transition-colors" />
        </Link>
      </div>

      {/* Recent activity */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" /> Recent activity
          </h2>
          <Link to="/history" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">View all</Link>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="text-center py-8">
            <Globe className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No translations yet — <Link to="/translate" className="text-indigo-600 hover:underline">start one!</Link></p>
          </div>
        ) : (
          <div className="space-y-2">
            {recent.map((item) => (
              <motion.div key={item._id || item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center flex-shrink-0 text-sm">
                  {getLang(item.sourceLanguage)?.flag}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.originalText}</p>
                  <p className="text-xs text-gray-500 truncate">{item.translatedText}</p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {getLang(item.sourceLanguage)?.flag} → {getLang(item.targetLanguage)?.flag}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
