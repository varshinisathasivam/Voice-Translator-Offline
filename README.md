# 🌐 VoiceTranslate — Offline-capable Voice Translator

A full-stack voice translation application supporting 7 languages with speech-to-text, real-time translation, and text-to-speech playback.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express.js |
| Database | MongoDB (with in-memory fallback) |
| Auth | JWT |
| Voice | Web Speech API (browser-native) |

## Supported Languages

🇺🇸 English · 🇮🇳 Tamil · 🇮🇳 Hindi · 🇫🇷 French · 🇪🇸 Spanish · 🇩🇪 German · 🇸🇦 Arabic

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (optional — app runs without it using in-memory storage)

### 1. Clone and install

```bash
git clone <repo>
cd voice-translator
npm run install:all
```

### 2. Configure server environment

```bash
cd server
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

### 3. Run in development

```bash
# From project root:
npm run dev
```

This starts:
- **Backend** at http://localhost:5000
- **Frontend** at http://localhost:3000

## Project Structure

```
voice-translator/
├── client/                   # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/       # Sidebar, topbar
│   │   │   └── ui/           # Reusable UI components
│   │   ├── context/          # Auth + Theme context
│   │   ├── hooks/            # useVoiceRecorder, useSpeechRecognition
│   │   ├── pages/            # Landing, Login, Register, Dashboard, Translate, History
│   │   └── utils/            # Axios instance, language config
│   └── vite.config.js        # Proxies /api → backend
│
└── server/                   # Express backend
    ├── controllers/          # Business logic
    ├── middleware/            # JWT auth
    ├── models/               # Mongoose schemas
    ├── routes/               # REST API routes
    ├── uploads/              # Uploaded audio files
    └── index.js              # Entry point
```

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | — | Create account |
| POST | /api/auth/login | — | Sign in, get JWT |
| GET | /api/auth/me | ✓ | Get profile |
| GET | /api/translate/languages | — | List languages |
| POST | /api/translate | ✓ | Translate text |
| GET | /api/history | ✓ | Get history |
| GET | /api/history/stats | ✓ | Stats |
| DELETE | /api/history/:id | ✓ | Delete one |
| DELETE | /api/history/clear | ✓ | Clear all |
| PUT | /api/history/:id/favorite | ✓ | Toggle favorite |
| POST | /api/audio/upload | ✓ | Upload audio |

## Features

- ✅ JWT authentication (register / login / logout)
- ✅ Voice recording via browser microphone
- ✅ Speech-to-text via Web Speech API
- ✅ Offline-capable translation engine (dictionary-based)
- ✅ Text-to-speech playback (browser-native)
- ✅ Translation history with pagination, search, filter
- ✅ Favorite translations
- ✅ Dark/light mode
- ✅ Responsive mobile-friendly design
- ✅ Waveform animation during recording
- ✅ Confidence score display
- ✅ Copy and download translated audio

## MongoDB is optional

The app detects MongoDB availability and falls back to in-memory storage automatically. All features work without a database — data is lost on server restart in fallback mode.

## License

MIT
