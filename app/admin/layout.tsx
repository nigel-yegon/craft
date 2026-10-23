// app/admin/layout.tsx
import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminGate } from "./admin-gate";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Create the promise but DON'T await it here.
  const sessionPromise = getServerSession(authOptions);

  return (
    
    <Suspense fallback={<AdminSkeleton />}>
      <AdminGate sessionPromise={sessionPromise}>{children}</AdminGate>
    </Suspense>
  );
}

function AdminSkeleton() {
  return <div role="status" aria-label="Loading admin area" />;
}