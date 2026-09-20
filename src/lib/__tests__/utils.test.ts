import { describe, it, expect } from "vitest";
import { formatDate, formatDateTime, formatDecimal, formatNumber } from "../utils";

describe("formatDate", () => {
  it("formats Date object to Japanese date string", () => {
    const date = new Date("2026-03-24T00:00:00");
    const result = formatDate(date);
    expect(result).toMatch(/2026/);
    expect(result).toMatch(/03/);
    expect(result).toMatch(/24/);
  });

  it("formats date string", () => {
    const result = formatDate("2026-01-15");
    expect(result).toMatch(/2026/);
    expect(result).toMatch(/01/);
    expect(result).toMatch(/15/);
  });
});

describe("formatDateTime", () => {
  it("includes time component", () => {
    const date = new Date("2026-03-24T14:30:00");
    const result = formatDateTime(date);
    expect(result).toMatch(/2026/);
    expect(result).toMatch(/14/);
    expect(result).toMatch(/30/);
  });
});

describe("formatDecimal", () => {
  it("formats number with 1 decimal place by default", () => {
    expect(formatDecimal(3.14159)).toBe("3.1");
  });

  it("formats with specified decimal places", () => {
    expect(formatDecimal(3.14159, 2)).toBe("3.14");
  });

  it("formats string input", () => {
    expect(formatDecimal("42.567", 1)).toBe("42.6");
  });

  it("formats zero", () => {
    expect(formatDecimal(0)).toBe("0.0");
  });

  it("formats negative numbers", () => {
    expect(formatDecimal(-18.5, 1)).toBe("-18.5");
  });
});

describe("formatNumber", () => {
  it("formats large numbers with locale separators", () => {
    const result = formatNumber(1234567);
    expect(result).toContain("1,234,567");
  });

  it("formats string input", () => {
    const result = formatNumber("1000");
    expect(result).toContain("1,000");
  });

  it("formats zero", () => {
    expect(formatNumber(0)).toBe("0");
  });

  it("formats negative numbers", () => {
    const result = formatNumber(-5000);
    expect(result).toContain("5,000");
  });
});
