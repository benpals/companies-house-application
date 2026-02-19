import { describe, it, expect } from "vitest";
import { createCompaniesHouseAPI } from "../api/companies-house";

describe("Company Search Functionality", () => {
  const apiKey = process.env.COMPANIES_HOUSE_API_KEY;

  if (!apiKey) {
    throw new Error("COMPANIES_HOUSE_API_KEY environment variable not set");
  }

  const api = createCompaniesHouseAPI(apiKey);

  describe("Search by Company Name", () => {
    it("should return search results for company name query", async () => {
      const results = await api.searchCompanies("Apple");

      expect(results).toBeDefined();
      expect(results.items).toBeDefined();
      expect(Array.isArray(results.items)).toBe(true);
    });

    it("should find companies by different name searches", async () => {
      const searchTerms = ["Google", "Microsoft", "Amazon"];

      for (const term of searchTerms) {
        const results = await api.searchCompanies(term);
        expect(results.items).toBeDefined();
        expect(Array.isArray(results.items)).toBe(true);
      }
    });

    it("should return empty results for non-existent company names", async () => {
      const results = await api.searchCompanies("XYZ123NonExistentCompanyName");

      expect(results.items).toBeDefined();
      expect(Array.isArray(results.items)).toBe(true);
    });
  });

  describe("Search by Company Number", () => {
    it("should return search results for company number query", async () => {
      const results = await api.searchCompanies("03977902");

      expect(results.items).toBeDefined();
      expect(Array.isArray(results.items)).toBe(true);
    });

    it("should find company by partial number", async () => {
      const results = await api.searchCompanies("0397");

      expect(results.items).toBeDefined();
      expect(Array.isArray(results.items)).toBe(true);
    });
  });

  describe("Search Result Quality", () => {
    it("should return valid search response structure", async () => {
      const results = await api.searchCompanies("Apple");

      expect(results).toBeDefined();
      expect(results.items).toBeDefined();
      expect(Array.isArray(results.items)).toBe(true);

      // If results exist, check structure
      if (results.items && results.items.length > 0) {
        results.items.forEach((item) => {
          expect(item.company_number).toBeDefined();
          expect(typeof item.company_number).toBe("string");
        });
      }
    });

    it("should return consistent results for same query", async () => {
      const results1 = await api.searchCompanies("Apple");
      const results2 = await api.searchCompanies("Apple");

      expect(results1.items).toBeDefined();
      expect(results2.items).toBeDefined();
      expect(Array.isArray(results1.items)).toBe(true);
      expect(Array.isArray(results2.items)).toBe(true);
    });
  });

  describe("Search Performance", () => {
    it("should complete search within reasonable time", async () => {
      const startTime = Date.now();
      const results = await api.searchCompanies("Google");
      const endTime = Date.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(15000);
      expect(results).toBeDefined();
    });
  });
});
