// app/admin/actions/payments.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ─── Types ────────────────────────────────────────────────────────

export type InvoiceRow = {
  id: number;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  status: string;
  paidAt: string | null;
  createdAt: string;
};

export type TransactionRow = {
  id: number;
  invoiceId: number | null;
  checkoutRequestId: string | null;
  mpesaReceiptNumber: string | null;
  phoneNumber: string;
  amount: number;
  status: string;
  resultCode: string | null;
  resultDesc: string | null;
  createdAt: string;
};

// ─── Helpers ──────────────────────────────────────────────────────

async function getToken(): Promise<string> {
  const key = process.env.MPESA_CONSUMER_KEY;
  const secret = process.env.MPESA_CONSUMER_SECRET;

  if (!key || !secret) {
    throw new Error(
      "M-Pesa credentials not configured (MPESA_CONSUMER_KEY / MPESA_CONSUMER_SECRET)",
    );
  }

  const base =
    process.env.MPESA_ENVIRONMENT === "production"
      ? "https://api.safaricom.co.ke"
      : "https://sandbox.safaricom.co.ke";

  const auth = Buffer.from(`${key}:${secret}`).toString("base64");
  const res = await fetch(
    `${base}/oauth/v1/generate?grant_type=client_credentials`,
    { headers: { Authorization: `Basic ${auth}` }, cache: "no-store" },
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`M-Pesa OAuth failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

/**
 * Generate the next invoice number for the current year.
 * Uses the highest existing number rather than a row count — this is
 * safe against deletions and gaps, and matches the `INV-YYYY-NNNN` format.
 */
async function nextInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;

  const last = await prisma.invoice.findFirst({
    where: { invoiceNumber: { startsWith: prefix } },
    orderBy: { invoiceNumber: "desc" },
    select: { invoiceNumber: true },
  });

  const seq = last
    ? parseInt(last.invoiceNumber.slice(prefix.length), 10) + 1
    : 1;

  return `${prefix}${String(seq).padStart(4, "0")}`;
}

function isUniqueConstraintError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === "P2002"
  );
}

// ─── STK Push (Paybill) ───────────────────────────────────────────

export async function sendPaymentPrompt(invoiceId: number) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
  });
  if (!invoice) throw new Error("Invoice not found");
  if (invoice.status === "PAID") throw new Error("Invoice already paid");

  const shortcode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!shortcode || !passkey) {
    throw new Error("M-Pesa shortcode/passkey not configured");
  }
  if (!appUrl) {
    throw new Error(
      "NEXT_PUBLIC_APP_URL is not set — required for M-Pesa callback",
    );
  }

  // Daraja expects EAT (UTC+3), 14 digits, no separators
  const timestamp = new Date(Date.now() + 3 * 60 * 60 * 1000)
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 14);

  const password = Buffer.from(
    `${shortcode}${passkey}${timestamp}`,
  ).toString("base64");

  const token = await getToken();
  const base =
    process.env.MPESA_ENVIRONMENT === "production"
      ? "https://api.safaricom.co.ke"
      : "https://sandbox.safaricom.co.ke";

  // PAYBILL: TransactionType MUST be CustomerPayBillOnline
  const payload = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: invoice.amount,
    PartyA: invoice.customerPhone,
    PartyB: shortcode,
    PhoneNumber: invoice.customerPhone,
    CallBackURL: `${appUrl}/api/mpesa/callback`,
    AccountReference: invoice.invoiceNumber.slice(0, 12),
    TransactionDesc: "Invoice payment".slice(0, 13),
  };

  const res = await fetch(`${base}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await res.json()) as {
    MerchantRequestID?: string;
    CheckoutRequestID?: string;
    errorMessage?: string;
  };

  if (!res.ok) {
    throw new Error(data.errorMessage || `STK failed: ${res.status}`);
  }

  // Persist BEFORE responding — callback can arrive fast
  await prisma.mpesaTransaction.create({
    data: {
      invoiceId: invoice.id,
      checkoutRequestId: data.CheckoutRequestID,
      phoneNumber: invoice.customerPhone,
      amount: invoice.amount,
      status: "PENDING",
    },
  });

  revalidatePath("/admin");
  return { checkoutRequestId: data.CheckoutRequestID as string };
}

// ─── Reads ────────────────────────────────────────────────────────

export async function listInvoices(): Promise<InvoiceRow[]> {
  const rows = await prisma.invoice.findMany({
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    invoiceNumber: r.invoiceNumber,
    customerName: r.customerName,
    customerPhone: r.customerPhone,
    amount: r.amount,
    status: r.status,
    paidAt: r.paidAt?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function listTransactions(): Promise<TransactionRow[]> {
  const rows = await prisma.mpesaTransaction.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return rows.map((r) => ({
    id: r.id,
    invoiceId: r.invoiceId,
    checkoutRequestId: r.checkoutRequestId,
    mpesaReceiptNumber: r.mpesaReceiptNumber,
    phoneNumber: r.phoneNumber,
    amount: r.amount,
    status: r.status,
    resultCode: r.resultCode,
    resultDesc: r.resultDesc,
    createdAt: r.createdAt.toISOString(),
  }));
}

// ─── Writes ───────────────────────────────────────────────────────

export async function createInvoice(input: {
  customerName: string;
  customerPhone: string;
  amount: number;
}) {
  let phone = input.customerPhone.replace(/[^\d]/g, "");
  if (phone.startsWith("0")) phone = `254${phone.slice(1)}`;
  if (phone.startsWith("7") || phone.startsWith("1")) phone = `254${phone}`;
  if (!phone.startsWith("254") || phone.length !== 12) {
    throw new Error(
      "Phone must be a Kenyan number (e.g. 0712345678 or 254712345678)",
    );
  }

  // Try to create; if we collide on the unique invoice number, retry once
  // with a freshly computed number (covers the rare concurrent-create race).
  for (let attempt = 0; attempt < 2; attempt++) {
    const invoiceNumber = await nextInvoiceNumber();
    try {
      const inv = await prisma.invoice.create({
        data: {
          invoiceNumber,
          customerName: input.customerName,
          customerPhone: phone,
          amount: Math.ceil(input.amount),
        },
      });
      revalidatePath("/admin");
      return inv;
    } catch (err) {
      if (isUniqueConstraintError(err) && attempt === 0) {
        continue;
      }
      throw err;
    }
  }

  // Unreachable — the loop either returns or throws
  throw new Error("Failed to allocate a unique invoice number");
}

export async function deleteInvoice(id: number) {
  await prisma.invoice.delete({ where: { id } });
  revalidatePath("/admin");
}
