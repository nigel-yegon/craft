// app/admin/page.tsx — scaffold version, no auth gate
import { DashboardClient } from "./dashboard-client";

export const metadata = { title: "Admin — Craft" };

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-cream-200 dark:bg-deep-950">
      <DashboardClient userName="Admin" />
    </main>
  );
}