import type { AuthUser } from "@dictation/contracts";
import {
  createClient,
  type SupabaseClient,
  type User,
} from "@supabase/supabase-js";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { ApiError } from "@/server/http-error";

const TOKEN_CACHE_TTL_MS = 30_000;
const TOKEN_CACHE_MAX_ENTRIES = 500;

type CachedAuthUser = {
  expiresAt: number;
  user: AuthUser;
};

let supabase: SupabaseClient | null = null;
const verifiedTokens = new Map<string, CachedAuthUser>();
const pendingVerifications = new Map<string, Promise<AuthUser>>();

export async function requireAuthUser(request: Request): Promise<AuthUser> {
  const accessToken = getBearerToken(request.headers.get("authorization"));

  if (!accessToken) {
    throw new ApiError(401, "Missing Supabase access token");
  }

  return verifyAccessToken(accessToken);
}

async function verifyAccessToken(accessToken: string): Promise<AuthUser> {
  const tokenKey = createHash("sha256").update(accessToken).digest("base64url");
  const cached = verifiedTokens.get(tokenKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.user;
  }

  verifiedTokens.delete(tokenKey);

  const pending = pendingVerifications.get(tokenKey);

  if (pending) {
    return pending;
  }

  const verification = Promise.resolve(
    verifyAccessTokenLocally(accessToken) ?? verifyTokenRemotely(accessToken),
  )
    .then((user) => {
      pruneTokenCache();
      verifiedTokens.set(tokenKey, {
        user,
        expiresAt: Date.now() + TOKEN_CACHE_TTL_MS,
      });

      return user;
    })
    .finally(() => {
      pendingVerifications.delete(tokenKey);
    });

  pendingVerifications.set(tokenKey, verification);

  return verification;
}

function verifyAccessTokenLocally(accessToken: string): AuthUser | null {
  const jwtSecret =
    process.env.SUPABASE_JWT_SECRET ?? process.env.SUPABASE_AUTH_JWT_SECRET;

  if (!jwtSecret) {
    return null;
  }

  const [encodedHeader, encodedPayload, encodedSignature] =
    accessToken.split(".");

  if (!encodedHeader || !encodedPayload || !encodedSignature) {
    return null;
  }

  const header = parseJwtPart(encodedHeader);
  const payload = parseJwtPart(encodedPayload);

  if (!isRecord(header) || header.alg !== "HS256" || !isRecord(payload)) {
    return null;
  }

  const expectedSignature = createHmac("sha256", jwtSecret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest();
  const actualSignature = base64UrlToBuffer(encodedSignature);

  if (
    actualSignature.length !== expectedSignature.length ||
    !timingSafeEqual(actualSignature, expectedSignature)
  ) {
    return null;
  }

  const nowInSeconds = Math.floor(Date.now() / 1000);
  const expiresAt = getNumericClaim(payload, "exp");
  const notBefore = getNumericClaim(payload, "nbf");
  const userId = getStringClaim(payload, "sub");
  const email = getStringClaim(payload, "email");

  if (
    !userId ||
    !email ||
    (expiresAt !== null && expiresAt <= nowInSeconds) ||
    (notBefore !== null && notBefore > nowInSeconds)
  ) {
    return null;
  }

  const metadata = getRecordClaim(payload, "user_metadata");

  return {
    id: userId,
    email,
    name:
      getStringMetadata(metadata, "name") ??
      getStringMetadata(metadata, "full_name"),
    avatarUrl:
      getStringMetadata(metadata, "avatar_url") ??
      getStringMetadata(metadata, "picture"),
  };
}

function getSupabase(): SupabaseClient {
  if (supabase) {
    return supabase;
  }

  const supabaseUrl =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new ApiError(401, "Supabase Auth is not configured");
  }

  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return supabase;
}

async function verifyTokenRemotely(accessToken: string): Promise<AuthUser> {
  const { data, error } = await getSupabase().auth.getUser(accessToken);

  if (error || !data.user?.email) {
    throw new ApiError(401, "Invalid Supabase access token");
  }

  return toAuthUser(data.user);
}

function pruneTokenCache(): void {
  const now = Date.now();

  for (const [key, value] of verifiedTokens) {
    if (value.expiresAt <= now) {
      verifiedTokens.delete(key);
    }
  }

  while (verifiedTokens.size >= TOKEN_CACHE_MAX_ENTRIES) {
    const oldestKey = verifiedTokens.keys().next().value as string | undefined;

    if (!oldestKey) {
      break;
    }

    verifiedTokens.delete(oldestKey);
  }
}

function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email as string,
    name:
      getStringMetadata(user.user_metadata, "name") ??
      getStringMetadata(user.user_metadata, "full_name"),
    avatarUrl:
      getStringMetadata(user.user_metadata, "avatar_url") ??
      getStringMetadata(user.user_metadata, "picture"),
  };
}

function getStringMetadata(
  metadata: Record<string, unknown> | null | undefined,
  key: string,
): string | null {
  const value: unknown =
    typeof metadata === "object" && metadata !== null
      ? (metadata as Record<string, unknown>)[key]
      : undefined;

  return typeof value === "string" && value.length > 0 ? value : null;
}

function parseJwtPart(value: string): unknown {
  try {
    return JSON.parse(base64UrlToBuffer(value).toString("utf8")) as unknown;
  } catch {
    return null;
  }
}

function base64UrlToBuffer(value: string): Buffer {
  return Buffer.from(value, "base64url");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getStringClaim(
  payload: Record<string, unknown>,
  key: string,
): string | null {
  const value = payload[key];

  return typeof value === "string" && value.length > 0 ? value : null;
}

function getNumericClaim(
  payload: Record<string, unknown>,
  key: string,
): number | null {
  const value = payload[key];

  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function getRecordClaim(
  payload: Record<string, unknown>,
  key: string,
): Record<string, unknown> | null {
  const value = payload[key];

  return isRecord(value) ? value : null;
}

function getBearerToken(authorization: string | null): string | null {
  if (!authorization) {
    return null;
  }

  const [scheme, token] = authorization.split(" ");

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
}
