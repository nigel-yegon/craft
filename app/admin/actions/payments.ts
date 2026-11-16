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
  quoteId: number | null;
  description: string | null;
  mpesaReceipt: string | null;   // ⭐ NEW
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

  let res: Response;
  try {
    res = await fetch(
      `${base}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: { Authorization: `Basic ${auth}` },
        cache: "no-store",
        signal: AbortSignal.timeout(15_000),
      },
    );
  } catch (err: any) {
    if (err.name === "TimeoutError" || err.name === "AbortError") {
      throw new Error(
        "M-Pesa OAuth timed out after 15s — check network/VPS connectivity to Safaricom",
      );
    }
    throw new Error(`M-Pesa OAuth network error: ${err.message}`);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`M-Pesa OAuth failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

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

function getTillNumber(): string {
  const till = process.env.MPESA_TILL_NUMBER;
  if (!till) {
    throw new Error(
      "MPESA_TILL_NUMBER not configured. For Buy Goods, set it to your till number (e.g. 9090113).",
    );
  }
  return till;
}

// ─── STK Push (Buy Goods) ─────────────────────────────────────────

export async function sendPaymentPrompt(invoiceId: number) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
  });
  if (!invoice) throw new Error("Invoice not found");
  if (invoice.status === "PAID") throw new Error("Invoice already paid");

  const tillNumber = getTillNumber();
  const passkey = process.env.MPESA_PASSKEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!passkey) {
    throw new Error("MPESA_PASSKEY not configured");
  }
  if (!appUrl) {
    throw new Error(
      "NEXT_PUBLIC_APP_URL is not set — required for M-Pesa callback",
    );
  }

  const cleanAppUrl = appUrl.trim().replace(/\/+$/, "");
  if (!cleanAppUrl.startsWith("https://")) {
    throw new Error(
      `M-Pesa callback URL must use HTTPS. Got: ${cleanAppUrl}`,
    );
  }
  if (cleanAppUrl.includes("localhost") || cleanAppUrl.includes("127.0.0.1")) {
    throw new Error(
      `M-Pesa callback URL cannot be localhost. Got: ${cleanAppUrl}`,
    );
  }

  const callbackUrl = `${cleanAppUrl}/api/mpesa/callback`;
  console.log("M-Pesa STK Push — Till:", tillNumber, "Callback:", callbackUrl);

  const timestamp = new Date(Date.now() + 3 * 60 * 60 * 1000)
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 14);

  const password = Buffer.from(
    `${tillNumber}${passkey}${timestamp}`,
  ).toString("base64");

  const token = await getToken();
  const base =
    process.env.MPESA_ENVIRONMENT === "production"
      ? "https://api.safaricom.co.ke"
      : "https://sandbox.safaricom.co.ke";

  const payload = {
    BusinessShortCode: tillNumber,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerBuyGoodsOnline",
    Amount: invoice.amount,
    PartyA: invoice.customerPhone,
    PartyB: tillNumber,
    PhoneNumber: invoice.customerPhone,
    CallBackURL: callbackUrl,
    AccountReference: invoice.invoiceNumber.slice(0, 12),
    TransactionDesc: "Invoice payment".slice(0, 13),
  };

  console.log("M-Pesa STK Push — payload:", JSON.stringify(payload, null, 2));

  let res: Response;
  try {
    res = await fetch(`${base}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30_000),
    });
  } catch (err: any) {
    if (err.name === "TimeoutError" || err.name === "AbortError") {
      console.error("M-Pesa STK Push — request timed out after 30s");
      throw new Error(
        "M-Pesa request timed out — Safaricom API is not responding. Retry or check if the till is active.",
      );
    }
    console.error("M-Pesa STK Push — network error:", err.name, err.message);
    throw new Error(`M-Pesa network error: ${err.message}`);
  }

  let data: {
    MerchantRequestID?: string;
    CheckoutRequestID?: string;
    errorMessage?: string;
    errorCode?: string;
  };
  try {
    data = await res.json();
  } catch (err: any) {
    console.error(
      "M-Pesa STK Push — could not parse JSON response:",
      err.message,
    );
    throw new Error(`M-Pesa returned non-JSON response (HTTP ${res.status})`);
  }

  if (!res.ok) {
    console.error(
      "M-Pesa STK Push failed — status:",
      res.status,
      "response:",
      JSON.stringify(data, null, 2),
    );
    throw new Error(
      data.errorMessage || `STK failed: ${res.status} ${JSON.stringify(data)}`,
    );
  }

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

// ─── Reconciliation ──────────────────────────────────────────────

export async function queryStkStatus(checkoutRequestId: string) {
  const token = await getToken();
  const tillNumber = getTillNumber();
  const passkey = process.env.MPESA_PASSKEY;

  if (!passkey) {
    throw new Error("MPESA_PASSKEY not configured");
  }

  const base =
    process.env.MPESA_ENVIRONMENT === "production"
      ? "https://api.safaricom.co.ke"
      : "https://sandbox.safaricom.co.ke";

  const timestamp = new Date(Date.now() + 3 * 60 * 60 * 1000)
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 14);
  const password = Buffer.from(`${tillNumber}${passkey}${timestamp}`).toString(
    "base64",
  );

  let res: Response;
  try {
    res = await fetch(`${base}/mpesa/stkpushquery/v1/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: tillNumber,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
      }),
      signal: AbortSignal.timeout(15_000),
    });
  } catch (err: any) {
    if (err.name === "TimeoutError" || err.name === "AbortError") {
      return { status: "UNKNOWN" as const, message: "Status query timed out" };
    }
    return {
      status: "UNKNOWN" as const,
      message: `Network error: ${err.message}`,
    };
  }

  const data = (await res.json()) as {
    ResultCode?: string;
    ResultDesc?: string;
    errorMessage?: string;
  };

  if (!res.ok) {
    return {
      status: "UNKNOWN" as const,
      message: data.errorMessage ?? "Query failed",
    };
  }

  if (data.ResultCode === "0") return { status: "SUCCESS" as const };
  if (data.ResultCode === "1032" || data.ResultCode === "1037") {
    return { status: "FAILED" as const, message: data.ResultDesc };
  }
  return { status: "PENDING" as const, message: data.ResultDesc };
}

export async function reconcileInvoice(invoiceId: number) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      transactions: {
        where: { status: "PENDING" },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
  if (!invoice) throw new Error("Invoice not found");
  if (invoice.status === "PAID") return { status: "PAID" as const };

  const tx = invoice.transactions[0];
  if (!tx?.checkoutRequestId) {
    return { status: "NO_PENDING" as const };
  }

  const result = await queryStkStatus(tx.checkoutRequestId);

  if (result.status === "SUCCESS") {
    await prisma.mpesaTransaction.update({
      where: { id: tx.id },
      data: {
        status: "SUCCESS",
        resultCode: "0",
        resultDesc: result.message ?? "Reconciled via query",
      },
    });
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: "PAID", paidAt: new Date() },
    });
    revalidatePath("/admin");
    return { status: "PAID" as const };
  }

  if (result.status === "FAILED") {
    await prisma.mpesaTransaction.update({
      where: { id: tx.id },
      data: {
        status: "FAILED",
        resultCode: "1032",
        resultDesc: result.message ?? "Failed (reconciled)",
      },
    });
    revalidatePath("/admin");
    return { status: "FAILED" as const, message: result.message };
  }

  return { status: "PENDING" as const };
}

// ─── Reads ────────────────────────────────────────────────────────

export async function listInvoices(): Promise<InvoiceRow[]> {
  const rows = await prisma.invoice.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { mpesaReceiptNumber: true },
      },
    },
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
    quoteId: r.quoteId,
    description: r.description,
    mpesaReceipt: r.transactions[0]?.mpesaReceiptNumber ?? null,
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
  customerEmail?: string;
  amount: number;
  description?: string;
  quoteId?: number;
}) {
  let phone = input.customerPhone.replace(/[^\d]/g, "");
  if (phone.startsWith("0")) phone = `254${phone.slice(1)}`;
  if (phone.startsWith("7") || phone.startsWith("1")) phone = `254${phone}`;
  if (!phone.startsWith("254") || phone.length !== 12) {
    throw new Error(
      "Phone must be a Kenyan number (e.g. 0712345678 or 254712345678)",
    );
  }

  for (let attempt = 0; attempt < 2; attempt++) {
    const invoiceNumber = await nextInvoiceNumber();
    try {
      const inv = await prisma.invoice.create({
        data: {
          invoiceNumber,
          customerName: input.customerName,
          customerPhone: phone,
          customerEmail: input.customerEmail ?? null,
          description: input.description ?? null,
          amount: Math.ceil(input.amount),
          quoteId: input.quoteId ?? null,
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

  throw new Error("Failed to allocate a unique invoice number");
}

// ⭐ NEW — update the note (stored in Invoice.description)
export async function updateInvoiceNote(
  invoiceId: number,
  note: string | null,
): Promise<void> {
  const cleaned = note?.trim();
  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { description: cleaned && cleaned.length > 0 ? cleaned : null },
  });
  revalidatePath("/admin");
}

export async function deleteInvoice(id: number) {
  await prisma.invoice.delete({ where: { id } });
  revalidatePath("/admin");
}