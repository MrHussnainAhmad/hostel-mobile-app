// screens/ProfileScreen.tsx

import { COLORS, OPACITY } from '@/constants/colors';
import { useRouter } from 'expo-router';
import {
  AlertCircle,
  Building,
  Calendar,
  ChevronRight,
  Cog,
  FileText,
  LogOut,
  MapPin,
  Phone,
  Trash2,
  User,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { usersApi } from '@/api/users';
import AppText from "@/components/common/AppText";
import { useAuthStore } from '@/stores/authStore';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const profile = user?.studentProfile;
  const isVerified = profile?.selfVerified;

  // Key from JSON: "I want to delete."
  const DELETE_PHRASE = t('manager.profile.delete_modal.confirm_phrase');

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== DELETE_PHRASE) return;

    setDeleting(true);
    try {
      await usersApi.deleteMyAccount();
      await logout();
      router.replace('/(auth)/login');
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: t('manager.profile.delete_modal.error_title'),
        text2: err?.response?.data?.message || t('manager.profile.delete_modal.error_message'),
      });
    } finally {
      setDeleting(false);
    }
  };

  const infoItems = [
    { label: t('auth.register.full_name_label'), value: profile?.fullName, icon: User },
    { label: t('student.verify.fields.father.label'), value: profile?.fatherName, icon: User },
    { label: t('student.verify.fields.institute.label'), value: profile?.instituteName, icon: Building },
    { label: t('student.verify.fields.address.label'), value: profile?.permanentAddress, icon: MapPin },
    { label: t('student.verify.fields.phone.label'), value: profile?.phoneNumber, icon: Phone },
    { label: t('student.verify.fields.whatsapp.label'), value: profile?.whatsappNumber, icon: Phone },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <AppText style={styles.title}>{t('manager.profile.title')}</AppText>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <AppText style={styles.avatarText}>
              {profile?.fullName?.charAt(0) || user?.email?.charAt(0) || 'S'}
            </AppText>
          </View>

          <AppText style={styles.name}>{profile?.fullName || t('student.home.fallback_name')}</AppText>
          <AppText style={styles.email}>{user?.email}</AppText>

          <View style={styles.badgeRow}>
            <View style={styles.badgeInfo}>
              <AppText style={styles.badgeInfoText}>
                {t('student.home.fallback_name').toUpperCase()}
              </AppText>
            </View>
            <View style={[
              styles.badge,
              isVerified ? styles.badgeSuccess : styles.badgeWarning
            ]}>
              <AppText style={[
                styles.badgeText,
                isVerified ? styles.badgeSuccessText : styles.badgeWarningText
              ]}>
                {isVerified ? t('manager.profile.status.verified') : t('manager.profile.status.unverified')}
              </AppText>
            </View>
          </View>
        </View>

        {/* Verify Banner */}
        {!isVerified && (
          <Pressable
            style={({ pressed }) => [
              styles.verifyBanner,
              pressed && { opacity: OPACITY.pressed },
            ]}
            onPress={() => router.push('/(app)/student/verify')}
          >
            <View style={styles.verifyIcon}>
              <AlertCircle size={20} color={COLORS.warning} strokeWidth={1.5} />
            </View>
            <View style={styles.verifyContent}>
              <AppText style={styles.verifyTitle}>{t('student.verify.submit_button')}</AppText>
              <AppText style={styles.verifyDesc}>{t('student.home.verification_alert_desc')}</AppText>
            </View>
            <ChevronRight size={18} color={COLORS.warning} strokeWidth={1.5} />
          </Pressable>
        )}

        {/* Personal Info */}
        {isVerified && profile && (
          <View style={styles.section}>
            {/* Using Manager's Account Info key as best fit */}
            <AppText style={styles.sectionTitle}>{t('manager.profile.section_account_info')}</AppText>
            
            <View style={styles.card}>
              {infoItems.map((item, idx) => (
                <View key={idx}>
                  {idx !== 0 && <View style={styles.divider} />}
                  <View style={styles.infoRow}>
                    <View style={styles.iconBox}>
                      <item.icon size={16} color={COLORS.textMuted} strokeWidth={1.5} />
                    </View>
                    <View style={styles.infoContent}>
                      <AppText style={styles.infoLabel}>{item.label}</AppText>
                      <AppText style={styles.infoValue}>{item.value || '—'}</AppText>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Quick Links */}
        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>{t('manager.profile.section_quick_links')}</AppText>
          
          <View style={styles.card}>
            <LinkRow
              icon={<Calendar size={16} color={COLORS.info} strokeWidth={1.5} />}
              iconBg={COLORS.infoLight}
              label={t('student.reservations.header_title')}
              onPress={() => router.push('/(app)/student/reservations')}
            />
            
            <View style={styles.divider} />
            
            <LinkRow
              icon={<FileText size={16} color={COLORS.success} strokeWidth={1.5} />}
              iconBg={COLORS.successLight}
              label={t('student.bookings.header_title')}
              onPress={() => router.push('/(app)/student/bookings')}
            />
            
            <View style={styles.divider} />
            
            <LinkRow
              icon={<Cog size={16} color={COLORS.textSecondary} strokeWidth={1.5} />}
              iconBg={COLORS.bgSecondary}
              label={t('app.settings.title')}
              onPress={() => router.push('/(app)/settings')}
            />
          </View>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>{t('manager.profile.section_account')}</AppText>
          
          <View style={styles.card}>
            <LinkRow
              icon={<LogOut size={16} color={COLORS.textSecondary} strokeWidth={1.5} />}
              iconBg={COLORS.bgSecondary}
              label={t('manager.profile.link_logout')}
              onPress={handleLogout}
            />
            
            <View style={styles.divider} />
            
            <LinkRow
              icon={<Trash2 size={16} color={COLORS.error} strokeWidth={1.5} />}
              iconBg={COLORS.errorLight}
              label={t('manager.profile.link_delete_account')}
              labelColor={COLORS.error}
              chevronColor={COLORS.error}
              onPress={() => setConfirmVisible(true)}
            />
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Delete Confirmation Modal */}
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

            <AppText style={styles.modalTitle}>{t('manager.profile.delete_modal.title')}</AppText>
            <AppText style={styles.modalDesc}>
              {t('manager.profile.delete_modal.description')}
            </AppText>

            <AppText style={styles.modalLabel}>
              {t('manager.profile.delete_modal.label_prefix')}{' '}
              <AppText style={styles.modalHighlight}>"{DELETE_PHRASE}"</AppText>{' '}
              {t('manager.profile.delete_modal.label_suffix')}
            </AppText>

            <TextInput
              style={styles.modalInput}
              placeholder={DELETE_PHRASE}
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
                  setConfirmText('');
                }}
              >
                <AppText style={styles.cancelBtnText}>{t('manager.profile.delete_modal.cancel')}</AppText>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.deleteBtn,
                  confirmText !== DELETE_PHRASE && styles.deleteBtnDisabled,
                  pressed && confirmText === DELETE_PHRASE && { opacity: OPACITY.pressed },
                ]}
                onPress={handleDeleteAccount}
                disabled={confirmText !== DELETE_PHRASE || deleting}
              >
                <AppText style={styles.deleteBtnText}>
                  {deleting ? t('manager.profile.delete_modal.deleting') : t('manager.profile.delete_modal.delete')}
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
    <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
      {icon}
    </View>
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
    backgroundColor: COLORS.primaryLight,
  },
  badgeInfoText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  badgeSuccess: {
    backgroundColor: COLORS.successLight,
  },
  badgeSuccessText: {
    color: COLORS.success,
  },
  badgeWarning: {
    backgroundColor: COLORS.warningLight,
  },
  badgeWarningText: {
    color: COLORS.warning,
  },

  // Verify Banner
  verifyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warningLight,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.warningMuted,
  },
  verifyIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
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
    alignItems: 'center',
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