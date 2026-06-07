import { NextResponse } from "next/server";
import { requireAuthUser } from "@/server/auth/supabase-auth";
import { dictationService } from "@/server/dictation/dictation-service";
import { toErrorResponse } from "@/server/http-error";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const runtime = "nodejs";

export async function GET(request: Request, context: RouteContext) {
  try {
    const user = await requireAuthUser(request);
    const { id } = await context.params;
    const result = await dictationService.getSession(user.id, id);

    return NextResponse.json(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
