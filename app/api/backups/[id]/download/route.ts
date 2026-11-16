// app/api/backups/[id]/download/route.ts
import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { prisma } from "@/lib/prisma";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(
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

    const filePath = join(
      process.cwd(),
      "uploads",
      "backups",
      backup.businessId,
      backup.filename
    );

    const file = await readFile(filePath);

    return new NextResponse(file, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${backup.filename}"`,
        "Content-Length": String(file.length),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Download failed" },
      { status: 500, headers: corsHeaders }
    );
  }
}
