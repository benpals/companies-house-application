/**
 * Company Context
 * Manages global state for companies and app settings
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import { Company, AppSettings } from "@/lib/types";
import { StorageService } from "@/lib/storage/storage-service";
import { CompanyService } from "@/lib/services/company-service";
import { SEED_COMPANIES } from "@/lib/seed-companies";

interface CompanyContextState {
  companies: Company[];
  settings: AppSettings;
  loading: boolean;
  error: string | null;
  companyService: CompanyService | null;
}

type CompanyContextAction =
  | { type: "SET_COMPANIES"; payload: Company[] }
  | { type: "SET_SETTINGS"; payload: AppSettings }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_COMPANY_SERVICE"; payload: CompanyService }
  | { type: "ADD_COMPANY"; payload: Company }
  | { type: "REMOVE_COMPANY"; payload: string }
  | { type: "UPDATE_COMPANY"; payload: Company };

const initialState: CompanyContextState = {
  companies: [],
  settings: {
    apiKey: "",
    notificationsEnabled: true,
    notificationDays: [7, 14, 30],
    lastRefreshTime: null,
  },
  loading: false,
  error: null,
  companyService: null,
};

function companyReducer(
  state: CompanyContextState,
  action: CompanyContextAction
): CompanyContextState {
  switch (action.type) {
    case "SET_COMPANIES":
      return { ...state, companies: action.payload };
    case "SET_SETTINGS":
      return { ...state, settings: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_COMPANY_SERVICE":
      return { ...state, companyService: action.payload };
    case "ADD_COMPANY":
      return { ...state, companies: [...state.companies, action.payload] };
    case "REMOVE_COMPANY":
      return {
        ...state,
        companies: state.companies.filter((c) => c.id !== action.payload),
      };
    case "UPDATE_COMPANY":
      return {
        ...state,
        companies: state.companies.map((c) =>
          c.id === action.payload.id ? action.payload : c
        ),
      };
    default:
      return state;
  }
}

interface CompanyContextType extends CompanyContextState {
  addCompany: (companyNumber: string) => Promise<void>;
  removeCompany: (companyId: string) => Promise<void>;
  refreshCompanies: () => Promise<void>;
  updateSettings: (settings: AppSettings) => Promise<void>;
  setApiKey: (apiKey: string) => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

// Background seeding function
async function seedCompaniesInBackground(
  apiKey: string,
  dispatch: React.Dispatch<CompanyContextAction>
) {
  try {
    const service = new CompanyService(apiKey);
    const seededCompanies: Company[] = [];

    for (const companyNumber of SEED_COMPANIES) {
      try {
        const company = await service.addCompanyToFavorites(companyNumber);
        seededCompanies.push(company);

        // Update UI every 10 companies
        if (seededCompanies.length % 10 === 0) {
          dispatch({ type: "SET_COMPANIES", payload: [...seededCompanies] });
        }
      } catch (error) {
        console.log(`Failed to seed company ${companyNumber}:`, error);
      }
    }

    // Final update with all seeded companies
    if (seededCompanies.length > 0) {
      dispatch({ type: "SET_COMPANIES", payload: seededCompanies });
    }
  } catch (error) {
    console.error("Error seeding companies:", error);
  }
}

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(companyReducer, initialState);

  // Initialize on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        dispatch({ type: "SET_LOADING", payload: true });

        // Load settings
        let settings = await StorageService.getSettings();

        // Pre-populate API key from environment if not already set
        const envApiKey = (process.env.EXPO_PUBLIC_COMPANIES_HOUSE_API_KEY || process.env.COMPANIES_HOUSE_API_KEY) as string | undefined;
        if (!settings.apiKey && envApiKey) {
          settings.apiKey = envApiKey;
          await StorageService.saveSettings(settings);
        }

        dispatch({ type: "SET_SETTINGS", payload: settings });

        // Load companies
        const companies = await StorageService.getAllCompanies();
        dispatch({ type: "SET_COMPANIES", payload: companies });

        // Initialize company service if API key exists
        if (settings.apiKey) {
          const service = new CompanyService(settings.apiKey);
          dispatch({ type: "SET_COMPANY_SERVICE", payload: service });
          // Bulk seeding disabled - users will add companies manually
        }

        dispatch({ type: "SET_LOADING", payload: false });
      } catch (error) {
        console.error("Error initializing company context:", error);
        dispatch({ type: "SET_ERROR", payload: "Failed to initialize app" });
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    initialize();
  }, []);

  const addCompany = async (companyNumber: string) => {
    if (!state.companyService) {
      throw new Error("API key not configured");
    }

    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      const company = await state.companyService.addCompanyToFavorites(companyNumber);
      dispatch({ type: "ADD_COMPANY", payload: company });

      dispatch({ type: "SET_LOADING", payload: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to add company";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      dispatch({ type: "SET_LOADING", payload: false });
      throw error;
    }
  };

  const removeCompany = async (companyId: string) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      await state.companyService?.removeCompanyFromFavorites(companyId);
      dispatch({ type: "REMOVE_COMPANY", payload: companyId });
      dispatch({ type: "SET_LOADING", payload: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to remove company";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      dispatch({ type: "SET_LOADING", payload: false });
      throw error;
    }
  };

  const refreshCompanies = async () => {
    if (!state.companyService) {
      throw new Error("API key not configured");
    }

    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      const companies = await state.companyService.refreshAllCompanies();
      dispatch({ type: "SET_COMPANIES", payload: companies });

      // Update last refresh time
      const updatedSettings = {
        ...state.settings,
        lastRefreshTime: new Date().toISOString(),
      };
      await StorageService.saveSettings(updatedSettings);
      dispatch({ type: "SET_SETTINGS", payload: updatedSettings });

      dispatch({ type: "SET_LOADING", payload: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to refresh companies";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      dispatch({ type: "SET_LOADING", payload: false });
      throw error;
    }
  };

  const updateSettings = async (settings: AppSettings) => {
    try {
      await StorageService.saveSettings(settings);
      dispatch({ type: "SET_SETTINGS", payload: settings });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update settings";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      throw error;
    }
  };

  const setApiKey = async (apiKey: string) => {
    try {
      await StorageService.saveApiKey(apiKey);

      const updatedSettings = {
        ...state.settings,
        apiKey,
      };
      await StorageService.saveSettings(updatedSettings);

      const service = new CompanyService(apiKey);
      dispatch({ type: "SET_COMPANY_SERVICE", payload: service });
      dispatch({ type: "SET_SETTINGS", payload: updatedSettings });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to set API key";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      throw error;
    }
  };

  const value: CompanyContextType = {
    ...state,
    addCompany,
    removeCompany,
    refreshCompanies,
    updateSettings,
    setApiKey,
  };

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompanyContext(): CompanyContextType {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error("useCompanyContext must be used within CompanyProvider");
  }
  return context;
}
