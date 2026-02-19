import {
  ScrollView,
  Text,
  View,
  Pressable,
  TextInput,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useCompanyContext } from "@/lib/context/company-context";
import { useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/use-colors";
import { createCompaniesHouseAPI } from "@/lib/api/companies-house";

export default function AddCompanyScreen() {
  const router = useRouter();
  const colors = useColors();
  const { settings, addCompany } = useCompanyContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ number: string; name: string | undefined }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<"name" | "number">("name");

  // Handle text input changes (just update state, don't search)
  const handleTextChange = useCallback((query: string) => {
    setSearchQuery(query);
    setError(null);
  }, []);

  // Execute search when user presses Enter/Return
  const handleSearch = useCallback(async () => {
    if (searchQuery.length < 1) {
      setSearchResults([]);
      return;
    }

    // Auto-detect search mode
    const isNumberSearch = /^[0-9]{8}$/.test(searchQuery);
    if (isNumberSearch) {
      setSearchMode("number");
    } else {
      setSearchMode("name");
    }

    setLoading(true);
    setError(null);

    try {
      if (!settings.apiKey) {
        throw new Error("API key not configured");
      }

      const api = createCompaniesHouseAPI(settings.apiKey);
      const results = await api.searchCompanies(searchQuery);
      const mapped = (results.items || []).map((item) => ({
        number: item.company_number,
        name: item.title || item.company_name || "Unknown Company",
      }));
      setSearchResults(mapped.slice(0, 15));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Search failed";
      setError(errorMessage);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, settings.apiKey]);

  const handleSelectCompany = async (companyNumber: string) => {
    try {
      setLoading(true);
      await addCompany(companyNumber);
      router.back();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add company";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderSearchResult = ({
    item,
  }: {
    item: { number: string; name: string | undefined };
  }) => (
    <Pressable
      onPress={() => handleSelectCompany(item.number)}
      style={({ pressed }) => ({
        opacity: pressed ? 0.7 : 1,
      })}
      className="py-3 px-4 border-b border-border flex-row items-center justify-between"
    >
      <View className="flex-1">
        <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
          {item.name}
        </Text>
        <Text className="text-xs text-muted mt-1">{item.number}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.muted} />
    </Pressable>
  );

  return (
    <ScreenContainer className="flex-1 bg-background">
      {/* Header */}
      <View className="px-4 pt-3 pb-3 flex-row justify-between items-center gap-2">
        <Text className="text-2xl font-bold text-foreground flex-1">Search Companies</Text>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Ionicons name="close" size={24} color={colors.foreground} />
        </Pressable>
      </View>

      {error && (
        <View className="bg-error/10 border border-error rounded-lg p-3 mx-4 mb-3">
          <Text className="text-sm text-error">{error}</Text>
        </View>
      )}

      {/* Search Input */}
      <View className="px-4 pb-4">
        <View className="flex-row items-center bg-surface border border-border rounded-lg px-3 py-2">
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            className="flex-1 ml-2 text-foreground"
            placeholder="Search by company name or number"
            placeholderTextColor={colors.muted}
            value={searchQuery}
            onChangeText={handleTextChange}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            editable={!loading}
          />
          {searchQuery.length > 0 && (
            <Pressable
              onPress={() => {
                setSearchQuery("");
                setSearchResults([]);
              }}
              style={({ pressed }) => ({
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Ionicons name="close-circle" size={18} color={colors.muted} />
            </Pressable>
          )}
        </View>

        {/* Search Mode Indicator */}
        {searchQuery.length > 0 && (
          <View className="mt-2 flex-row items-center gap-2">
            <View className="bg-primary/10 rounded-full px-3 py-1">
              <Text className="text-xs font-semibold text-primary">
                {searchMode === "number" ? "Company Number" : "Company Name"}
              </Text>
            </View>
            <Text className="text-xs text-muted">
              {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} found
            </Text>
          </View>
        )}
      </View>

      {/* Loading State */}
      {loading && (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="text-sm text-muted mt-3">Searching companies...</Text>
        </View>
      )}

      {/* Search Results */}
      {!loading && searchResults.length > 0 && (
        <FlatList
          data={searchResults}
          renderItem={renderSearchResult}
          keyExtractor={(item) => item.number}
          scrollEnabled={true}
        />
      )}

      {/* Empty State */}
      {!loading && searchQuery.length === 0 && searchResults.length === 0 && (
        <View className="flex-1 justify-center items-center px-4">
          <Ionicons name="search" size={48} color={colors.muted} />
          <Text className="text-lg font-semibold text-foreground mt-4">Search for Companies</Text>
          <Text className="text-sm text-muted text-center mt-2">
            Enter a company name or 8-digit company number and press Enter to search
          </Text>
        </View>
      )}

      {/* No Results State */}
      {!loading && searchQuery.length > 0 && searchResults.length === 0 && !error && (
        <View className="flex-1 justify-center items-center px-4">
          <Ionicons name="alert-circle-outline" size={48} color={colors.muted} />
          <Text className="text-lg font-semibold text-foreground mt-4">No Results</Text>
          <Text className="text-sm text-muted text-center mt-2">
            No companies found matching "{searchQuery}". Try a different search term.
          </Text>
        </View>
      )}
    </ScreenContainer>
  );
}
