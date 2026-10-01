const mongoose = require('mongoose');

const translationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    originalText: {
      type: String,
      required: true,
      trim: true,
    },
    translatedText: {
      type: String,
      required: true,
      trim: true,
    },
    sourceLanguage: {
      type: String,
      required: true,
      default: 'en',
    },
    targetLanguage: {
      type: String,
      required: true,
    },
    sourceLanguageName: String,
    targetLanguageName: String,
    inputType: {
      type: String,
      enum: ['voice', 'text'],
      default: 'text',
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: 95,
    },
    audioUrl: {
      type: String,
      default: null,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    duration: {
      type: Number, // in seconds
      default: 0,
    },
  },
  { timestamps: true }
);

// Index for faster queries
translationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Translation', translationSchema);
