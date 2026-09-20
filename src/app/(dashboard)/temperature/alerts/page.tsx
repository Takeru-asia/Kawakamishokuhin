import { getAlerts } from "@/actions/temperature";
import { getSession } from "@/lib/session";
import { AlertsClient } from "./client";

export default async function AlertsPage() {
  const [alerts, session] = await Promise.all([getAlerts(), getSession()]);
  const canResolve = session?.role === "ADMIN" || session?.role === "MANAGER";
  return <AlertsClient alerts={JSON.parse(JSON.stringify(alerts))} canResolve={canResolve} />;
}
