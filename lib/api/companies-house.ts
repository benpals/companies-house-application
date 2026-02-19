/**
 * Companies House API Service
 * Handles all API calls to the Companies House Public Data API
 */

import axios, { AxiosInstance } from "axios";
import {
  CompaniesHouseProfileResponse,
  CompaniesHouseOfficersResponse,
  CompaniesHouseFilingHistoryResponse,
  CompaniesHouseSearchResponse,
} from "@/lib/types";

const BASE_URL = "https://api.company-information.service.gov.uk";

export class CompaniesHouseAPI {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL: BASE_URL,
      auth: {
        username: apiKey,
        password: "", // Companies House API uses empty password
      },
      timeout: 10000,
    });
  }

  /**
   * Get company profile information
   */
  async getCompanyProfile(companyNumber: string): Promise<CompaniesHouseProfileResponse> {
    try {
      const response = await this.client.get<CompaniesHouseProfileResponse>(
        `/company/${companyNumber}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, `Failed to fetch company profile for ${companyNumber}`);
    }
  }

  /**
   * Get company officers
   */
  async getCompanyOfficers(companyNumber: string): Promise<CompaniesHouseOfficersResponse> {
    try {
      const response = await this.client.get<CompaniesHouseOfficersResponse>(
        `/company/${companyNumber}/officers`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, `Failed to fetch officers for ${companyNumber}`);
    }
  }

  /**
   * Get company filing history
   */
  async getFilingHistory(
    companyNumber: string,
    itemsPerPage: number = 10
  ): Promise<CompaniesHouseFilingHistoryResponse> {
    try {
      const response = await this.client.get<CompaniesHouseFilingHistoryResponse>(
        `/company/${companyNumber}/filing-history`,
        {
          params: {
            items_per_page: itemsPerPage,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, `Failed to fetch filing history for ${companyNumber}`);
    }
  }

  /**
   * Search for companies by name
   */
  async searchCompanies(query: string): Promise<CompaniesHouseSearchResponse> {
    try {
      const response = await this.client.get<CompaniesHouseSearchResponse>("/search/companies", {
        params: {
          q: query,
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, `Failed to search for companies: ${query}`);
    }
  }

  /**
   * Validate API key by making a test call
   */
  async validateApiKey(): Promise<boolean> {
    try {
      // Try to fetch a well-known company (Companies House itself)
      await this.client.get("/company/00000000");
      return true;
    } catch (error: any) {
      // 404 is expected for this non-existent company, but 401 means auth failed
      if (error.response?.status === 401) {
        return false;
      }
      // Any other error, assume key is valid (API might be down)
      return true;
    }
  }

  /**
   * Handle API errors
   */
  private handleError(error: any, message: string): Error {
    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        return new Error("Invalid API key");
      } else if (status === 404) {
        return new Error("Company not found");
      } else if (status === 429) {
        return new Error("API rate limit exceeded. Please try again later.");
      } else if (status >= 500) {
        return new Error("Companies House API is temporarily unavailable");
      }
    }
    if (error.code === "ECONNABORTED") {
      return new Error("Request timeout. Please check your internet connection.");
    }
    return new Error(message);
  }
}

/**
 * Create API instance with provided API key
 */
export function createCompaniesHouseAPI(apiKey: string): CompaniesHouseAPI {
  return new CompaniesHouseAPI(apiKey);
}
