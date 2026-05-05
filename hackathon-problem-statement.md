# SOFTEC 2026
## AI Hackathon Competition

---

### MeetingMind: AI-Powered Meeting Intelligence Platform

#### Problem Statement

Modern teams and organizations conduct countless meetings daily, but valuable insights, decisions, and action items discussed during these sessions are often lost or poorly documented. Participants struggle to take comprehensive notes while actively engaging in discussions, leading to misalignment, forgotten commitments, and reduced productivity. Build an AI-powered meeting intelligence system that automatically transcribes meetings in real-time, generates structured summaries, extracts actionable items, and enables semantic search across all meeting history. Given audio input from meetings, the system should produce accurate transcripts, intelligent summaries, identified action items with owners, and allow team members to query past meetings using natural language.

#### What Participants Should Build

Participants should build a working prototype where users can upload audio files or record meetings live, receive instant AI-generated transcripts, generate structured meeting summaries with key points and decisions, extract action items with assigned owners, and search across meeting history using natural language queries. The system should support multiple audio formats, provide real-time transcription feedback, and present results in a clean, professional interface that teams can use immediately after meetings.

#### Core AI Component

The AI should do more than simple speech-to-text conversion. It should handle multiple accents and languages, distinguish between different speakers, identify key discussion topics and decisions, extract structured action items with assigned owners and deadlines, and power a semantic search engine that understands context and intent. A retrieval-augmented generation (RAG) system should enable natural language queries across meeting history, returning evidence-backed answers with references to specific meetings and timestamps.

#### Realistic MVP in 6 Hours

Support 3 to 5 audio files (MP3, WAV, M4A, FLAC, OGG) up to 5 MB each as input. Provide live recording capability with real-time transcription display. Generate structured meeting summaries including: meeting title, date, duration, participants, key discussion topics, decisions made, and action items with owners. Implement semantic search that accepts natural language questions and returns relevant answers with meeting references. Build a clean Next.js 16 frontend with responsive design, dark mode support, and intuitive navigation across transcription, summarization, history, and search features.

#### Technical Stack Requirements

**Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui components
**Backend:** FastAPI (Python 3.10+) with RESTful endpoints
**AI/ML:** Groq API (Whisper Large v3 Turbo) for transcription, LLM for summarization and extraction
**Database:** PostgreSQL with Prisma ORM for type-safe data access
**Package Manager:** Bun for frontend dependencies, uv for Python

#### Suggested Demo Flow

Show a team struggling with meeting documentation — scattered notes, forgotten action items, and no search capability. Demonstrate uploading a recorded meeting or recording live, watch as real-time transcription appears with speaker identification. Show the AI-generated summary highlighting key decisions and extracted action items with assigned owners. Demonstrate the post-meeting agent distributing action items to Slack or email. Finally, showcase semantic search by asking natural language questions like "What did we decide about the Q3 roadmap?" and show the system returning precise answers with meeting references.

#### Evaluation Criteria

| Criteria | Weight | Description |
|----------|--------|-------------|
| AI Accuracy | 25% | Transcription accuracy, summary quality, action item extraction precision |
| User Experience | 20% | Intuitive interface, responsive design, accessibility, dark mode implementation |
| Technical Implementation | 20% | Clean code, proper TypeScript usage, API integration, error handling |
| Feature Completeness | 20% | All core features working: upload, live recording, summarization, search |
| Innovation | 15% | Creative enhancements beyond MVP (multi-speaker detection, integrations, etc.) |

---

**Foundation for Advancement of Science & Technology**

**SOFTEC Society, FAST-NU**  
Block-B, Faisal Town, Lahore, Pakistan  
E-Mail: info@softecnu.org
