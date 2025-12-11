// screens/VerifyScreen.tsx

import { COLORS, OPACITY } from "@/constants/colors";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { ArrowLeft, Building, MapPin, Phone, User } from "lucide-react-native";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { z } from "zod";

import { usersApi } from "@/api/users";
import AppText from "@/components/common/AppText";
import { Button, Input } from "@/components/ui";
import { useAuthStore } from "@/stores/authStore";


// FIXED: Added "student." prefix to match JSON structure
const verifySchema = z.object({
  fatherName: z.string().min(1, "student.verify.errors.father_required"),
  instituteName: z.string().min(1, "student.verify.errors.institute_required"),
  permanentAddress: z.string().min(1, "student.verify.errors.address_required"),
  phoneNumber: z.string().min(10, "student.verify.errors.phone_required"),
  whatsappNumber: z.string().min(10, "student.verify.errors.whatsapp_required"),
});

type VerifyFormData = z.infer<typeof verifySchema>;

export default function VerifyScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { setUser, user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyFormData>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      fatherName: "",
      instituteName: "",
      permanentAddress: "",
      phoneNumber: "",
      whatsappNumber: "",
    },
  });

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(app)/student");
    }
  };

  const onSubmit = async (data: VerifyFormData) => {
    try {
      setLoading(true);
      const response = await usersApi.selfVerify(data);

      if (response.success) {
        if (user) {
          const newUser = {
            ...user,
            studentProfile: {
              ...user.studentProfile,
              selfVerified: true,
            },
          };
          // @ts-ignore
          setUser(newUser);
        }

        // FIXED: Added "student." prefix
        Toast.show({
          type: "success",
          text1: t("student.verify.toast.success_title"),
          text2: t("student.verify.toast.success_message"),
        });

        router.replace("/(app)/student");
      }
    } catch (error: any) {
      // FIXED: Added "student." prefix
      Toast.show({
        type: "error",
        text1: t("student.verify.toast.failed_title"),
        text2: error?.response?.data?.message || t("common.generic_error"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={handleGoBack}
          style={({ pressed }) => [
            styles.backButton,
            pressed && { opacity: OPACITY.pressed },
          ]}
        >
          <ArrowLeft size={22} color={COLORS.textPrimary} strokeWidth={1.5} />
        </Pressable>

        {/* FIXED: Added "student." prefix */}
        <AppText style={styles.headerTitle}>{t("student.verify.header_title")}</AppText>

        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {/* Intro Section */}
          <View style={styles.introSection}>
            {/* FIXED: Added "student." prefix */}
            <AppText style={styles.introTitle}>{t("student.verify.intro.title")}</AppText>
            <AppText style={styles.introDesc}>
              {t("student.verify.intro.description")}
            </AppText>
          </View>

          {/* Form */}
          <View style={styles.formSection}>
            {/* Father Name */}
            <Controller
              control={control}
              name="fatherName"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label={t("student.verify.fields.father.label")}
                  placeholder={t("student.verify.fields.father.placeholder")}
                  leftIcon={
                    <User
                      size={20}
                      color={COLORS.textMuted}
                      strokeWidth={1.5}
                    />
                  }
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={
                    errors.fatherName?.message && t(errors.fatherName.message)
                  }
                />
              )}
            />

            {/* Institute */}
            <Controller
              control={control}
              name="instituteName"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label={t("student.verify.fields.institute.label")}
                  placeholder={t("student.verify.fields.institute.placeholder")}
                  leftIcon={
                    <Building
                      size={20}
                      color={COLORS.textMuted}
                      strokeWidth={1.5}
                    />
                  }
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={
                    errors.instituteName?.message &&
                    t(errors.instituteName.message)
                  }
                />
              )}
            />

            {/* Address */}
            <Controller
              control={control}
              name="permanentAddress"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label={t("student.verify.fields.address.label")}
                  placeholder={t("student.verify.fields.address.placeholder")}
                  leftIcon={
                    <MapPin
                      size={20}
                      color={COLORS.textMuted}
                      strokeWidth={1.5}
                    />
                  }
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={
                    errors.permanentAddress?.message &&
                    t(errors.permanentAddress.message)
                  }
                  multiline
                />
              )}
            />

            {/* Phone */}
            <Controller
              control={control}
              name="phoneNumber"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label={t("student.verify.fields.phone.label")}
                  placeholder={t("student.verify.fields.phone.placeholder")}
                  leftIcon={
                    <Phone
                      size={20}
                      color={COLORS.textMuted}
                      strokeWidth={1.5}
                    />
                  }
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="phone-pad"
                  error={
                    errors.phoneNumber?.message && t(errors.phoneNumber.message)
                  }
                />
              )}
            />

            {/* WhatsApp */}
            <Controller
              control={control}
              name="whatsappNumber"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label={t("student.verify.fields.whatsapp.label")}
                  placeholder={t("student.verify.fields.whatsapp.placeholder")}
                  leftIcon={
                    <Phone
                      size={20}
                      color={COLORS.textMuted}
                      strokeWidth={1.5}
                    />
                  }
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="phone-pad"
                  error={
                    errors.whatsappNumber?.message &&
                    t(errors.whatsappNumber.message)
                  }
                />
              )}
            />

            {/* Submit Button */}
            <View style={styles.buttonContainer}>
              {/* FIXED: Added "student." prefix */}
              <Button
                title={t("student.verify.submit_button")}
                onPress={handleSubmit(onSubmit)}
                loading={loading}
              />
            </View>

            {/* Note */}
            <View style={styles.noteBox}>
              {/* FIXED: Added "student." prefix */}
              <AppText style={styles.noteText}>{t("student.verify.note")}</AppText>
            </View>
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.bgPrimary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.bgCard,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  headerSpacer: {
    width: 44,
  },

  // Content
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },

  // Intro Section
  introSection: {
    marginBottom: 28,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 10,
    letterSpacing: -0.4,
  },
  introDesc: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },

  // Form Section
  formSection: {
    flex: 1,
  },
  buttonContainer: {
    marginTop: 8,
  },

  // Note Box
  noteBox: {
    marginTop: 20,
    padding: 16,
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 12,
  },
  noteText: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 20,
    textAlign: "center",
  },
});