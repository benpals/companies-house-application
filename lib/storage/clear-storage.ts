import AsyncStorage from "@react-native-async-storage/async-storage";

export async function clearAllStorage() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    await AsyncStorage.multiRemove(keys);
    console.log("All storage cleared");
  } catch (error) {
    console.error("Error clearing storage:", error);
  }
}

export async function clearCompanies() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const companyKeys = keys.filter((key) => key.startsWith("company_"));
    await AsyncStorage.multiRemove(companyKeys);
    console.log("Companies cleared");
  } catch (error) {
    console.error("Error clearing companies:", error);
  }
}
