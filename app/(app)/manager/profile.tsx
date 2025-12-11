// app/(app)/manager/profile.tsx

import { COLORS, OPACITY } from "@/constants/colors";
import { useRouter } from "expo-router";
import {
  AlertCircle,
  Building2,
  ChevronRight,
  Clock,
  Cog,
  CreditCard,
  FileText,
  LogOut,
  Mail,
  Plus,
  Trash2,
  User,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import { usersApi } from "@/api/users";
import { Verification, verificationApi } from "@/api/verification";
import AppText from "@/components/common/AppText";
import { LoadingScreen } from "@/components/ui";
import { useAuthStore } from "@/stores/authStore";
import { ManagerProfile } from "@/types";


export default function ManagerProfileScreen() {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const [profile, setProfile] = useState<ManagerProfile | null>(null);
  const [verification, setVerification] = useState<Verification | null>(null);
  const [loading, setLoading] = useState(true);

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, verificationRes] = await Promise.all([
        usersApi.getManagerProfile(),
        verificationApi.getMyVerifications(),
      ]);

      if (profileRes.success) setProfile(profileRes.data);
      if (verificationRes.success && verificationRes.data.length > 0) {
        setVerification(verificationRes.data[0]);
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: t("manager.profile.fetch_error_title"),
        text2:
          error?.response?.data?.message ||
          t("manager.profile.fetch_error_message"),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== t("manager.profile.delete_modal.confirm_phrase"))
      return;

    setDeleting(true);
    try {
      await usersApi.deleteMyAccount();
      await logout();
      router.replace("/(auth)/login");
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: t("manager.profile.delete_modal.error_title"),
        text2:
          err?.response?.data?.message ||
          t("manager.profile.delete_modal.error_message"),
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  const isVerified = verification?.status === "APPROVED";
  const isPending = verification?.status === "PENDING";
  const isRejected = verification?.status === "REJECTED";

  const getPaymentMethods = () => {
    if (!verification) return null;
    const methods: string[] = [];
    if (verification.easypaisaNumber) {
      methods.push(
        `${t("manager.profile.payment_easypaisa")}: ${
          verification.easypaisaNumber
        }`
      );
    }
    if (verification.jazzcashNumber) {
      methods.push(
        `${t("manager.profile.payment_jazzcash")}: ${
          verification.jazzcashNumber
        }`
      );
    }
    if (verification.customBanks?.length) {
      verification.customBanks.forEach((bank) => {
        methods.push(`${bank.bankName}: ****${bank.accountNumber.slice(-4)}`);
      });
    }
    return methods.length > 0 ? methods.join("\n") : null;
  };

  const infoItems = [
    { label: t("manager.profile.info_email"), value: user?.email, icon: Mail },
    {
      label: t("manager.profile.info_owner_name"),
      value: verification?.ownerName,
      icon: User,
    },
    {
      label: t("manager.profile.info_city"),
      value: verification?.city,
      icon: Building2,
    },
    {
      label: t("manager.profile.info_payment_methods"),
      value: getPaymentMethods(),
      icon: CreditCard,
      multiline: true,
    },
  ];

  const getStatusLabel = () => {
    if (isVerified) return t("manager.profile.status.verified");
    if (isPending) return t("manager.profile.status.pending");
    if (isRejected) return t("manager.profile.status.rejected");
    return t("manager.profile.status.unverified");
  };

  const getVerificationTitle = () => {
    if (isPending) return t("manager.profile.verification_pending_title");
    if (isRejected) return t("manager.profile.verification_rejected_title");
    return t("manager.profile.verification_required_title");
  };

  const getVerificationDesc = () => {
    if (isPending) return t("manager.profile.verification_pending_desc");
    if (isRejected)
      return (
        verification?.adminComment ||
        t("manager.profile.verification_rejected_fallback")
      );
    return t("manager.profile.verification_required_desc");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <AppText style={styles.title}>{t("manager.profile.title")}</AppText>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <AppText style={styles.avatarText}>
              {verification?.ownerName?.charAt(0) ||
                user?.email?.charAt(0) ||
                "M"}
            </AppText>
          </View>

          <AppText style={styles.name}>
            {verification?.ownerName ||
              profile?.fullName ||
              t("manager.profile.fallback_name")}
          </AppText>
          <AppText style={styles.email}>{user?.email}</AppText>

          <View style={styles.badgeRow}>
            <View style={styles.badgeInfo}>
              <AppText style={styles.badgeInfoText}>
                {t("manager.profile.role_badge")}
              </AppText>
            </View>
            <View
              style={[
                styles.badge,
                isVerified && styles.badgeSuccess,
                isPending && styles.badgePending,
                isRejected && styles.badgeError,
                !isVerified && !isPending && !isRejected && styles.badgeWarning,
              ]}
            >
              <AppText
                style={[
                  styles.badgeText,
                  isVerified && styles.badgeSuccessText,
                  isPending && styles.badgePendingText,
                  isRejected && styles.badgeErrorText,
                  !isVerified &&
                    !isPending &&
                    !isRejected &&
                    styles.badgeWarningText,
                ]}
              >
                {getStatusLabel()}
              </AppText>
            </View>
          </View>
        </View>

        {/* Verification Banner */}
        {!isVerified && (
          <Pressable
            style={({ pressed }) => [
              styles.verifyBanner,
              isPending && styles.verifyBannerPending,
              isRejected && styles.verifyBannerError,
              pressed && !isPending && { opacity: OPACITY.pressed },
            ]}
            onPress={() =>
              !isPending && router.push("/(app)/manager/verification")
            }
            disabled={isPending}
          >
            <View
              style={[
                styles.verifyIcon,
                isPending && styles.verifyIconPending,
                isRejected && styles.verifyIconError,
              ]}
            >
              {isPending ? (
                <Clock size={20} color={COLORS.info} strokeWidth={1.5} />
              ) : (
                <AlertCircle
                  size={20}
                  color={isRejected ? COLORS.error : COLORS.warning}
                  strokeWidth={1.5}
                />
              )}
            </View>
            <View style={styles.verifyContent}>
              <AppText style={styles.verifyTitle}>{getVerificationTitle()}</AppText>
              <AppText style={styles.verifyDesc}>{getVerificationDesc()}</AppText>
            </View>
            {!isPending && (
              <ChevronRight
                size={18}
                color={isRejected ? COLORS.error : COLORS.warning}
                strokeWidth={1.5}
              />
            )}
          </Pressable>
        )}

        {/* Account Information */}
        {(isVerified || isPending) && verification && (
          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>
              {t("manager.profile.section_account_info")}
            </AppText>
            <View style={styles.card}>
              {infoItems.map((item, idx) => (
                <View key={idx}>
                  {idx !== 0 && <View style={styles.divider} />}
                  <View style={styles.infoRow}>
                    <View style={styles.iconBox}>
                      <item.icon
                        size={16}
                        color={COLORS.textMuted}
                        strokeWidth={1.5}
                      />
                    </View>
                    <View style={styles.infoContent}>
                      <AppText style={styles.infoLabel}>{item.label}</AppText>
                      <AppText
                        style={[
                          styles.infoValue,
                          item.multiline && styles.infoValueMultiline,
                        ]}
                      >
                        {item.value || t("manager.profile.info_empty")}
                      </AppText>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Quick Links */}
        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>
            {t("manager.profile.section_quick_links")}
          </AppText>
          <View style={styles.card}>
            <LinkRow
              icon={
                <Building2 size={16} color={COLORS.info} strokeWidth={1.5} />
              }
              iconBg={COLORS.infoLight}
              label={t("manager.profile.link_my_hostels")}
              onPress={() => router.push("/(app)/manager/hostels")}
            />
            <View style={styles.divider} />
            <LinkRow
              icon={
                <FileText size={16} color={COLORS.success} strokeWidth={1.5} />
              }
              iconBg={COLORS.successLight}
              label={t("manager.profile.link_booking_requests")}
              onPress={() => router.push("/(app)/manager/bookings")}
            />
            <View style={styles.divider} />
            <LinkRow
              icon={<Plus size={16} color={COLORS.warning} strokeWidth={1.5} />}
              iconBg={COLORS.warningLight}
              label={t("manager.profile.link_add_hostel")}
              onPress={() => router.push("/(app)/manager/hostel/create")}
            />
            <View style={styles.divider} />
            <LinkRow
              icon={
                <Cog size={16} color={COLORS.textSecondary} strokeWidth={1.5} />
              }
              iconBg={COLORS.bgSecondary}
              label={t("manager.profile.link_settings")}
              onPress={() => router.push("/(app)/settings")}
            />
          </View>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>
            {t("manager.profile.section_account")}
          </AppText>
          <View style={styles.card}>
            <LinkRow
              icon={
                <LogOut
                  size={16}
                  color={COLORS.textSecondary}
                  strokeWidth={1.5}
                />
              }
              iconBg={COLORS.bgSecondary}
              label={t("manager.profile.link_logout")}
              onPress={handleLogout}
            />
            <View style={styles.divider} />
            <LinkRow
              icon={<Trash2 size={16} color={COLORS.error} strokeWidth={1.5} />}
              iconBg={COLORS.errorLight}
              label={t("manager.profile.link_delete_account")}
              labelColor={COLORS.error}
              chevronColor={COLORS.error}
              onPress={() => setConfirmVisible(true)}
            />
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Delete Modal */}
      <Modal
        transparent
        visible={confirmVisible}
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalIcon}>
              <Trash2 size={28} color={COLORS.error} strokeWidth={1.5} />
            </View>

            <AppText style={styles.modalTitle}>
              {t("manager.profile.delete_modal.title")}
            </AppText>
            <AppText style={styles.modalDesc}>
              {t("manager.profile.delete_modal.description")}
            </AppText>

            <AppText style={styles.modalLabel}>
              {t("manager.profile.delete_modal.label_prefix")}{" "}
              <AppText style={styles.modalHighlight}>
                "{t("manager.profile.delete_modal.confirm_phrase")}"
              </AppText>{" "}
              {t("manager.profile.delete_modal.label_suffix")}
            </AppText>

            <TextInput
              style={styles.modalInput}
              placeholder={t("manager.profile.delete_modal.confirm_phrase")}
              placeholderTextColor={COLORS.inputPlaceholder}
              value={confirmText}
              onChangeText={setConfirmText}
              autoCapitalize="none"
            />

            <View style={styles.modalButtons}>
              <Pressable
                style={({ pressed }) => [
                  styles.cancelBtn,
                  pressed && { opacity: OPACITY.pressed },
                ]}
                onPress={() => {
                  setConfirmVisible(false);
                  setConfirmText("");
                }}
              >
                <AppText style={styles.cancelBtnText}>
                  {t("manager.profile.delete_modal.cancel")}
                </AppText>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.deleteBtn,
                  confirmText !==
                    t("manager.profile.delete_modal.confirm_phrase") &&
                    styles.deleteBtnDisabled,
                  pressed &&
                    confirmText ===
                      t("manager.profile.delete_modal.confirm_phrase") && {
                      opacity: OPACITY.pressed,
                    },
                ]}
                onPress={handleDeleteAccount}
                disabled={
                  confirmText !==
                    t("manager.profile.delete_modal.confirm_phrase") || deleting
                }
              >
                <AppText style={styles.deleteBtnText}>
                  {deleting
                    ? t("manager.profile.delete_modal.deleting")
                    : t("manager.profile.delete_modal.delete")}
                </AppText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Link Row Component
interface LinkRowProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  labelColor?: string;
  chevronColor?: string;
  onPress: () => void;
}

const LinkRow: React.FC<LinkRowProps> = ({
  icon,
  iconBg,
  label,
  labelColor = COLORS.textPrimary,
  chevronColor = COLORS.textMuted,
  onPress,
}) => (
  <Pressable
    style={({ pressed }) => [
      styles.linkRow,
      pressed && { opacity: OPACITY.pressed },
    ]}
    onPress={onPress}
  >
    <View style={[styles.iconBox, { backgroundColor: iconBg }]}>{icon}</View>
    <AppText style={[styles.linkText, { color: labelColor }]}>{label}</AppText>
    <ChevronRight size={18} color={chevronColor} strokeWidth={1.5} />
  </Pressable>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  scrollContent: {
    paddingBottom: 24,
  },

  // Header
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },

  // Profile Card
  profileCard: {
    alignItems: "center",
    backgroundColor: COLORS.bgCard,
    marginHorizontal: 20,
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "600",
    color: COLORS.textInverse,
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  email: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeInfo: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#F3E8FF",
  },
  badgeInfoText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9333EA",
    letterSpacing: 0.5,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  badgeSuccess: { backgroundColor: COLORS.successLight },
  badgeSuccessText: { color: COLORS.success },
  badgeWarning: { backgroundColor: COLORS.warningLight },
  badgeWarningText: { color: COLORS.warning },
  badgePending: { backgroundColor: COLORS.infoLight },
  badgePendingText: { color: COLORS.info },
  badgeError: { backgroundColor: COLORS.errorLight },
  badgeErrorText: { color: COLORS.error },

  // Verify Banner
  verifyBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.warningLight,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.warningMuted,
  },
  verifyBannerPending: {
    backgroundColor: COLORS.infoLight,
    borderColor: COLORS.infoMuted,
  },
  verifyBannerError: {
    backgroundColor: COLORS.errorLight,
    borderColor: COLORS.errorMuted,
  },
  verifyIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  verifyIconPending: {
    backgroundColor: COLORS.white,
  },
  verifyIconError: {
    backgroundColor: COLORS.white,
  },
  verifyContent: {
    flex: 1,
  },
  verifyTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  verifyDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  // Section
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

  // Card
  card: {
    backgroundColor: COLORS.bgCard,
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    overflow: "hidden",
  },

  // Info Row
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.bgSecondary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: "500",
  },
  infoValueMultiline: {
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginHorizontal: 16,
  },

  // Link Row
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  linkText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.overlay,
    padding: 24,
  },
  modalBox: {
    width: "100%",
    backgroundColor: COLORS.bgCard,
    padding: 28,
    borderRadius: 24,
  },
  modalIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: COLORS.errorLight,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  modalDesc: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  modalLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  modalHighlight: {
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
    backgroundColor: COLORS.inputBg,
    padding: 14,
    borderRadius: 12,
    fontSize: 15,
    color: COLORS.textPrimary,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.bgSecondary,
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  deleteBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.error,
    alignItems: "center",
  },
  deleteBtnDisabled: {
    backgroundColor: COLORS.errorMuted,
  },
  deleteBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textInverse,
  },
});
