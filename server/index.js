const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded audio files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/translate', require('./routes/translate'));
app.use('/api/history', require('./routes/history'));
app.use('/api/audio', require('./routes/audio'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Voice Translator API is running', timestamp: new Date() });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Global error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// Disable command buffering when disconnected so requests never hang
mongoose.set('bufferCommands', false);

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/voice-translator';

const startServer = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('⚠️  Starting server without DB (translations and users will use fast in-memory storage)');
  }

  app.listen(PORT, () => {
    const mode = mongoose.connection.readyState === 1 ? 'MongoDB' : 'in-memory mode';
    console.log(`🚀 Server running on http://localhost:${PORT} (${mode})`);
  });
};

startServer();

module.exports = app;
