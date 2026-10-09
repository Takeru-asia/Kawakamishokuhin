import { describe, it, expect, vi } from "vitest";

// constants.ts resolves JWT_SECRET at module load; provide one before imports run.
vi.hoisted(() => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || "vitest-secret";
});

import { createHealthCheckSchema, isAbnormalHealthCheck } from "./health";

const userId = "550e8400-e29b-41d4-a716-446655440000";
const base = {
  userId,
  checkDate: "2026-01-15",
  clockInTime: "08:30",
  bodyTemperature: "36.5",
  hasCap: "on",
  hasMask: "on",
  hasUniform: "on",
};

const normal = {
  bodyTemperature: 36.5,
  hasHandInjury: false,
  hasSymptoms: false,
  hasSickFamily: false,
  hasCap: true,
  hasMask: true,
  hasUniform: true,
};

describe("createHealthCheckSchema", () => {
  it("accepts a valid record and maps checkboxes to booleans", () => {
    const result = createHealthCheckSchema.safeParse(base);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.bodyTemperature).toBe(36.5);
      expect(result.data.hasHandInjury).toBe(false);
      expect(result.data.hasCap).toBe(true);
    }
  });

  it("rejects temperature out of range", () => {
    expect(createHealthCheckSchema.safeParse({ ...base, bodyTemperature: "33.9" }).success).toBe(false);
    expect(createHealthCheckSchema.safeParse({ ...base, bodyTemperature: "42.1" }).success).toBe(false);
  });

  it("rejects a future date", () => {
    const future = new Date();
    future.setDate(future.getDate() + 1);
    const checkDate = future.toLocaleDateString("sv-SE");
    expect(createHealthCheckSchema.safeParse({ ...base, checkDate }).success).toBe(false);
  });

  it("rejects an invalid clock-in time", () => {
    expect(createHealthCheckSchema.safeParse({ ...base, clockInTime: "25:00" }).success).toBe(false);
  });
});

describe("isAbnormalHealthCheck", () => {
  it("is normal below the fever threshold (37.4)", () => {
    expect(isAbnormalHealthCheck({ ...normal, bodyTemperature: 37.4 })).toBe(false);
  });

  it("is abnormal at the fever threshold (37.5)", () => {
    expect(isAbnormalHealthCheck({ ...normal, bodyTemperature: 37.5 })).toBe(true);
  });

  it.each(["hasHandInjury", "hasSymptoms", "hasSickFamily"] as const)("is abnormal when %s is true", (flag) => {
    expect(isAbnormalHealthCheck({ ...normal, [flag]: true })).toBe(true);
  });

  it.each(["hasCap", "hasMask", "hasUniform"] as const)("is abnormal when %s is false", (flag) => {
    expect(isAbnormalHealthCheck({ ...normal, [flag]: false })).toBe(true);
  });
});
