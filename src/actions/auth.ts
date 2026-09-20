"use server";

import { prisma } from "@/lib/prisma";
import { signToken, setAuthCookie, removeAuthCookie } from "@/lib/auth";
import { loginSchema } from "@/validations/auth";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function loginAction(_prev: unknown, formData: FormData) {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    return { error: "メールアドレスまたはパスワードが正しくありません" };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return { error: "メールアドレスまたはパスワードが正しくありません" };
  }

  // Track engagement: when the user last signed in
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  const token = await signToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  await setAuthCookie(token);
  redirect("/");
}

export async function logoutAction() {
  await removeAuthCookie();
  redirect("/login");
}
