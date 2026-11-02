// app/admin/layout.tsx
import { Suspense } from "react";
import { AdminGate } from "./admin-gate";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <AdminGate>{children}</AdminGate>
    </Suspense>
  );
}

function AdminSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading admin area"
      className="min-h-screen bg-background"
    >
      <div className="border-b border-foreground/10 px-6 py-4">
        <div className="mx-auto max-w-7xl">
          <div className="h-6 w-40 animate-pulse rounded bg-foreground/10" />
        </div>
      </div>
    </div>
  );
}