// app/pay/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";

type Invoice = {
  id: number;
  unitNumber: string;
  propertyName: string;
  tenantName: string;
  tenantPhone: string;
  amount: number;
  forMonth: string;
  status: string;
  dueDate: string;
};

export default function PayPage({ params }: { params: { id: string } }) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("PENDING");
  const [receipt, setReceipt] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/rent/invoices/${params.id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.statusText)))
      .then(setInvoice)
      .catch((e) => setError(String(e)));
  }, [params.id]);

  // Poll status once STK Push is sent
  useEffect(() => {
    if (!checkoutId) return;
    if (status === "SUCCESS" || status === "FAILED" || status === "TIMEOUT") return;
    const timer = setInterval(async () => {
      const res = await fetch(`/api/mpesa/status/${checkoutId}`);
      if (!res.ok) return;
      const data = await res.json();
      setStatus(data.status);
      if (data.receipt) setReceipt(data.receipt);
    }, 3000);
    return () => clearInterval(timer);
  }, [checkoutId, status]);

  async function pay() {
    if (!invoice) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/mpesa/rent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          phone: invoice.tenantPhone,
          amount: invoice.amount,
          tenantName: invoice.tenantName,
          unitNumber: invoice.unitNumber,
          forMonth: invoice.forMonth,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setCheckoutId(data.checkoutRequestId);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (!invoice) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md items-center justify-center p-6">
        <p className="text-sm text-gray-500">
          {error ? `Error: ${error}` : "Loading invoice…"}
        </p>
      </main>
    );
  }

  const monthLabel = new Date(invoice.forMonth + "-01").toLocaleDateString(
    "en-KE",
    { month: "long", year: "numeric" }
  );

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 p-6">
      <div className="w-full rounded-lg border border-gray-200 p-6 shadow-sm">
        <h1 className="text-lg font-semibold">Rent Invoice</h1>
        <p className="text-xs text-gray-500">{invoice.propertyName}</p>

        <div className="mt-4 space-y-2 text-sm">
          <Row label="Unit" value={invoice.unitNumber} />
          <Row label="Tenant" value={invoice.tenantName} />
          <Row label="Month" value={monthLabel} />
          <Row label="Amount" value={`KES ${invoice.amount.toLocaleString()}`} bold />
        </div>

        {status === "PENDING" && !checkoutId && (
          <button
            onClick={pay}
            disabled={loading}
            className="mt-6 w-full rounded-md bg-green-600 px-4 py-3 font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Sending request…" : "Pay with M-Pesa"}
          </button>
        )}

        {status === "PENDING" && checkoutId && (
          <div className="mt-6 rounded-md bg-yellow-50 p-3 text-center text-sm text-yellow-800">
            Check your phone ({invoice.tenantPhone}) and enter your M-Pesa PIN.
            <div className="mt-2 h-1 w-full overflow-hidden rounded bg-yellow-200">
              <div className="h-full w-1/2 animate-pulse rounded bg-yellow-600" />
            </div>
          </div>
        )}

        {status === "SUCCESS" && (
          <div className="mt-6 rounded-md bg-green-50 p-4 text-center">
            <p className="font-semibold text-green-800">Payment received ✓</p>
            {receipt && (
              <p className="mt-1 text-xs text-green-700">
                Receipt: {receipt}
              </p>
            )}
          </div>
        )}

        {(status === "FAILED" || status === "TIMEOUT") && (
          <div className="mt-6 rounded-md bg-red-50 p-4 text-center text-sm text-red-800">
            Payment {status.toLowerCase()}. Please try again.
            <button
              onClick={() => {
                setCheckoutId(null);
                setStatus("PENDING");
                setReceipt(null);
              }}
              className="mt-3 w-full rounded bg-red-600 px-4 py-2 font-medium text-white"
            >
              Retry
            </button>
          </div>
        )}

        {error && (
          <p className="mt-4 text-xs text-red-600">Error: {error}</p>
        )}
      </div>

      <p className="text-center text-xs text-gray-400">
        Powered by Craft · Spectrum
      </p>
    </main>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className={bold ? "font-semibold" : ""}>{value}</span>
    </div>
  );
}