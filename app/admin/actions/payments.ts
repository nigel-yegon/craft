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
  description: string | null;
  amount: number;
  status: string;
  dueDate: string | null;
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

export type PaymentsData = {
  invoices: InvoiceRow[];
  transactions: TransactionRow[];
};

// ─── M-Pesa OAuth ─────────────────────────────────────────────────

async function getMpesaToken(): Promise<string> {
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

// ─── Reads ────────────────────────────────────────────────────────

export async function listInvoices(): Promise<InvoiceRow[]> {
  const rows = await prisma.invoice.findMany({
    orderBy: { createdAt: "desc" },
    include: { transactions: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  return rows.map((r) => ({
    id: r.id,
    invoiceNumber: r.invoiceNumber,
    customerName: r.customerName,
    customerPhone: r.customerPhone,
    description: r.description,
    amount: r.amount,
    status: r.status,
    dueDate: r.dueDate?.toISOString() ?? null,
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

/**
 * Bundled read for the panel: returns both lists in one round-trip.
 * Use this when the server component passes initial data down, and
 * the client uses it for the "Refresh" button too.
 */
export async function getPaymentsData(): Promise<PaymentsData> {
  const [invoices, transactions] = await Promise.all([
    listInvoices(),
    listTransactions(),
  ]);
  return { invoices, transactions };
}

// ─── Writes ───────────────────────────────────────────────────────

export async function createInvoice(input: {
  customerName: string;
  customerPhone: string;
  description?: string;
  amount: number;
  dueDate?: string;
}) {
  let phone = input.customerPhone.replace(/[^\d]/g, "");
  if (phone.startsWith("0")) phone = `254${phone.slice(1)}`;
  if (phone.startsWith("7") || phone.startsWith("1")) phone = `254${phone}`;
  if (!phone.startsWith("254") || phone.length !== 12) {
    throw new Error(
      "Phone must be a Kenyan number (e.g. 0712345678 or 254712345678)",
    );
  }

  const count = await prisma.invoice.count();
  const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

  const inv = await prisma.invoice.create({
    data: {
      invoiceNumber,
      customerName: input.customerName,
      customerPhone: phone,
      description: input.description || null,
      amount: Math.ceil(input.amount),
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
    },
  });

  revalidatePath("/admin");
  return inv;
}

export async function deleteInvoice(id: number) {
  await prisma.invoice.delete({ where: { id } });
  revalidatePath("/admin");
}

export async function initiateStkPush(invoiceId: number) {
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

  const token = await getMpesaToken();
  const base =
    process.env.MPESA_ENVIRONMENT === "production"
      ? "https://api.safaricom.co.ke"
      : "https://sandbox.safaricom.co.ke";

  const timestamp = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 14);
  const password = Buffer.from(
    `${shortcode}${passkey}${timestamp}`,
  ).toString("base64");

  const res = await fetch(`${base}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerBuyGoodsOnline",
      Amount: invoice.amount,
      PartyA: invoice.customerPhone,
      PartyB: shortcode,
      PhoneNumber: invoice.customerPhone,
      CallBackURL: `${appUrl}/api/mpesa/callback`,
      AccountReference: invoice.invoiceNumber.slice(0, 12),
      TransactionDesc: "Invoice payment".slice(0, 13),
    }),
  });

  const data = (await res.json()) as {
    MerchantRequestID?: string;
    CheckoutRequestID?: string;
    errorMessage?: string;
  };
  if (!res.ok) throw new Error(data.errorMessage || "STK Push failed");

  const tx = await prisma.mpesaTransaction.create({
    data: {
      invoiceId: invoice.id,
      merchantRequestId: data.MerchantRequestID,
      checkoutRequestId: data.CheckoutRequestID,
      phoneNumber: invoice.customerPhone,
      amount: invoice.amount,
      status: "PENDING",
    },
  });

  revalidatePath("/admin");
  return {
    checkoutRequestId: data.CheckoutRequestID as string,
    transactionId: tx.id,
  };
}