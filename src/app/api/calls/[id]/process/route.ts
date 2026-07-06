import { NextResponse } from 'next/server';
import { getCallById, updateCall } from '@/lib/db';
import { processCall } from '@/lib/process';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const params = await props.params;
    const id = params.id;
    const call = getCallById(id);

    if (!call) {
      return NextResponse.json({ error: 'Call not found.' }, { status: 404 });
    }

    // Reset status and error
    updateCall(id, { status: 'queued', error: undefined });

    // Start background processing
    processCall(id).catch(err => {
      console.error(`Background retried processing for call ${id} failed:`, err);
    });

    return NextResponse.json({ success: true, message: 'Processing started in the background.' });
  } catch (error: any) {
    console.error('Trigger process API error:', error);
    return NextResponse.json({ error: error.message || 'Failed to trigger processing.' }, { status: 500 });
  }
}
