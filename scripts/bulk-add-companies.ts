import { createCompaniesHouseAPI } from "../lib/api/companies-house";

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

async function bulkAddCompanies() {
  const api = createCompaniesHouseAPI(API_KEY);
  let successCount = 0;
  let failureCount = 0;
  const failures: string[] = [];

  console.log(`Starting bulk add of ${companyNumbers.length} companies...`);

  for (let i = 0; i < companyNumbers.length; i++) {
    const companyNumber = companyNumbers[i];
    try {
      const profile = await api.getCompanyProfile(companyNumber);
      console.log(`✓ [${i + 1}/${companyNumbers.length}] ${profile.company_name} (${companyNumber})`);
      successCount++;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      console.log(`✗ [${i + 1}/${companyNumbers.length}] Failed to fetch ${companyNumber}: ${errorMsg}`);
      failures.push(companyNumber);
      failureCount++;
    }
  }

  console.log("\n=== Bulk Add Summary ===");
  console.log(`✓ Success: ${successCount}`);
  console.log(`✗ Failed: ${failureCount}`);
  if (failures.length > 0) {
    console.log(`Failed company numbers: ${failures.join(", ")}`);
  }
}

bulkAddCompanies().catch(console.error);
