// app/api/mpesa/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type StkCallbackItem = { Name: string; Value: string | number };

type StkCallback = {
  MerchantRequestID?: string;
  CheckoutRequestID?: string;
  ResultCode?: number;
  ResultDesc?: string;
  CallbackMetadata?: { Item?: StkCallbackItem[] };
};

type CallbackBody = { Body?: { stkCallback?: StkCallback } };

export async function POST(req: NextRequest) {
  let body: CallbackBody;
  try {
    body = (await req.json()) as CallbackBody;
  } catch {
    // Malformed payload — ack anyway so Safaricom doesn't retry endlessly.
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }

  const callback = body?.Body?.stkCallback;
  if (!callback) {
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }

  const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = callback;

  // Extract the receipt and amount from metadata when the payment succeeded.
  let mpesaReceiptNumber: string | null = null;
  let amount: number | null = null;

  if (ResultCode === 0 && Array.isArray(CallbackMetadata?.Item)) {
    for (const item of CallbackMetadata.Item) {
      if (item.Name === "MpesaReceiptNumber") {
        mpesaReceiptNumber = String(item.Value);
      }
      if (item.Name === "Amount") {
        amount = Number(item.Value);
      }
    }
  }

  try {
    if (!CheckoutRequestID) {
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    // ── Idempotency guard ──────────────────────────────────────────
    // If this receipt already exists, a previous callback already settled
    // it. Return success and do nothing — Safaricom retries are expected.
    if (mpesaReceiptNumber) {
      const existing = await prisma.mpesaTransaction.findUnique({
        where: { mpesaReceiptNumber },
      });
      if (existing) {
        return NextResponse.json({ ResultCode: 0, ResultDesc: "Duplicate" });
      }
    }

    const tx = await prisma.mpesaTransaction.findUnique({
      where: { checkoutRequestId: CheckoutRequestID },
    });

    if (!tx) {
      // The pending row doesn't exist. This can happen if the callback
      // beat the initiation response to the database. Log it and ack —
      // reconciliation will catch it later.
      console.warn(
        `[mpesa] callback for unknown checkoutRequestId: ${CheckoutRequestID}`,
      );
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    const success = ResultCode === 0;

    await prisma.mpesaTransaction.update({
      where: { id: tx.id },
      data: {
        status: success ? "SUCCESS" : "FAILED",
        resultCode: String(ResultCode ?? ""),
        resultDesc: ResultDesc ?? "",
        mpesaReceiptNumber: mpesaReceiptNumber ?? undefined,
        amount: amount ?? tx.amount,
        rawCallback: body as object,
      },
    });

    // Cascade to the invoice when the payment succeeded.
    if (success && tx.invoiceId) {
      await prisma.invoice.update({
        where: { id: tx.invoiceId },
        data: { status: "PAID", paidAt: new Date() },
      });
    }
  } catch (err) {
    // Log, but still ack — a 500 here makes Safaricom retry the callback,
    // which will hit the same error. Reconciliation is the safety net.
    console.error("[mpesa] callback processing error:", err);
  }

  // Always 200. Safaricom treats non-2xx as a failure and retries.
  return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
}

export async function GET() {
  return NextResponse.json(
    { ok: false, error: "Use POST" },
    { status: 405 },
  );
}