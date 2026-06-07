import { NextResponse } from "next/server";
import { requireAuthUser } from "@/server/auth/supabase-auth";
import { dictationService } from "@/server/dictation/dictation-service";
import { ApiError, toErrorResponse } from "@/server/http-error";

type RouteContext = {
  params: Promise<{ hskLevel: string; lessonId: string }>;
};

export const runtime = "nodejs";

export async function POST(request: Request, context: RouteContext) {
  try {
    const user = await requireAuthUser(request);
    const { hskLevel: rawLevel, lessonId } = await context.params;
    const hskLevel = Number(rawLevel);

    if (!Number.isInteger(hskLevel) || hskLevel < 1 || hskLevel > 6) {
      throw new ApiError(400, "Cấp HSK không hợp lệ.");
    }

    return NextResponse.json(
      await dictationService.createStudyPlanSession(user.id, hskLevel, lessonId)
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}
