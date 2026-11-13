// app/admin/actions/transactions.ts
"use server";

import { prisma } from "@/lib/prisma";

export type MpesaTransactionRow = {
  id: number;
  checkoutRequestId: string | null;
  receipt: string | null;
  phone: string;
  amount: number;
  plan: string | null;
  source: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  resultDesc: string | null;
};

export async function listTransactions(): Promise<MpesaTransactionRow[]> {
  const transactions = await prisma.mpesaTransaction.findMany({
    // No where clause: fetch ALL transactions
    orderBy: {
      createdAt: "desc",
    },
  });

  return transactions.map((tx) => ({
    id: tx.id,
    checkoutRequestId: tx.checkoutRequestId,
    receipt: tx.mpesaReceiptNumber,
    phone: tx.phoneNumber,
    amount: tx.amount,
    plan: tx.subscriptionPlan,
    source: tx.source || "invoice", // fallback for older rows
    status: tx.status,
    createdAt: tx.createdAt,
    updatedAt: tx.updatedAt,
    resultDesc: tx.resultDesc,
  }));
}