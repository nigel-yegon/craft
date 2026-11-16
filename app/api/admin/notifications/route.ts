// app/api/admin/notifications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ⭐ GET — admin overview. businessId is OPTIONAL:
//     - ?limit=100            → all shops
//     - ?businessId=X&limit=50 → one shop
const querySchema = z.object({
  businessId: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(100),
});

// POST — publish a notification. businessId is REQUIRED (targets a shop).
const createSchema = z.object({
  businessId: z.string().min(1),
  type: z.enum(["subscription", "code", "alert", "backup", "system"]),
  title: z.string().min(1).max(120),
  body: z.string().max(2000).optional().default(""),
  actionRoute: z.string().max(200).nullable().optional(),
  payload: z.unknown().nullable().optional(),
});

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(req: NextRequest) {
  try {
    const params = {
      businessId: req.nextUrl.searchParams.get("businessId") ?? undefined,
      limit: req.nextUrl.searchParams.get("limit") ?? undefined,
    };

    const parsed = querySchema.safeParse(params);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid query", issues: parsed.error.issues },
        { status: 400, headers: corsHeaders }
      );
    }

    const { businessId, limit } = parsed.data;

    const rows = await prisma.notification.findMany({
      where: businessId ? { businessId } : undefined,
      take: limit,
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        businessId: true,
        type: true,
        title: true,
        body: true,
        actionRoute: true,
        payload: true,
        publishedAt: true,
      },
    });

    return NextResponse.json(
      rows.map((r) => ({ ...r, publishedAt: r.publishedAt.toISOString() })),
      { headers: corsHeaders }
    );
  } catch (err: any) {
    console.error("Admin notifications query error:", err);
    return NextResponse.json(
      { error: err.message ?? "Failed to list notifications" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid body", issues: parsed.error.issues },
        { status: 400, headers: corsHeaders }
      );
    }

    const { businessId, type, title, body: msg, actionRoute, payload } = parsed.data;

    const row = await prisma.notification.create({
      data: {
        businessId,
        type,
        title,
        body: msg ?? "",
        actionRoute: actionRoute ?? null,
        payload: payload ?? undefined,
        publishedAt: new Date(),
      },
      select: {
        id: true,
        businessId: true,
        type: true,
        title: true,
        body: true,
        actionRoute: true,
        payload: true,
        publishedAt: true,
      },
    });

    return NextResponse.json(
      { ...row, publishedAt: row.publishedAt.toISOString() },
      { status: 201, headers: corsHeaders }
    );
  } catch (err: any) {
    console.error("Admin notification publish error:", err);
    return NextResponse.json(
      { error: err.message ?? "Failed to publish notification" },
      { status: 500, headers: corsHeaders }
    );
  }
}