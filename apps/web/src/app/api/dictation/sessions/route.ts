import { NextResponse } from "next/server";
import { requireAuthUser } from "@/server/auth/supabase-auth";
import { dictationService } from "@/server/dictation/dictation-service";
import { parseJsonBody, toErrorResponse } from "@/server/http-error";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await requireAuthUser(request);
    const result = await dictationService.listSessions(user.id);

    return NextResponse.json(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuthUser(request);
    const body = await parseJsonBody(request);
    const result = await dictationService.createSession(user.id, body);

    return NextResponse.json(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
