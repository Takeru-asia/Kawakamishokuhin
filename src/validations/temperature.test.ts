import { describe, it, expect } from "vitest";
import { createTemperatureRecordSchema, updateAlertSchema } from "./temperature";

describe("createTemperatureRecordSchema", () => {
  const validFacilityId = "550e8400-e29b-41d4-a716-446655440000";

  it("accepts valid temperature record", () => {
    const result = createTemperatureRecordSchema.safeParse({
      facilityId: validFacilityId,
      temperature: 3.5,
    });
    expect(result.success).toBe(true);
  });

  it("accepts negative temperatures (freezer)", () => {
    const result = createTemperatureRecordSchema.safeParse({
      facilityId: validFacilityId,
      temperature: -18.5,
    });
    expect(result.success).toBe(true);
  });

  it("coerces string temperature to number", () => {
    const result = createTemperatureRecordSchema.safeParse({
      facilityId: validFacilityId,
      temperature: "4.2",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.temperature).toBe(4.2);
    }
  });

  it("rejects missing facilityId", () => {
    const result = createTemperatureRecordSchema.safeParse({ temperature: 3.5 });
    expect(result.success).toBe(false);
  });

  it("rejects invalid UUID for facilityId", () => {
    const result = createTemperatureRecordSchema.safeParse({
      facilityId: "not-a-uuid",
      temperature: 3.5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric temperature", () => {
    const result = createTemperatureRecordSchema.safeParse({
      facilityId: validFacilityId,
      temperature: "abc",
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional notes", () => {
    const result = createTemperatureRecordSchema.safeParse({
      facilityId: validFacilityId,
      temperature: 3.5,
      notes: "Morning check",
    });
    expect(result.success).toBe(true);
  });
});

describe("updateAlertSchema", () => {
  const validId = "550e8400-e29b-41d4-a716-446655440000";

  it("accepts ACKNOWLEDGED status", () => {
    const result = updateAlertSchema.safeParse({
      id: validId,
      status: "ACKNOWLEDGED",
    });
    expect(result.success).toBe(true);
  });

  it("accepts RESOLVED status with corrective action", () => {
    const result = updateAlertSchema.safeParse({
      id: validId,
      status: "RESOLVED",
      correctiveAction: "Temperature adjusted",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid status value", () => {
    const result = updateAlertSchema.safeParse({
      id: validId,
      status: "OPEN",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid status value CLOSED", () => {
    const result = updateAlertSchema.safeParse({
      id: validId,
      status: "CLOSED",
    });
    expect(result.success).toBe(false);
  });
});
