// app/api/rent/invoices/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }
  const inv = await prisma.rentInvoice.findUnique({
    where: { id: numericId },
  });
  if (!inv) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json(inv);
}