import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getSession } from "@/lib/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <DashboardShell userName={session?.name}>
      {children}
    </DashboardShell>
  );
}
