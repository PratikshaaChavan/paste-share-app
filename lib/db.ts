import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL!);
const kv = redis;

export interface Paste {
  id: string;
  content: string;
  createdAt: number;
  expiresAt: number | null;
  maxViews: number | null;
  viewCount: number;
}

export interface CreatePasteInput {
  content: string;
  ttl_seconds?: number;
  max_views?: number;
}

export function getCurrentTime(headers: Headers): number {
  const testMode = process.env.TEST_MODE === "1";
  if (testMode) {
    const testNowMs = headers.get("x-test-now-ms");
    if (testNowMs) {
      return parseInt(testNowMs, 10);
    }
  }
  return Date.now();
}

export async function createPaste(input: CreatePasteInput, currentTime: number): Promise<Paste> {
  const { nanoid } = await import("nanoid");
  const id = nanoid(10);
  const expiresAt = input.ttl_seconds ? currentTime + input.ttl_seconds * 1000 : null;
  const paste: Paste = {
    id,
    content: input.content,
    createdAt: currentTime,
    expiresAt,
    maxViews: input.max_views ?? null,
    viewCount: 0,
  };
  await kv.set("paste:" + id, JSON.stringify(paste));
  if (expiresAt) {
    const ttlSeconds = Math.ceil((expiresAt - currentTime) / 1000);
    await kv.expire("paste:" + id, ttlSeconds);
  }
  return paste;
}

export async function getPasteAndIncrementView(id: string, currentTime: number): Promise<Paste | null> {
  const data = await kv.get("paste:" + id);
  if (!data) {
    return null;
  }
  const paste: Paste = JSON.parse(data);
  if (paste.expiresAt && currentTime >= paste.expiresAt) {
    await kv.del("paste:" + id);
    return null;
  }
  if (paste.maxViews !== null && paste.viewCount >= paste.maxViews) {
    await kv.del("paste:" + id);
    return null;
  }
  paste.viewCount += 1;
  if (paste.maxViews !== null && paste.viewCount >= paste.maxViews) {
    await kv.del("paste:" + id);
  } else {
    await kv.set("paste:" + id, JSON.stringify(paste));
  }
  return paste;
}

export async function getPasteWithoutIncrement(id: string, currentTime: number): Promise<Paste | null> {
  const data = await kv.get("paste:" + id);
  if (!data) {
    return null;
  }
  const paste: Paste = JSON.parse(data);
  if (paste.expiresAt && currentTime >= paste.expiresAt) {
    await kv.del("paste:" + id);
    return null;
  }
  if (paste.maxViews !== null && paste.viewCount >= paste.maxViews) {
    await kv.del("paste:" + id);
    return null;
  }
  return paste;
}

export async function checkHealth(): Promise<boolean> {
  try {
    await kv.setex("health:check", 10, Date.now().toString());
    return true;
  } catch {
    return false;
  }
}
