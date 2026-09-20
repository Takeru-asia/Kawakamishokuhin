import { z } from "zod";

export const createHygieneRecordSchema = z.object({
  categoryId: z.string().uuid("カテゴリを選択してください"),
  facilityId: z.string().uuid().optional().or(z.literal("")),
  recordDate: z.string().min(1, "記録日を入力してください"),
  details: z.string().min(1, "詳細を入力してください"),
  result: z.enum(["PASS", "FAIL", "NA"], { message: "結果を選択してください" }),
  notes: z.string().optional(),
});

export type CreateHygieneRecordInput = z.infer<typeof createHygieneRecordSchema>;
