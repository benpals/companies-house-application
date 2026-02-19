import { ScrollView, Text, View, Pressable, RefreshControl, FlatList } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useCompanyContext } from "@/lib/context/company-context";
import { useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { Deadline, Company } from "@/lib/types";
import {
  getCompanyDeadlines,
  getNextDeadline,
  formatDaysRemaining,
  formatDate,
  getUrgencyColor,
} from "@/lib/deadline-calculator";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/use-colors";


export default function HomeScreen() {
  const router = useRouter();
  const colors = useColors();
  const { companies, loading, error, refreshCompanies, settings, removeCompany } = useCompanyContext();
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<"urgency" | "name" | "next30">("urgency");
  const [deadlineType, setDeadlineType] = useState<"accounts" | "confirmation">("accounts");

  // Refresh on screen focus
  useFocusEffect(
    useCallback(() => {
      if (!settings.apiKey) {
        return;
      }
      handleRefresh();
    }, [settings.apiKey])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshCompanies();
    } catch (error) {
      console.error("Error refreshing companies:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Get filtered and sorted deadline data
  const getTableData = (): Array<{
    id: string;
    companyName: string;
    yearEndDate: string;
    dueDate: string;
    daysRemaining: number;
    overdue: boolean;
    urgency: "critical" | "urgent" | "normal";
  }> => {
    const data: Array<{
      id: string;
      companyName: string;
      yearEndDate: string;
      dueDate: string;
      daysRemaining: number;
      overdue: boolean;
      urgency: "critical" | "urgent" | "normal";
    }> = [];

    companies.forEach((company) => {
      let yearEndDate: string = "N/A";

      if (deadlineType === "accounts") {
        // Show the company's accounting year-end date (e.g., 31/12/2025)
        if (company.accountsYearEndDate && company.nextAccountsDueDate) {
          const { day, month } = company.accountsYearEndDate;
          // Extract year from the next accounts due date
          const dueDate = new Date(company.nextAccountsDueDate);
          const year = dueDate.getFullYear();
          yearEndDate = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
        }
      } else {
        // For confirmation statement, show the last made up to date as reference
        if (company.confirmationStatementLastMadeUpTo) {
          yearEndDate = formatDate(company.confirmationStatementLastMadeUpTo);
        }
      }

      const deadlines = getCompanyDeadlines(
        company.id,
        company.companyName,
        company.nextAccountsDueDate,
        company.confirmationStatementNextDueDate
      );

      const deadline = deadlines.find((d) => {
        if (deadlineType === "accounts") {
          return d.type === "accounts";
        } else {
          return d.type === "confirmation_statement";
        }
      });

      if (deadline) {
        data.push({
          id: company.id,
          companyName: company.companyName,
          yearEndDate: yearEndDate,
          dueDate: formatDate(deadline.dueDate),
          daysRemaining: deadline.daysRemaining,
          overdue: deadline.overdue,
          urgency: deadline.urgency,
        });
      }
    });

    // Apply sorting
    if (sortBy === "urgency") {
      data.sort((a, b) => {
        const urgencyOrder = { critical: 0, urgent: 1, normal: 2 };
        const urgencyDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
        if (urgencyDiff !== 0) return urgencyDiff;
        return a.daysRemaining - b.daysRemaining;
      });
    } else if (sortBy === "name") {
      data.sort((a, b) => a.companyName.localeCompare(b.companyName));
    } else if (sortBy === "next30") {
      data.sort((a, b) => a.daysRemaining - b.daysRemaining);
      // Filter to only show next 30 days
      return data.filter((item) => item.daysRemaining <= 30 && !item.overdue);
    }

    return data;
  };

  const tableData = getTableData();

  const getUrgencyBgColor = (urgency: string, overdue: boolean) => {
    if (overdue) return colors.error;
    if (urgency === "critical") return colors.error;
    if (urgency === "urgent") return colors.warning;
    return colors.success;
  };

  const renderTableRow = ({
    item,
  }: {
    item: {
      id: string;
      companyName: string;
      yearEndDate: string;
      dueDate: string;
      daysRemaining: number;
      overdue: boolean;
      urgency: "critical" | "urgent" | "normal";
    };
  }) => {
    const bgColor = getUrgencyBgColor(item.urgency, item.overdue);

    return (
      <Pressable
        onPress={() => router.push({ pathname: "/company/[id]", params: { id: item.id } })}
        style={({ pressed }) => ({
          opacity: pressed ? 0.7 : 1,
        })}
        className="px-4 py-3 border-b border-border flex-row items-center gap-3"
      >
        <View
          style={{ backgroundColor: bgColor }}
          className="w-1 h-10 rounded-full"
        />
        <View className="flex-1">
          <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
            {item.companyName}
          </Text>
          <Text className="text-xs text-muted mt-0.5">{item.yearEndDate}</Text>
        </View>
        <View className="items-end">
          <Text className="text-xs text-muted">{item.dueDate}</Text>
        </View>
        <View className="items-center min-w-[50px]">
          <Text className={`text-sm font-semibold ${
            item.overdue ? "text-error" : item.urgency === "critical" ? "text-error" : item.urgency === "urgent" ? "text-warning" : "text-success"
          }`}>
            {item.daysRemaining}d
          </Text>
        </View>
      </Pressable>
    );
  };

  if (!settings.apiKey) {
    return (
      <ScreenContainer className="p-4 justify-center">
        <View className="items-center gap-4">
          <Ionicons name="alert-circle" size={48} color={colors.error} />
          <Text className="text-xl font-semibold text-foreground text-center">
            API Key Required
          </Text>
          <Text className="text-sm text-muted text-center">
            Please configure your Companies House API key in settings to get started.
          </Text>
          <Pressable
            onPress={() => router.push("/settings")}
            className="bg-primary px-6 py-3 rounded-lg mt-4"
          >
            <Text className="text-background font-semibold">Go to Settings</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="flex-1 bg-background">
      {/* Header with Title and Action Buttons */}
      <View className="px-4 pt-3 pb-2 flex-row justify-between items-center gap-2">
        <Text className="text-2xl font-bold text-foreground flex-1">Deadlines</Text>
        <Pressable
          onPress={handleRefresh}
          disabled={refreshing}
          style={({ pressed }) => ({
            opacity: pressed ? 0.6 : refreshing ? 0.5 : 1,
          })}
        >
          <Ionicons 
            name={refreshing ? "refresh" : "refresh-outline"} 
            size={20} 
            color={colors.foreground} 
          />
        </Pressable>

        <Pressable
          onPress={() => router.push("/settings")}
          style={({ pressed }) => ({
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Ionicons name="settings" size={20} color={colors.foreground} />
        </Pressable>
      </View>

      {error && (
        <View className="bg-error/10 border border-error rounded-lg p-2 mx-4 mb-2">
          <Text className="text-xs text-error">{error}</Text>
        </View>
      )}

      {/* Deadline Type Filter - Compact */}
      <View className="px-4 pb-2 flex-row gap-1">
        <Pressable
          onPress={() => setDeadlineType("accounts")}
          style={({ pressed }) => ({
            opacity: pressed ? 0.7 : 1,
          })}
          className={`flex-1 py-1.5 px-2 rounded-lg border ${
            deadlineType === "accounts"
              ? "bg-primary border-primary"
              : "bg-surface border-border"
          }`}
        >
          <Text
            className={`text-xs font-semibold text-center ${
              deadlineType === "accounts" ? "text-background" : "text-foreground"
            }`}
          >
            Accounts
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setDeadlineType("confirmation")}
          style={({ pressed }) => ({
            opacity: pressed ? 0.7 : 1,
          })}
          className={`flex-1 py-1.5 px-2 rounded-lg border ${
            deadlineType === "confirmation"
              ? "bg-primary border-primary"
              : "bg-surface border-border"
          }`}
        >
          <Text
            className={`text-xs font-semibold text-center ${
              deadlineType === "confirmation" ? "text-background" : "text-foreground"
            }`}
          >
            Confirmation
          </Text>
        </Pressable>
      </View>

      {/* Sort Options - Compact */}
      <View className="px-4 pb-2 flex-row gap-1">
        <Pressable
          onPress={() => setSortBy("urgency")}
          style={({ pressed }) => ({
            opacity: pressed ? 0.7 : 1,
          })}
          className={`flex-1 py-1.5 px-2 rounded-lg border ${
            sortBy === "urgency"
              ? "bg-primary border-primary"
              : "bg-surface border-border"
          }`}
        >
          <Text
            className={`text-xs font-semibold text-center ${
              sortBy === "urgency" ? "text-background" : "text-foreground"
            }`}
          >
            Urgency
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setSortBy("name")}
          style={({ pressed }) => ({
            opacity: pressed ? 0.7 : 1,
          })}
          className={`flex-1 py-1.5 px-2 rounded-lg border ${
            sortBy === "name"
              ? "bg-primary border-primary"
              : "bg-surface border-border"
          }`}
        >
          <Text
            className={`text-xs font-semibold text-center ${
              sortBy === "name" ? "text-background" : "text-foreground"
            }`}
          >
            Name
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setSortBy("next30")}
          style={({ pressed }) => ({
            opacity: pressed ? 0.7 : 1,
          })}
          className={`flex-1 py-1.5 px-2 rounded-lg border ${
            sortBy === "next30"
              ? "bg-primary border-primary"
              : "bg-surface border-border"
          }`}
        >
          <Text
            className={`text-xs font-semibold text-center ${
              sortBy === "next30" ? "text-background" : "text-foreground"
            }`}
          >
            Next 30d
          </Text>
        </Pressable>
      </View>

      {/* Table */}
      {tableData.length === 0 ? (
        <View className="flex-1 justify-center items-center px-4">
          <Ionicons name="briefcase-outline" size={48} color={colors.muted} />
          <Text className="text-lg font-semibold text-foreground mt-4">No Deadlines</Text>
          <Text className="text-sm text-muted text-center mt-2">
            Add companies to track their {deadlineType === "accounts" ? "annual accounts" : "confirmation statement"} deadlines
          </Text>
          <Pressable
            onPress={() => router.push("/add-company")}
            className="bg-primary px-6 py-2 rounded-lg mt-4"
          >
            <Text className="text-background font-semibold text-sm">Add Company</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={tableData}
          renderItem={renderTableRow}
          keyExtractor={(item) => item.id}
          scrollEnabled={true}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={
            <View className="px-4 py-2 flex-row items-center gap-3 bg-surface border-b border-border">
              <View style={{ width: 4, height: 20 }} />
              <View className="flex-1">
                <Text className="text-xs font-bold text-muted uppercase tracking-wider">
                  Company
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-xs font-bold text-muted uppercase tracking-wider">
                  Due Date
                </Text>
              </View>
              <View className="items-center min-w-[50px]">
                <Text className="text-xs font-bold text-muted uppercase tracking-wider">
                  Days
                </Text>
              </View>
            </View>
          }
        />
      )}
    </ScreenContainer>
  );
}
