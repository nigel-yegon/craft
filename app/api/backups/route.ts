// app/api/backups/route.ts
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// GET — list backups for a business (used by the app + admin panel)
export async function GET(req: NextRequest) {
  try {
    const businessId = req.nextUrl.searchParams.get("businessId");
    if (!businessId) {
      return NextResponse.json(
        { error: "businessId required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const rows = await prisma.businessBackup.findMany({
      where: { businessId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(
      rows.map((r) => ({
        id: r.id,
        filename: r.filename,
        sizeBytes: r.sizeBytes,
        createdAt: r.createdAt.toISOString(),
        downloadUrl: `/api/backups/${r.id}/download`,
      })),
      { headers: corsHeaders }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

// POST — upload a .db file
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const businessId = form.get("businessId") as string | null;
    const file = form.get("file") as File | null;

    if (!businessId || !file) {
      return NextResponse.json(
        { error: "businessId and file are required" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large (max 100 MB)" },
        { status: 413, headers: corsHeaders }
      );
    }

    // Save the file to disk
    const uploadsDir = join(process.cwd(), "uploads", "backups", businessId);
    await mkdir(uploadsDir, { recursive: true });

    const fileId = randomUUID();
    const filename = `${fileId}.sqlite`;
    const filePath = join(uploadsDir, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // Save metadata to DB
    const backup = await prisma.businessBackup.create({
      data: {
        id: fileId,
        businessId,
        filename: filename,
        sizeBytes: file.size,
      },
    });

    return NextResponse.json(
      {
        id: backup.id,
        filename: backup.filename,
        sizeBytes: backup.sizeBytes,
        createdAt: backup.createdAt.toISOString(),
      },
      { status: 201, headers: corsHeaders }
    );
  } catch (err: any) {
    console.error("Backup upload error:", err);
    return NextResponse.json(
      { error: err.message ?? "Upload failed" },
      { status: 500, headers: corsHeaders }
    );
  }
}