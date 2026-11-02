// app/admin/admin-gate.tsx
import { connection } from "next/server";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { authOptions } from "@/lib/auth";

export async function AdminGate({ children }: { children: ReactNode }) {
  // ✅ Marks this subtree request-bound.
  await connection();

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin");
  }
  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div suppressHydrationWarning className="min-h-screen">
      {children}
    </div>
  );
}