import fs from 'fs';
import path from 'path';

export interface ActionItem {
  task: string;
  assignee: string;
  urgency: 'low' | 'medium' | 'high';
}

export interface TranscriptTurn {
  speaker: string;
  startTime: string; // MM:SS or seconds
  endTime: string;
  text: string;
  language?: string;
}

export interface CallInsights {
  summary: string;
  keyDiscussionPoints: string[];
  actionItems: ActionItem[];
  customerIntent: string;
  sentiment: 'positive' | 'neutral' | 'negative' | string;
  callOutcome: string;
  detectedLanguages: string[];
  speakerMapping?: {
    agent: string;
    customer: string;
  };
}

export interface CallRecord {
  id: string;
  filename: string;
  originalName: string;
  duration: number; // in seconds, default 0 initially
  status: 'uploading' | 'queued' | 'transcribing' | 'analyzing' | 'completed' | 'failed';
  error?: string;
  createdAt: string;
  transcript?: TranscriptTurn[];
  insights?: CallInsights;
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Ensure database directory and file exist
function ensureDb() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ calls: [] }, null, 2), 'utf-8');
  }
}

export function getCalls(): CallRecord[] {
  ensureDb();
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    return parsed.calls || [];
  } catch (error) {
    console.error('Error reading JSON DB:', error);
    return [];
  }
}

export function getCallById(id: string): CallRecord | undefined {
  const calls = getCalls();
  return calls.find(call => call.id === id);
}

export function createCall(call: CallRecord): CallRecord {
  ensureDb();
  const calls = getCalls();
  calls.unshift(call); // Add to the beginning so new calls show up first
  fs.writeFileSync(DB_FILE, JSON.stringify({ calls }, null, 2), 'utf-8');
  return call;
}

export function updateCall(id: string, updates: Partial<CallRecord>): CallRecord {
  ensureDb();
  const calls = getCalls();
  const index = calls.findIndex(call => call.id === id);
  if (index === -1) {
    throw new Error(`Call with ID ${id} not found.`);
  }

  const updatedCall = { ...calls[index], ...updates };
  calls[index] = updatedCall;

  fs.writeFileSync(DB_FILE, JSON.stringify({ calls }, null, 2), 'utf-8');
  return updatedCall;
}

export function deleteCall(id: string): boolean {
  ensureDb();
  const calls = getCalls();
  const filtered = calls.filter(call => call.id !== id);
  if (filtered.length === calls.length) {
    return false;
  }
  fs.writeFileSync(DB_FILE, JSON.stringify({ calls: filtered }, null, 2), 'utf-8');
  return true;
}
