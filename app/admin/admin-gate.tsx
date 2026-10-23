// app/admin/admin-gate.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export async function AdminGate({
  sessionPromise,
  children,
}: {
  sessionPromise: Promise<
    | null
    | {
        user?: {
          role?: string | null;
        };
      }
  >;
  children: ReactNode;
}) {
  const session = (await sessionPromise) as {
    user?: {
      role?: string | null;
    };
  } | null;

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin");
  }
  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return <div suppressHydrationWarning className="min-h-screen">{children}</div>;
}