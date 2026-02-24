import { z } from "zod";

export const createMaterialLotSchema = z.object({
  materialId: z.string().uuid("原材料を選択してください"),
  receivedDate: z.string().min(1, "入荷日を入力してください"),
  expiryDate: z.string().optional(),
  quantity: z.coerce.number().positive("数量は0より大きい値を入力してください"),
  supplierLot: z.string().optional(),
});

export const createLotLinkSchema = z.object({
  materialLotId: z.string().uuid("原材料ロットを選択してください"),
  productLotId: z.string().uuid("製品ロットを選択してください"),
  quantityUsed: z.coerce.number().positive().optional(),
});

export type CreateMaterialLotInput = z.infer<typeof createMaterialLotSchema>;
export type CreateLotLinkInput = z.infer<typeof createLotLinkSchema>;
