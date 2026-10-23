// app/admin/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DashboardClient } from "./dashboard-client";

export const metadata = { title: "Admin" };

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  const userName = session?.user?.name ?? session?.user?.email ?? "Admin";

  return <DashboardClient userName={userName} />;
}