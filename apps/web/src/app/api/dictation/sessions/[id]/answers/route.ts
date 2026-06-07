import { NextResponse } from "next/server";
import { requireAuthUser } from "@/server/auth/supabase-auth";
import { dictationService } from "@/server/dictation/dictation-service";
import { parseJsonBody, toErrorResponse } from "@/server/http-error";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const runtime = "nodejs";

export async function POST(request: Request, context: RouteContext) {
  try {
    const user = await requireAuthUser(request);
    const { id } = await context.params;
    const body = await parseJsonBody(request);
    const result = await dictationService.submitAnswer(user.id, id, body);

    return NextResponse.json(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
