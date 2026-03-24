import { describe, it, expect } from "vitest";
import {
  createProductSchema,
  createFacilitySchema,
  createUserSchema,
  updateUserSchema,
} from "./master";

describe("createProductSchema", () => {
  it("accepts valid product", () => {
    const result = createProductSchema.safeParse({
      code: "PRD-005",
      name: "がんもどき",
      unit: "丁",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty code", () => {
    const result = createProductSchema.safeParse({ code: "", name: "test", unit: "kg" });
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = createProductSchema.safeParse({ code: "P1", name: "", unit: "kg" });
    expect(result.success).toBe(false);
  });
});

describe("createFacilitySchema", () => {
  it("accepts valid facility with type", () => {
    const result = createFacilitySchema.safeParse({
      code: "FAC-005",
      name: "冷蔵庫C",
      type: "REFRIGERATOR",
    });
    expect(result.success).toBe(true);
  });

  it("accepts all facility types", () => {
    for (const type of ["REFRIGERATOR", "FREEZER", "HEATER", "OTHER"]) {
      const result = createFacilitySchema.safeParse({
        code: "F1",
        name: "Test",
        type,
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid facility type", () => {
    const result = createFacilitySchema.safeParse({
      code: "F1",
      name: "Test",
      type: "INVALID",
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional temperature limits as strings", () => {
    const result = createFacilitySchema.safeParse({
      code: "F1",
      name: "Test",
      type: "REFRIGERATOR",
      tempLowerLimit: "-5",
      tempUpperLimit: "5",
    });
    expect(result.success).toBe(true);
  });
});

describe("createUserSchema", () => {
  it("accepts valid user", () => {
    const result = createUserSchema.safeParse({
      name: "田中太郎",
      email: "tanaka@example.com",
      password: "password123",
      role: "WORKER",
    });
    expect(result.success).toBe(true);
  });

  it("rejects password shorter than 8 characters", () => {
    const result = createUserSchema.safeParse({
      name: "田中",
      email: "t@e.com",
      password: "short",
      role: "WORKER",
    });
    expect(result.success).toBe(false);
  });

  it("accepts all roles", () => {
    for (const role of ["ADMIN", "MANAGER", "WORKER"]) {
      const result = createUserSchema.safeParse({
        name: "Test",
        email: "t@e.com",
        password: "password123",
        role,
      });
      expect(result.success).toBe(true);
    }
  });
});

describe("updateUserSchema", () => {
  const validId = "550e8400-e29b-41d4-a716-446655440000";

  it("allows empty password (no change)", () => {
    const result = updateUserSchema.safeParse({
      id: validId,
      name: "Updated",
      email: "u@e.com",
      password: "",
      role: "ADMIN",
    });
    expect(result.success).toBe(true);
  });

  it("allows omitting password", () => {
    const result = updateUserSchema.safeParse({
      id: validId,
      name: "Updated",
      email: "u@e.com",
      role: "ADMIN",
    });
    expect(result.success).toBe(true);
  });
});
