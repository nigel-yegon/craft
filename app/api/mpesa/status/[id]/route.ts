import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", 
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

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

  if (!tx) {
    return NextResponse.json({ error: "not found" }, { status: 404, headers: corsHeaders });
  }

  return NextResponse.json(
    {
      status: tx.status,
      receipt: tx.mpesaReceiptNumber,
      resultCode: tx.resultCode,
      resultDesc: tx.resultDesc,
      amount: tx.amount,
    },
    { headers: corsHeaders }
  );
}