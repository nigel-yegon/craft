import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const tx = await prisma.mpesaTransaction.findUnique({
    where: { checkoutRequestId: id },
    select: {
      status: true,
      mpesaReceiptNumber: true,
      resultCode: true,
      resultDesc: true,
      amount: true,
    },
  });

  if (!tx) return NextResponse.json({ error: "not found" }, { status: 404 });

  return NextResponse.json({
    status: tx.status,
    receipt: tx.mpesaReceiptNumber,
    resultCode: tx.resultCode,
    resultDesc: tx.resultDesc,
    amount: tx.amount,
  });
}