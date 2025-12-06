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
  User,
} from 'lucide-react-native';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge, Button, Card } from '@/components/ui';
import { COLORS } from '@/constants/colors';
import { useAuthStore } from '@/stores/authStore';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const isVerified = user?.studentProfile?.selfVerified;
  const profile = user?.studentProfile;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* Avatar & Basic Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile?.fullName?.charAt(0) ||
                user?.email?.charAt(0) ||
                'S'}
            </Text>
          </View>
          <Text style={styles.name}>{profile?.fullName || 'Student'}</Text>
          <Text style={styles.email}>{user?.email}</Text>

          <View style={styles.badgeRow}>
            <Badge label="STUDENT" variant="info" />
            {isVerified ? (
              <Badge label="VERIFIED" variant="success" />
            ) : (
              <Badge label="UNVERIFIED" variant="warning" />
            )}
          </View>
        </View>

        {/* Verification Alert */}
        {!isVerified && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(app)/student/verify')}
          >
            <Card style={styles.verifyCard}>
              <View style={styles.verifyContent}>
                <AlertCircle size={24} color={COLORS.warning} />
                <View style={styles.verifyText}>
                  <Text style={styles.verifyTitle}>Complete verification</Text>
                  <Text style={styles.verifyDesc}>
                    Verify your profile to book hostels
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color={COLORS.textMuted} />
            </Card>
          </TouchableOpacity>
        )}

        {/* Profile Details */}
        {isVerified && profile && (
          <>
            <Text style={styles.sectionTitle}>Personal information</Text>
            <Card style={styles.infoCard}>
              <View style={styles.infoRow}>
                <User size={20} color={COLORS.textMuted} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Full name</Text>
                  <Text style={styles.infoValue}>{profile.fullName}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <User size={20} color={COLORS.textMuted} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Father&apos;s name</Text>
                  <Text style={styles.infoValue}>
                    {profile.fatherName}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <Building size={20} color={COLORS.textMuted} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Institute</Text>
                  <Text style={styles.infoValue}>
                    {profile.instituteName}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <MapPin size={20} color={COLORS.textMuted} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Permanent address</Text>
                  <Text style={styles.infoValue}>
                    {profile.permanentAddress}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <Phone size={20} color={COLORS.textMuted} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Phone number</Text>
                  <Text style={styles.infoValue}>
                    {profile.phoneNumber}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <Phone size={20} color={COLORS.textMuted} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>WhatsApp number</Text>
                  <Text style={styles.infoValue}>
                    {profile.whatsappNumber}
                  </Text>
                </View>
              </View>
            </Card>
          </>
        )}

        {/* Quick Links */}
        <Text style={styles.sectionTitle}>Quick links</Text>
        <Card style={styles.linksCard}>
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => router.push('/(app)/student/reservations')}
          >
            <Calendar size={20} color={COLORS.primary} />
            <Text style={styles.linkText}>My reservations</Text>
            <ChevronRight size={20} color={COLORS.textMuted} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => router.push('/(app)/student/bookings')}
          >
            <FileText size={20} color={COLORS.success} />
            <Text style={styles.linkText}>My bookings</Text>
            <ChevronRight size={20} color={COLORS.textMuted} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => router.push('/(app)/student/reports')}
          >
            <AlertCircle size={20} color={COLORS.warning} />
            <Text style={styles.linkText}>My reports</Text>
            <ChevronRight size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </Card>

        {/* Logout */}
        <View style={styles.logoutSection}>
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="outline"
            icon={<LogOut size={20} color={COLORS.primary} />}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '700',
    color: COLORS.textInverse,
    textTransform: 'uppercase',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  email: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  verifyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: COLORS.warning + '15',
    borderColor: COLORS.warning + '30',
  },
  verifyContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  verifyText: {
    flex: 1,
  },
  verifyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  verifyDesc: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    paddingHorizontal: 24,
    marginBottom: 12,
    marginTop: 8,
  },
  infoCard: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 4,
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
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  linksCard: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 4,
  },
  linkText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  logoutSection: {
    paddingHorizontal: 24,
  },
});