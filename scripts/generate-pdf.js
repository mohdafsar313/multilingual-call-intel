const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Initialize PDF Document
const doc = new PDFDocument({ 
  margin: 50,
  size: 'A4'
});

const outputPath = path.join(process.cwd(), 'AuraIntel_Project_Documentation.pdf');
const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

// Color Palette
const PRIMARY_COLOR = '#1e1b4b'; // Deep Indigo
const SECONDARY_COLOR = '#0f766e'; // Teal
const TEXT_COLOR = '#334155'; // Slate
const CODE_BG = '#f1f5f9'; // Soft Gray
const BORDER_COLOR = '#e2e8f0';

// Helper: Page Header/Footer
doc.on('pageAdded', () => {
  drawHeaderFooter();
});

function drawHeaderFooter() {
  doc.save();
  // Header
  doc.fontSize(8)
     .fillColor('#94a3b8')
     .text('AuraIntel | Project Reference Manual', 50, 25, { align: 'left' });
  doc.text('Confidential - For Review', 50, 25, { align: 'right' });
  doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(50, 35).lineTo(545, 35).stroke();
  doc.restore();
}

// Draw the header for page 1 manually
drawHeaderFooter();

// TITLE PAGE / HEADER
doc.y = 50;
doc.fontSize(24)
   .font('Helvetica-Bold')
   .fillColor(PRIMARY_COLOR)
   .text('PROJECT DOCUMENTATION', { align: 'center' });

doc.moveDown(0.2);
doc.fontSize(16)
   .font('Helvetica')
   .fillColor(SECONDARY_COLOR)
   .text('AuraIntel: Multilingual Call Intelligence Platform', { align: 'center' });

doc.moveDown(0.5);
doc.strokeColor(SECONDARY_COLOR).lineWidth(2).moveTo(150, doc.y).lineTo(450, doc.y).stroke();
doc.moveDown(1.5);

// SECTION 1: INTRODUCTION
doc.fontSize(14).font('Helvetica-Bold').fillColor(PRIMARY_COLOR).text('1. Project Overview');
doc.moveDown(0.3);
doc.fontSize(10).font('Helvetica').fillColor(TEXT_COLOR).text(
  'AuraIntel is a full-stack Next.js web application engineered to process call recordings (customer support and sales audio) and automatically generate deep intelligence. The platform transcribes multilingual calls, differentiates speakers (Agent vs. Customer), highlights transcripts dynamically as audio plays, and extracts executive summaries, action items, sentiment indices, and outcome classifications.',
  { align: 'justify', lineGap: 3 }
);
doc.moveDown(1.2);

// SECTION 2: TECH STACK
doc.fontSize(14).font('Helvetica-Bold').fillColor(PRIMARY_COLOR).text('2. Core Technologies & Architecture');
doc.moveDown(0.5);

const techStack = [
  { term: 'Framework: ', desc: 'Next.js 15 (App Router). Used for serving frontend pages and housing serverless backend API endpoints.' },
  { term: 'Language: ', desc: 'TypeScript. Enforces compile-time type safety across database entities, service layers, and React state.' },
  { term: 'Speech-to-Text: ', desc: 'AssemblyAI SDK. Primary engine offering automated language detection, speaker diarization, and millisecond timestamps.' },
  { term: 'AI Insights: ', desc: 'Google Gemini 2.5 Flash API (@google/genai). Extracted summaries, action tasks, and metadata using structured JSON schemas.' },
  { term: 'Database: ', desc: 'Lightweight File-system DB (data/db.json). Standard JSON reads and writes, facilitating zero-configuration portability.' },
  { term: 'UI/Styling: ', desc: 'Vanilla CSS with CSS Variables. Custom styles representing dark mode, glassmorphism, responsive grids, and highlight animations.' }
];

techStack.forEach(item => {
  doc.fontSize(10).font('Helvetica-Bold').fillColor(SECONDARY_COLOR).text(item.term, { bullet: true, continued: true });
  doc.font('Helvetica').fillColor(TEXT_COLOR).text(item.desc, { lineGap: 2 });
  doc.moveDown(0.2);
});

doc.moveDown(1);

// SECTION 3: STEP-BY-STEP IMPLEMENTATION LOG
doc.fontSize(14).font('Helvetica-Bold').fillColor(PRIMARY_COLOR).text('3. Step-by-Step Implementation Timeline');
doc.moveDown(0.5);

const steps = [
  'Research: Analyzed Windows environment paths, validated Git execution path (C:\\Program Files\\Git\\cmd\\git.exe), and tested Google Gen AI library exports.',
  'Scaffolding: Initialized Next.js 15 project in scratch directory with App Router and TypeScript, bypassing Tailwind in favor of custom CSS.',
  'Dependency Setup: Installed NPM packages: @google/genai, assemblyai, lucide-react, and pdfkit.',
  'Data Layer: Implemented a robust data utility (src/lib/db.ts) defining standard data interfaces (CallRecord, CallInsights, ActionItem) and CRUD file operations.',
  'Transcriber Adapter: Coded src/lib/audio.ts supporting AssemblyAI and a robust fallback to Gemini Files API (handling uploads, polling for ACTIVE, and parsing JSON transcript structures).',
  'Insights Adapter: Coded src/lib/insights.ts sending transcripts to Gemini 2.5 Flash to automatically detect speakers, map Agent/Customer roles, and extract summaries and action items.',
  'Process Orchestrator: Linked transcription and insights in src/lib/process.ts to process audio records in the background.',
  'API Routes: Built REST routes: GET/POST uploads, GET calls list, GET/DELETE call details, and POST process retries.',
  'Styles & Layouts: Wrote globals.css utilizing CSS variables for smooth background gradients, scrollbars, glowing metrics, and layouts.',
  'Frontend Dashboard: Wrote page.tsx featuring state variables for search filters, file uploads, audio slider playback, and synced karaoke highlights.',
  'GitHub setup: Created scripts/git-push.js to automate repository creation via GitHub API and push files using local Git.',
  'Compilation Check: Built the production code successfully via npm run build, validating typescript types and route rendering.',
  'Git Publishing: Executed push script using the user token, successfully creating mohdafsar313/multilingual-call-intel, followed by a secure Git origin URL reset.'
];

steps.forEach((step, idx) => {
  doc.fontSize(10).font('Helvetica-Bold').fillColor(PRIMARY_COLOR).text(`${idx + 1}. `, { continued: true });
  doc.font('Helvetica').fillColor(TEXT_COLOR).text(step, { lineGap: 2 });
  doc.moveDown(0.25);
});

doc.addPage();

// SECTION 4: SHELL COMMANDS USED
doc.fontSize(14).font('Helvetica-Bold').fillColor(PRIMARY_COLOR).text('4. Executed Shell Commands');
doc.moveDown(0.5);

const commands = [
  { label: 'Check Tools', cmd: 'node -v; npm -v; git --version' },
  { label: 'Project Scaffold', cmd: 'npx -y create-next-app@latest multilingual-call-intel --ts --no-tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --disable-git' },
  { label: 'Install Packages', cmd: 'npm install @google/genai assemblyai lucide-react pdfkit' },
  { label: 'Clean Test Scripts', cmd: 'Remove-Item scripts/test-sdk.js' },
  { label: 'Production Build Check', cmd: 'npm run build' },
  { label: 'GitHub Push execution', cmd: '$env:GITHUB_TOKEN="ghp_***"; $env:GITHUB_REPO="multilingual-call-intel"; node scripts/git-push.js' },
  { label: 'Reset Remote for Security', cmd: '& "C:\\Program Files\\Git\\cmd\\git.exe" remote set-url origin https://github.com/mohdafsar313/multilingual-call-intel.git' }
];

commands.forEach(c => {
  doc.fontSize(10).font('Helvetica-Bold').fillColor(SECONDARY_COLOR).text(c.label);
  doc.moveDown(0.1);
  
  // Render command in a boxed code layout
  const indent = 60;
  const rectWidth = 485;
  const rectHeight = 22;
  
  doc.save();
  doc.fillColor(CODE_BG).rect(50, doc.y, rectWidth, rectHeight).fill();
  doc.font('Courier').fontSize(8.5).fillColor('#0f172a').text(c.cmd, 60, doc.y + 6);
  doc.restore();
  
  doc.y += rectHeight + 5;
  doc.moveDown(0.4);
});

doc.moveDown(0.5);

// SECTION 5: SOURCE CODE HIGHLIGHT
doc.fontSize(14).font('Helvetica-Bold').fillColor(PRIMARY_COLOR).text('5. Project Core Source Code File Directory');
doc.moveDown(0.5);

const filesDescription = [
  { file: 'src/lib/db.ts', desc: 'Main interfaces (CallRecord, CallInsights, ActionItem, TranscriptTurn) and synchronous JSON write/read database logic.' },
  { file: 'src/lib/audio.ts', desc: 'Speech-to-Text orchestrator. Integrates AssemblyAI for transcription/diarization and falls back to Gemini Files API.' },
  { file: 'src/lib/insights.ts', desc: 'Generates summary, action items, customer intent, sentiment and maps speaker IDs to Agent/Customer roles using Gemini.' },
  { file: 'src/lib/process.ts', desc: 'Processes audio asynchronously by chaining audio.ts (STT) and insights.ts (AI) and saving updates to the database.' },
  { file: 'src/app/page.tsx', desc: 'React Client Component for dashboard UI. Manages lists, search filtering, audio tracking, and tab layouts.' },
  { file: 'src/app/globals.css', desc: 'Custom style system, responsive grid layouts, scrollbars, glowing borders, and animations.' },
  { file: 'scripts/git-push.js', desc: 'Automated script to create public GitHub repos via REST and run Git checkout, remote configure, and push.' }
];

filesDescription.forEach(f => {
  doc.fontSize(10).font('Helvetica-Bold').fillColor(SECONDARY_COLOR).text(f.file);
  doc.font('Helvetica').fontSize(9.5).fillColor(TEXT_COLOR).text(f.desc, { lineGap: 1.5 });
  doc.moveDown(0.4);
});

// Finalize and close PDF
doc.end();

stream.on('finish', () => {
  console.log(`PDF successfully created at: ${outputPath}`);
});
