import type {
  PaymentOrderListResponse,
  PaymentOrderResponse,
  SubscriptionPlan
} from "@dictation/contracts";
import type { PaymentOrder, SubscriptionPlan as PrismaSubscriptionPlan } from "@prisma/client";
import { ApiError } from "@/server/http-error";
import { prisma } from "@/server/prisma";
import { getBillingPlan } from "./plans";
import { activateSubscriptionForUser } from "./subscription-service";

export async function createPaymentOrder({
  userId,
  userEmail,
  plan
}: {
  userId: string;
  userEmail: string;
  plan: SubscriptionPlan;
}): Promise<PaymentOrderResponse> {
  const planConfig = getBillingPlan(plan);
  const invoiceNumber = `HF${Date.now().toString(36).toUpperCase()}${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;

  const order = await prisma.paymentOrder.create({
    data: {
      userId,
      userEmail,
      plan: plan as PrismaSubscriptionPlan,
      invoiceNumber,
      amount: planConfig.amount,
      description: `Hanzi Flow ${planConfig.label}`
    }
  });

  return toPaymentOrderResponse(order);
}

export async function getPaymentOrderByInvoice(
  invoiceNumber: string
): Promise<PaymentOrderResponse> {
  const order = await prisma.paymentOrder.findUnique({ where: { invoiceNumber } });
  if (!order) throw new ApiError(404, "Không tìm thấy đơn thanh toán.");
  return toPaymentOrderResponse(order);
}

export async function listPaymentOrders(): Promise<PaymentOrderListResponse> {
  const orders = await prisma.paymentOrder.findMany({
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return { orders: orders.map(toPaymentOrderResponse) };
}

export async function activatePaymentOrder(
  orderId: string,
  adminEmail: string
): Promise<PaymentOrderResponse> {
  const order = await prisma.paymentOrder.findUnique({ where: { id: orderId } });
  if (!order) throw new ApiError(404, "Không tìm thấy đơn thanh toán.");
  if (order.status === "ACTIVATED") return toPaymentOrderResponse(order);

  await activateSubscriptionForUser(order.userId, normalizePlan(order.plan));
  const updated = await prisma.paymentOrder.update({
    where: { id: order.id },
    data: {
      status: "ACTIVATED",
      activatedAt: new Date(),
      activatedBy: adminEmail
    }
  });

  return toPaymentOrderResponse(updated);
}

function toPaymentOrderResponse(order: PaymentOrder): PaymentOrderResponse {
  return {
    id: order.id,
    userId: order.userId,
    userEmail: order.userEmail,
    plan: normalizePlan(order.plan),
    status: order.status,
    invoiceNumber: order.invoiceNumber,
    amount: order.amount,
    currency: order.currency,
    description: order.description,
    paymentMethod: order.paymentMethod,
    activatedAt: order.activatedAt,
    activatedBy: order.activatedBy,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt
  };
}

function normalizePlan(plan: PrismaSubscriptionPlan): SubscriptionPlan {
  return plan === "ANNUAL" ? "LIFETIME" : plan;
}
