import { ScrollView, Text, View, Pressable } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCompanyContext } from "@/lib/context/company-context";
import { useEffect, useState } from "react";
import { Company } from "@/lib/types";
import {
  getCompanyDeadlines,
  formatDate,
  formatDaysRemaining,
  getUrgencyColor,
  formatDeadlineType,
} from "@/lib/deadline-calculator";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/use-colors";

export default function CompanyDetailScreen() {
  const router = useRouter();
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { companies, removeCompany } = useCompanyContext();
  const [company, setCompany] = useState<Company | null>(null);

  useEffect(() => {
    if (id) {
      const found = companies.find((c) => c.id === id);
      setCompany(found || null);
    }
  }, [id, companies]);

  const handleDelete = async () => {
    if (!company) return;
    try {
      await removeCompany(company.id);
      router.back();
    } catch (error) {
      console.error("Error deleting company:", error);
    }
  };

  if (!company) {
    return (
      <ScreenContainer className="p-4 justify-center items-center">
        <Text className="text-lg text-foreground">Company not found</Text>
        <Pressable
          onPress={() => router.back()}
          className="bg-primary px-6 py-3 rounded-lg mt-4"
        >
          <Text className="text-background font-semibold">Go Back</Text>
        </Pressable>
      </ScreenContainer>
    );
  }

  const deadlines = getCompanyDeadlines(
    company.id,
    company.companyName,
    company.nextAccountsDueDate,
    company.confirmationStatementNextDueDate
  );

  const formatAddress = () => {
    const addr = company.registeredOfficeAddress;
    const parts = [
      addr.addressLine1,
      addr.addressLine2,
      addr.locality,
      addr.postalCode,
      addr.country,
    ].filter(Boolean);
    return parts.join(", ");
  };

  return (
    <ScreenContainer className="p-4">
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1">
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({
              opacity: pressed ? 0.6 : 1,
            })}
            className="mb-2"
          >
            <Ionicons name="chevron-back" size={24} color={colors.foreground} />
          </Pressable>
          <Text className="text-2xl font-bold text-foreground">{company.companyName}</Text>
          <Text className="text-sm text-muted">{company.companyNumber}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Company Status */}
        <View className="bg-surface rounded-lg p-4 mb-4 border border-border">
          <Text className="text-xs text-muted uppercase tracking-wider mb-2">Status</Text>
          <View className="flex-row items-center gap-2">
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: company.companyStatus === "active" ? colors.success : colors.error,
              }}
            />
            <Text className="text-base font-semibold text-foreground capitalize">
              {company.companyStatus}
            </Text>
          </View>
        </View>

        {/* Key Information */}
        <View className="bg-surface rounded-lg p-4 mb-4 border border-border">
          <Text className="text-xs text-muted uppercase tracking-wider mb-3">Key Information</Text>

          <View className="mb-3">
            <Text className="text-xs text-muted mb-1">Company Type</Text>
            <Text className="text-base font-semibold text-foreground capitalize">{company.type}</Text>
          </View>

          <View className="mb-3">
            <Text className="text-xs text-muted mb-1">Incorporation Date</Text>
            <Text className="text-base font-semibold text-foreground">
              {formatDate(company.dateOfCreation)}
            </Text>
          </View>

          <View>
            <Text className="text-xs text-muted mb-1">Registered Office</Text>
            <Text className="text-sm text-foreground">{formatAddress()}</Text>
          </View>
        </View>

        {/* Deadlines */}
        <View className="bg-surface rounded-lg p-4 mb-4 border border-border">
          <Text className="text-xs text-muted uppercase tracking-wider mb-3">Upcoming Deadlines</Text>

          {deadlines.length === 0 ? (
            <Text className="text-sm text-muted">No upcoming deadlines</Text>
          ) : (
            deadlines.map((deadline, index) => {
              const isAccounts = deadline.type === "accounts";
              const yearEndInfo = isAccounts && company.accountsYearEndDate
                ? `${company.accountsYearEndDate.day.toString().padStart(2, '0')}/${company.accountsYearEndDate.month.toString().padStart(2, '0')}/${new Date(deadline.dueDate).getFullYear()}`
                : null;
              return (
                <View
                  key={index}
                  className="mb-3 pb-3 border-b border-border last:mb-0 last:pb-0 last:border-b-0"
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="text-base font-semibold text-foreground">
                      {formatDeadlineType(deadline.type)}
                    </Text>
                    <View
                      style={{
                        backgroundColor: getUrgencyColor(deadline.urgency),
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 4,
                      }}
                    >
                      <Text className="text-xs font-semibold text-white capitalize">
                        {deadline.urgency}
                      </Text>
                    </View>
                  </View>
                  {yearEndInfo && (
                    <View className="mb-2">
                      <Text className="text-xs text-muted mb-1">Year End Date</Text>
                      <Text className="text-sm text-foreground font-semibold">{yearEndInfo}</Text>
                    </View>
                  )}
                  <View className="flex-row justify-between items-center">
                    <View>
                      <Text className="text-xs text-muted mb-1">Filing Deadline</Text>
                      <Text className="text-sm text-foreground font-semibold">{formatDate(deadline.dueDate)}</Text>
                    </View>
                    <Text
                      style={{
                        color: getUrgencyColor(deadline.urgency),
                      }}
                      className="font-semibold text-sm"
                    >
                      {formatDaysRemaining(deadline.daysRemaining, deadline.overdue)}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Directors */}
        {company.officers.length > 0 && (
          <View className="bg-surface rounded-lg p-4 mb-4 border border-border">
            <Text className="text-xs text-muted uppercase tracking-wider mb-3">Directors</Text>

            {company.officers.map((officer, index) => (
              <View
                key={index}
                className="mb-3 pb-3 border-b border-border last:mb-0 last:pb-0 last:border-b-0"
              >
                <Text className="text-base font-semibold text-foreground">{officer.name}</Text>
                <Text className="text-sm text-muted capitalize">{officer.role}</Text>
                <Text className="text-xs text-muted mt-1">
                  Appointed: {formatDate(officer.appointmentDate)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Filing History */}
        {company.filingHistory.length > 0 && (
          <View className="bg-surface rounded-lg p-4 mb-4 border border-border">
            <Text className="text-xs text-muted uppercase tracking-wider mb-3">
              Recent Filings
            </Text>

            {company.filingHistory.slice(0, 5).map((filing, index) => (
              <View
                key={index}
                className="mb-3 pb-3 border-b border-border last:mb-0 last:pb-0 last:border-b-0"
              >
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-foreground">{filing.type}</Text>
                    <Text className="text-xs text-muted">{filing.description}</Text>
                  </View>
                  <Text className="text-xs text-muted ml-2">{formatDate(filing.date)}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Last Updated */}
        <View className="bg-surface rounded-lg p-4 mb-4 border border-border">
          <Text className="text-xs text-muted">
            Last updated: {formatDate(company.lastRefreshed)}
          </Text>
        </View>

        {/* Delete Button */}
        <Pressable
          onPress={handleDelete}
          style={({ pressed }) => ({
            opacity: pressed ? 0.7 : 1,
          })}
          className="bg-error/10 border border-error rounded-lg p-4 mb-4"
        >
          <Text className="text-error font-semibold text-center">Remove from Favorites</Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}
