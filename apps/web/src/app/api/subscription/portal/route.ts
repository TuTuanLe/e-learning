import { NextResponse } from "next/server";
import { requireAuthUser } from "@/server/auth/supabase-auth";
import { getStripe, isMockBillingEnabled } from "@/server/billing/stripe";
import { ApiError, toErrorResponse } from "@/server/http-error";
import { prisma } from "@/server/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const user = await requireAuthUser(request);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;

    if (isMockBillingEnabled()) {
      return NextResponse.json({ url: `${appUrl}/pricing?billing=mock` });
    }

    const subscription = await prisma.userSubscription.findUnique({
      where: { userId: user.id }
    });

    if (!subscription?.stripeCustomerId) {
      throw new ApiError(404, "Chưa tìm thấy hồ sơ thanh toán.");
    }

    const session = await getStripe().billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${appUrl}/pricing`
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return toErrorResponse(error);
  }
}
