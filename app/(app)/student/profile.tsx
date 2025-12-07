// screens/ProfileScreen.tsx

import { COLORS, OPACITY } from '@/constants/colors';
import { useRouter } from 'expo-router';
import {
  AlertCircle,
  Building,
  Calendar,
  ChevronRight,
  FileText,
  LogOut,
  MapPin,
  Phone,
  Trash2,
  User,
} from 'lucide-react-native';
import React, { useState } from 'react';
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
import { useAuthStore } from '@/stores/authStore';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const profile = user?.studentProfile;
  const isVerified = profile?.selfVerified;

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

  const infoItems = [
    { label: 'Full name', value: profile?.fullName, icon: User },
    { label: 'Father name', value: profile?.fatherName, icon: User },
    { label: 'Institute', value: profile?.instituteName, icon: Building },
    { label: 'Address', value: profile?.permanentAddress, icon: MapPin },
    { label: 'Phone', value: profile?.phoneNumber, icon: Phone },
    { label: 'WhatsApp', value: profile?.whatsappNumber, icon: Phone },
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
              {profile?.fullName?.charAt(0) || user?.email?.charAt(0) || 'S'}
            </Text>
          </View>

          <Text style={styles.name}>{profile?.fullName || 'Student'}</Text>
          <Text style={styles.email}>{user?.email}</Text>

          <View style={styles.badgeRow}>
            <View style={styles.badgeInfo}>
              <Text style={styles.badgeInfoText}>STUDENT</Text>
            </View>
            <View style={[
              styles.badge,
              isVerified ? styles.badgeSuccess : styles.badgeWarning
            ]}>
              <Text style={[
                styles.badgeText,
                isVerified ? styles.badgeSuccessText : styles.badgeWarningText
              ]}>
                {isVerified ? 'VERIFIED' : 'UNVERIFIED'}
              </Text>
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
              <Text style={styles.verifyTitle}>Complete verification</Text>
              <Text style={styles.verifyDesc}>Verify your profile to book hostels</Text>
            </View>
            <ChevronRight size={18} color={COLORS.warning} strokeWidth={1.5} />
          </Pressable>
        )}

        {/* Personal Info */}
        {isVerified && profile && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PERSONAL INFORMATION</Text>
            
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
                      <Text style={styles.infoValue}>{item.value || '—'}</Text>
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
              icon={<Calendar size={16} color={COLORS.info} strokeWidth={1.5} />}
              iconBg={COLORS.infoLight}
              label="My Reservations"
              onPress={() => router.push('/(app)/student/reservations')}
            />
            
            <View style={styles.divider} />
            
            <LinkRow
              icon={<FileText size={16} color={COLORS.success} strokeWidth={1.5} />}
              iconBg={COLORS.successLight}
              label="My Bookings"
              onPress={() => router.push('/(app)/student/bookings')}
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

            <Text style={styles.modalTitle}>Delete Account</Text>
            <Text style={styles.modalDesc}>
              This action cannot be undone. All your data will be permanently deleted.
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
                style={({ pressed }) => [
                  styles.cancelBtn,
                  pressed && { opacity: OPACITY.pressed },
                ]}
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
                <Text style={styles.deleteBtnText}>
                  {deleting ? 'Deleting...' : 'Delete'}
                </Text>
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