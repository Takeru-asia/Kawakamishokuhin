import { z } from "zod";

export const createFeedbackSchema = z.object({
  category: z.enum(["REQUEST", "BUG", "QUESTION", "OTHER"], { message: "種類を選択してください" }),
  content: z.string().trim().min(1, "内容を入力してください").max(2000, "2000文字以内で入力してください"),
  pageUrl: z.string().max(500).optional().or(z.literal("")),
});

export const updateFeedbackStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["NEW", "REVIEWED", "DONE"], { message: "ステータスを選択してください" }),
});

export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>;
