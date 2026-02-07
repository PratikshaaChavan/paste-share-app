import { NextRequest, NextResponse } from 'next/server';
import { createPaste, getCurrentTime } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate content
    if (!body.content || typeof body.content !== 'string' || body.content.trim().length === 0) {
      return NextResponse.json(
        { error: 'content is required and must be a non-empty string' },
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Validate ttl_seconds if present
    if (body.ttl_seconds !== undefined) {
      if (!Number.isInteger(body.ttl_seconds) || body.ttl_seconds < 1) {
        return NextResponse.json(
          { error: 'ttl_seconds must be an integer >= 1' },
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }
    
    // Validate max_views if present
    if (body.max_views !== undefined) {
      if (!Number.isInteger(body.max_views) || body.max_views < 1) {
        return NextResponse.json(
          { error: 'max_views must be an integer >= 1' },
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }
    
    const currentTime = getCurrentTime(request.headers);
    
    const paste = await createPaste({
      content: body.content,
      ttl_seconds: body.ttl_seconds,
      max_views: body.max_views,
    }, currentTime);
    
    const baseUrl = request.headers.get('host') || 'localhost:3000';
    const protocol = baseUrl.includes('localhost') ? 'http' : 'https';
    const url = `${protocol}://${baseUrl}/p/${paste.id}`;
    
    return NextResponse.json(
      { 
        id: paste.id,
        url,
      },
      { 
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error creating paste:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
