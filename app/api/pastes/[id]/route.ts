import { NextRequest, NextResponse } from 'next/server';
import { getPasteAndIncrementView, getCurrentTime } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const currentTime = getCurrentTime(request.headers);
    const paste = await getPasteAndIncrementView(id, currentTime);  // ← FIXED HERE
    
    if (!paste) {
      return NextResponse.json(
        { error: 'Paste not found' },
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    
    const remainingViews = paste.maxViews !== null 
      ? Math.max(0, paste.maxViews - paste.viewCount)
      : null;
    
    const expiresAt = paste.expiresAt 
      ? new Date(paste.expiresAt).toISOString()
      : null;
    
    return NextResponse.json(
      {
        content: paste.content,
        remaining_views: remainingViews,
        expires_at: expiresAt,
      },
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error fetching paste:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}