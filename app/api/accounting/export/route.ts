// app/api/accounting/export/route.ts
import { NextRequest } from "next/server";
import { getAccountingSummary } from "@/app/admin/actions/accounting";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!from || !to) {
    return Response.json({ error: "Missing from/to dates" }, { status: 400 });
  }

  const summary = await getAccountingSummary(from, to);

  // Build a minimal PDF using raw PDF syntax (no dependencies).
  // For production, swap this for @formepdf/next or a PDF API.
  const pdf = generateSimplePdf(summary);

  return new Response(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="accounting-${from}-to-${to}.pdf"`,
    },
  });
}

/**
 * Minimal PDF generator — no external dependencies.
 * Produces a single-page summary suitable for quick exports.
 * For branded, multi-page reports, replace with @formepdf/next
 * (works on Vercel, no Puppeteer) [citation:2].
 */
function generateSimplePdf(summary: ReturnType<typeof getAccountingSummary> extends Promise<infer T> ? T : never): Uint8Array {
  const lines = [
    `Accounting Report`,
    `Period: ${summary.period.from} to ${summary.period.to}`,
    ``,
    `Revenue (paid invoices): KES ${summary.revenue.total.toLocaleString()}`,
    `Expenses (approved): KES ${summary.expenses.total.toLocaleString()}`,
    `Gross profit: KES ${summary.profit.gross.toLocaleString()} (${summary.profit.margin}%)`,
    ``,
    `Balance sheet:`,
    `  Receivables (pending invoices): KES ${summary.balanceSheet.receivables.toLocaleString()}`,
    `  Payables (pending expenses): KES ${summary.balanceSheet.payables.toLocaleString()}`,
    `  Net position: KES ${summary.balanceSheet.netPosition.toLocaleString()}`,
    ``,
    `Revenue rows:`,
    ...summary.revenue.rows.map(
      (r) => `  ${r.invoiceNumber} | ${r.customerName} | KES ${r.amount.toLocaleString()} | ${r.paidAt.slice(0, 10)}`,
    ),
    ``,
    `Expense rows:`,
    ...summary.expenses.rows.map(
      (e) => `  ${e.reference} | ${e.category} | KES ${e.amount.toLocaleString()} | ${e.incurredAt.slice(0, 10)}`,
    ),
  ];

  const content = lines
    .map((line, i) => `BT /F1 10 Tf 50 ${750 - i * 14} Td (${escapePdf(line)}) Tj ET`)
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
  const xref = `\nxref\n0 6\n0000000000 65535 f \n${objects.map((_, i) => `${String(10 + i * 70).padStart(10, "0")} 00000 n `).join("\n")}\ntrailer << /Size 6 /Root 1 0 R >>\nstartxref\n0\n%%EOF`;

  return new TextEncoder().encode(header + body + xref);
}

function escapePdf(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}