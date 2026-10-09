import { describe, it, expect } from "vitest";
import { createChemicalUsageSchema } from "./chemicals";

const base = {
  usedDate: "2026-01-15",
  usedTime: "07:30",
  chemicalKind: "SODIUM_HYPOCHLORITE",
  quantity: "2.5",
  unit: "L",
  purpose: "製造ライン殺菌",
  usedById: "550e8400-e29b-41d4-a716-446655440000",
};

describe("createChemicalUsageSchema", () => {
  it("accepts a valid record", () => {
    const result = createChemicalUsageSchema.safeParse(base);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.quantity).toBe(2.5);
  });

  it("rejects OTHER without a chemical name", () => {
    expect(createChemicalUsageSchema.safeParse({ ...base, chemicalKind: "OTHER", chemicalName: " " }).success).toBe(false);
  });

  it("accepts OTHER with a chemical name", () => {
    expect(createChemicalUsageSchema.safeParse({ ...base, chemicalKind: "OTHER", chemicalName: "エタノール" }).success).toBe(true);
  });

  it("rejects quantity 0", () => {
    expect(createChemicalUsageSchema.safeParse({ ...base, quantity: "0" }).success).toBe(false);
  });

  it("rejects empty unit and purpose", () => {
    expect(createChemicalUsageSchema.safeParse({ ...base, unit: "" }).success).toBe(false);
    expect(createChemicalUsageSchema.safeParse({ ...base, purpose: "" }).success).toBe(false);
  });
});
