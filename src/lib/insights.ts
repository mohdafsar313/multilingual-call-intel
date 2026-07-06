import { GoogleGenAI } from '@google/genai';
import { TranscriptTurn, CallInsights } from './db';

export interface CallInsightsWithMapping extends CallInsights {
  speakerMapping: {
    agent: string;
    customer: string;
  };
}

export async function generateCallInsights(
  transcript: TranscriptTurn[],
  filename: string
): Promise<CallInsightsWithMapping> {
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!geminiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured.');
  }

  const ai = new GoogleGenAI({ apiKey: geminiKey });

  // Format transcript turns for the prompt
  const formattedTranscript = transcript
    .map(turn => `[${turn.startTime} - ${turn.endTime}] ${turn.speaker}: ${turn.text}`)
    .join('\n');

  const prompt = `
You are an expert Call Intelligence AI. Your task is to analyze the following call transcript and generate structured insights.

First, read the transcript and identify:
1. Who is the "Agent" (representing the company, sales, support) and who is the "Customer" (the client calling in).
2. The overall summary of the call.
3. Key discussion points.
4. Action items with assignees (Agent, Customer, or a specific name) and urgency level (low, medium, high).
5. Customer's core intent (why they called, what they want).
6. Sentiment of the call (positive, neutral, negative, mixed).
7. Outcome classification (e.g. closed sale, follow-up scheduled, problem resolved, complaint unresolved, inquiry).
8. Detected languages, including code-switching (e.g. English, Hindi, Telugu, Tamil).

Transcript:
${formattedTranscript}

Please return the results in the exact JSON schema requested.
`;

  const responseSchema = {
    type: 'OBJECT',
    properties: {
      summary: {
        type: 'STRING',
        description: 'A detailed summary of the conversation.'
      },
      keyDiscussionPoints: {
        type: 'ARRAY',
        items: { type: 'STRING' },
        description: 'Main topics discussed during the call.'
      },
      actionItems: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            task: { type: 'STRING', description: 'The task/action item.' },
            assignee: { type: 'STRING', description: 'Who is responsible (e.g., Agent, Customer).' },
            urgency: { type: 'STRING', enum: ['low', 'medium', 'high'] }
          },
          required: ['task', 'assignee', 'urgency']
        },
        description: 'Action items identified in the conversation.'
      },
      customerIntent: {
        type: 'STRING',
        description: 'The primary purpose or goal of the customer.'
      },
      sentiment: {
        type: 'STRING',
        description: 'Overall sentiment of the conversation: positive, neutral, negative, or mixed.'
      },
      callOutcome: {
        type: 'STRING',
        description: 'The final status or result of the call (e.g., "Sale Closed", "Follow-up Scheduled", "Complaint Resolved", "Inquiry Only").'
      },
      detectedLanguages: {
        type: 'ARRAY',
        items: { type: 'STRING' },
        description: 'All languages detected in the transcript, including code-switching (e.g., English, Hindi, Telugu, Tamil).'
      },
      speakerMapping: {
        type: 'OBJECT',
        properties: {
          agent: { type: 'STRING', description: 'The speaker label representing the agent (e.g., Speaker A).' },
          customer: { type: 'STRING', description: 'The speaker label representing the customer (e.g., Speaker B).' }
        },
        required: ['agent', 'customer']
      }
    },
    required: [
      'summary',
      'keyDiscussionPoints',
      'actionItems',
      'customerIntent',
      'sentiment',
      'callOutcome',
      'detectedLanguages',
      'speakerMapping'
    ]
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: responseSchema as any
    }
  });

  const responseText = response.text;
  if (!responseText) {
    throw new Error('Gemini insights model returned an empty response.');
  }

  const result = JSON.parse(responseText);
  return result as CallInsightsWithMapping;
}
