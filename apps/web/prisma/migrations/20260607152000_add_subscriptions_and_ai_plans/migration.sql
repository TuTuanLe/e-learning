CREATE TYPE "SubscriptionPlan" AS ENUM ('MONTHLY', 'SIX_MONTH', 'ANNUAL');

CREATE TYPE "SubscriptionStatus" AS ENUM (
  'INCOMPLETE',
  'TRIALING',
  'ACTIVE',
  'PAST_DUE',
  'CANCELED',
  'UNPAID'
);

CREATE TABLE "user_subscriptions" (
  "id" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "stripeCustomerId" TEXT,
  "stripeSubscriptionId" TEXT,
  "stripePriceId" TEXT,
  "plan" "SubscriptionPlan" NOT NULL,
  "status" "SubscriptionStatus" NOT NULL DEFAULT 'INCOMPLETE',
  "currentPeriodStart" TIMESTAMP(3),
  "currentPeriodEnd" TIMESTAMP(3),
  "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "user_subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ai_study_plans" (
  "id" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "intake" JSONB NOT NULL,
  "plan" JSONB NOT NULL,
  "model" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ai_study_plans_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_subscriptions_userId_key"
  ON "user_subscriptions"("userId");
CREATE UNIQUE INDEX "user_subscriptions_stripeCustomerId_key"
  ON "user_subscriptions"("stripeCustomerId");
CREATE UNIQUE INDEX "user_subscriptions_stripeSubscriptionId_key"
  ON "user_subscriptions"("stripeSubscriptionId");
CREATE INDEX "user_subscriptions_status_currentPeriodEnd_idx"
  ON "user_subscriptions"("status", "currentPeriodEnd");
CREATE INDEX "ai_study_plans_userId_createdAt_idx"
  ON "ai_study_plans"("userId", "createdAt");
