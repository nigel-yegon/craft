// app/api/backups/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import { join } from "path";
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

    const backup = await prisma.businessBackup.findUnique({ where: { id } });
    if (!backup) {
      return NextResponse.json(
        { error: "Backup not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    // Try to delete the file (ignore if it's already gone)
    try {
      const filePath = join(
        process.cwd(),
        "uploads",
        "backups",
        backup.businessId,
        backup.filename
      );
      await unlink(filePath);
    } catch (e) {
      console.warn("File delete skipped:", e);
    }

    await prisma.businessBackup.delete({ where: { id } });

    return new NextResponse(null, { status: 204, headers: corsHeaders });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Delete failed" },
      { status: 500, headers: corsHeaders }
    );
  }
}