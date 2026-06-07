import { SePayPgClient } from "sepay-pg-node";
import type { SubscriptionPlan } from "@dictation/contracts";
import { ApiError } from "@/server/http-error";
import { getBillingPlan } from "./plans";

let client: SePayPgClient | null = null;

export function getSePayClient(): SePayPgClient {
  const merchantId = process.env.SEPAY_MERCHANT_ID;
  const secretKey = process.env.SEPAY_SECRET_KEY;

  if (!merchantId || !secretKey) {
    throw new ApiError(503, "SePay chưa được cấu hình.");
  }

  client ??= new SePayPgClient({
    env: process.env.SEPAY_ENV === "production" ? "production" : "sandbox",
    merchant_id: merchantId,
    secret_key: secretKey
  });

  return client;
}

export function createSePayCheckoutFields({
  plan,
  invoiceNumber,
  userId,
  appUrl
}: {
  plan: SubscriptionPlan;
  invoiceNumber: string;
  userId: string;
  appUrl: string;
}): { url: string; fields: Record<string, string> } {
  const planConfig = getBillingPlan(plan);
  const sepay = getSePayClient();
  const resultUrl = process.env.SEPAY_CHECKOUT_RESULT_URL;
  const fields = sepay.checkout.initOneTimePaymentFields({
    operation: "PURCHASE",
    payment_method: "BANK_TRANSFER",
    order_invoice_number: invoiceNumber,
    order_amount: planConfig.amount,
    currency: "VND",
    order_description: `Hanzi Flow ${planConfig.label} ${invoiceNumber}`,
    customer_id: userId,
    custom_data: JSON.stringify({ userId, plan }),
    success_url: resultUrl
      ? withCheckoutResult(resultUrl, invoiceNumber, "success")
      : `${appUrl}/payment/success?order=${invoiceNumber}`,
    error_url: resultUrl
      ? withCheckoutResult(resultUrl, invoiceNumber, "error")
      : `${appUrl}/payment/error?order=${invoiceNumber}`,
    cancel_url: resultUrl
      ? withCheckoutResult(resultUrl, invoiceNumber, "cancel")
      : `${appUrl}/pricing?payment=cancel&order=${invoiceNumber}`
  });

  return {
    url: sepay.checkout.initCheckoutUrl(),
    fields: Object.fromEntries(
      Object.entries(fields).map(([key, value]) => [key, String(value)])
    )
  };
}

function withCheckoutResult(
  baseUrl: string,
  invoiceNumber: string,
  payment: "success" | "error" | "cancel"
): string {
  const url = new URL(baseUrl);
  url.searchParams.set("order", invoiceNumber);
  url.searchParams.set("payment", payment);
  return url.toString();
}
