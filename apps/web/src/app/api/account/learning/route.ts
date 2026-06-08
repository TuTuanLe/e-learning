import type { StudyPlanResponse, SubscriptionSummary } from "@dictation/contracts";
import { NextResponse } from "next/server";
import { requireAuthUser } from "@/server/auth/supabase-auth";
import { getSubscriptionSummary } from "@/server/billing/subscription-service";
import { toErrorResponse } from "@/server/http-error";
import { studyPlanService } from "@/server/study-plan/study-plan-service";

type LearningOverviewResponse = {
  subscription: SubscriptionSummary;
  studyPlans: StudyPlanResponse[];
};

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await requireAuthUser(request);
    const [subscription, { studyPlans }] = await Promise.all([
      getSubscriptionSummary(user.id),
      studyPlanService.list(user.id),
    ]);

    return NextResponse.json({
      subscription,
      studyPlans,
    } satisfies LearningOverviewResponse);
  } catch (error) {
    return toErrorResponse(error);
  }
}
