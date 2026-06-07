import type { SubscriptionPlan } from "@dictation/contracts";

export type BillingPlanConfig = {
  id: SubscriptionPlan;
  label: string;
  amount: number;
  durationMonths: number | null;
  ai: boolean;
};

export const TRIAL_DAYS = 14;

export const billingPlans: Record<SubscriptionPlan, BillingPlanConfig> = {
  MONTHLY: {
    id: "MONTHLY",
    label: "1 tháng",
    amount: 49_000,
    durationMonths: 1,
    ai: false,
  },
  SIX_MONTH: {
    id: "SIX_MONTH",
    label: "6 tháng",
    amount: 249_000,
    durationMonths: 6,
    ai: true,
  },
  LIFETIME: {
    id: "LIFETIME",
    label: "Vĩnh viễn",
    amount: 599_000,
    durationMonths: null,
    ai: true,
  },
};

export function getBillingPlan(plan: SubscriptionPlan): BillingPlanConfig {
  return billingPlans[plan];
}

export function formatVnd(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
}
