# AuraIntel: Multilingual Call Intelligence Platform

AuraIntel is a modern, high-end, responsive web application built with Next.js, designed to process customer support or sales call recordings and generate actionable intelligence. It transcribes audio containing multiple languages (with full support for English, Hindi, Telugu, Tamil, and code-switching), detects speaker turns, synchronizes audio playback with the transcript text, and extracts deep AI-driven insights.

## Key Features

1. **Audio Upload**: Supports MP3, WAV, and M4A formats with reactive progress indicators and asynchronous processing status polling (`queued` -> `transcribing` -> `analyzing` -> `completed` / `failed`).
2. **Speech-to-Text with Speaker Diarization**: 
   - **Primary (AssemblyAI)**: Provides highly accurate multilingual transcriptions with millisecond-level timestamps and speaker separation.
   - **Fallback (Gemini API)**: Processes files directly using Gemini's native audio understanding via the Files API when AssemblyAI is not configured.
3. **Multilingual & Code-Switching Support**: Seamlessly detects and transcribes languages (English, Hindi, Tamil, Telugu) and hybrid code-switched dialogues (e.g., Hinglish, Tanglish).
4. **AI Insights Generation (via Gemini 2.5 Flash)**:
   - **Executive Summary**: Narrative overview of the conversation.
   - **Key Discussion Points**: Categorized key topics.
   - **Action Items**: Detailed tasks with assigned owners (Agent/Customer) and urgency levels (High, Medium, Low).
   - **Customer Intent**: Core intent/objective of the call (e.g. Refund request, Sale inquiry).
   - **Sentiment Analysis**: Overall conversation sentiment.
   - **Call Outcome**: Final result classification (e.g., Sale Closed, Follow-up Scheduled, Problem Resolved).
5. **Interactive Audio-Synced Transcript**: Clicking on any utterance in the transcript seeks the audio player to that exact timestamp. The transcript acts as a "karaoke style" scroll, highlighting the currently active speaker turn in real-time during audio playback.
6. **Zero-Configuration Portable DB**: Built on a lightweight file-system JSON database (`data/db.json`), making the application fully portable and self-contained without needing Postgres, Mongo, or MySQL setups.

---

## Technical Stack

- **Framework**: Next.js 15 (App Router, dynamic routes, API endpoints)
- **Language**: TypeScript
- **Styling**: Vanilla CSS (Modern dark mode, glassmorphism, responsive grid, micro-animations)
- **STT SDK**: AssemblyAI Node SDK (`assemblyai`)
- **AI SDK**: Google Gen AI Node SDK (`@google/genai`)
- **Icons**: Lucide React (`lucide-react`)

---

## Installation & Setup

### 1. Prerequisites
Ensure you have the following installed on your machine:
- **Node.js**: `v18.x` or later (tested on Node `v24.x`)
- **NPM**: `v9.x` or later (tested on NPM `v11.x`)
- **Git**: Installed (for repository operations)

### 2. Install Dependencies
Navigate to the project root directory and install dependencies:
```bash
npm install
```

### 3. Configure Environment Variables
Create a file named `.env.local` in the root of the project:
```env
# Required for AI Insights and fallback transcription
GEMINI_API_KEY=your_gemini_api_key_here

# Recommended for premium-grade STT, diarization and timestamps
ASSEMBLYAI_API_KEY=your_assemblyai_api_key_here
```
> **Note**: If `ASSEMBLYAI_API_KEY` is not provided, the platform will fall back to transcribing the audio directly using Gemini 2.5 Flash.

---

## Running the Application

### 1. Run in Development Mode
Start the local development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

### 2. Build for Production
To build a production-optimized version:
```bash
npm run build
```

Run the production server:
```bash
npm start
```

---

## GitHub Repository Creation & Deployment

To make the codebase accessible to interviewers, you can automatically create a GitHub repository in your account and push the sources using the provided utility script.

### Push to GitHub
1. Generate a **GitHub Personal Access Token (PAT)**:
   - Go to: GitHub Settings -> Developer settings -> Personal access tokens -> Tokens (classic).
   - Generate a new token and select the **`repo`** scope.
2. Run the push script:
   ```bash
   node scripts/git-push.js
   ```
3. Enter your Personal Access Token (PAT) when prompted, along with the desired repository name.
4. The script will authenticate, create the repository on your GitHub account, configure local Git credentials, and push all files (excluding keys and temporary uploads as per `.gitignore`).

---

## Deploying to Production (e.g. Vercel)

Next.js projects deploy seamlessly to **Vercel**:
1. Push your repository to GitHub.
2. Sign in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Select your `multilingual-call-intel` repository.
4. Expand **Environment Variables** and add:
   - `GEMINI_API_KEY`
   - `ASSEMBLYAI_API_KEY` (optional)
5. Click **"Deploy"**. Vercel will automatically build, package, and host your serverless APIs and React pages.

*Note on Vercel deployment: Since Vercel is serverless, uploaded files saved to `public/uploads` are ephemeral. For production scale, configure files to upload directly to Amazon S3 or Google Cloud Storage.*
