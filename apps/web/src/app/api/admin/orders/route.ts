import { NextResponse } from "next/server";
import { assertAdminUser } from "@/server/auth/admin";
import { requireAuthUser } from "@/server/auth/supabase-auth";
import { listPaymentOrders } from "@/server/billing/payment-order-service";
import { toErrorResponse } from "@/server/http-error";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await requireAuthUser(request);
    assertAdminUser(user);
    return NextResponse.json(await listPaymentOrders());
  } catch (error) {
    return toErrorResponse(error);
  }
}
