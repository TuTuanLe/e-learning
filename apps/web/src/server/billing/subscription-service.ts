import type {
  SubscriptionEntitlements,
  SubscriptionPlan,
  SubscriptionStatus,
  SubscriptionSummary
} from "@dictation/contracts";
import type {
  SubscriptionPlan as PrismaSubscriptionPlan,
  SubscriptionStatus as PrismaSubscriptionStatus
} from "@prisma/client";
import type Stripe from "stripe";
import { ApiError } from "@/server/http-error";
import { prisma } from "@/server/prisma";
import { getBillingPlan, TRIAL_DAYS } from "./plans";
import { getBillingMode, isBillingConfigured, planFromPriceId } from "./stripe";

const FREE_UNIT_IDS = new Set(["hsk-1-greetings", "hsk-1-daily"]);
const ACTIVE_STATUSES = new Set<PrismaSubscriptionStatus>(["ACTIVE", "TRIALING"]);

export async function getSubscriptionSummary(userId: string): Promise<SubscriptionSummary> {
  const subscription =
    await prisma.userSubscription.findUnique({ where: { userId } }) ??
    await createTrialSubscription(userId);

  if (!subscription) {
    return {
      plan: null,
      status: "NONE",
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      entitlements: entitlementsFor(null, false),
      billingConfigured: isBillingConfigured(),
      billingMode: getBillingMode()
    };
  }

  const active =
    ACTIVE_STATUSES.has(subscription.status) &&
    (!subscription.currentPeriodEnd || subscription.currentPeriodEnd > new Date());

  return {
    plan: normalizePlan(subscription.plan),
    status: subscription.status as SubscriptionStatus,
    currentPeriodEnd: subscription.currentPeriodEnd,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    entitlements: entitlementsFor(normalizePlan(subscription.plan), active),
    billingConfigured: isBillingConfigured(),
    billingMode: getBillingMode()
  };
}

export async function activateMockSubscription(
  userId: string,
  plan: SubscriptionPlan
): Promise<SubscriptionSummary> {
  if (process.env.NODE_ENV === "production") {
    throw new ApiError(403, "Mock billing không khả dụng trong production.");
  }

  const currentPeriodStart = new Date();
  const currentPeriodEnd = periodEndForPlan(currentPeriodStart, plan);

  await prisma.userSubscription.upsert({
    where: { userId },
    create: {
      userId,
      plan: plan as PrismaSubscriptionPlan,
      status: "ACTIVE",
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: false
    },
    update: {
      plan: plan as PrismaSubscriptionPlan,
      status: "ACTIVE",
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: false
    }
  });

  return getSubscriptionSummary(userId);
}

export async function activateSubscriptionForUser(
  userId: string,
  plan: SubscriptionPlan
): Promise<void> {
  const currentPeriodStart = new Date();
  const currentPeriodEnd = periodEndForPlan(currentPeriodStart, plan);

  await prisma.userSubscription.upsert({
    where: { userId },
    create: {
      userId,
      plan: plan as PrismaSubscriptionPlan,
      status: "ACTIVE",
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: false
    },
    update: {
      plan: plan as PrismaSubscriptionPlan,
      status: "ACTIVE",
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: false
    }
  });
}

export async function assertUnitAccess(userId: string, unitId: string): Promise<void> {
  if (FREE_UNIT_IDS.has(unitId)) return;

  const subscription = await getSubscriptionSummary(userId);

  if (!subscription.entitlements.fullCatalog) {
    throw new ApiError(402, "Bài học này cần một gói Hanzi Flow đang hoạt động.");
  }
}

export async function assertAiPlannerAccess(userId: string): Promise<void> {
  const subscription = await getSubscriptionSummary(userId);

  if (!subscription.entitlements.aiStudyPlan) {
    throw new ApiError(403, "Lộ trình AI chỉ có trong gói 6 tháng và vĩnh viễn.");
  }
}

export async function syncStripeSubscription(subscription: Stripe.Subscription): Promise<void> {
  const item = subscription.items.data[0];
  const priceId = item?.price.id;
  const plan = priceId ? planFromPriceId(priceId) : null;
  const userId = subscription.metadata.userId;

  if (!plan || !userId) {
    throw new ApiError(400, "Stripe subscription thiếu metadata Hanzi Flow.");
  }

  await prisma.userSubscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeCustomerId: getStripeId(subscription.customer),
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      plan: plan as PrismaSubscriptionPlan,
      status: toPrismaStatus(subscription.status),
      currentPeriodStart: item ? fromUnix(item.current_period_start) : null,
      currentPeriodEnd: item ? fromUnix(item.current_period_end) : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    },
    update: {
      stripeCustomerId: getStripeId(subscription.customer),
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      plan: plan as PrismaSubscriptionPlan,
      status: toPrismaStatus(subscription.status),
      currentPeriodStart: item ? fromUnix(item.current_period_start) : null,
      currentPeriodEnd: item ? fromUnix(item.current_period_end) : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    }
  });
}

function entitlementsFor(
  plan: SubscriptionPlan | null,
  active: boolean
): SubscriptionEntitlements {
  const personalized = active && (plan === "SIX_MONTH" || plan === "LIFETIME");

  return {
    fullCatalog: active,
    aiStudyPlan: personalized,
    customTopics: personalized,
    monthlyPlanReview: personalized
  };
}

function toPrismaStatus(status: Stripe.Subscription.Status): PrismaSubscriptionStatus {
  switch (status) {
    case "active":
      return "ACTIVE";
    case "trialing":
      return "TRIALING";
    case "past_due":
      return "PAST_DUE";
    case "unpaid":
      return "UNPAID";
    case "canceled":
    case "incomplete_expired":
      return "CANCELED";
    default:
      return "INCOMPLETE";
  }
}

function getStripeId(value: string | { id: string }): string {
  return typeof value === "string" ? value : value.id;
}

function fromUnix(value: number): Date {
  return new Date(value * 1000);
}

async function createTrialSubscription(userId: string) {
  const currentPeriodStart = new Date();
  const currentPeriodEnd = new Date(currentPeriodStart);
  currentPeriodEnd.setUTCDate(currentPeriodEnd.getUTCDate() + TRIAL_DAYS);

  return prisma.userSubscription.create({
    data: {
      userId,
      plan: "MONTHLY",
      status: "TRIALING",
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: false
    }
  });
}

function periodEndForPlan(date: Date, plan: SubscriptionPlan): Date | null {
  const durationMonths = getBillingPlan(plan).durationMonths;
  return durationMonths === null ? null : addMonths(date, durationMonths);
}

function normalizePlan(plan: PrismaSubscriptionPlan): SubscriptionPlan {
  return plan === "ANNUAL" ? "LIFETIME" : plan;
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  const day = result.getUTCDate();
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + months);
  const lastDayOfTargetMonth = new Date(
    Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)
  ).getUTCDate();
  result.setUTCDate(Math.min(day, lastDayOfTargetMonth));
  return result;
}
