import { describe, it, expect } from "vitest";
import { createProductionRecordSchema, productionRecordItemSchema } from "./production";

describe("productionRecordItemSchema", () => {
  const validProductId = "550e8400-e29b-41d4-a716-446655440000";

  it("accepts valid item", () => {
    const result = productionRecordItemSchema.safeParse({
      productId: validProductId,
      quantity: 100,
    });
    expect(result.success).toBe(true);
  });

  it("coerces string quantity to number", () => {
    const result = productionRecordItemSchema.safeParse({
      productId: validProductId,
      quantity: "50",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.quantity).toBe(50);
  });

  it("rejects zero quantity", () => {
    const result = productionRecordItemSchema.safeParse({
      productId: validProductId,
      quantity: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative quantity", () => {
    const result = productionRecordItemSchema.safeParse({
      productId: validProductId,
      quantity: -10,
    });
    expect(result.success).toBe(false);
  });
});

describe("createProductionRecordSchema", () => {
  const validItem = {
    productId: "550e8400-e29b-41d4-a716-446655440000",
    quantity: 100,
  };

  it("accepts valid record with items", () => {
    const result = createProductionRecordSchema.safeParse({
      productionDate: "2026-03-24",
      items: [validItem],
    });
    expect(result.success).toBe(true);
  });

  it("accepts multiple items", () => {
    const result = createProductionRecordSchema.safeParse({
      productionDate: "2026-03-24",
      items: [validItem, { ...validItem, quantity: 200 }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty items array", () => {
    const result = createProductionRecordSchema.safeParse({
      productionDate: "2026-03-24",
      items: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing production date", () => {
    const result = createProductionRecordSchema.safeParse({
      productionDate: "",
      items: [validItem],
    });
    expect(result.success).toBe(false);
  });
});
