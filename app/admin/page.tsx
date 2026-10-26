// app/admin/page.tsx
import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DashboardClient } from "./dashboard-client";

export const metadata = { title: "Admin" };

export default function AdminPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <AdminShell />
    </Suspense>
  );
}

async function AdminShell() {
  const session = await getServerSession(authOptions);
  const userName = session?.user?.name ?? session?.user?.email ?? "Admin";
  return <DashboardClient userName={userName} />;
}

function AdminSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-200 dark:bg-deep-950">
      <div
        role="status"
        aria-label="Loading admin dashboard"
        className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"
      />
    </div>
  );
}