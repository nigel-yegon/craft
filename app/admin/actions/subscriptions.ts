// app/admin/actions/subscriptions.ts
"use server";

import { prisma } from "@/lib/prisma";

export type SubscriptionRow = {
  id: number;
  checkoutRequestId: string | null;
  receipt: string | null;
  phone: string;
  amount: number;
  plan: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  resultDesc: string | null;
};

export async function listSubscriptions(): Promise<SubscriptionRow[]> {
  const transactions = await prisma.mpesaTransaction.findMany({
    where: {
      source: "subscription",
    },
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
    status: tx.status,
    createdAt: tx.createdAt,
    updatedAt: tx.updatedAt,
    resultDesc: tx.resultDesc,
  }));
}