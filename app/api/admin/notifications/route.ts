// app/api/notifications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const querySchema = z.object({
  businessId: z.string().min(1, "businessId is required"),
  since: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(100),
});

type NotificationRow = {
  id: string;
  type: string;
  title: string;
  body: string;
  actionRoute: string | null;
  payload: unknown;
  publishedAt: Date;
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(req: NextRequest) {
  try {
    const params = {
      businessId: req.nextUrl.searchParams.get("businessId") ?? undefined,
      since: req.nextUrl.searchParams.get("since") ?? undefined,
      limit: req.nextUrl.searchParams.get("limit") ?? undefined,
    };

    const parsed = querySchema.safeParse(params);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid query", issues: parsed.error.issues },
        { status: 400, headers: corsHeaders }
      );
    }

    const { businessId, since, limit } = parsed.data;

    const rows = await prisma.notification.findMany({
      where: {
        businessId,
        ...(since ? { publishedAt: { gt: new Date(since) } } : {}),
      },
      orderBy: { publishedAt: "desc" },
      take: limit,
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
      (rows as NotificationRow[]).map((r: NotificationRow) => ({
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