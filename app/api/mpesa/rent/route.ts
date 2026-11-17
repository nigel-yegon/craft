// app/api/mpesa/rent/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const MPESA_BASE_URL = "https://api.safaricom.co.ke";
const CONSUMER_KEY = (process.env.MPESA_CONSUMER_KEY || "").trim();
const CONSUMER_SECRET = (process.env.MPESA_CONSUMER_SECRET || "").trim();
const PASSKEY = (process.env.MPESA_PASSKEY || "").trim();
const STORE_NUMBER = (process.env.MPESA_STORE_NUMBER || "").trim();
const TILL_NUMBER = (process.env.MPESA_TILL_NUMBER || "").trim();
const CALLBACK_URL = (process.env.MPESA_CALLBACK_URL || "").trim();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const bodySchema = z.object({
  phone: z.string().regex(/^254(7|1)\d{8}$/, "Phone must be 2547XXXXXXXX or 2541XXXXXXXX"),
  amount: z.number().int().positive(),
  tenantName: z.string().min(1),
  unitNumber: z.string().min(1),
  forMonth: z.string().regex(/^\d{4}-\d{2}$/, "forMonth must be YYYY-MM"),
});

async function getToken(): Promise<string> {
  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString("base64");
  const res = await fetch(`${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  if (!res.ok) throw new Error(`OAuth failed (${res.status}): ${await res.text()}`);
  return (await res.json()).access_token;
}

function eatTimestamp(): string {
  const now = new Date(Date.now() + 3 * 60 * 60 * 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${now.getUTCFullYear()}${p(now.getUTCMonth() + 1)}${p(now.getUTCDate())}${p(now.getUTCHours())}${p(now.getUTCMinutes())}${p(now.getUTCSeconds())}`;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid body", issues: parsed.error.issues },
        { status: 400, headers: corsHeaders }
      );
    }
    const { phone, amount, tenantName, unitNumber, forMonth } = parsed.data;

    // 1. Create the Invoice first so the transaction links to it
    const invoiceNumber = `RENT-${unitNumber}-${forMonth.replace("-", "")}-${Date.now().toString().slice(-6)}`;
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        customerName: tenantName,
        customerPhone: phone,
        description: `Rent for unit ${unitNumber} — ${forMonth}`,
        amount,
        status: "PENDING",
      },
    });

    // 2. Get token, build payload
    let token: string;
    try {
      token = await getToken();
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 502, headers: corsHeaders });
    }

    const timestamp = eatTimestamp();
    const password = Buffer.from(`${STORE_NUMBER}${PASSKEY}${timestamp}`).toString("base64");

    // AccountReference must be ≤12 chars
    const accountRef = `RNT${String(invoice.id).padStart(9, "0")}`.slice(0, 12);

    const payload = {
      BusinessShortCode: STORE_NUMBER,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerBuyGoodsOnline",
      Amount: amount,
      PartyA: phone,
      PartyB: TILL_NUMBER,
      PhoneNumber: phone,
      CallBackURL: CALLBACK_URL,
      AccountReference: accountRef,
      TransactionDesc: `Rent ${forMonth}`.slice(0, 13),
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);

    let darajaRes: Response;
    try {
      darajaRes = await fetch(`${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } catch (e: any) {
      clearTimeout(timeout);
      if (e.name === "AbortError") {
        return NextResponse.json({ error: "Safaricom timed out" }, { status: 504, headers: corsHeaders });
      }
      throw e;
    }
    clearTimeout(timeout);

    const data = await darajaRes.json();
    if (!darajaRes.ok || !data.CheckoutRequestID) {
      return NextResponse.json({ error: "STK rejected", detail: data }, { status: 502, headers: corsHeaders });
    }

    // 3. Persist the transaction linked to the invoice
    await prisma.mpesaTransaction.create({
      data: {
        invoiceId: invoice.id,
        checkoutRequestId: data.CheckoutRequestID,
        merchantRequestId: data.MerchantRequestID,
        phoneNumber: phone,
        amount,
        status: "PENDING",
        source: "rent",
      },
    });

    return NextResponse.json(
      {
        checkoutRequestId: data.CheckoutRequestID,
        invoiceId: invoice.id,
        invoiceNumber,
        customerMessage: data.CustomerMessage,
      },
      { headers: corsHeaders }
    );
  } catch (err: any) {
    console.error("Rent STK error:", err);
    return NextResponse.json({ error: err.message ?? "STK failed" }, { status: 500, headers: corsHeaders });
  }
}