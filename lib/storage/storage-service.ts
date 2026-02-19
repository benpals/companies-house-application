/**
 * Storage Service
 * Handles local data persistence using AsyncStorage and SecureStore
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Company, AppSettings } from "@/lib/types";

const COMPANIES_KEY = "companies_house_monitor_companies";
const SETTINGS_KEY = "companies_house_monitor_settings";
const API_KEY_KEY = "companies_house_monitor_api_key";

export class StorageService {
  /**
   * Save a company to local storage
   */
  static async saveCompany(company: Company): Promise<void> {
    try {
      const companies = await this.getAllCompanies();
      const index = companies.findIndex((c) => c.id === company.id);

      if (index >= 0) {
        companies[index] = company;
      } else {
        companies.push(company);
      }

      await AsyncStorage.setItem(COMPANIES_KEY, JSON.stringify(companies));
    } catch (error) {
      console.error("Error saving company:", error);
      throw error;
    }
  }

  /**
   * Get all saved companies
   */
  static async getAllCompanies(): Promise<Company[]> {
    try {
      const data = await AsyncStorage.getItem(COMPANIES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error getting companies:", error);
      return [];
    }
  }

  /**
   * Get a specific company by ID
   */
  static async getCompany(companyId: string): Promise<Company | null> {
    try {
      const companies = await this.getAllCompanies();
      return companies.find((c) => c.id === companyId) || null;
    } catch (error) {
      console.error("Error getting company:", error);
      return null;
    }
  }

  /**
   * Delete a company from local storage
   */
  static async deleteCompany(companyId: string): Promise<void> {
    try {
      const companies = await this.getAllCompanies();
      const filtered = companies.filter((c) => c.id !== companyId);
      await AsyncStorage.setItem(COMPANIES_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error("Error deleting company:", error);
      throw error;
    }
  }

  /**
   * Save API key securely
   */
  static async saveApiKey(apiKey: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(API_KEY_KEY, apiKey);
    } catch (error) {
      console.error("Error saving API key:", error);
      throw error;
    }
  }

  /**
   * Get API key from secure storage
   */
  static async getApiKey(): Promise<string | null> {
    try {
      const apiKey = await SecureStore.getItemAsync(API_KEY_KEY);
      return apiKey || null;
    } catch (error) {
      console.error("Error getting API key:", error);
      return null;
    }
  }

  /**
   * Delete API key from secure storage
   */
  static async deleteApiKey(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(API_KEY_KEY);
    } catch (error) {
      console.error("Error deleting API key:", error);
      throw error;
    }
  }

  /**
   * Save app settings
   */
  static async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Error saving settings:", error);
      throw error;
    }
  }

  /**
   * Get app settings
   */
  static async getSettings(): Promise<AppSettings> {
    try {
      const data = await AsyncStorage.getItem(SETTINGS_KEY);
      if (data) {
        return JSON.parse(data);
      }
      // Return default settings
      return {
        apiKey: "",
        notificationsEnabled: true,
        notificationDays: [7, 14, 30],
        lastRefreshTime: null,
      };
    } catch (error) {
      console.error("Error getting settings:", error);
      return {
        apiKey: "",
        notificationsEnabled: true,
        notificationDays: [7, 14, 30],
        lastRefreshTime: null,
      };
    }
  }

  /**
   * Clear all data (for testing or reset)
   */
  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(COMPANIES_KEY);
      await AsyncStorage.removeItem(SETTINGS_KEY);
      await this.deleteApiKey();
    } catch (error) {
      console.error("Error clearing data:", error);
      throw error;
    }
  }
}
