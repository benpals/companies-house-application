import { describe, it, expect, beforeAll } from "vitest";
import { createCompaniesHouseAPI } from "../api/companies-house";

// Skip these tests if running in a Node.js environment without proper setup
const skipTests = typeof window === "undefined" && !process.env.COMPANIES_HOUSE_API_KEY;

describe("Companies House API Key Validation", () => {
  beforeAll(() => {
    if (!process.env.COMPANIES_HOUSE_API_KEY) {
      throw new Error("COMPANIES_HOUSE_API_KEY environment variable not set");
    }
  });
  it("should validate a valid API key by making a test request", async () => {
    const apiKey = process.env.COMPANIES_HOUSE_API_KEY!;

    const api = createCompaniesHouseAPI(apiKey);

    // Test with a known valid company number (Apple Inc UK subsidiary)
    // This is a real company in the Companies House registry
    const result = await api.searchCompanies("Apple");

    // If we get results, the API key is valid
    expect(result).toBeDefined();
    expect(result.items).toBeDefined();
    expect(Array.isArray(result.items)).toBe(true);

    // The search should return at least some results for "Apple"
    expect(result.items && result.items.length > 0).toBe(true);
  });

  it("should successfully fetch company profile with valid API key", async () => {
    const apiKey = process.env.COMPANIES_HOUSE_API_KEY!;

    const api = createCompaniesHouseAPI(apiKey);

    // Test with a well-known UK company number
    // Google UK Limited: 03977902
    const result = await api.getCompanyProfile("03977902");

    expect(result).toBeDefined();
    expect(result.company_number).toBe("03977902");
    expect(result.company_name).toBeDefined();
    expect(result.company_status).toBeDefined();
  });
});
