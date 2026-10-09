import { getEmployees } from "@/actions/health";
import { getSession } from "@/lib/session";
import { NewHealthClient } from "./client";

export default async function NewHealthPage() {
  const [employees, session] = await Promise.all([getEmployees(), getSession()]);
  const now = new Date(); // server TZ (Asia/Tokyo in production)
  return (
    <NewHealthClient
      employees={JSON.parse(JSON.stringify(employees))}
      currentUserId={session?.userId ?? ""}
      today={now.toLocaleDateString("sv-SE")}
      nowTime={now.toTimeString().slice(0, 5)}
    />
  );
}
