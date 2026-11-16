// app/api/businesses/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const registerSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(120),
  phone: z.string().max(40).nullable().optional(),
  email: z.string().email().nullable().optional(),
});

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid body", issues: parsed.error.issues },
        { status: 400, headers: corsHeaders }
      );
    }

    const { id, name, phone, email } = parsed.data;

    // Upsert — if the app re-registers (e.g. after restore), update instead of failing
    const business = await prisma.business.upsert({
      where: { id },
      create: {
        id,
        name,
        phone: phone ?? null,
        email: email ?? null,
      },
      update: {
        name,
        phone: phone ?? null,
        email: email ?? null,
      },
    });

    return NextResponse.json(
      {
        id: business.id,
        name: business.name,
        createdAt: business.createdAt.toISOString(),
      },
      { status: 201, headers: corsHeaders }
    );
  } catch (err: any) {
    console.error("Business registration error:", err);
    return NextResponse.json(
      { error: err.message ?? "Registration failed" },
      { status: 500, headers: corsHeaders }
    );
  }
}