// app/(app)/manager/profile.tsx

import { useRouter } from 'expo-router';
import {
  AlertCircle,
  Building2,
  Calendar,
  ChevronRight,
  CreditCard,
  FileText,
  LogOut,
  Shield,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { usersApi } from '@/api/users';
import {
  Verification,
  verificationApi,
} from '@/api/verification';
import { Badge, Button, Card, LoadingScreen } from '@/components/ui';
import { COLORS } from '@/constants/colors';
import { useAuthStore } from '@/stores/authStore';
import { ManagerProfile } from '@/types';

export default function ManagerProfileScreen() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<ManagerProfile | null>(
    null
  );
  const [verification, setVerification] = useState<Verification | null>(
    null
  );

  const fetchData = async () => {
    try {
      const [profileRes, verificationRes] = await Promise.all([
        usersApi.getManagerProfile(),
        verificationApi.getMyVerifications(),
      ]);

      if (profileRes.success) {
        setProfile(profileRes.data);
      }

      if (verificationRes.success && verificationRes.data.length > 0) {
        setVerification(verificationRes.data[0]);
      }
    } catch (error: any) {
      console.log('Profile fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  if (loading) {
    return <LoadingScreen />;
  }

  const isVerified = verification?.status === 'APPROVED';
  const isPending = verification?.status === 'PENDING';
  const isRejected = verification?.status === 'REJECTED';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
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
                'M'}
            </Text>
          </View>
          <Text style={styles.name}>
            {profile?.fullName || 'Manager'}
          </Text>
          <Text style={styles.email}>{user?.email}</Text>

          <View style={styles.badgeRow}>
            <Badge label="MANAGER" variant="info" />
            {isVerified ? (
              <Badge label="VERIFIED" variant="success" />
            ) : isPending ? (
              <Badge label="PENDING" variant="warning" />
            ) : (
              <Badge label="UNVERIFIED" variant="error" />
            )}
          </View>
        </View>

        {/* Verification Status */}
        {!isVerified && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              router.push('/(app)/manager/verification')
            }
          >
            <Card
              style={[
                styles.verifyCard,
                isPending && styles.verifyCardPending,
                isRejected && styles.verifyCardRejected,
              ]}
            >
              <View style={styles.verifyContent}>
                {isPending ? (
                  <AlertCircle size={24} color={COLORS.warning} />
                ) : isRejected ? (
                  <AlertCircle size={24} color={COLORS.error} />
                ) : (
                  <Shield size={24} color={COLORS.primary} />
                )}
                <View style={styles.verifyText}>
                  <Text style={styles.verifyTitle}>
                    {isPending
                      ? 'Verification pending'
                      : isRejected
                      ? 'Verification rejected'
                      : 'Complete verification'}
                  </Text>
                  <Text style={styles.verifyDesc}>
                    {isPending
                      ? 'Your verification is under review.'
                      : isRejected
                      ? verification?.adminComment ||
                        'Please resubmit with corrections.'
                      : 'Verify your details to add and manage hostels.'}
                  </Text>
                </View>
              </View>
              {!isPending && (
                <ChevronRight
                  size={20}
                  color={COLORS.textMuted}
                />
              )}
            </Card>
          </TouchableOpacity>
        )}

        {/* Verification Details (if approved) */}
        {isVerified && verification && (
          <>
            <Text style={styles.sectionTitle}>
              Verification details
            </Text>
            <Card style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Building2 size={20} color={COLORS.textMuted} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Owner name</Text>
                  <Text style={styles.infoValue}>
                    {verification.ownerName}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <Building2 size={20} color={COLORS.textMuted} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Address</Text>
                  <Text style={styles.infoValue}>
                    {verification.city}, {verification.address}
                  </Text>
                </View>
              </View>

              {verification.easypaisaNumber && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.infoRow}>
                    <CreditCard
                      size={20}
                      color={COLORS.textMuted}
                    />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Easypaisa</Text>
                      <Text style={styles.infoValue}>
                        {verification.easypaisaNumber}
                      </Text>
                    </View>
                  </View>
                </>
              )}

              {verification.jazzcashNumber && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.infoRow}>
                    <CreditCard
                      size={20}
                      color={COLORS.textMuted}
                    />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>JazzCash</Text>
                      <Text style={styles.infoValue}>
                        {verification.jazzcashNumber}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </Card>
          </>
        )}

        {/* Quick Links */}
        <Text style={styles.sectionTitle}>Quick links</Text>
        <Card style={styles.linksCard}>
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() =>
              router.push('/(app)/manager/hostels')
            }
          >
            <Building2 size={20} color={COLORS.primary} />
            <Text style={styles.linkText}>My hostels</Text>
            <ChevronRight
              size={20}
              color={COLORS.textMuted}
            />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.linkRow}
            onPress={() =>
              router.push('/(app)/manager/reservations')
            }
          >
            <Calendar size={20} color={COLORS.warning} />
            <Text style={styles.linkText}>Reservations</Text>
            <ChevronRight
              size={20}
              color={COLORS.textMuted}
            />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.linkRow}
            onPress={() =>
              router.push('/(app)/manager/bookings')
            }
          >
            <FileText size={20} color={COLORS.success} />
            <Text style={styles.linkText}>Bookings</Text>
            <ChevronRight
              size={20}
              color={COLORS.textMuted}
            />
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
    backgroundColor: COLORS.success,
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

  // Verification card
  verifyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: COLORS.primary + '15',
    borderColor: COLORS.primary + '30',
  },
  verifyCardPending: {
    backgroundColor: COLORS.warning + '15',
    borderColor: COLORS.warning + '30',
  },
  verifyCardRejected: {
    backgroundColor: COLORS.error + '15',
    borderColor: COLORS.error + '30',
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

  // Sections
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

  // Links
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

  // Logout
  logoutSection: {
    paddingHorizontal: 24,
  },
});