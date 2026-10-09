import { describe, it, expect } from "vitest";
import { upsertProductionPlanSchema } from "./plan";

const productId = "550e8400-e29b-41d4-a716-446655440000";
const materialId = "550e8400-e29b-41d4-a716-446655440001";

function build(overrides: Record<string, string> = {}) {
  return {
    planDate: "2026-10-10",
    items: JSON.stringify([{ productId, plannedQuantity: 120 }]),
    materials: JSON.stringify([{ materialId, quantity: 30.5 }]),
    notes: "",
    ...overrides,
  };
}

describe("upsertProductionPlanSchema", () => {
  it("accepts valid plan and parses JSON rows", () => {
    const result = upsertProductionPlanSchema.safeParse(build());
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.items[0].plannedQuantity).toBe(120);
      expect(result.data.materials[0].quantity).toBe(30.5);
    }
  });

  it("accepts plan with only materials set", () => {
    const result = upsertProductionPlanSchema.safeParse(
      build({ items: JSON.stringify([{ productId, plannedQuantity: 0 }]) })
    );
    expect(result.success).toBe(true);
  });

  it("rejects negative quantity", () => {
    const result = upsertProductionPlanSchema.safeParse(
      build({ items: JSON.stringify([{ productId, plannedQuantity: -1 }]) })
    );
    expect(result.success).toBe(false);
  });

  it("rejects when all quantities are zero or empty", () => {
    const result = upsertProductionPlanSchema.safeParse(
      build({ items: JSON.stringify([{ productId, plannedQuantity: 0 }]), materials: "[]" })
    );
    expect(result.success).toBe(false);
  });

  it("rejects bad date", () => {
    expect(upsertProductionPlanSchema.safeParse(build({ planDate: "" })).success).toBe(false);
    expect(upsertProductionPlanSchema.safeParse(build({ planDate: "2026/10/10" })).success).toBe(false);
  });

  it("rejects malformed JSON rows", () => {
    const result = upsertProductionPlanSchema.safeParse(build({ items: "{not json" }));
    expect(result.success).toBe(false);
  });
});
