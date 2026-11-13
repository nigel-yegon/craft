import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const MPESA_BASE_URL = "https://api.safaricom.co.ke";
const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY!;
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET!;
const PASSKEY = process.env.MPESA_PASSKEY!;
const SHORTCODE = process.env.MPESA_SHORTCODE!;
const CALLBACK_URL = process.env.MPESA_CALLBACK_URL!;

const bodySchema = z.object({
  phone: z.string().regex(/^254(7|1)\d{8}$/, "Phone must be 2547XXXXXXXX"),
  amount: z.number().int().positive(),
  plan: z.enum(["weekly", "monthly", "yearly"]),
});

async function getToken(): Promise<string> {
  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString("base64");
  const res = await fetch(
    `${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
    { headers: { Authorization: `Basic ${auth}` } }
  );
  if (!res.ok) throw new Error(`OAuth failed: ${res.status}`);
  const data = await res.json();
  return data.access_token;
}

function eatTimestamp(): string {
  const now = new Date(Date.now() + 3 * 60 * 60 * 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${now.getUTCFullYear()}${p(now.getUTCMonth() + 1)}${p(now.getUTCDate())}${p(now.getUTCHours())}${p(now.getUTCMinutes())}${p(now.getUTCSeconds())}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid body", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { phone, amount, plan } = parsed.data;
    const token = await getToken();
    const timestamp = eatTimestamp();
    const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString("base64");

    const darajaRes = await fetch(
      `${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          BusinessShortCode: SHORTCODE,
          Password: password,
          Timestamp: timestamp,
          TransactionType: "CustomerPayBillOnline",
          Amount: amount,
          PartyA: phone,
          PartyB: SHORTCODE,
          PhoneNumber: phone,
          CallBackURL: CALLBACK_URL,
          AccountReference: `SUB-${plan.toUpperCase()}`.slice(0, 12),
          TransactionDesc: `${plan} plan`.slice(0, 13),
        }),
      }
    );

    const data = await darajaRes.json();

    if (!darajaRes.ok || !data.CheckoutRequestID) {
      return NextResponse.json(
        { error: "STK Push rejected", detail: data },
        { status: 502 }
      );
    }

    await prisma.mpesaTransaction.create({
      data: {
        checkoutRequestId: data.CheckoutRequestID,
        merchantRequestId: data.MerchantRequestID,
        phoneNumber: phone,
        amount,
        status: "PENDING",
        // If you added source/subscriptionPlan columns:
        // source: "subscription",
        // subscriptionPlan: plan,
      },
    });

    return NextResponse.json({
      checkoutRequestId: data.CheckoutRequestID,
      customerMessage: data.CustomerMessage,
    });
  } catch (err) {
    console.error("STK Push error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "STK Push failed" },
      { status: 500 }
    );
  }
}