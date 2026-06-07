import { NextResponse } from "next/server";
import { assertAdminUser } from "@/server/auth/admin";
import { requireAuthUser } from "@/server/auth/supabase-auth";
import { activatePaymentOrder } from "@/server/billing/payment-order-service";
import { toErrorResponse } from "@/server/http-error";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuthUser(request);
    assertAdminUser(user);
    const { id } = await params;
    return NextResponse.json(await activatePaymentOrder(id, user.email));
  } catch (error) {
    return toErrorResponse(error);
  }
}
