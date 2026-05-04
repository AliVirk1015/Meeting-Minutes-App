# MeetingMind

AI-powered meeting transcription for productive teams. Upload audio files or record live to get instant, accurate transcripts using Groq's Whisper API.

## Features

- **File Upload** — Drag & drop or click to upload audio (MP3, WAV, M4A, FLAC, OGG, WebM)
- **Live Recording** — Record directly from your microphone with real-time transcription
- **Instant Results** — Transcribed text appears immediately with copy-to-clipboard
- **Dark Mode** — Toggle with `d` key (thanks to `next-themes`)

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui |
| Backend | FastAPI, Python 3.10+ |
| AI | Groq API (Whisper Large v3 Turbo) |
| Package Manager | Bun |

## Quick Start

### Prerequisites

- Node.js 18+ and [Bun](https://bun.sh/)
- Python 3.10+ and [uv](https://docs.astral.sh/uv/)
- Groq API key ([get one here](https://console.groq.com/))

### 1. Clone & Install

```bash
git clone <your-repo>
cd meeting-mind

# Frontend
bun install

# Backend
cd backend
cp .env.example .env
# Add your GROQ_API_KEY to .env
uv sync
```

### 2. Run Development Servers

```bash
# Terminal 1 — Frontend
bun dev

# Terminal 2 — Backend
cd backend
uv run uvicorn main:app --reload --port 8000
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8000

### 3. Try It Out

Navigate to `/transcribe` and either:
- Upload an audio file (max 5 MB)
- Click "Start recording" to transcribe live

## Project Structure

```
meeting-mind/
├── app/                    # Next.js app router
│   ├── layout.tsx
│   ├── page.tsx           # Landing page
│   └── transcribe/        # Transcription UI
├── backend/
│   ├── main.py            # FastAPI endpoints
│   ├── pyproject.toml
│   └── uv.lock
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── lib/
│   └── utils.ts          # cn() helper
├── public/               # Static assets
├── AGENTS.md             # Dev conventions
└── README.md             # This file
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `bun dev` | Start Next.js dev server (Turbopack) |
| `bun build` | Production build |
| `bun lint` | ESLint |
| `bun typecheck` | TypeScript check |
| `bun format` | Prettier format |

## Backend API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check + API key status |
| `/api/transcribe` | POST | Upload audio file, returns transcription |

## Configuration

All theme and tooling config is in `AGENTS.md` (Conventions):
- Tailwind CSS v4 (no `tailwind.config.ts` — uses CSS-based config)
- shadcn/ui with `@aceternity` and `@react-bits` registries
- Prettier with Tailwind class sorting
- ESLint flat config

## License

MIT
