import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { getSession } from "@/lib/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="ml-60">
        <Header title="HACCP管理システム" userName={session?.name} />
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
