import { z } from "zod";
import { FEVER_THRESHOLD_C } from "@/lib/constants";

/** Local calendar date as YYYY-MM-DD (matches <input type="date"> value). */
function todayString(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Checkbox values arrive as "on" when checked and are absent when unchecked.
const checkbox = z.preprocess((v) => v === "on" || v === true || v === "true", z.boolean());

export const createHealthCheckSchema = z.object({
  userId: z.string().uuid("従業員を選択してください"),
  checkDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "日付を入力してください")
    .refine((d) => d <= todayString(), "未来の日付は登録できません"),
  clockInTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "出勤時刻を入力してください"),
  bodyTemperature: z.coerce
    .number({ message: "体温を入力してください" })
    .min(34.0, "体温は34.0〜42.0℃の範囲で入力してください")
    .max(42.0, "体温は34.0〜42.0℃の範囲で入力してください")
    .transform((t) => Math.round(t * 10) / 10),
  hasHandInjury: checkbox,
  hasSymptoms: checkbox,
  hasSickFamily: checkbox,
  // Dress-code checkboxes mean "worn correctly" when checked.
  hasCap: checkbox,
  hasMask: checkbox,
  hasUniform: checkbox,
  notes: z.string().optional(),
});

export type CreateHealthCheckInput = z.infer<typeof createHealthCheckSchema>;

export type HealthCheckFlags = Pick<
  CreateHealthCheckInput,
  "bodyTemperature" | "hasHandInjury" | "hasSymptoms" | "hasSickFamily" | "hasCap" | "hasMask" | "hasUniform"
>;

/** A check is abnormal on fever, any health flag, or any missing dress-code item. */
export function isAbnormalHealthCheck(input: HealthCheckFlags): boolean {
  return (
    input.bodyTemperature >= FEVER_THRESHOLD_C ||
    input.hasHandInjury ||
    input.hasSymptoms ||
    input.hasSickFamily ||
    !input.hasCap ||
    !input.hasMask ||
    !input.hasUniform
  );
}
