// app/api/contact/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json(
      { errors: ["Invalid request body."] },
      { status: 400 },
    );
  }

  const errors: string[] = [];
  if (!body.name || String(body.name).trim().length < 2) {
    errors.push("Please enter your name.");
  }
  if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    errors.push("Please enter a valid email address.");
  }
  if (!body.message || String(body.message).trim().length < 10) {
    errors.push("Please add a short message (at least 10 characters).");
  }

  if (errors.length) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  // TODO: send via Resend / Postmark / SMTP here.
  console.log("[contact]", body);

  return NextResponse.json({ ok: true }, { status: 202 });
}