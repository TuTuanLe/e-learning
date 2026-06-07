ALTER TYPE "SubscriptionPlan" ADD VALUE IF NOT EXISTS 'LIFETIME';

CREATE TYPE "PaymentOrderStatus" AS ENUM (
  'PENDING',
  'PAID',
  'ACTIVATED',
  'CANCELED',
  'FAILED'
);

CREATE TABLE "payment_orders" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "userEmail" TEXT NOT NULL,
  "plan" "SubscriptionPlan" NOT NULL,
  "status" "PaymentOrderStatus" NOT NULL DEFAULT 'PENDING',
  "invoiceNumber" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'VND',
  "description" TEXT NOT NULL,
  "paymentMethod" TEXT NOT NULL DEFAULT 'BANK_TRANSFER',
  "activatedAt" TIMESTAMP(3),
  "activatedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "payment_orders_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "payment_orders_invoiceNumber_key" ON "payment_orders"("invoiceNumber");
CREATE INDEX "payment_orders_userId_createdAt_idx" ON "payment_orders"("userId", "createdAt");
CREATE INDEX "payment_orders_status_createdAt_idx" ON "payment_orders"("status", "createdAt");
