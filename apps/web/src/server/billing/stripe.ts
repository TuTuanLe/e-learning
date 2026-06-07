import Stripe from "stripe";
import type { BillingMode, SubscriptionPlan } from "@dictation/contracts";
import { ApiError } from "@/server/http-error";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new ApiError(503, "Thanh toán chưa được cấu hình.");
  }

  stripeClient ??= new Stripe(secretKey, { typescript: true });
  return stripeClient;
}

export function getPriceId(plan: SubscriptionPlan): string {
  const priceIdByPlan: Record<SubscriptionPlan, string | undefined> = {
    MONTHLY: process.env.STRIPE_PRICE_MONTHLY,
    SIX_MONTH: process.env.STRIPE_PRICE_SIX_MONTH,
    LIFETIME: process.env.STRIPE_PRICE_LIFETIME
  };
  const priceId = priceIdByPlan[plan];

  if (!priceId) {
    throw new ApiError(503, "Gói học này chưa được cấu hình trên Stripe.");
  }

  return priceId;
}

export function planFromPriceId(priceId: string): SubscriptionPlan | null {
  if (priceId === process.env.STRIPE_PRICE_MONTHLY) return "MONTHLY";
  if (priceId === process.env.STRIPE_PRICE_SIX_MONTH) return "SIX_MONTH";
  if (priceId === process.env.STRIPE_PRICE_LIFETIME) return "LIFETIME";
  return null;
}

export function isBillingConfigured(): boolean {
  return getBillingMode() !== "unconfigured";
}

export function isMockBillingEnabled(): boolean {
  return getBillingMode() === "mock";
}

export function getBillingMode(): BillingMode {
  if (process.env.NODE_ENV !== "production" && process.env.BILLING_MODE === "mock") {
    return "mock";
  }

  const sepayConfigured = Boolean(process.env.SEPAY_MERCHANT_ID && process.env.SEPAY_SECRET_KEY);
  if (sepayConfigured) return "sepay";

  const stripeConfigured = Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_PRICE_MONTHLY &&
      process.env.STRIPE_PRICE_SIX_MONTH &&
      process.env.STRIPE_PRICE_LIFETIME
  );

  return stripeConfigured ? "stripe" : "unconfigured";
}
