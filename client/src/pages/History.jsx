import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2, Volume2, Star, Search, Globe, Copy, CheckCheck, Mic
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { getLang, speakText, LANGUAGES } from '../utils/languages';
import ConfidenceBadge from '../components/ui/ConfidenceBadge';

export default function History() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterLang, setFilterLang] = useState('');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const load = async (pg = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pg, limit: 15 });
      if (filterLang) params.append('lang', filterLang);
      if (onlyFavorites) params.append('favorite', 'true');
      const { data } = await api.get(`/history?${params}`);
      setItems(data.data || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
      setPage(pg);
    } catch (_) {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
  }, [filterLang, onlyFavorites]);

  const del = async (id) => {
    try {
      await api.delete(`/history/${id}`);
      setItems((prev) => prev.filter((i) => (i._id || i.id) !== id));
      setTotal((prev) => Math.max(0, prev - 1));
      toast.success('Deleted');
    } catch (_) {
      toast.error('Failed to delete');
    }
  };

  const clearAll = async () => {
    if (!window.confirm('Clear all translation history?')) return;
    try {
      await api.delete('/history/clear');
      setItems([]);
      setTotal(0);
      toast.success('History cleared');
    } catch (_) {
      toast.error('Failed to clear history');
    }
  };

  const toggleFav = async (id) => {
    try {
      const { data } = await api.put(`/history/${id}/favorite`);
      setItems((prev) =>
        prev.map((i) =>
          (i._id || i.id) === id ? { ...i, isFavorite: data.data?.isFavorite } : i
        )
      );
    } catch (_) {}
  };

  const copyText = async (id, text) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = items.filter(
    (i) =>
      !search ||
      i.originalText?.toLowerCase().includes(search.toLowerCase()) ||
      i.translatedText?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">History</h1>
          <p className="text-sm text-gray-500 mt-1">{total} translations saved</p>
        </div>
        {items.length > 0 && (
          <button
            onClick={clearAll}
            className="btn-secondary text-sm flex items-center gap-1.5 text-red-500 hover:text-red-600"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear all
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap gap-2.5">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="input pl-9 text-sm"
            placeholder="Search translations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input text-sm w-36"
          value={filterLang}
          onChange={(e) => setFilterLang(e.target.value)}
        >
          <option value="">All languages</option>
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.flag} {l.name}
            </option>
          ))}
        </select>
        <button
          onClick={() => setOnlyFavorites(!onlyFavorites)}
          className={`px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
            onlyFavorites
              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
              : 'btn-secondary'
          }`}
        >
          <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-amber-500 text-amber-500' : ''}`} />
          Favorites
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Globe className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No translations found</p>
          <p className="text-sm text-gray-400 mt-1">
            {search || onlyFavorites || filterLang
              ? 'Try adjusting your filters or search terms'
              : 'Start translating to build your history'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((item) => {
              const id = item._id || item.id;
              return (
                <motion.div
                  key={id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="card p-4 space-y-2.5"
                >
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="font-medium">
                      {getLang(item.sourceLanguage)?.flag} {item.sourceLanguageName || item.sourceLanguage}
                    </span>
                    <span>→</span>
                    <span className="font-medium">
                      {getLang(item.targetLanguage)?.flag} {item.targetLanguageName || item.targetLanguage}
                    </span>
                    {item.inputType === 'voice' && (
                      <span className="inline-flex items-center gap-0.5 text-xs bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-md">
                        <Mic className="w-3 h-3" /> Voice
                      </span>
                    )}
                    <span className="ml-auto">{new Date(item.createdAt).toLocaleDateString()}</span>
                    <ConfidenceBadge score={item.confidence || 95} />
                  </div>

                  <p className="text-sm text-gray-900 dark:text-white font-medium">{item.originalText}</p>
                  <p
                    className="text-base text-indigo-600 dark:text-indigo-400 font-semibold"
                    dir={getLang(item.targetLanguage)?.rtl ? 'rtl' : 'ltr'}
                  >
                    {item.translatedText}
                  </p>

                  {item.audioUrl && (
                    <div className="pt-1">
                      <audio controls src={item.audioUrl} className="h-8 w-full max-w-xs" />
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1 border-t border-gray-100 dark:border-gray-800">
                    <button
                      onClick={() => speakText(item.translatedText, item.targetLanguage)}
                      className="btn-secondary text-xs flex items-center gap-1 py-1"
                    >
                      <Volume2 className="w-3 h-3" /> Speak
                    </button>
                    <button
                      onClick={() => copyText(id, item.translatedText)}
                      className="btn-secondary text-xs flex items-center gap-1 py-1"
                    >
                      {copiedId === id ? (
                        <CheckCheck className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      {copiedId === id ? 'Copied' : 'Copy'}
                    </button>
                    <button
                      onClick={() => toggleFav(id)}
                      className={`btn-secondary text-xs flex items-center gap-1 py-1 ${
                        item.isFavorite ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40' : ''
                      }`}
                    >
                      <Star className={`w-3 h-3 ${item.isFavorite ? 'fill-amber-500' : ''}`} />
                      {item.isFavorite ? 'Starred' : 'Star'}
                    </button>
                    <button
                      onClick={() => del(id)}
                      className="btn-secondary text-xs flex items-center gap-1 py-1 text-red-500 hover:text-red-600 ml-auto"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            disabled={page === 1}
            onClick={() => load(page - 1)}
            className="btn-secondary text-sm px-3 disabled:opacity-40"
          >
            ← Prev
          </button>
          <span className="text-sm text-gray-500">
            {page} / {pages}
          </span>
          <button
            disabled={page === pages}
            onClick={() => load(page + 1)}
            className="btn-secondary text-sm px-3 disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
