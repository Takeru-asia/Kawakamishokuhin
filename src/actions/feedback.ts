"use server";

import { prisma } from "@/lib/prisma";
import { requireSession, requireRole } from "@/lib/session";
import { createFeedbackSchema, updateFeedbackStatusSchema } from "@/validations/feedback";
import { revalidatePath } from "next/cache";

const REVIEWER_ROLES = ["ADMIN", "MANAGER"];

// Reviewers see everything; other users only see their own submissions.
export async function getFeedbacks() {
  const session = await requireSession();
  const where = REVIEWER_ROLES.includes(session.role) ? {} : { submittedById: session.userId };

  return prisma.feedback.findMany({
    where,
    include: { submittedBy: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function createFeedback(_prev: unknown, formData: FormData) {
  const session = await requireSession();
  const raw = Object.fromEntries(formData);
  const parsed = createFeedbackSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { category, content, pageUrl } = parsed.data;

  await prisma.feedback.create({
    data: {
      category,
      content,
      pageUrl: pageUrl || null,
      submittedById: session.userId,
    },
  });

  revalidatePath("/feedback");
  return { success: true };
}

export async function updateFeedbackStatus(_prev: unknown, formData: FormData) {
  await requireRole(REVIEWER_ROLES);
  const raw = Object.fromEntries(formData);
  const parsed = updateFeedbackStatusSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.feedback.update({
    where: { id: parsed.data.id },
    data: { status: parsed.data.status },
  });

  revalidatePath("/feedback");
  return { success: true };
}
