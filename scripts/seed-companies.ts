import { createCompaniesHouseAPI } from "../lib/api/companies-house";
import * as fs from "fs";
import * as path from "path";

const API_KEY = process.env.COMPANIES_HOUSE_API_KEY || "0048f207-1b47-47ff-a8cf-5722074f97ea";

const companyNumbers = [
  "12194837", "11584510", "09374133", "13739640", "13328319",
  "15558026", "12663108", "05442766", "12273977", "06542579",
  "15153386", "12796174", "15940170", "04227657", "10514436",
  "10347308", "13398593", "12798938", "12749941", "15676410",
  "15159101", "12819102", "10616077", "09629612", "13353409",
  "11748493", "14353029", "09404669", "09394489", "10294589",
  "10619515", "09689336", "15781791", "08325691", "10251286",
  "09680861", "12623298", "09407191", "16553877", "07132920",
  "13961820", "05538601", "14237884", "14046074", "13951728",
  "08680420", "08368478", "08483355", "10122566", "11387251",
  "14693530", "14921966", "12801205", "15781474", "13952899",
  "14725866", "13846310", "16110561", "12555734", "09143269",
  "10470287", "13601061", "11832350", "12193111", "13398604",
  "13897249", "09575488", "14047721", "10277099", "07354667",
  "07689092", "14921058", "10267735", "10823646", "15913462",
  "13711343", "12501554", "14899055", "09440776", "07887253",
  "12976739", "07594685", "10722082", "11302067", "12291805",
  "09219512", "11588306", "09387619", "10154905", "13503203",
  "14790568", "04924534", "07053859", "08049670", "12977595",
  "11821694", "09043242", "11437318", "12830702", "11974233",
  "09369599", "13705908", "16686851", "15858868", "16314652",
  "16828731", "16876400", "16885338",
];

interface CompanyData {
  id: string;
  companyName: string;
  companyNumber: string;
  companyStatus: string;
  companyType: string;
  registeredOfficeAddress: string;
  incorporationDate: string;
  nextAccountsDueDate: string;
  lastAccountsMadeUpTo: string;
  nextConfirmationStatementDueDate: string;
  confirmationStatementLastMadeUpTo: string;
  directors: Array<{ name: string; appointmentDate: string }>;
  filingHistory: Array<{ date: string; type: string; description: string }>;
}

async function seedCompanies() {
  const api = createCompaniesHouseAPI(API_KEY);
  const companies: CompanyData[] = [];
  let successCount = 0;
  let failureCount = 0;

  console.log(`Fetching data for ${companyNumbers.length} companies...`);

  for (let i = 0; i < companyNumbers.length; i++) {
    const companyNumber = companyNumbers[i];
    try {
      const profile = await api.getCompanyProfile(companyNumber);
      const officers = await api.getCompanyOfficers(companyNumber);
      const filings = await api.getFilingHistory(companyNumber);

      const company: CompanyData = {
        id: companyNumber,
        companyName: profile.company_name || "Unknown",
        companyNumber: profile.company_number || companyNumber,
        companyStatus: profile.company_status || "active",
        companyType: (profile as any).type || "private-company",
        registeredOfficeAddress: profile.registered_office_address
          ? `${profile.registered_office_address.address_line_1 || ""}, ${profile.registered_office_address.postal_code || ""}`
          : "N/A",
        incorporationDate: profile.date_of_creation || "N/A",
        nextAccountsDueDate: profile.accounts?.next_accounts?.due_on || "N/A",
        lastAccountsMadeUpTo: profile.accounts?.last_accounts?.made_up_to || "N/A",
        nextConfirmationStatementDueDate: profile.confirmation_statement?.next_due || "N/A",
        confirmationStatementLastMadeUpTo: profile.confirmation_statement?.last_made_up_to || "N/A",
        directors: (officers.items || [])
          .slice(0, 5)
          .map((officer: any) => ({
            name: officer.name || "Unknown",
            appointmentDate: officer.appointed_on || "N/A",
          })),
        filingHistory: (filings.items || [])
          .slice(0, 5)
          .map((filing: any) => ({
            date: filing.date || "N/A",
            type: filing.type || "Unknown",
            description: filing.description || "N/A",
          })),
      };

      companies.push(company);
      console.log(`✓ [${i + 1}/${companyNumbers.length}] ${profile.company_name}`);
      successCount++;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      console.log(`✗ [${i + 1}/${companyNumbers.length}] Failed to fetch ${companyNumber}: ${errorMsg}`);
      failureCount++;
    }

    // Add delay to avoid rate limiting
    if ((i + 1) % 10 === 0) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  // Save to JSON file
  const outputPath = path.join(__dirname, "../seed-data.json");
  fs.writeFileSync(outputPath, JSON.stringify(companies, null, 2));

  console.log("\n=== Seed Summary ===");
  console.log(`✓ Success: ${successCount}`);
  console.log(`✗ Failed: ${failureCount}`);
  console.log(`\nData saved to: ${outputPath}`);
  console.log(`Total companies: ${companies.length}`);
}

seedCompanies().catch(console.error);
