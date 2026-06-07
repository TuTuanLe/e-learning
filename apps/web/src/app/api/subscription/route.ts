import { NextResponse } from "next/server";
import { requireAuthUser } from "@/server/auth/supabase-auth";
import { getSubscriptionSummary } from "@/server/billing/subscription-service";
import { toErrorResponse } from "@/server/http-error";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await requireAuthUser(request);
    return NextResponse.json(await getSubscriptionSummary(user.id));
  } catch (error) {
    return toErrorResponse(error);
  }
}
