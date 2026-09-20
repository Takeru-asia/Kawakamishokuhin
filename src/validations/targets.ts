import { z } from "zod";

export const createProductionTargetSchema = z.object({
  productId: z.string().uuid("製品を選択してください"),
  targetYear: z.coerce.number().int().min(2020).max(2100),
  targetMonth: z.coerce.number().int().min(1).max(12),
  targetQuantity: z.coerce.number().positive("目標数量は0より大きい値を入力してください"),
  dailyTarget: z.coerce.number().positive().optional(),
});

export const updateProductionTargetSchema = createProductionTargetSchema.extend({
  id: z.string().uuid(),
});

export type CreateProductionTargetInput = z.infer<typeof createProductionTargetSchema>;
export type UpdateProductionTargetInput = z.infer<typeof updateProductionTargetSchema>;
