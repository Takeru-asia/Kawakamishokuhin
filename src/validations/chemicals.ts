import { z } from "zod";

export const CHEMICAL_KINDS = ["SODIUM_HYDROXIDE", "SODIUM_HYPOCHLORITE", "OTHER"] as const;
export type ChemicalKindValue = (typeof CHEMICAL_KINDS)[number];

export const CHEMICAL_KIND_LABELS: Record<ChemicalKindValue, string> = {
  SODIUM_HYDROXIDE: "水酸化ナトリウム（カセイソーダ）",
  SODIUM_HYPOCHLORITE: "次亜塩素酸ナトリウム",
  OTHER: "その他",
};

export const createChemicalUsageSchema = z
  .object({
    usedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "使用日を入力してください"),
    usedTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "時刻を入力してください"),
    chemicalKind: z.enum(CHEMICAL_KINDS, { message: "薬品を選択してください" }),
    chemicalName: z.string().max(200, "薬品名は200文字以内で入力してください").optional(),
    quantity: z.coerce.number({ message: "数量を入力してください" }).positive("数量は0より大きい値を入力してください"),
    unit: z.string().min(1, "単位を入力してください").max(20, "単位は20文字以内で入力してください"),
    purpose: z.string().min(1, "用途を入力してください"),
    usedById: z.string().uuid("使用者を選択してください"),
    notes: z.string().optional(),
  })
  .refine((d) => d.chemicalKind !== "OTHER" || (d.chemicalName ?? "").trim().length > 0, {
    message: "その他の場合は薬品名を入力してください",
    path: ["chemicalName"],
  });

export type CreateChemicalUsageInput = z.infer<typeof createChemicalUsageSchema>;
