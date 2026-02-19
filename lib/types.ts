/**
 * Types for Companies House Monitor app
 */

export interface Company {
  id: string; // Unique identifier (company_number)
  companyNumber: string;
  companyName: string;
  companyStatus: string; // "active", "dissolved", etc.
  dateOfCreation: string; // ISO date
  type: string; // "ltd", "plc", etc.
  registeredOfficeAddress: Address;
  accountsYearEndDate: { day: number; month: number } | null;
  nextAccountsDueDate: string | null; // ISO date
  lastAccountsMadeUpTo: string | null; // ISO date
  confirmationStatementLastMadeUpTo: string | null; // ISO date
  confirmationStatementNextDueDate: string | null; // ISO date
  officers: Officer[];
  filingHistory: FilingHistoryItem[];
  lastRefreshed: string; // ISO timestamp
}

export interface Address {
  addressLine1?: string;
  addressLine2?: string;
  careOf?: string;
  country?: string;
  locality?: string;
  poBox?: string;
  postalCode?: string;
  premises?: string;
  region?: string;
}

export interface Officer {
  name: string;
  appointmentDate: string; // ISO date
  role: string;
  dateOfBirth?: string;
  nationality?: string;
  occupation?: string;
}

export interface FilingHistoryItem {
  transactionId: string;
  date: string; // ISO date
  type: string;
  description: string;
  category: string;
}

export interface Deadline {
  companyId: string;
  companyName: string;
  type: "accounts" | "confirmation_statement";
  dueDate: string; // ISO date
  daysRemaining: number;
  overdue: boolean;
  urgency: "critical" | "urgent" | "normal"; // < 14 days, 15-30 days, > 30 days
}

export interface CompaniesHouseProfileResponse {
  accounts?: {
    next_accounts?: {
      due_on?: string;
      period_end_on?: string;
    };
    last_accounts?: {
      made_up_to?: string;
    };
    accounting_reference_date?: {
      day: number;
      month: number;
    };
  };
  annual_return?: {
    next_due?: string;
    last_made_up_to?: string;
  };
  company_name: string;
  company_number: string;
  company_status: string;
  company_type?: string;
  date_of_creation: string;
  registered_office_address?: {
    address_line_1?: string;
    address_line_2?: string;
    care_of?: string;
    country?: string;
    locality?: string;
    po_box?: string;
    postal_code?: string;
    premises?: string;
    region?: string;
  };
  confirmation_statement?: {
    next_due?: string;
    last_made_up_to?: string;
  };
}

export interface CompaniesHouseOfficersResponse {
  items?: Array<{
    name: string;
    appointed_on: string;
    officer_role: string;
    date_of_birth?: {
      month: number;
      year: number;
    };
    nationality?: string;
    occupation?: string;
  }>;
}

export interface CompaniesHouseFilingHistoryResponse {
  items?: Array<{
    transaction_id: string;
    date: string;
    type: string;
    description: string;
    category: string;
  }>;
}

export interface CompaniesHouseSearchResponse {
  items?: Array<{
    company_number: string;
    title?: string; // Company name in search results
    company_name?: string; // Fallback field
    company_status?: string;
    company_type?: string;
  }>;
}

export interface AppSettings {
  apiKey: string;
  notificationsEnabled: boolean;
  notificationDays: number[]; // [7, 14, 30]
  lastRefreshTime: string | null; // ISO timestamp
}
