import { z } from "zod";

/** Local calendar date as YYYY-MM-DD (server TZ is Asia/Tokyo). */
export function todayString(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Empty string / null → undefined so optional numeric inputs can be left blank. */
const emptyToUndefined = (v: unknown) => (v === "" || v == null ? undefined : v);

export const equipmentSchema = z.object({
  code: z.string().min(1, "コードを入力してください"),
  name: z.string().min(1, "名称を入力してください"),
  type: z.enum(["THERMOMETER", "SCALE", "OTHER"], { message: "種別を選択してください" }),
  checkFrequency: z.enum(["DAILY", "MONTHLY"], { message: "点検周期を選択してください" }),
  location: z.string().optional(),
  isActive: z.preprocess((v) => v === undefined || v === "true" || v === "on" || v === true, z.boolean()),
});

export const updateEquipmentSchema = equipmentSchema.extend({
  id: z.string().uuid(),
});

export const equipmentCheckSchema = z.object({
  equipmentId: z.string().uuid("計器を選択してください"),
  checkDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "点検日を入力してください")
    .refine((v) => v <= todayString(), "点検日に未来の日付は指定できません"),
  kind: z.enum(["CALIBRATION", "INSPECTION"], { message: "種類を選択してください" }),
  result: z.enum(["PASS", "FAIL", "NA"], { message: "結果を選択してください" }),
  measuredValue: z.preprocess(
    emptyToUndefined,
    z.coerce.number({ message: "測定値は数値で入力してください" }).optional()
  ),
  notes: z.string().optional(),
});

export type EquipmentInput = z.infer<typeof equipmentSchema>;
export type UpdateEquipmentInput = z.infer<typeof updateEquipmentSchema>;
export type EquipmentCheckInput = z.infer<typeof equipmentCheckSchema>;
