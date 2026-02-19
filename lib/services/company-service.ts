/**
 * Company Service
 * Manages company data, API calls, and data transformation
 */

import { Company, Officer, FilingHistoryItem } from "@/lib/types";
import { createCompaniesHouseAPI } from "@/lib/api/companies-house";
import { StorageService } from "@/lib/storage/storage-service";
import { getCompanyDeadlines } from "@/lib/deadline-calculator";

export class CompanyService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Fetch and save a company from Companies House API
   */
  async fetchAndSaveCompany(companyNumber: string): Promise<Company> {
    const api = createCompaniesHouseAPI(this.apiKey);

    // Fetch company profile
    const profile = await api.getCompanyProfile(companyNumber);

    // Fetch officers
    let officers: Officer[] = [];
    try {
      const officersResponse = await api.getCompanyOfficers(companyNumber);
      officers = (officersResponse.items || []).map((item) => ({
        name: item.name,
        appointmentDate: item.appointed_on,
        role: item.officer_role,
        dateOfBirth: item.date_of_birth
          ? `${item.date_of_birth.year}-${String(item.date_of_birth.month).padStart(2, "0")}-01`
          : undefined,
        nationality: item.nationality,
        occupation: item.occupation,
      }));
    } catch (error) {
      console.warn("Failed to fetch officers:", error);
    }

    // Fetch filing history
    let filingHistory: FilingHistoryItem[] = [];
    try {
      const filingResponse = await api.getFilingHistory(companyNumber, 10);
      filingHistory = (filingResponse.items || []).map((item) => ({
        transactionId: item.transaction_id,
        date: item.date,
        type: item.type,
        description: item.description,
        category: item.category,
      }));
    } catch (error) {
      console.warn("Failed to fetch filing history:", error);
    }

    // Transform API response to Company object
    const company: Company = {
      id: profile.company_number,
      companyNumber: profile.company_number,
      companyName: profile.company_name,
      companyStatus: profile.company_status,
      dateOfCreation: profile.date_of_creation,
      type: profile.company_type || "unknown",
      registeredOfficeAddress: profile.registered_office_address || {},
      accountsYearEndDate: profile.accounts?.accounting_reference_date || null,
      nextAccountsDueDate: profile.accounts?.next_accounts?.due_on || null,
      lastAccountsMadeUpTo: profile.accounts?.last_accounts?.made_up_to || null,
      confirmationStatementLastMadeUpTo:
        profile.confirmation_statement?.last_made_up_to || null,
      confirmationStatementNextDueDate: profile.confirmation_statement?.next_due || null,
      officers,
      filingHistory,
      lastRefreshed: new Date().toISOString(),
    };

    // Save to local storage
    await StorageService.saveCompany(company);

    return company;
  }

  /**
   * Search for companies by name
   */
  async searchCompanies(query: string): Promise<Array<{ number: string; name: string }>> {
    const api = createCompaniesHouseAPI(this.apiKey);
    const response = await api.searchCompanies(query);

    return (response.items || []).map((item) => ({
      number: item.company_number,
      name: item.title || item.company_name || "Unknown Company",
    }));
  }

  /**
   * Refresh a company's data
   */
  async refreshCompany(companyId: string): Promise<Company> {
    return this.fetchAndSaveCompany(companyId);
  }

  /**
   * Refresh all saved companies
   */
  async refreshAllCompanies(): Promise<Company[]> {
    const companies = await StorageService.getAllCompanies();
    const refreshed: Company[] = [];

    for (const company of companies) {
      try {
        const updated = await this.refreshCompany(company.id);
        refreshed.push(updated);
      } catch (error) {
        console.error(`Failed to refresh company ${company.id}:`, error);
        // Return cached version if refresh fails
        refreshed.push(company);
      }
    }

    return refreshed;
  }

  /**
   * Add a company to favorites
   */
  async addCompanyToFavorites(companyNumber: string): Promise<Company> {
    return this.fetchAndSaveCompany(companyNumber);
  }

  /**
   * Remove a company from favorites
   */
  async removeCompanyFromFavorites(companyId: string): Promise<void> {
    await StorageService.deleteCompany(companyId);
  }

  /**
   * Get all favorited companies
   */
  async getFavoritedCompanies(): Promise<Company[]> {
    return StorageService.getAllCompanies();
  }

  /**
   * Get a specific company
   */
  async getCompany(companyId: string): Promise<Company | null> {
    return StorageService.getCompany(companyId);
  }
}
