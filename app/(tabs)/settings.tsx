import { ScrollView, Text, View, Pressable, TextInput, Switch, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useCompanyContext } from "@/lib/context/company-context";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/use-colors";
import { createCompaniesHouseAPI } from "@/lib/api/companies-house";
import { formatDate } from "@/lib/deadline-calculator";

export default function SettingsScreen() {
  const router = useRouter();
  const colors = useColors();
  const { settings, updateSettings, setApiKey } = useCompanyContext();
  const [apiKeyInput, setApiKeyInput] = useState(settings.apiKey);
  const [validatingKey, setValidatingKey] = useState(false);
  const [keyValid, setKeyValid] = useState<boolean | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(settings.notificationsEnabled);
  const [notificationDays, setNotificationDays] = useState(settings.notificationDays);

  useEffect(() => {
    setApiKeyInput(settings.apiKey);
  }, [settings.apiKey]);

  const handleValidateAndSaveApiKey = async () => {
    if (!apiKeyInput.trim()) {
      setKeyValid(false);
      return;
    }

    setValidatingKey(true);
    try {
      const api = createCompaniesHouseAPI(apiKeyInput);
      const isValid = await api.validateApiKey();
      setKeyValid(isValid);

      if (isValid) {
        await setApiKey(apiKeyInput);
      }
    } catch (error) {
      setKeyValid(false);
    } finally {
      setValidatingKey(false);
    }
  };

  const handleUpdateNotifications = async () => {
    const updatedSettings = {
      ...settings,
      notificationsEnabled,
      notificationDays,
    };
    await updateSettings(updatedSettings);
  };

  const toggleNotificationDay = (day: number) => {
    const updated = notificationDays.includes(day)
      ? notificationDays.filter((d) => d !== day)
      : [...notificationDays, day].sort((a, b) => a - b);
    setNotificationDays(updated);
  };

  return (
    <ScreenContainer className="p-4">
      <View className="flex-row items-center mb-4">
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            opacity: pressed ? 0.6 : 1,
          })}
          className="mr-3"
        >
          <Ionicons name="chevron-back" size={24} color={colors.foreground} />
        </Pressable>
        <Text className="text-2xl font-bold text-foreground">Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* API Key Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-foreground mb-3">Companies House API</Text>

          <View className="bg-surface rounded-lg p-4 border border-border mb-3">
            <Text className="text-xs text-muted uppercase tracking-wider mb-2">API Key</Text>
            <TextInput
              value={apiKeyInput}
              onChangeText={setApiKeyInput}
              placeholder="Enter your API key"
              placeholderTextColor={colors.muted}
              secureTextEntry
              editable={!validatingKey}
              className="bg-background text-foreground px-3 py-2 rounded border border-border mb-3"
            />

            <Pressable
              onPress={handleValidateAndSaveApiKey}
              disabled={validatingKey}
              style={({ pressed }) => ({
                opacity: pressed ? 0.8 : 1,
              })}
              className="bg-primary px-4 py-3 rounded-lg flex-row items-center justify-center"
            >
              {validatingKey ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={18} color={colors.background} />
                  <Text className="text-background font-semibold ml-2">Validate & Save</Text>
                </>
              )}
            </Pressable>

            {keyValid === true && (
              <View className="mt-3 flex-row items-center gap-2 bg-success/10 p-3 rounded border border-success">
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                <Text className="text-success text-sm font-semibold">API key is valid</Text>
              </View>
            )}

            {keyValid === false && (
              <View className="mt-3 flex-row items-center gap-2 bg-error/10 p-3 rounded border border-error">
                <Ionicons name="close-circle" size={18} color={colors.error} />
                <Text className="text-error text-sm font-semibold">API key is invalid</Text>
              </View>
            )}
          </View>

          <Text className="text-xs text-muted">
            Get your free API key from{" "}
            <Text className="text-primary font-semibold">
              https://developer.company-information.service.gov.uk
            </Text>
          </Text>
        </View>

        {/* Notifications Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-foreground mb-3">Notifications</Text>

          <View className="bg-surface rounded-lg p-4 border border-border mb-3">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-base font-semibold text-foreground">Enable Notifications</Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={(value) => {
                  setNotificationsEnabled(value);
                  handleUpdateNotifications();
                }}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.background}
              />
            </View>

            {notificationsEnabled && (
              <View>
                <Text className="text-xs text-muted uppercase tracking-wider mb-3">
                  Alert me before deadline
                </Text>

                {[7, 14, 30].map((day) => (
                  <Pressable
                    key={day}
                    onPress={() => {
                      toggleNotificationDay(day);
                    }}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.7 : 1,
                    })}
                    className="flex-row items-center py-2 mb-2"
                  >
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 4,
                        borderWidth: 2,
                        borderColor: colors.primary,
                        backgroundColor: notificationDays.includes(day)
                          ? colors.primary
                          : "transparent",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {notificationDays.includes(day) && (
                        <Ionicons name="checkmark" size={14} color={colors.background} />
                      )}
                    </View>
                    <Text className="text-base text-foreground ml-3">
                      {day} day{day !== 1 ? "s" : ""} before
                    </Text>
                  </Pressable>
                ))}

                <Pressable
                  onPress={handleUpdateNotifications}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.8 : 1,
                  })}
                  className="bg-primary px-4 py-3 rounded-lg mt-4"
                >
                  <Text className="text-background font-semibold text-center">Save Preferences</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>

        {/* Data Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-foreground mb-3">Data</Text>

          <View className="bg-surface rounded-lg p-4 border border-border">
            {settings.lastRefreshTime && (
              <Text className="text-xs text-muted mb-4">
                Last updated: {formatDate(settings.lastRefreshTime)}
              </Text>
            )}

            <Pressable
              onPress={() => {}}
              style={({ pressed }) => ({
                opacity: pressed ? 0.8 : 1,
              })}
              className="bg-background border border-border px-4 py-3 rounded-lg mb-3"
            >
              <Text className="text-foreground font-semibold text-center">Clear Cache</Text>
            </Pressable>
          </View>
        </View>

        {/* About Section */}
        <View>
          <Text className="text-lg font-semibold text-foreground mb-3">About</Text>

          <View className="bg-surface rounded-lg p-4 border border-border">
            <View className="mb-4">
              <Text className="text-xs text-muted uppercase tracking-wider mb-1">Version</Text>
              <Text className="text-base font-semibold text-foreground">1.0.0</Text>
            </View>

            <View>
              <Text className="text-xs text-muted uppercase tracking-wider mb-1">
                Companies House API
              </Text>
              <Text className="text-sm text-foreground">
                This app uses the free Companies House Public Data API to fetch company information
                and filing deadlines.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
