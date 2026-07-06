import { NextResponse } from 'next/server';
import { getCalls } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const calls = getCalls();
    return NextResponse.json({ success: true, calls });
  } catch (error: any) {
    console.error('Fetch calls API error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch calls.' }, { status: 500 });
  }
}
