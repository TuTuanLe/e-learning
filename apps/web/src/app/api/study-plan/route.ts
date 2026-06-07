import { NextResponse } from "next/server";
import { requireAuthUser } from "@/server/auth/supabase-auth";
import { parseJsonBody, toErrorResponse } from "@/server/http-error";
import { studyPlanService } from "@/server/study-plan/study-plan-service";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await requireAuthUser(request);
    return NextResponse.json(await studyPlanService.list(user.id));
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuthUser(request);
    const body = await parseJsonBody(request);
    return NextResponse.json(await studyPlanService.generateOrUpdate(user.id, body));
  } catch (error) {
    return toErrorResponse(error);
  }
}
