import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);
const kv = redis;
export interface Paste {
  id: string;
  content: string;
  createdAt: number; // timestamp in ms
  expiresAt: number | null; // timestamp in ms, null if no TTL
  maxViews: number | null; // null if unlimited
  viewCount: number;
}

export interface CreatePasteInput {
  content: string;
  ttl_seconds?: number;
  max_views?: number;
}

/**
 * Get current time in milliseconds, supporting deterministic testing
 */
export function getCurrentTime(headers: Headers): number {
  const testMode = process.env.TEST_MODE === '1';
  if (testMode) {
    const testNowMs = headers.get('x-test-now-ms');
    if (testNowMs) {
      return parseInt(testNowMs, 10);
    }
  }
  return Date.now();
}

/**
 * Create a new paste
 */
export async function createPaste(input: CreatePasteInput, currentTime: number): Promise<Paste> {
  const { nanoid } = await import('nanoid');
  const id = nanoid(10);
  
  const expiresAt = input.ttl_seconds 
    ? currentTime + (input.ttl_seconds * 1000) 
    : null;
  
  const paste: Paste = {
    id,
    content: input.content,
    createdAt: currentTime,
    expiresAt,
    maxViews: input.max_views ?? null,
    viewCount: 0,
  };
  
  await kv.set(`paste:${id}`, JSON.stringify(paste));
  
  // Set TTL in Redis if applicable
  if (expiresAt) {
    const ttlSeconds = Math.ceil((expiresAt - currentTime) / 1000);
    await kv.expire(`paste:${id}`, ttlSeconds);
  }
  
  return paste;
}

/**
 * Get a paste by ID and increment view count
 */
export async function getPasteAndIncrementView(id: string, currentTime: number): Promise<Paste | null> {
  const data = await kv.get(`paste:${id}`);
  
  if (!data) {
    return null;
  }
  
  const paste: Paste = JSON.parse(data);
  
  // Check if expired
  if (paste.expiresAt && currentTime >= paste.expiresAt) {
    await kv.del(`paste:${id}`);
    return null;
  }
  
  // Check if view limit reached (before incrementing)
  if (paste.maxViews !== null && paste.viewCount >= paste.maxViews) {
    await kv.del(`paste:${id}`);
    return null;
  }
  
  // Increment view count
  paste.viewCount += 1;
  
  // Check if this view reaches the limit
  if (paste.maxViews !== null && paste.viewCount >= paste.maxViews) {
    // Delete the paste as it has reached its view limit
    await kv.del(`paste:${id}`);
  } else {
    // Update the paste with new view count
    await kv.set(`paste:${id}`, JSON.stringify(paste));
  }
  
  return paste;
}

/**
 * Get a paste by ID without incrementing view count (for HTML display)
 */
export async function getPasteWithoutIncrement(id: string, currentTime: number): Promise<Paste | null> {
  const data = await kv.get(`paste:${id}`);
  
  if (!data) {
    return null;
  }
  
  const paste: Paste = JSON.parse(data);
  
  // Check if expired
  if (paste.expiresAt && currentTime >= paste.expiresAt) {
    await kv.del(`paste:${id}`);
    return null;
  }
  
  // Check if view limit reached
  if (paste.maxViews !== null && paste.viewCount >= paste.maxViews) {
    await kv.del(`paste:${id}`);
    return null;
  }
  
  return paste;
}

/**
 * Check if KV is accessible
 */
export async function checkHealth(): Promise<boolean> {
  try {
    await kv.set('health:check', Date.now(), { ex: 10 });
    return true;
  } catch {
    return false;
  }
}

