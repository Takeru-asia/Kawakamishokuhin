import { z } from "zod";

const quantity = z.coerce.number().min(0, "数量は0以上の値を入力してください");

export const planItemSchema = z.object({
  productId: z.string().uuid("製品が不正です"),
  plannedQuantity: quantity,
});

export const planMaterialSchema = z.object({
  materialId: z.string().uuid("原材料が不正です"),
  quantity: quantity,
});

// Form rows are posted as a JSON string (same pattern as production record items)
function jsonArray<T extends z.ZodTypeAny>(item: T, message: string) {
  return z
    .string()
    .transform((s, ctx) => {
      try {
        return JSON.parse(s || "[]");
      } catch {
        ctx.addIssue({ code: "custom", message });
        return z.NEVER;
      }
    })
    .pipe(z.array(item));
}

export const upsertProductionPlanSchema = z
  .object({
    planDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日付を入力してください"),
    items: jsonArray(planItemSchema, "製造予定データが不正です"),
    materials: jsonArray(planMaterialSchema, "仕込み数量データが不正です"),
    notes: z.string().optional(),
  })
  .refine(
    (d) => d.items.some((i) => i.plannedQuantity > 0) || d.materials.some((m) => m.quantity > 0),
    { message: "製造予定または仕込み数量を1件以上入力してください" }
  );

export type UpsertProductionPlanInput = z.infer<typeof upsertProductionPlanSchema>;
