import { z } from "zod";

export const createHygieneCategorySchema = z.object({
  name: z.string().min(1, "名称を入力してください"),
  description: z.string().optional(),
  sortOrder: z.coerce.number().int("表示順は整数で入力してください"),
  isActive: z.preprocess((v) => v === undefined || v === "true" || v === "on" || v === true, z.boolean()),
});

export const updateHygieneCategorySchema = createHygieneCategorySchema.extend({
  id: z.string().uuid(),
});

export type CreateHygieneCategoryInput = z.infer<typeof createHygieneCategorySchema>;
export type UpdateHygieneCategoryInput = z.infer<typeof updateHygieneCategorySchema>;
