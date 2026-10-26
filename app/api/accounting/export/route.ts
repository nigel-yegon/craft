// app/api/accounting/export/route.ts
import { NextRequest } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { getAccountingSummary } from "@/app/admin/actions/accounting";

// ─── Route handler ────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!from || !to) {
    return Response.json({ error: "Missing from/to dates" }, { status: 400 });
  }

  try {
    const summary = await getAccountingSummary(from, to);
    const logo = await loadLogo();
    const pdf = await buildBrandedPdf(summary, logo);

    return new Response(pdf.buffer as ArrayBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="craft-accounting-${from}-to-${to}.pdf"`,
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

// ─── Logo loading ─────────────────────────────────────────────────
//
// Decodes the favicon to raw RGB so it can be embedded as a PDF
// image XObject. Cached across requests in a module-level variable
// so the decode runs at most once per cold start.

type LogoImage = {
  width: number;
  height: number;
  rgb: Uint8Array;
};

let cachedLogo: LogoImage | null | undefined;

async function loadLogo(): Promise<LogoImage | null> {
  if (cachedLogo !== undefined) return cachedLogo;

  try {
    // Resolve public/favicon.png relative to the project root.
    const filePath = path.join(process.cwd(), "public", "favicon.png");
    const buffer = await readFile(filePath);

    // Normalise: crop to square, resize to 128×128, remove alpha (PDF
    // base-14 image XObjects expect RGB, not RGBA — flatten onto white).
    const { data, info } = await sharp(buffer)
      .resize(128, 128, { fit: "cover" })
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    cachedLogo = {
      width: info.width,
      height: info.height,
      rgb: new Uint8Array(data),
    };
    return cachedLogo;
  } catch (err) {
    // Missing favicon or decode failure — the PDF renders without a logo.
    console.warn("[accounting/export] logo not embedded:", err);
    cachedLogo = null;
    return null;
  }
}

// ─── Types ────────────────────────────────────────────────────────

type AccountingSummaryData = Awaited<
  ReturnType<typeof getAccountingSummary>
>;

// ─── Brand palette (RGB 0..1) ─────────────────────────────────────

const C = {
  brand: [0.47, 0.53, 0.35] as const,
  brandDark: [0.35, 0.40, 0.27] as const,
  deep: [0.14, 0.15, 0.13] as const,
  cream: [0.957, 0.941, 0.906] as const,
  creamMuted: [0.918, 0.906, 0.871] as const,
  emerald: [0.13, 0.60, 0.40] as const,
  rose: [0.85, 0.28, 0.34] as const,
  amber: [0.85, 0.60, 0.15] as const,
  gray: [0.45, 0.45, 0.44] as const,
  white: [1, 1, 1] as const,
};

// ─── PdfPage ──────────────────────────────────────────────────────

class PdfPage {
  ops: string[] = [];
  readonly width = 595;
  readonly height = 842;
  readonly margin = 48;
  cursor: { y: number } = { y: 842 - 48 };

  private fill(rgb: readonly [number, number, number]) {
    this.ops.push(`${rgb[0]} ${rgb[1]} ${rgb[2]} rg`);
  }
  private stroke(rgb: readonly [number, number, number]) {
    this.ops.push(`${rgb[0]} ${rgb[1]} ${rgb[2]} RG`);
  }

  rect(x: number, y: number, w: number, h: number, rgb: readonly [number, number, number]) {
    this.fill(rgb);
    this.ops.push(`${x} ${y} ${w} ${h} re f`);
  }

  text(
    str: string,
    x: number,
    y: number,
    opts: { size?: number; font?: "regular" | "bold"; rgb?: readonly [number, number, number] } = {},
  ) {
    const { size = 10, font = "regular", rgb = C.deep } = opts;
    const fontKey = font === "bold" ? "/F2" : "/F1";
    this.fill(rgb);
    this.ops.push(
      `BT ${fontKey} ${size} Tf 1 0 0 1 ${x} ${y} Tm (${escapePdf(str)}) Tj ET`,
    );
  }

  textRight(
    str: string,
    rightX: number,
    y: number,
    opts: { size?: number; font?: "regular" | "bold"; rgb?: readonly [number, number, number] } = {},
  ) {
    const size = opts.size ?? 10;
    const width = str.length * size * 0.52;
    this.text(str, rightX - width, y, opts);
  }

  hr(y: number, rgb: readonly [number, number, number] = C.creamMuted) {
    this.stroke(rgb);
    this.ops.push(`0.5 w ${this.margin} ${y} m ${this.width - this.margin} ${y} l S`);
  }

  sectionHeading(y: number, label: string): number {
    this.rect(this.margin, y - 2, 3, 14, C.brand);
    this.text(label.toUpperCase(), this.margin + 10, y + 1, {
      size: 9,
      font: "bold",
      rgb: C.brandDark,
    });
    return y - 20;
  }

  /** Draw a pre-embedded image XObject by name (e.g. "/Logo") at x,y,size. */
  image(x: number, y: number, size: number) {
    this.ops.push(`q ${size} 0 0 ${size} ${x} ${y} cm /Logo Do Q`);
  }

  draw() {
    return this.ops.join("\n");
  }
}

// ─── High-level builder ──────────────────────────────────────────

async function buildBrandedPdf(
  summary: AccountingSummaryData,
  logo: LogoImage | null,
): Promise<Uint8Array> {
  const pages: PdfPage[] = [];
  let page = new PdfPage();
  pages.push(page);

  // ── HEADER BAND ─────────────────────────────────────────────
  const bandHeight = 70;
  page.rect(0, page.height - bandHeight, page.width, bandHeight, C.brand);

  // Logo — top-left inside the band, 36pt square with 12pt inset
  if (logo) {
    page.image(page.margin, page.height - bandHeight + 17, 36);
  }

  // Wordmark — shifted right if the logo is present
  const wordmarkX = logo ? page.margin + 46 : page.margin;
  page.text("CRAFT STUDIOS", wordmarkX, page.height - 32, {
    size: 16,
    font: "bold",
    rgb: C.cream,
  });
  page.text("Spaces. Systems. Experiences.", wordmarkX, page.height - 48, {
    size: 8,
    rgb: C.cream,
  });

  // Report meta (right)
  page.textRight("Accounting Report", page.width - page.margin, page.height - 30, {
    size: 12,
    font: "bold",
    rgb: C.cream,
  });
  page.textRight(
    `${summary.period.from}  →  ${summary.period.to}`,
    page.width - page.margin,
    page.height - 44,
    { size: 8, rgb: C.cream },
  );
  page.textRight(
    `Generated ${new Date().toISOString().slice(0, 10)}`,
    page.width - page.margin,
    page.height - 56,
    { size: 7, rgb: C.cream },
  );

  let y = page.height - bandHeight - 24;

  // ── EXECUTIVE SUMMARY ───────────────────────────────────────
  y = page.sectionHeading(y, "Executive summary");
  const boxH = 68;
  page.rect(page.margin, y - boxH, page.width - 2 * page.margin, boxH, C.cream);
  page.rect(page.margin, y - boxH, 4, boxH, C.brandDark);

  const revenue = summary.revenue.total;
  const expenses = summary.expenses.total;
  const profit = summary.profit.gross;
  const margin = summary.profit.margin;

  page.text("Revenue", page.margin + 16, y - 18, { size: 8, font: "bold", rgb: C.gray });
  page.text(`KES ${revenue.toLocaleString()}`, page.margin + 16, y - 34, {
    size: 14,
    font: "bold",
    rgb: C.emerald,
  });

  page.text("Expenses", page.margin + 170, y - 18, { size: 8, font: "bold", rgb: C.gray });
  page.text(`KES ${expenses.toLocaleString()}`, page.margin + 170, y - 34, {
    size: 14,
    font: "bold",
    rgb: C.rose,
  });

  page.text("Gross profit", page.margin + 324, y - 18, { size: 8, font: "bold", rgb: C.gray });
  page.text(`KES ${profit.toLocaleString()}`, page.margin + 324, y - 34, {
    size: 14,
    font: "bold",
    rgb: profit >= 0 ? C.emerald : C.rose,
  });

  page.text(
    `Margin: ${margin}%   ·   Net position: KES ${summary.balanceSheet.netPosition.toLocaleString()}`,
    page.margin + 16,
    y - 54,
    { size: 8, rgb: C.gray },
  );

  y -= boxH + 24;

  // ── CONTEXTUAL NOTE ─────────────────────────────────────────
  y = drawNote(
    page,
    y,
    summary.balanceSheet.netPosition >= 0
      ? "Positive cash position. Receivables exceed payables — collections are healthy for this period."
      : "Cash strain detected. Payables exceed receivables — consider accelerating outstanding invoice collection.",
    summary.balanceSheet.netPosition >= 0 ? "emerald" : "rose",
  );

  // ── BALANCE SHEET ───────────────────────────────────────────
  y = page.sectionHeading(y, "Balance sheet");
  y = drawRow(page, y, "Receivables (pending invoices)", `KES ${summary.balanceSheet.receivables.toLocaleString()}`, C.amber);
  y = drawRow(page, y, "Payables (pending expenses)", `KES ${summary.balanceSheet.payables.toLocaleString()}`, C.rose);
  y = drawRow(
    page,
    y,
    "Net position",
    `KES ${summary.balanceSheet.netPosition.toLocaleString()}`,
    summary.balanceSheet.netPosition >= 0 ? C.emerald : C.rose,
    true,
  );
  y -= 10;

  // ── REVENUE TABLE ───────────────────────────────────────────
  y = page.sectionHeading(y, `Revenue — ${summary.revenue.rows.length} paid invoices`);

  if (y < 100) {
    page = new PdfPage();
    pages.push(page);
    y = page.height - page.margin;
  }
  page.rect(page.margin, y - 14, page.width - 2 * page.margin, 18, C.creamMuted);
  page.text("INVOICE", page.margin + 6, y - 9, { size: 8, font: "bold", rgb: C.brandDark });
  page.text("CUSTOMER", page.margin + 90, y - 9, { size: 8, font: "bold", rgb: C.brandDark });
  page.text("PROJECT", page.margin + 260, y - 9, { size: 8, font: "bold", rgb: C.brandDark });
  page.textRight("AMOUNT", page.width - page.margin - 6, y - 9, { size: 8, font: "bold", rgb: C.brandDark });
  y -= 22;

  for (const r of summary.revenue.rows) {
    if (y < 80) {
      page = new PdfPage();
      pages.push(page);
      y = page.height - page.margin - 20;
      page.rect(page.margin, y - 14, page.width - 2 * page.margin, 18, C.creamMuted);
      page.text("INVOICE", page.margin + 6, y - 9, { size: 8, font: "bold", rgb: C.brandDark });
      page.text("CUSTOMER", page.margin + 90, y - 9, { size: 8, font: "bold", rgb: C.brandDark });
      page.text("PROJECT", page.margin + 260, y - 9, { size: 8, font: "bold", rgb: C.brandDark });
      page.textRight("AMOUNT", page.width - page.margin - 6, y - 9, { size: 8, font: "bold", rgb: C.brandDark });
      y -= 22;
    }
    page.text(r.invoiceNumber.slice(0, 14), page.margin + 6, y, { size: 9, font: "bold" });
    page.text(r.customerName.slice(0, 26), page.margin + 90, y, { size: 9 });
    page.text((r.projectTitle ?? "—").slice(0, 26), page.margin + 260, y, { size: 9, rgb: C.gray });
    page.textRight(`KES ${r.amount.toLocaleString()}`, page.width - page.margin - 6, y, { size: 9, font: "bold", rgb: C.emerald });
    y -= 16;
  }
  y -= 8;

  // ── EXPENSE TABLE ───────────────────────────────────────────
  y = page.sectionHeading(y, `Expenses — ${summary.expenses.rows.length} approved`);

  if (y < 100) {
    page = new PdfPage();
    pages.push(page);
    y = page.height - page.margin;
  }
  page.rect(page.margin, y - 14, page.width - 2 * page.margin, 18, C.creamMuted);
  page.text("REF", page.margin + 6, y - 9, { size: 8, font: "bold", rgb: C.brandDark });
  page.text("DESCRIPTION", page.margin + 70, y - 9, { size: 8, font: "bold", rgb: C.brandDark });
  page.text("CATEGORY", page.margin + 260, y - 9, { size: 8, font: "bold", rgb: C.brandDark });
  page.text("PROJECT", page.margin + 340, y - 9, { size: 8, font: "bold", rgb: C.brandDark });
  page.textRight("AMOUNT", page.width - page.margin - 6, y - 9, { size: 8, font: "bold", rgb: C.brandDark });
  y -= 22;

  for (const e of summary.expenses.rows) {
    if (y < 80) {
      page = new PdfPage();
      pages.push(page);
      y = page.height - page.margin - 20;
      page.rect(page.margin, y - 14, page.width - 2 * page.margin, 18, C.creamMuted);
      page.text("REF", page.margin + 6, y - 9, { size: 8, font: "bold", rgb: C.brandDark });
      page.text("DESCRIPTION", page.margin + 70, y - 9, { size: 8, font: "bold", rgb: C.brandDark });
      page.text("CATEGORY", page.margin + 260, y - 9, { size: 8, font: "bold", rgb: C.brandDark });
      page.text("PROJECT", page.margin + 340, y - 9, { size: 8, font: "bold", rgb: C.brandDark });
      page.textRight("AMOUNT", page.width - page.margin - 6, y - 9, { size: 8, font: "bold", rgb: C.brandDark });
      y -= 22;
    }
    page.text(e.reference.slice(0, 12), page.margin + 6, y, { size: 8, font: "bold" });
    page.text(e.description.slice(0, 36), page.margin + 70, y, { size: 9 });
    page.text(e.category.slice(0, 12), page.margin + 260, y, { size: 8, rgb: C.gray });
    page.text((e.projectTitle ?? "—").slice(0, 18), page.margin + 340, y, { size: 8, rgb: C.gray });
    page.textRight(`KES ${e.amount.toLocaleString()}`, page.width - page.margin - 6, y, { size: 9, font: "bold", rgb: C.rose });
    y -= 16;
  }
  y -= 8;

  // ── PROJECT PROFITABILITY ──────────────────────────────────
  const profitable = summary.projectProfitability.filter((p) => p.revenue > 0 || p.expenses > 0);
  if (profitable.length > 0) {
    if (y < 160) {
      page = new PdfPage();
      pages.push(page);
      y = page.height - page.margin;
    }
    y = page.sectionHeading(y, "Project profitability");
    page.rect(page.margin, y - 14, page.width - 2 * page.margin, 18, C.creamMuted);
    page.text("PROJECT", page.margin + 6, y - 9, { size: 8, font: "bold", rgb: C.brandDark });
    page.textRight("REVENUE", page.margin + 350, y - 9, { size: 8, font: "bold", rgb: C.brandDark });
    page.textRight("EXPENSES", page.margin + 440, y - 9, { size: 8, font: "bold", rgb: C.brandDark });
    page.textRight("PROFIT", page.width - page.margin - 6, y - 9, { size: 8, font: "bold", rgb: C.brandDark });
    y -= 22;

    for (const p of profitable) {
      if (y < 80) {
        page = new PdfPage();
        pages.push(page);
        y = page.height - page.margin - 20;
      }
      page.text(p.projectTitle.slice(0, 40), page.margin + 6, y, { size: 9 });
      page.textRight(`+${p.revenue.toLocaleString()}`, page.margin + 350, y, { size: 9, rgb: C.emerald });
      page.textRight(`−${p.expenses.toLocaleString()}`, page.margin + 440, y, { size: 9, rgb: C.rose });
      page.textRight(p.profit.toLocaleString(), page.width - page.margin - 6, y, {
        size: 9,
        font: "bold",
        rgb: p.profit >= 0 ? C.emerald : C.rose,
      });
      y -= 16;
    }
  }

  // ── FOOTER ─────────────────────────────────────────────────
  pages.forEach((p, i) => {
    p.hr(p.margin + 20, C.brand);
    p.text("Craft Studios · Accounting Report", p.margin, p.margin + 6, { size: 7, rgb: C.gray });
    p.textRight(`Page ${i + 1} of ${pages.length}`, p.width - p.margin, p.margin + 6, { size: 7, rgb: C.gray });
  });

  return assemblePdf(pages, logo);
}

// ─── Drawing helpers ─────────────────────────────────────────────

function drawRow(
  page: PdfPage,
  y: number,
  label: string,
  value: string,
  rgb: readonly [number, number, number],
  bold = false,
): number {
  page.text(label, page.margin + 4, y, { size: 10, font: bold ? "bold" : "regular" });
  page.textRight(value, page.width - page.margin - 4, y, { size: 10, font: "bold", rgb });
  return y - 18;
}

function drawNote(page: PdfPage, y: number, text: string, tone: "emerald" | "rose"): number {
  const accent = tone === "emerald" ? C.emerald : C.rose;
  const bg = C.cream;
  const h = 32;
  page.rect(page.margin, y - h, page.width - 2 * page.margin, h, bg);
  page.rect(page.margin, y - h, 4, h, accent);

  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    if ((current + " " + w).length > 95) {
      lines.push(current);
      current = w;
    } else {
      current = current ? current + " " + w : w;
    }
  }
  if (current) lines.push(current);

  lines.slice(0, 2).forEach((line, i) => {
    page.text(line, page.margin + 12, y - 14 - i * 11, { size: 9, rgb: C.deep });
  });

  return y - h - 12;
}

// ─── PDF assembly ────────────────────────────────────────────────

function assemblePdf(pages: PdfPage[], logo: LogoImage | null): Uint8Array {
  const objects: string[] = [];

  // Object numbering:
  //   1: font regular
  //   2: font bold
  //   3: image XObject (only if logo present)
  //   4: pages tree
  //   5..: page objects, then content streams
  //   last: catalog

  const fontRegular = 1;
  const fontBold = 2;
  const imageObj = logo ? 3 : null;
  const pagesTreeNumber = logo ? 4 : 3;

  let nextNumber = pagesTreeNumber + 1;

  const pageObjectNumbers: number[] = [];
  const contentObjectNumbers: number[] = [];

  for (const _ of pages) {
    pageObjectNumbers.push(nextNumber++);
    contentObjectNumbers.push(nextNumber++);
  }

  const catalogNumber = nextNumber++;

  // Font objects
  objects[fontRegular - 1] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`;
  objects[fontBold - 1] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>`;

  // Image XObject
  if (logo && imageObj) {
    // Stream is the raw RGB bytes; PDF wraps it in a stream with
    // /ColorSpace /DeviceRGB and /BitsPerComponent 8.
    const stream = new TextDecoder("latin1").decode(logo.rgb);
    objects[imageObj - 1] =
      `<< /Type /XObject /Subtype /Image /Width ${logo.width} /Height ${logo.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Length ${logo.rgb.length} >>\nstream\n${stream}\nendstream`;
  }

  // Pages tree
  objects[pagesTreeNumber - 1] = `<< /Type /Pages /Kids [${pageObjectNumbers
    .map((n) => `${n} 0 R`)
    .join(" ")}] /Count ${pages.length} >>`;

  // Page objects + content streams
  pages.forEach((p, i) => {
    const pageNum = pageObjectNumbers[i];
    const contentNum = contentObjectNumbers[i];
    const stream = p.draw();

    const xobjectEntry = logo
      ? `/XObject << /Logo ${imageObj} 0 R >>`
      : "";

    objects[pageNum - 1] =
      `<< /Type /Page /Parent ${pagesTreeNumber} 0 R /MediaBox [0 0 ${p.width} ${p.height}] /Resources << /Font << /F1 ${fontRegular} 0 R /F2 ${fontBold} 0 R >> ${xobjectEntry} >> /Contents ${contentNum} 0 R >>`;

    objects[contentNum - 1] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  });

  // Catalog
  objects[catalogNumber - 1] = `<< /Type /Catalog /Pages ${pagesTreeNumber} 0 R >>`;

  // Serialize with xref
  const header = `%PDF-1.4\n`;
  let body = "";
  const offsets: number[] = [];

  for (let i = 0; i < objects.length; i++) {
    offsets.push(header.length + body.length);
    body += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const xrefStart = header.length + body.length;
  const xrefLines = [
    "xref",
    `0 ${objects.length + 1}`,
    "0000000000 65535 f ",
    ...offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n `),
    "trailer",
    `<< /Size ${objects.length + 1} /Root ${catalogNumber} 0 R >>`,
    "startxref",
    String(xrefStart),
    "%%EOF",
  ];

  const xref = xrefLines.join("\n");
  // TextEncoder handles the ASCII wrapper; binary image bytes were
  // passed through latin1-safe TextDecoder above.
  return new TextEncoder().encode(header + body + xref);
}

function escapePdf(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}