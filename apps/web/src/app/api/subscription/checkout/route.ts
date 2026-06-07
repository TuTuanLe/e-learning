import type { CheckoutResponse, SubscriptionPlan } from "@dictation/contracts";
import { NextResponse } from "next/server";
import { requireAuthUser } from "@/server/auth/supabase-auth";
import { createPaymentOrder } from "@/server/billing/payment-order-service";
import { createSePayCheckoutFields } from "@/server/billing/sepay";
import {
  activateMockSubscription,
  getSubscriptionSummary
} from "@/server/billing/subscription-service";
import {
  getBillingMode,
  getPriceId,
  getStripe,
  isMockBillingEnabled
} from "@/server/billing/stripe";
import { ApiError, parseJsonBody, toErrorResponse } from "@/server/http-error";
import { prisma } from "@/server/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const user = await requireAuthUser(request);
    const body = await parseJsonBody(request);
    const plan = parsePlan(body);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;

    if (isMockBillingEnabled()) {
      await activateMockSubscription(user.id, plan);
      return NextResponse.json({
        url: `${appUrl}/pricing?checkout=mock-success&plan=${plan}`
      } satisfies CheckoutResponse);
    }

    const current = await getSubscriptionSummary(user.id);

    if (current.status === "ACTIVE") {
      throw new ApiError(409, "Bạn đã có gói đang hoạt động.");
    }

    if (getBillingMode() === "sepay") {
      const order = await createPaymentOrder({
        userId: user.id,
        userEmail: user.email,
        plan
      });
      const checkout = createSePayCheckoutFields({
        plan,
        invoiceNumber: order.invoiceNumber,
        userId: user.id,
        appUrl
      });

      return NextResponse.json({
        url: checkout.url,
        method: "POST",
        fields: checkout.fields,
        orderId: order.invoiceNumber
      } satisfies CheckoutResponse);
    }

    if (getBillingMode() !== "stripe") {
      throw new ApiError(503, "Thanh toán SePay chưa được cấu hình.");
    }

    const stripe = getStripe();
    const existing = await prisma.userSubscription.findUnique({
      where: { userId: user.id }
    });
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      client_reference_id: user.id,
      ...(existing?.stripeCustomerId
        ? { customer: existing.stripeCustomerId }
        : { customer_email: user.email }),
      line_items: [{ price: getPriceId(plan), quantity: 1 }],
      subscription_data: {
        metadata: { userId: user.id, plan }
      },
      metadata: { userId: user.id, plan },
      success_url: `${appUrl}/pricing?checkout=success`,
      cancel_url: `${appUrl}/pricing?checkout=canceled`,
      allow_promotion_codes: true
    });

    if (!session.url) throw new ApiError(502, "Stripe không trả về checkout URL.");
    return NextResponse.json({ url: session.url } satisfies CheckoutResponse);
  } catch (error) {
    return toErrorResponse(error);
  }
}

function parsePlan(body: unknown): SubscriptionPlan {
  const plan =
    typeof body === "object" && body !== null
      ? (body as Record<string, unknown>).plan
      : undefined;

  if (plan !== "MONTHLY" && plan !== "SIX_MONTH" && plan !== "LIFETIME") {
    throw new ApiError(400, "Gói học không hợp lệ.");
  }

  return plan;
}
