import { z } from "zod";

export const createLossRecordSchema = z.object({
  productId: z.string().uuid("製品を選択してください"),
  categoryId: z.string().uuid("カテゴリを選択してください"),
  recordDate: z.string().min(1, "記録日を入力してください"),
  quantity: z.coerce.number().positive("数量は0より大きい値を入力してください"),
  notes: z.string().optional(),
});

export type CreateLossRecordInput = z.infer<typeof createLossRecordSchema>;
