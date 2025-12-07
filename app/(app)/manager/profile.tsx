// app/(app)/manager/profile.tsx

import { COLORS, OPACITY } from '@/constants/colors';
import { useRouter } from 'expo-router';
import {
  AlertCircle,
  Building2,
  ChevronRight,
  Clock,
  CreditCard,
  FileText,
  LogOut,
  Mail,
  Plus,
  Trash2,
  User,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { usersApi } from '@/api/users';
import { Verification, verificationApi } from '@/api/verification';
import { LoadingScreen } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';
import { ManagerProfile } from '@/types';

export default function ManagerProfileScreen() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const [profile, setProfile] = useState<ManagerProfile | null>(null);
  const [verification, setVerification] = useState<Verification | null>(null);
  const [loading, setLoading] = useState(true);

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmText, setConfirmText] = useState('');
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
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Failed to fetch profile',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== 'I want to delete.') return;

    setDeleting(true);
    try {
      await usersApi.deleteMyAccount();
      await logout();
      router.replace('/(auth)/login');
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err?.response?.data?.message || 'Failed to delete account',
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  const isVerified = verification?.status === 'APPROVED';
  const isPending = verification?.status === 'PENDING';
  const isRejected = verification?.status === 'REJECTED';

  const getPaymentMethods = () => {
    if (!verification) return null;
    const methods: string[] = [];
    if (verification.easypaisaNumber) methods.push(`Easypaisa: ${verification.easypaisaNumber}`);
    if (verification.jazzcashNumber) methods.push(`JazzCash: ${verification.jazzcashNumber}`);
    if (verification.customBanks?.length) {
      verification.customBanks.forEach((bank) => {
        methods.push(`${bank.bankName}: ****${bank.accountNumber.slice(-4)}`);
      });
    }
    return methods.length > 0 ? methods.join('\n') : null;
  };

  const infoItems = [
    { label: 'Email', value: user?.email, icon: Mail },
    { label: 'Owner Name', value: verification?.ownerName, icon: User },
    { label: 'City', value: verification?.city, icon: Building2 },
    { label: 'Payment Methods', value: getPaymentMethods(), icon: CreditCard, multiline: true },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {verification?.ownerName?.charAt(0) || user?.email?.charAt(0) || 'M'}
            </Text>
          </View>

          <Text style={styles.name}>
            {verification?.ownerName || profile?.fullName || 'Manager'}
          </Text>
          <Text style={styles.email}>{user?.email}</Text>

          <View style={styles.badgeRow}>
            <View style={styles.badgeInfo}>
              <Text style={styles.badgeInfoText}>MANAGER</Text>
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
              <Text
                style={[
                  styles.badgeText,
                  isVerified && styles.badgeSuccessText,
                  isPending && styles.badgePendingText,
                  isRejected && styles.badgeErrorText,
                  !isVerified && !isPending && !isRejected && styles.badgeWarningText,
                ]}
              >
                {isVerified ? 'VERIFIED' : isPending ? 'PENDING' : isRejected ? 'REJECTED' : 'UNVERIFIED'}
              </Text>
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
            onPress={() => !isPending && router.push('/(app)/manager/verification')}
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
                <AlertCircle size={20} color={isRejected ? COLORS.error : COLORS.warning} strokeWidth={1.5} />
              )}
            </View>
            <View style={styles.verifyContent}>
              <Text style={styles.verifyTitle}>
                {isPending ? 'Verification Pending' : isRejected ? 'Verification Rejected' : 'Verification Required'}
              </Text>
              <Text style={styles.verifyDesc}>
                {isPending
                  ? 'Your verification is under review'
                  : isRejected
                  ? verification?.adminComment || 'Please resubmit verification'
                  : 'Complete verification to add hostels'}
              </Text>
            </View>
            {!isPending && (
              <ChevronRight size={18} color={isRejected ? COLORS.error : COLORS.warning} strokeWidth={1.5} />
            )}
          </Pressable>
        )}

        {/* Account Information */}
        {(isVerified || isPending) && verification && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ACCOUNT INFORMATION</Text>
            <View style={styles.card}>
              {infoItems.map((item, idx) => (
                <View key={idx}>
                  {idx !== 0 && <View style={styles.divider} />}
                  <View style={styles.infoRow}>
                    <View style={styles.iconBox}>
                      <item.icon size={16} color={COLORS.textMuted} strokeWidth={1.5} />
                    </View>
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>{item.label}</Text>
                      <Text style={[styles.infoValue, item.multiline && styles.infoValueMultiline]}>
                        {item.value || '—'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Quick Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>QUICK LINKS</Text>
          <View style={styles.card}>
            <LinkRow
              icon={<Building2 size={16} color={COLORS.info} strokeWidth={1.5} />}
              iconBg={COLORS.infoLight}
              label="My Hostels"
              onPress={() => router.push('/(app)/manager/hostels')}
            />
            <View style={styles.divider} />
            <LinkRow
              icon={<FileText size={16} color={COLORS.success} strokeWidth={1.5} />}
              iconBg={COLORS.successLight}
              label="Booking Requests"
              onPress={() => router.push('/(app)/manager/bookings')}
            />
            <View style={styles.divider} />
            <LinkRow
              icon={<Plus size={16} color={COLORS.warning} strokeWidth={1.5} />}
              iconBg={COLORS.warningLight}
              label="Add New Hostel"
              onPress={() => router.push('/(app)/manager/hostel/create')}
            />
          </View>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACCOUNT</Text>
          <View style={styles.card}>
            <LinkRow
              icon={<LogOut size={16} color={COLORS.textSecondary} strokeWidth={1.5} />}
              iconBg={COLORS.bgSecondary}
              label="Logout"
              onPress={handleLogout}
            />
            <View style={styles.divider} />
            <LinkRow
              icon={<Trash2 size={16} color={COLORS.error} strokeWidth={1.5} />}
              iconBg={COLORS.errorLight}
              label="Delete Account"
              labelColor={COLORS.error}
              chevronColor={COLORS.error}
              onPress={() => setConfirmVisible(true)}
            />
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Delete Modal */}
      <Modal transparent visible={confirmVisible} animationType="fade" statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalIcon}>
              <Trash2 size={28} color={COLORS.error} strokeWidth={1.5} />
            </View>

            <Text style={styles.modalTitle}>Delete Account</Text>
            <Text style={styles.modalDesc}>
              This action cannot be undone. All your data including hostels will be permanently deleted.
            </Text>

            <Text style={styles.modalLabel}>
              Type <Text style={styles.modalHighlight}>"I want to delete."</Text> to confirm:
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="I want to delete."
              placeholderTextColor={COLORS.inputPlaceholder}
              value={confirmText}
              onChangeText={setConfirmText}
              autoCapitalize="none"
            />

            <View style={styles.modalButtons}>
              <Pressable
                style={({ pressed }) => [styles.cancelBtn, pressed && { opacity: OPACITY.pressed }]}
                onPress={() => {
                  setConfirmVisible(false);
                  setConfirmText('');
                }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.deleteBtn,
                  confirmText !== 'I want to delete.' && styles.deleteBtnDisabled,
                  pressed && confirmText === 'I want to delete.' && { opacity: OPACITY.pressed },
                ]}
                onPress={handleDeleteAccount}
                disabled={confirmText !== 'I want to delete.' || deleting}
              >
                <Text style={styles.deleteBtnText}>{deleting ? 'Deleting...' : 'Delete'}</Text>
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
    style={({ pressed }) => [styles.linkRow, pressed && { opacity: OPACITY.pressed }]}
    onPress={onPress}
  >
    <View style={[styles.iconBox, { backgroundColor: iconBg }]}>{icon}</View>
    <Text style={[styles.linkText, { color: labelColor }]}>{label}</Text>
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
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },

  // Profile Card
  profileCard: {
    alignItems: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '600',
    color: COLORS.textInverse,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
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
    flexDirection: 'row',
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
    backgroundColor: '#F3E8FF',
  },
  badgeInfoText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9333EA',
    letterSpacing: 0.5,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  badgeSuccess: { backgroundColor: COLORS.successLight },
  badgeSuccessText: { color: COLORS.success },
  badgeWarning: { backgroundColor: COLORS.warningLight },
  badgeWarningText: { color: COLORS.warning },
  badgePending: { backgroundColor: COLORS.warningLight },
  badgePendingText: { color: COLORS.warning },
  badgeError: { backgroundColor: COLORS.errorLight },
  badgeErrorText: { color: COLORS.error },

  // Verify Banner
  verifyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
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
    fontWeight: '600',
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
    fontWeight: '600',
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
    overflow: 'hidden',
  },

  // Info Row
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.bgSecondary,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontWeight: '500',
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  linkText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.overlay,
    padding: 24,
  },
  modalBox: {
    width: '100%',
    backgroundColor: COLORS.bgCard,
    padding: 28,
    borderRadius: 24,
  },
  modalIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: COLORS.errorLight,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  modalDesc: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  modalHighlight: {
    fontWeight: '600',
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
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.bgSecondary,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  deleteBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.error,
    alignItems: 'center',
  },
  deleteBtnDisabled: {
    backgroundColor: COLORS.errorMuted,
  },
  deleteBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textInverse,
  },
});