// app/api/admin/notifications/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Notification id is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    await prisma.notification.delete({ where: { id } });
    return NextResponse.json({ ok: true }, { headers: corsHeaders });
  } catch (err: any) {
    // P2025 = record not found
    if (err?.code === "P2025") {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404, headers: corsHeaders }
      );
    }
    console.error("Admin notification delete error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete notification" },
      { status: 500, headers: corsHeaders }
    );
  }
}