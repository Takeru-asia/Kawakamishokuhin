import { z } from "zod";

export const createHygieneRecordSchema = z.object({
  categoryId: z.string().uuid("カテゴリを選択してください"),
  facilityId: z.string().uuid().optional().or(z.literal("")),
  recordDate: z.string().min(1, "記録日を入力してください"),
  details: z.string().min(1, "詳細を入力してください"),
  result: z.enum(["PASS", "FAIL", "NA"], { message: "結果を選択してください" }),
  // Residual chlorine (mg/L); blank input → undefined
  measuredValue: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.coerce
      .number({ message: "残留塩素濃度は数値で入力してください" })
      .min(0, "残留塩素濃度は0〜5 mg/Lの範囲で入力してください")
      .max(5, "残留塩素濃度は0〜5 mg/Lの範囲で入力してください")
      .optional()
  ),
  notes: z.string().optional(),
});

export type CreateHygieneRecordInput = z.infer<typeof createHygieneRecordSchema>;

export type WaterQualityGuardResult =
  | { error: string }
  | { result: "PASS" | "FAIL" | "NA"; notes: string };

/**
 * Residual chlorine guard for water-quality categories (CCP rule).
 * The value is never clamped: below the minimum the record is forced to FAIL and the
 * deviation is appended to notes so it stays on record. Pure, so it is unit-testable.
 */
export function applyWaterQualityGuard(input: {
  isWaterQuality: boolean;
  measuredValue: number | undefined;
  result: "PASS" | "FAIL" | "NA";
  notes: string;
  minMgL: number;
}): WaterQualityGuardResult {
  const { isWaterQuality, measuredValue, result, notes, minMgL } = input;
  if (!isWaterQuality) return { result, notes };
  if (measuredValue === undefined) {
    return { error: "水質検査は残留塩素濃度（mg/L）を入力してください" };
  }
  if (measuredValue < minMgL) {
    const warning = `残留塩素 ${measuredValue} mg/L は基準 ${minMgL} mg/L 未満`;
    return { result: "FAIL", notes: notes ? `${notes}\n${warning}` : warning };
  }
  return { result, notes };
}
