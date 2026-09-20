import { getUsers } from "@/actions/master";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { UsersClient } from "./client";

export default async function UsersPage() {
  const session = await getSession();
  if (session?.role !== "ADMIN") redirect("/");

  const users = await getUsers();
  return <UsersClient users={JSON.parse(JSON.stringify(users))} />;
}
