const mongoose = require('mongoose');
const { inMemoryTranslations } = require('./translateController');

const isDbConnected = () => mongoose.connection.readyState === 1;

// Seed demo translations for demo user
const demoId = 'demo-user-001';
if (!inMemoryTranslations.has(demoId)) {
  inMemoryTranslations.set(demoId, [
    {
      id: 'demo-tx-001',
      _id: 'demo-tx-001',
      userId: demoId,
      originalText: 'Hello, how are you?',
      translatedText: 'வணக்கம், நீங்கள் எப்படி இருக்கிறீர்கள்?',
      sourceLanguage: 'en',
      targetLanguage: 'ta',
      sourceLanguageName: 'English',
      targetLanguageName: 'Tamil',
      inputType: 'voice',
      confidence: 98,
      isFavorite: true,
      createdAt: new Date(Date.now() - 3600000 * 2),
    },
    {
      id: 'demo-tx-002',
      _id: 'demo-tx-002',
      userId: demoId,
      originalText: 'Good morning my friend',
      translatedText: 'सुप्रभात मेरे दोस्त',
      sourceLanguage: 'en',
      targetLanguage: 'hi',
      sourceLanguageName: 'English',
      targetLanguageName: 'Hindi',
      inputType: 'voice',
      confidence: 96,
      isFavorite: false,
      createdAt: new Date(Date.now() - 3600000 * 6),
    },
    {
      id: 'demo-tx-003',
      _id: 'demo-tx-003',
      userId: demoId,
      originalText: 'Thank you very much',
      translatedText: 'Merci beaucoup',
      sourceLanguage: 'en',
      targetLanguage: 'fr',
      sourceLanguageName: 'English',
      targetLanguageName: 'French',
      inputType: 'text',
      confidence: 99,
      isFavorite: true,
      createdAt: new Date(Date.now() - 3600000 * 12),
    },
    {
      id: 'demo-tx-004',
      _id: 'demo-tx-004',
      userId: demoId,
      originalText: 'Where is the nearest hospital?',
      translatedText: '¿Dónde está el hospital más cercano?',
      sourceLanguage: 'en',
      targetLanguage: 'es',
      sourceLanguageName: 'English',
      targetLanguageName: 'Spanish',
      inputType: 'voice',
      confidence: 95,
      isFavorite: false,
      createdAt: new Date(Date.now() - 3600000 * 24),
    },
    {
      id: 'demo-tx-005',
      _id: 'demo-tx-005',
      userId: demoId,
      originalText: 'Welcome to our country',
      translatedText: 'مرحبًا بكم في بلدنا',
      sourceLanguage: 'en',
      targetLanguage: 'ar',
      sourceLanguageName: 'English',
      targetLanguageName: 'Arabic',
      inputType: 'text',
      confidence: 94,
      isFavorite: false,
      createdAt: new Date(Date.now() - 3600000 * 36),
    },
  ]);
}

// ─── Get History ──────────────────────────────────────────────────────────────
exports.getHistory = async (req, res) => {
  const { page = 1, limit = 20, lang, favorite } = req.query;
  const userId = String(req.user._id || req.user.id);
  const isFav = favorite === 'true';

  if (isDbConnected()) {
    try {
      const Translation = require('../models/Translation');
      const filter = { userId };
      if (lang) filter.targetLanguage = lang;
      if (isFav) filter.isFavorite = true;
      const total = await Translation.countDocuments(filter);
      const data = await Translation.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));
      return res.json({
        success: true,
        data,
        total,
        page: Number(page),
        pages: Math.max(1, Math.ceil(total / limit)),
      });
    } catch (_) {
      // Fall through to in-memory
    }
  }

  const list = inMemoryTranslations.get(userId) || [];
  const all = list.filter((t) => {
    if (lang && t.targetLanguage !== lang) return false;
    if (isFav && !t.isFavorite) return false;
    return true;
  });

  const start = (page - 1) * limit;
  return res.json({
    success: true,
    data: all.slice(start, start + Number(limit)),
    total: all.length,
    page: Number(page),
    pages: Math.max(1, Math.ceil(all.length / limit)),
  });
};

// ─── Delete Single ────────────────────────────────────────────────────────────
exports.deleteHistory = async (req, res) => {
  const { id } = req.params;
  const userId = String(req.user._id || req.user.id);

  if (isDbConnected()) {
    try {
      const Translation = require('../models/Translation');
      await Translation.findOneAndDelete({ _id: id, userId });
      return res.json({ success: true, message: 'Deleted' });
    } catch (_) {}
  }

  const list = inMemoryTranslations.get(userId) || [];
  inMemoryTranslations.set(userId, list.filter((t) => String(t.id) !== id && String(t._id) !== id));
  return res.json({ success: true, message: 'Deleted' });
};

// ─── Clear All ────────────────────────────────────────────────────────────────
exports.clearHistory = async (req, res) => {
  const userId = String(req.user._id || req.user.id);

  if (isDbConnected()) {
    try {
      const Translation = require('../models/Translation');
      await Translation.deleteMany({ userId });
      return res.json({ success: true, message: 'History cleared' });
    } catch (_) {}
  }

  inMemoryTranslations.set(userId, []);
  return res.json({ success: true, message: 'History cleared' });
};

// ─── Toggle Favorite ──────────────────────────────────────────────────────────
exports.toggleFavorite = async (req, res) => {
  const { id } = req.params;
  const userId = String(req.user._id || req.user.id);

  if (isDbConnected()) {
    try {
      const Translation = require('../models/Translation');
      const item = await Translation.findOne({ _id: id, userId });
      if (item) {
        item.isFavorite = !item.isFavorite;
        await item.save();
        return res.json({ success: true, data: item });
      }
    } catch (_) {}
  }

  const list = inMemoryTranslations.get(userId) || [];
  const item = list.find((t) => String(t.id) === id || String(t._id) === id);
  if (item) item.isFavorite = !item.isFavorite;
  return res.json({ success: true, data: item });
};

// ─── Stats ────────────────────────────────────────────────────────────────────
exports.getStats = async (req, res) => {
  const userId = String(req.user._id || req.user.id);

  if (isDbConnected()) {
    try {
      const Translation = require('../models/Translation');
      const total = await Translation.countDocuments({ userId });
      const favorites = await Translation.countDocuments({ userId, isFavorite: true });
      const byLang = await Translation.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: '$targetLanguage', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);
      const byType = await Translation.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: '$inputType', count: { $sum: 1 } } },
      ]);
      return res.json({ success: true, data: { total, favorites, byLang, byType } });
    } catch (_) {
      // Fall through to in-memory
    }
  }

  const list = inMemoryTranslations.get(userId) || [];
  const byLang = {};
  const byType = {};
  let favorites = 0;

  list.forEach((t) => {
    if (t.isFavorite) favorites++;
    byLang[t.targetLanguage] = (byLang[t.targetLanguage] || 0) + 1;
    byType[t.inputType] = (byType[t.inputType] || 0) + 1;
  });

  return res.json({
    success: true,
    data: {
      total: list.length,
      favorites,
      byLang: Object.entries(byLang).map(([k, v]) => ({ _id: k, count: v })),
      byType: Object.entries(byType).map(([k, v]) => ({ _id: k, count: v })),
    },
  });
};
