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

// ─── M-Pesa OAuth ─────────────────────────────────────────────────

async function getMpesaToken(): Promise<string> {
  const key = process.env.MPESA_CONSUMER_KEY!;
  const secret = process.env.MPESA_CONSUMER_SECRET!;
  const base = process.env.MPESA_ENVIRONMENT === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

  const auth = Buffer.from(`${key}:${secret}`).toString("base64");
  const res = await fetch(`${base}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("M-Pesa OAuth failed");
  const data = await res.json();
  return data.access_token;
}

// ─── STK Push ────────────────────────────────────────────────────

export async function initiateStkPush(invoiceId: number) {
  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) throw new Error("Invoice not found");
  if (invoice.status === "PAID") throw new Error("Invoice already paid");

  const token = await getMpesaToken();
  const shortcode = process.env.MPESA_SHORTCODE!;
  const passkey = process.env.MPESA_PASSKEY!;
  const base = process.env.MPESA_ENVIRONMENT === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

  const timestamp = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 14);

  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");

  const payload = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerBuyGoodsOnline", // Till; use CustomerPayBillOnline for Paybill
    Amount: invoice.amount,
    PartyA: invoice.customerPhone,
    PartyB: shortcode,
    PhoneNumber: invoice.customerPhone,
    CallBackURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/mpesa/callback`,
    AccountReference: invoice.invoiceNumber.slice(0, 12), // max 12 chars
    TransactionDesc: "Invoice payment".slice(0, 13),       // max 13 chars
  };

  const res = await fetch(`${base}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.errorMessage || "STK Push failed");

  // Persist the pending transaction BEFORE responding — callback can arrive
  // before this request finishes serialising [citation:21].
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
  return { checkoutRequestId: data.CheckoutRequestID, transactionId: tx.id };
}

// ─── Invoice CRUD ────────────────────────────────────────────────

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

export async function createInvoice(input: {
  customerName: string;
  customerPhone: string;
  description?: string;
  amount: number;
  dueDate?: string;
}) {
  // Normalise phone: 07... -> 2547...
  let phone = input.customerPhone.replace(/[^\d]/g, "");
  if (phone.startsWith("0")) phone = `254${phone.slice(1)}`;
  if (!phone.startsWith("254")) throw new Error("Phone must be a Kenyan number");

  const count = await prisma.invoice.count();
  const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

  const inv = await prisma.invoice.create({
    data: {
      invoiceNumber,
      customerName: input.customerName,
      customerPhone: phone,
      description: input.description || null,
      amount: Math.ceil(input.amount), // M-Pesa rejects decimals [citation:21]
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

// ─── Transactions list ──────────────────────────────────────────

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