// app/api/admin/businesses/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  try {
    const rows = await prisma.business.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
      { headers: corsHeaders }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Failed to list businesses" },
      { status: 500, headers: corsHeaders }
    );
  }
}