// app/api/accounting/export/route.ts
import { NextRequest } from "next/server";
import { getAccountingSummary } from "@/app/admin/actions/accounting";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!from || !to) {
    return Response.json(
      { error: "Missing from/to dates" },
      { status: 400 },
    );
  }

  try {
    const summary = await getAccountingSummary(from, to);
    const pdf = generateSimplePdf(summary);

    return new Response(pdf.buffer as ArrayBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="accounting-${from}-to-${to}.pdf"`,
      },
    });
  } catch (err) {
    console.error("[accounting/export] failed:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Export failed" },
      { status: 500 },
    );
  }
}

// ─── PDF generation ───────────────────────────────────────────────

type AccountingSummaryData = Awaited<
  ReturnType<typeof getAccountingSummary>
>;

function generateSimplePdf(
  summary: AccountingSummaryData,
): Uint8Array<ArrayBuffer> {
  const lines: string[] = [
    "CRAFT STUDIOS",
    "Accounting Report",
    "",
    `Period: ${summary.period.from} to ${summary.period.to}`,
    "",
    "─── Revenue ───────────────────────────────────────",
    `  Revenue (paid invoices):  KES ${summary.revenue.total.toLocaleString()}`,
    `  Expenses (approved):      KES ${summary.expenses.total.toLocaleString()}`,
    `  Gross profit:             KES ${summary.profit.gross.toLocaleString()} (${summary.profit.margin}%)`,
    "",
    "─── Balance sheet ─────────────────────────────────",
    `  Receivables (pending invoices):  KES ${summary.balanceSheet.receivables.toLocaleString()}`,
    `  Payables (pending expenses):     KES ${summary.balanceSheet.payables.toLocaleString()}`,
    `  Net position:                    KES ${summary.balanceSheet.netPosition.toLocaleString()}`,
    "",
    "─── Revenue rows ──────────────────────────────────",
    ...summary.revenue.rows.map(
      (r) =>
        `  ${r.invoiceNumber.padEnd(16)} ${r.customerName.slice(0, 28).padEnd(30)} KES ${r.amount.toLocaleString().padStart(12)} ${r.paidAt.slice(0, 10)}`,
    ),
    "",
    "─── Expense rows ──────────────────────────────────",
    ...summary.expenses.rows.map(
      (e) =>
        `  ${e.reference.padEnd(14)} ${e.category.slice(0, 12).padEnd(14)} KES ${e.amount.toLocaleString().padStart(10)} ${e.incurredAt.slice(0, 10)}`,
    ),
    "",
    "─── Project profitability ─────────────────────────",
    ...summary.projectProfitability
      .filter((p) => p.revenue > 0 || p.expenses > 0)
      .map(
        (p) =>
          `  ${p.projectTitle.slice(0, 34).padEnd(36)} +${p.revenue.toLocaleString().padStart(10)} −${p.expenses.toLocaleString().padStart(10)} = ${p.profit.toLocaleString().padStart(10)}`,
      ),
  ];

  const content = lines
    .map(
      (line, i) =>
        `BT /F1 9 Tf 40 ${752 - i * 12} Td (${escapePdf(line)}) Tj ET`,
    )
    .join("\n");

  const objects = [
    `1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj`,
    `2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj`,
    `3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj`,
    `4 0 obj << /Length ${content.length} >> stream\n${content}\nendstream endobj`,
    `5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Courier >> endobj`,
  ];

  const header = `%PDF-1.4\n`;
  const body = objects.join("\n");
  const xref = `\nxref\n0 6\n0000000000 65535 f \n${objects
    .map((_, i) => `${String(10 + i * 70).padStart(10, "0")} 00000 n `)
    .join("\n")}\ntrailer << /Size 6 /Root 1 0 R >>\nstartxref\n0\n%%EOF`;

  // TextEncoder.encode returns Uint8Array<ArrayBuffer> in modern libs,
  // but the explicit return type annotation keeps it narrow regardless.
  return new TextEncoder().encode(header + body + xref);
}

function escapePdf(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}