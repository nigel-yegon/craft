import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  // Respond within 5s so Safaricom doesn't retry
  const response = NextResponse.json({ ResultCode: 0, ResultDesc: "Success" });

  try {
    const body = await req.json();
    const stk = body?.Body?.stkCallback;
    if (!stk?.CheckoutRequestID) return response;

    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stk;
    const items: Array<{ Name: string; Value: any }> =
      CallbackMetadata?.Item ?? [];
    const receipt = items.find((i) => i.Name === "MpesaReceiptNumber")?.Value;

    const status =
      ResultCode === 0
        ? "SUCCESS"
        : ResultCode === 1037
          ? "TIMEOUT"
          : "FAILED";

    // Use updateMany so a missing row doesn't throw 500
    await prisma.mpesaTransaction.updateMany({
      where: { checkoutRequestId: CheckoutRequestID },
      data: {
        status,
        mpesaReceiptNumber: receipt ?? null,
        resultCode: String(ResultCode),
        resultDesc: String(ResultDesc ?? ""),
        rawCallback: body,
      },
    });
  } catch (err) {
    console.error("Callback error:", err);
  }

  return response;
}