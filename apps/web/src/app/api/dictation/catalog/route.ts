import { NextResponse } from "next/server";
import type { DictationCatalogResponse } from "@dictation/contracts";
import { getCachedJson } from "@/server/cache";
import { dictationService } from "@/server/dictation/dictation-service";
import { toErrorResponse } from "@/server/http-error";

export const runtime = "nodejs";
export const revalidate = 86400;
const CATALOG_CACHE_KEY = "dictation:catalog:v1";
const CATALOG_CACHE_TTL_SECONDS = 60 * 60 * 12;

export async function GET() {
  try {
    const catalog = await getCachedJson<DictationCatalogResponse>(
      CATALOG_CACHE_KEY,
      CATALOG_CACHE_TTL_SECONDS,
      () => dictationService.getCatalog(),
    );
    return NextResponse.json(catalog, {
      headers: {
        "Cache-Control":
          "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
