import AppText from "@/components/common/AppText";
import Constants from "expo-constants";
import { Stack, useRouter } from "expo-router";
import i18n from "i18next";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { changeAppLanguage } from "../../../i18n";

import { COLORS, OPACITY } from "@/constants/colors";

export default function SettingsScreen() {
  const router = useRouter();
  const { t, i18n: i18nInstance } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language);

  // Listen for language changes to force re-render
  useEffect(() => {
    const onLanguageChanged = (lng: string) => {
      setCurrentLang(lng);
    };

    i18n.on("languageChanged", onLanguageChanged);

    return () => {
      i18n.off("languageChanged", onLanguageChanged);
    };
  }, []);

  const languages = [
    { code: "en", label: t("app.settings.language_en") },
    { code: "ur", label: t("app.settings.language_ur") },
    { code: "pinglish", label: t("app.settings.language_pinglish") },
  ];

  const onSelectLanguage = async (code: string) => {
    await changeAppLanguage(code);
    setCurrentLang(code); // Immediately update state for instant UI feedback
  };

  const appVersion =
    Constants.expoConfig?.version ?? Constants.manifest?.version ?? "N/A";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen
        options={{ headerTitle: t("app.settings.title"), headerShown: true }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* LANGUAGE SECTION */}
        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>
            {t("app.settings.language_section")}
          </AppText>

          <View style={styles.card}>
            {languages.map((lang, idx) => (
              <View key={lang.code}>
                {idx !== 0 && <View style={styles.divider} />}

                <Pressable
                  style={({ pressed }) => [
                    styles.languageRow,
                    currentLang === lang.code && styles.activeLanguageRow,
                    pressed && { opacity: OPACITY.pressed },
                  ]}
                  onPress={() => onSelectLanguage(lang.code)}
                >
                  <AppText
                    style={[
                      styles.languageText,
                      currentLang === lang.code && styles.activeLanguageText,
                    ]}
                  >
                    {lang.label}
                  </AppText>

                  {/* Optional: Add checkmark for active language */}
                  {currentLang === lang.code && (
                    <AppText style={styles.checkmark}>✓</AppText>
                  )}
                </Pressable>
              </View>
            ))}
          </View>
        </View>

        {/* ABOUT SECTION */}
        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>
            {t("app.settings.about_section")}
          </AppText>

          <View style={styles.card}>
            <View style={styles.infoRow}>
              <AppText style={styles.infoLabel}>
                {t("app.settings.app_version")}
              </AppText>
              <AppText style={styles.infoValue}>{appVersion}</AppText>
            </View>
          </View>
        </View>

        {/* MADE WITH LOVE */}
        <View style={styles.madeWithLoveContainer}>
          <AppText style={styles.madeWithLoveText}>
            {t("app.settings.made_with_love")}
          </AppText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  section: {
    marginTop: 28,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textMuted,
    paddingHorizontal: 24,
    marginBottom: 12,
    letterSpacing: 0.8,
  },
  card: {
    backgroundColor: COLORS.bgCard,
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    overflow: "hidden",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginHorizontal: 16,
  },
  languageRow: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  activeLanguageRow: {
    backgroundColor: COLORS.primaryLight + "30",
  },
  languageText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: "500",
  },
  activeLanguageText: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  checkmark: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: "700",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  infoLabel: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 15,
    color: COLORS.textMuted,
  },
  madeWithLoveContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  madeWithLoveText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: "500",
  },
});
