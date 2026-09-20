import { z } from "zod";

export const productionRecordItemSchema = z.object({
  productId: z.string().uuid("製品を選択してください"),
  quantity: z.coerce.number().positive("数量は0より大きい値を入力してください"),
});

export const createProductionRecordSchema = z.object({
  productionDate: z.string().min(1, "製造日を入力してください"),
  notes: z.string().optional(),
  items: z.array(productionRecordItemSchema).min(1, "明細を1件以上入力してください"),
});

export type CreateProductionRecordInput = z.infer<typeof createProductionRecordSchema>;
