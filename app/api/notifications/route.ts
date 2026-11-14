// app/api/notifications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const querySchema = z.object({
  businessId: z.string().min(1, "businessId is required"),
  since: z.string().datetime().optional(),
});

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(req: NextRequest) {
  try {
    const params = {
      businessId: req.nextUrl.searchParams.get("businessId") ?? undefined,
      since: req.nextUrl.searchParams.get("since") ?? undefined,
    };

    const parsed = querySchema.safeParse(params);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid query", issues: parsed.error.issues },
        { status: 400, headers: corsHeaders }
      );
    }

    const { businessId, since } = parsed.data;

    const rows = await prisma.notification.findMany({
      where: {
        businessId,
        ...(since ? { publishedAt: { gt: new Date(since) } } : {}),
      },
      orderBy: { publishedAt: "desc" },
      take: 100,
      select: {
        id: true,
        type: true,
        title: true,
        body: true,
        actionRoute: true,
        payload: true,
        publishedAt: true,
      },
    });

    return NextResponse.json(
      rows.map((r) => ({
        id: r.id,
        type: r.type,
        title: r.title,
        body: r.body,
        actionRoute: r.actionRoute ?? null,
        payload: r.payload ?? null,
        publishedAt: r.publishedAt.toISOString(),
      })),
      { headers: corsHeaders }
    );
  } catch (err: any) {
    console.error("Notifications query error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load notifications" },
      { status: 500, headers: corsHeaders }
    );
  }
}