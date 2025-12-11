// app/(app)/manager/verification.tsx

import { COLORS, OPACITY } from "@/constants/colors";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Building2,
  Camera,
  Check,
  CreditCard,
  MapPin,
  Plus,
  X,
} from "lucide-react-native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import { verificationApi } from "@/api/verification";
import AppText from "@/components/common/AppText";
import { Button, Input } from "@/components/ui";


export default function VerificationScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form state
  const [ownerName, setOwnerName] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [hostelFor, setHostelFor] = useState<"BOYS" | "GIRLS">("BOYS");
  const [initialHostelNames, setInitialHostelNames] = useState<string[]>([""]);
  const [buildingImages, setBuildingImages] = useState<string[]>([]);
  const [easypaisaNumber, setEasypaisaNumber] = useState("");
  const [jazzcashNumber, setJazzcashNumber] = useState("");
  const [customBanks, setCustomBanks] = useState<
    { bankName: string; accountNumber: string; iban: string }[]
  >([]);
  const [acceptedRules, setAcceptedRules] = useState(false);

  // Image handlers
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setBuildingImages((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    setBuildingImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Hostel names
  const addHostelName = () => setInitialHostelNames((prev) => [...prev, ""]);

  const updateHostelName = (index: number, value: string) => {
    const updated = [...initialHostelNames];
    updated[index] = value;
    setInitialHostelNames(updated);
  };

  const removeHostelName = (index: number) => {
    if (initialHostelNames.length > 1) {
      setInitialHostelNames((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Banks
  const addBank = () =>
    setCustomBanks((prev) => [
      ...prev,
      { bankName: "", accountNumber: "", iban: "" },
    ]);

  const updateBank = (
    index: number,
    field: keyof (typeof customBanks)[number],
    value: string
  ) => {
    const updated = [...customBanks];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setCustomBanks(updated);
  };

  const removeBank = (index: number) =>
    setCustomBanks((prev) => prev.filter((_, i) => i !== index));

  // Validation
  const showError = (msg: string) => {
    Toast.show({
      type: "error",
      text1: t("manager.verification.errors.title"),
      text2: msg,
    });
    return false;
  };

  const validateStep1 = () => {
    if (!ownerName.trim())
      return showError(t("manager.verification.errors.owner_name_required"));
    if (!city.trim())
      return showError(t("manager.verification.errors.city_required"));
    if (!address.trim())
      return showError(t("manager.verification.errors.address_required"));
    if (!initialHostelNames.filter((n) => n.trim()).length)
      return showError(t("manager.verification.errors.hostel_name_required"));
    return true;
  };

  const validateStep2 = () => {
    if (buildingImages.length === 0)
      return showError(t("manager.verification.errors.image_required"));
    return true;
  };

  const validateStep3 = () => {
    const hasEasypaisa = easypaisaNumber.trim().length > 0;
    const hasJazzcash = jazzcashNumber.trim().length > 0;
    const hasValidBank = customBanks.some(
      (bank) => bank.bankName.trim() && bank.accountNumber.trim()
    );

    if (!hasEasypaisa && !hasJazzcash && !hasValidBank) {
      return showError(t("manager.verification.errors.payment_required"));
    }

    if (!acceptedRules)
      return showError(t("manager.verification.errors.rules_required"));
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("ownerName", ownerName.trim());
      formData.append("city", city.trim());
      formData.append("address", address.trim());
      formData.append("hostelFor", hostelFor);
      formData.append("acceptedRules", "true");

      initialHostelNames
        .filter((n) => n.trim())
        .forEach((name, index) => {
          formData.append(`initialHostelNames[${index}]`, name.trim());
        });

      if (easypaisaNumber.trim())
        formData.append("easypaisaNumber", easypaisaNumber.trim());
      if (jazzcashNumber.trim())
        formData.append("jazzcashNumber", jazzcashNumber.trim());

      customBanks.forEach((bank, index) => {
        if (bank.bankName.trim() && bank.accountNumber.trim()) {
          formData.append(
            `customBanks[${index}][bankName]`,
            bank.bankName.trim()
          );
          formData.append(
            `customBanks[${index}][accountNumber]`,
            bank.accountNumber.trim()
          );
          if (bank.iban.trim())
            formData.append(`customBanks[${index}][iban]`, bank.iban.trim());
        }
      });

      buildingImages.forEach((uri, index) => {
        const filename = uri.split("/").pop() || `image${index}.jpg`;
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";
        formData.append("buildingImages", { uri, name: filename, type } as any);
      });

      const response = await verificationApi.submit(formData);
      if (response.success) {
        Toast.show({
          type: "success",
          text1: t("manager.verification.success.title"),
          text2: t("manager.verification.success.message"),
        });
        router.back();
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: t("manager.verification.errors.title"),
        text2:
          error?.response?.data?.message ||
          t("manager.verification.errors.submit_failed"),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep((prev) => (prev - 1) as 1 | 2 | 3);
    else router.back();
  };

  // Step renderers (UI only)
  const renderStep1 = () => (
    <>
      <AppText style={styles.stepTitle}>
        {t("manager.verification.step1.title")}
      </AppText>
      <AppText style={styles.stepDesc}>
        {t("manager.verification.step1.description")}
      </AppText>

      <Input
        label={t("manager.verification.step1.owner_name_label")}
        placeholder={t("manager.verification.step1.owner_name_placeholder")}
        leftIcon={
          <Building2 size={20} color={COLORS.textMuted} strokeWidth={1.5} />
        }
        value={ownerName}
        onChangeText={setOwnerName}
      />

      <Input
        label={t("manager.verification.step1.city_label")}
        placeholder={t("manager.verification.step1.city_placeholder")}
        leftIcon={
          <MapPin size={20} color={COLORS.textMuted} strokeWidth={1.5} />
        }
        value={city}
        onChangeText={setCity}
      />

      <Input
        label={t("manager.verification.step1.address_label")}
        placeholder={t("manager.verification.step1.address_placeholder")}
        leftIcon={
          <MapPin size={20} color={COLORS.textMuted} strokeWidth={1.5} />
        }
        value={address}
        onChangeText={setAddress}
        multiline
      />

      <AppText style={styles.label}>
        {t("manager.verification.step1.hostel_for_label")}
      </AppText>
      <View style={styles.genderRow}>
        {(["BOYS", "GIRLS"] as const).map((type) => (
          <Pressable
            key={type}
            style={({ pressed }) => [
              styles.genderOption,
              hostelFor === type && styles.genderOptionActive,
              pressed && { opacity: OPACITY.pressed },
            ]}
            onPress={() => setHostelFor(type)}
          >
            <AppText
              style={[
                styles.genderText,
                hostelFor === type && styles.genderTextActive,
              ]}
            >
              {type === "BOYS"
                ? t("manager.verification.step1.boys")
                : t("manager.verification.step1.girls")}
            </AppText>
          </Pressable>
        ))}
      </View>

      <AppText style={styles.label}>
        {t("manager.verification.step1.hostel_names_label")}
      </AppText>
      {initialHostelNames.map((name, index) => (
        <View key={index} style={styles.hostelNameRow}>
          <TextInput
            style={styles.hostelNameInput}
            placeholder={t(
              "manager.verification.step1.hostel_name_placeholder",
              { index: index + 1 }
            )}
            placeholderTextColor={COLORS.textMuted}
            value={name}
            onChangeText={(v) => updateHostelName(index, v)}
          />
          {initialHostelNames.length > 1 && (
            <Pressable
              style={({ pressed }) => [
                styles.removeButton,
                pressed && { opacity: OPACITY.pressed },
              ]}
              onPress={() => removeHostelName(index)}
            >
              <X size={18} color={COLORS.error} strokeWidth={1.5} />
            </Pressable>
          )}
        </View>
      ))}
      <Pressable
        style={({ pressed }) => [
          styles.addButton,
          pressed && { opacity: OPACITY.pressed },
        ]}
        onPress={addHostelName}
      >
        <Plus size={18} color={COLORS.primary} strokeWidth={1.5} />
        <AppText style={styles.addButtonText}>
          {t("manager.verification.step1.add_hostel")}
        </AppText>
      </Pressable>
    </>
  );

  const renderStep2 = () => (
    <>
      <AppText style={styles.stepTitle}>
        {t("manager.verification.step2.title")}
      </AppText>
      <AppText style={styles.stepDesc}>
        {t("manager.verification.step2.description")}
      </AppText>

      <View style={styles.imagesGrid}>
        {buildingImages.map((uri, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={{ uri }} style={styles.uploadedImage} />
            <Pressable
              style={({ pressed }) => [
                styles.removeImageButton,
                pressed && { opacity: OPACITY.pressed },
              ]}
              onPress={() => removeImage(index)}
            >
              <X size={14} color={COLORS.textInverse} strokeWidth={2} />
            </Pressable>
          </View>
        ))}

        {buildingImages.length < 5 && (
          <Pressable
            style={({ pressed }) => [
              styles.addImageButton,
              pressed && { opacity: OPACITY.pressed },
            ]}
            onPress={pickImage}
          >
            <Camera size={28} color={COLORS.textMuted} strokeWidth={1.5} />
            <AppText style={styles.addImageText}>
              {t("manager.verification.step2.add_photo")}
            </AppText>
          </Pressable>
        )}
      </View>

      <AppText style={styles.imageHint}>
        {t("manager.verification.step2.image_hint")}
      </AppText>
    </>
  );

  const renderStep3 = () => (
    <>
      <AppText style={styles.stepTitle}>
        {t("manager.verification.step3.title")}
      </AppText>
      <AppText style={styles.stepDesc}>
        {t("manager.verification.step3.description")}
      </AppText>

      <Input
        label={t("manager.verification.step3.easypaisa_label")}
        placeholder={t("manager.verification.step3.easypaisa_placeholder")}
        leftIcon={
          <CreditCard size={20} color={COLORS.textMuted} strokeWidth={1.5} />
        }
        value={easypaisaNumber}
        onChangeText={setEasypaisaNumber}
        keyboardType="phone-pad"
      />

      <Input
        label={t("manager.verification.step3.jazzcash_label")}
        placeholder={t("manager.verification.step3.jazzcash_placeholder")}
        leftIcon={
          <CreditCard size={20} color={COLORS.textMuted} strokeWidth={1.5} />
        }
        value={jazzcashNumber}
        onChangeText={setJazzcashNumber}
        keyboardType="phone-pad"
      />

      <AppText style={styles.label}>
        {t("manager.verification.step3.bank_accounts_label")}
      </AppText>
      {customBanks.map((bank, index) => (
        <View key={index} style={styles.bankCard}>
          <View style={styles.bankHeader}>
            <AppText style={styles.bankTitle}>
              {t("manager.verification.step3.bank_title", { index: index + 1 })}
            </AppText>
            <Pressable onPress={() => removeBank(index)}>
              <X size={18} color={COLORS.error} strokeWidth={1.5} />
            </Pressable>
          </View>
          <TextInput
            style={styles.bankInput}
            placeholder={t("manager.verification.step3.bank_name_placeholder")}
            placeholderTextColor={COLORS.textMuted}
            value={bank.bankName}
            onChangeText={(v) => updateBank(index, "bankName", v)}
          />
          <TextInput
            style={styles.bankInput}
            placeholder={t(
              "manager.verification.step3.account_number_placeholder"
            )}
            placeholderTextColor={COLORS.textMuted}
            value={bank.accountNumber}
            onChangeText={(v) => updateBank(index, "accountNumber", v)}
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.bankInput, { marginBottom: 0 }]}
            placeholder={t("manager.verification.step3.iban_placeholder")}
            placeholderTextColor={COLORS.textMuted}
            value={bank.iban}
            onChangeText={(v) => updateBank(index, "iban", v)}
          />
        </View>
      ))}
      <Pressable
        style={({ pressed }) => [
          styles.addButton,
          pressed && { opacity: OPACITY.pressed },
        ]}
        onPress={addBank}
      >
        <Plus size={18} color={COLORS.primary} strokeWidth={1.5} />
        <AppText style={styles.addButtonText}>
          {t("manager.verification.step3.add_bank")}
        </AppText>
      </Pressable>

      {/* Info hint about required payment method */}
      <AppText style={styles.paymentHint}>
        {t("manager.verification.step3.payment_hint")}
      </AppText>

      {/* Rules */}
      <View style={styles.rulesCard}>
        <AppText style={styles.rulesTitle}>
          {t("manager.verification.step3.rules_title")}
        </AppText>
        <AppText style={styles.rulesText}>
          {t("manager.verification.step3.rules_text")}
        </AppText>

        <View style={styles.acceptRow}>
          <Switch
            value={acceptedRules}
            onValueChange={setAcceptedRules}
            trackColor={{ false: COLORS.border, true: COLORS.primary + "55" }}
            thumbColor={acceptedRules ? COLORS.primary : COLORS.textMuted}
          />
          <AppText style={styles.acceptText}>
            {t("manager.verification.step3.accept_rules")}
          </AppText>
        </View>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => [
            styles.backButton,
            pressed && { opacity: OPACITY.pressed },
          ]}
        >
          <ArrowLeft size={22} color={COLORS.textPrimary} strokeWidth={1.5} />
        </Pressable>
        <AppText style={styles.headerTitle}>
          {t("manager.verification.title")}
        </AppText>
        <View style={styles.headerSpacer} />
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressLine}>
          <View
            style={[
              styles.progressLineFill,
              { width: `${((step - 1) / 2) * 100}%` },
            ]}
          />
        </View>
        {[1, 2, 3].map((s) => {
          const isComplete = s < step;
          const isActive = s === step;
          return (
            <View
              key={s}
              style={[
                styles.progressStep,
                isActive && styles.progressStepActive,
                isComplete && styles.progressStepComplete,
              ]}
            >
              {isComplete ? (
                <Check size={14} color={COLORS.textInverse} strokeWidth={2.5} />
              ) : (
                <AppText
                  style={[
                    styles.progressText,
                    (isActive || isComplete) && styles.progressTextActive,
                  ]}
                >
                  {s}
                </AppText>
              )}
            </View>
          );
        })}
      </View>

      {/* Content: plain ScrollView, no KeyboardAvoidingView, no Animated */}
      <ScrollView
        style={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
        {step < 3 ? (
          <Button
            title={t("manager.verification.button_continue")}
            onPress={handleNext}
          />
        ) : (
          <Button
            title={t("manager.verification.button_submit")}
            onPress={handleSubmit}
            loading={loading}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
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

  // Progress
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    paddingHorizontal: 50,
    position: "relative",
  },
  progressLine: {
    position: "absolute",
    left: 80,
    right: 80,
    height: 3,
    backgroundColor: COLORS.borderLight,
    top: "50%",
    marginTop: -1.5,
  },
  progressLineFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  progressStep: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.bgCard,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    marginHorizontal: 28,
  },
  progressStepActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  progressStepComplete: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textMuted,
  },
  progressTextActive: {
    color: COLORS.textInverse,
  },

  // Step titles
  stepTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 8,
    letterSpacing: -0.4,
  },
  stepDesc: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 28,
    lineHeight: 22,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.textSecondary,
    marginBottom: 10,
    marginTop: 8,
  },

  // Gender Selection
  genderRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  genderOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  genderText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textMuted,
  },
  genderTextActive: {
    color: COLORS.primary,
  },

  // Hostel Names
  hostelNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  hostelNameInput: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: COLORS.textPrimary,
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
  },
  removeButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.errorLight,
    borderRadius: 12,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
    marginTop: 8,
    marginBottom: 20,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },

  // Images
  imagesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 12,
  },
  imageContainer: {
    position: "relative",
    width: 100,
    height: 100,
    borderRadius: 14,
    overflow: "hidden",
  },
  uploadedImage: {
    width: "100%",
    height: "100%",
  },
  removeImageButton: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.error,
    justifyContent: "center",
    alignItems: "center",
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 14,
    backgroundColor: COLORS.bgCard,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  addImageText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: "500",
  },
  imageHint: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 24,
  },

  // Banks
  bankCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  bankHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  bankTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  bankInput: {
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: COLORS.textPrimary,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
  },

  // Payment hint
  paymentHint: {
    fontSize: 13,
    color: COLORS.warning,
    fontStyle: "italic",
    marginBottom: 16,
  },

  // Rules
  rulesCard: {
    marginTop: 4,
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  rulesTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 14,
    letterSpacing: -0.2,
  },
  rulesText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 26,
    marginBottom: 18,
  },
  acceptRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  acceptText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    flex: 1,
    fontWeight: "500",
  },

  // Bottom Bar
  bottomBar: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 32,
    backgroundColor: COLORS.bgPrimary,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
});
