import { describe, it, expect } from "vitest";
import { createHygieneRecordSchema, applyWaterQualityGuard } from "./hygiene";

describe("createHygieneRecordSchema", () => {
  const base = {
    categoryId: "550e8400-e29b-41d4-a716-446655440000",
    facilityId: "",
    recordDate: "2026-10-09",
    details: "水質検査を実施",
    result: "PASS",
    notes: "",
  };

  it("accepts a record with a residual chlorine value", () => {
    const result = createHygieneRecordSchema.safeParse({ ...base, measuredValue: "0.35" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.measuredValue).toBe(0.35);
  });

  it("treats empty measured value as undefined", () => {
    const result = createHygieneRecordSchema.safeParse({ ...base, measuredValue: "" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.measuredValue).toBeUndefined();
  });

  it("accepts a record without measured value", () => {
    const result = createHygieneRecordSchema.safeParse(base);
    expect(result.success).toBe(true);
  });

  it("rejects measured value above 5 mg/L", () => {
    const result = createHygieneRecordSchema.safeParse({ ...base, measuredValue: "5.01" });
    expect(result.success).toBe(false);
  });

  it("rejects negative measured value", () => {
    const result = createHygieneRecordSchema.safeParse({ ...base, measuredValue: "-0.1" });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric measured value", () => {
    const result = createHygieneRecordSchema.safeParse({ ...base, measuredValue: "abc" });
    expect(result.success).toBe(false);
  });
});

describe("applyWaterQualityGuard", () => {
  const base = { isWaterQuality: true, result: "PASS" as const, notes: "", minMgL: 0.1 };

  it("forces FAIL and annotates notes when below the minimum", () => {
    const r = applyWaterQualityGuard({ ...base, measuredValue: 0.05, notes: "朝の測定" });
    expect(r).toEqual({ result: "FAIL", notes: "朝の測定\n残留塩素 0.05 mg/L は基準 0.1 mg/L 未満" });
  });

  it("keeps PASS at exactly the minimum", () => {
    expect(applyWaterQualityGuard({ ...base, measuredValue: 0.1 })).toEqual({ result: "PASS", notes: "" });
  });

  it("requires a value for water-quality categories", () => {
    expect(applyWaterQualityGuard({ ...base, measuredValue: undefined })).toHaveProperty("error");
  });

  it("does nothing for other categories, even without a value", () => {
    expect(applyWaterQualityGuard({ ...base, isWaterQuality: false, measuredValue: undefined, result: "NA" }))
      .toEqual({ result: "NA", notes: "" });
  });
});
