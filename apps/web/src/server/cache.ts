import { Redis as UpstashRedis } from "@upstash/redis";
import IORedis from "ioredis";

type CacheEntry = {
  expiresAt: number;
  value: string;
};

const memoryCache = new Map<string, CacheEntry>();

let upstashRedis: UpstashRedis | null | undefined;
let ioRedis: IORedis | null | undefined;

function getUpstashRedis(): UpstashRedis | null {
  if (upstashRedis !== undefined) return upstashRedis;

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    upstashRedis = null;
    return upstashRedis;
  }

  upstashRedis = UpstashRedis.fromEnv();
  return upstashRedis;
}

function getIoRedis(): IORedis | null {
  if (ioRedis !== undefined) return ioRedis;

  const url = process.env.REDIS_URL;
  if (!url) {
    ioRedis = null;
    return ioRedis;
  }

  ioRedis = new IORedis(url, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false
  });
  ioRedis.on("error", () => {
    // Optional cache only. Keep API responses working when Redis is unavailable.
  });

  return ioRedis;
}

async function getRemoteCache(key: string): Promise<string | null> {
  const upstash = getUpstashRedis();
  if (upstash) {
    try {
      return await upstash.get<string>(key);
    } catch {
      // Fall through to TCP Redis or loader.
    }
  }

  const redis = getIoRedis();
  if (!redis) return null;

  try {
    if (redis.status === "wait") await redis.connect();
    return await redis.get(key);
  } catch {
    return null;
  }
}

async function setRemoteCache(
  key: string,
  value: string,
  ttlSeconds: number
): Promise<void> {
  const upstash = getUpstashRedis();
  if (upstash) {
    try {
      await upstash.set(key, value, { ex: ttlSeconds });
      return;
    } catch {
      // Fall through to TCP Redis.
    }
  }

  const redis = getIoRedis();
  if (!redis) return;

  try {
    if (redis.status === "wait") await redis.connect();
    await redis.set(key, value, "EX", ttlSeconds);
  } catch {
    // Redis cache write failures should not affect the response.
  }
}

export async function getCachedJson<T>(
  key: string,
  ttlSeconds: number,
  loader: () => T | Promise<T>
): Promise<T> {
  const now = Date.now();
  const memoryHit = memoryCache.get(key);
  if (memoryHit && memoryHit.expiresAt > now) {
    return JSON.parse(memoryHit.value) as T;
  }

  const cached = await getRemoteCache(key);
  if (cached) {
    memoryCache.set(key, {
      value: cached,
      expiresAt: now + ttlSeconds * 1000
    });
    return JSON.parse(cached) as T;
  }

  const value = await loader();
  const serialized = JSON.stringify(value);
  memoryCache.set(key, {
    value: serialized,
    expiresAt: now + ttlSeconds * 1000
  });

  await setRemoteCache(key, serialized, ttlSeconds);

  return value;
}
