import { describe, it, expect } from "vitest";
import { equipmentSchema, equipmentCheckSchema, todayString } from "./equipment";

const validEquipmentId = "550e8400-e29b-41d4-a716-446655440000";

describe("equipmentSchema", () => {
  it("accepts valid equipment", () => {
    const result = equipmentSchema.safeParse({
      code: "TH-01",
      name: "冷蔵庫用温度計",
      type: "THERMOMETER",
      checkFrequency: "DAILY",
      location: "冷蔵庫A",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.isActive).toBe(true);
  });

  it("rejects missing code", () => {
    const result = equipmentSchema.safeParse({
      code: "",
      name: "温度計",
      type: "THERMOMETER",
      checkFrequency: "DAILY",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid type", () => {
    const result = equipmentSchema.safeParse({
      code: "X",
      name: "温度計",
      type: "FRIDGE",
      checkFrequency: "DAILY",
    });
    expect(result.success).toBe(false);
  });
});

describe("equipmentCheckSchema", () => {
  it("accepts valid check with measured value", () => {
    const result = equipmentCheckSchema.safeParse({
      equipmentId: validEquipmentId,
      checkDate: todayString(),
      kind: "CALIBRATION",
      result: "PASS",
      measuredValue: "0.5",
      notes: "",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.measuredValue).toBe(0.5);
  });

  it("treats empty measured value as undefined", () => {
    const result = equipmentCheckSchema.safeParse({
      equipmentId: validEquipmentId,
      checkDate: todayString(),
      kind: "INSPECTION",
      result: "PASS",
      measuredValue: "",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.measuredValue).toBeUndefined();
  });

  it("rejects a future check date", () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const future = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const result = equipmentCheckSchema.safeParse({
      equipmentId: validEquipmentId,
      checkDate: future,
      kind: "INSPECTION",
      result: "PASS",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing equipmentId", () => {
    const result = equipmentCheckSchema.safeParse({
      checkDate: todayString(),
      kind: "INSPECTION",
      result: "PASS",
    });
    expect(result.success).toBe(false);
  });
});
