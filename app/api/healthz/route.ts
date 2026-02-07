import { NextResponse } from 'next/server';
import { checkHealth } from '@/lib/db';

export async function GET() {
  try {
    const healthy = await checkHealth();
    
    return NextResponse.json(
      { ok: healthy },
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { ok: false },
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
