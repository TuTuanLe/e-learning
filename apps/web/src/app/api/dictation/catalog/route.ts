import { NextResponse } from "next/server";
import type { DictationCatalogResponse } from "@dictation/contracts";
import { getCachedJson } from "@/server/cache";
import { dictationService } from "@/server/dictation/dictation-service";
import { toErrorResponse } from "@/server/http-error";

export const runtime = "nodejs";
const CATALOG_CACHE_KEY = "dictation:catalog:v1";
const CATALOG_CACHE_TTL_SECONDS = 60 * 60 * 12;

export async function GET() {
  try {
    const catalog = await getCachedJson<DictationCatalogResponse>(
      CATALOG_CACHE_KEY,
      CATALOG_CACHE_TTL_SECONDS,
      () => dictationService.getCatalog(),
    );
    return NextResponse.json(catalog);
  } catch (error) {
    return toErrorResponse(error);
  }
}
