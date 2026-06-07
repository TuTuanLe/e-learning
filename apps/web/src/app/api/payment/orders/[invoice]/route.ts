import { NextResponse } from "next/server";
import { getPaymentOrderByInvoice } from "@/server/billing/payment-order-service";
import { toErrorResponse } from "@/server/http-error";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ invoice: string }> }
) {
  try {
    const { invoice } = await params;
    return NextResponse.json(await getPaymentOrderByInvoice(invoice));
  } catch (error) {
    return toErrorResponse(error);
  }
}
