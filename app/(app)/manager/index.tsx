// app/(app)/manager/index.tsx

import { useRouter } from 'expo-router';
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  Users,
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
import Toast from 'react-native-toast-message';

import { hostelsApi } from '@/api/hostels';
import { Verification, verificationApi } from '@/api/verification';
import { Badge, Card, LoadingScreen } from '@/components/ui';
import { COLORS } from '@/constants/colors';
import { useAuthStore } from '@/stores/authStore';
import { Hostel } from '@/types';

export default function ManagerDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [verification, setVerification] = useState<Verification | null>(
    null
  );

  const fetchData = async () => {
    try {
      const [hostelsRes, verificationRes] = await Promise.all([
        hostelsApi.getMyHostels(),
        verificationApi.getMyVerifications(),
      ]);

      if (hostelsRes.success) {
        setHostels(hostelsRes.data);
      }

      if (verificationRes.success && verificationRes.data.length > 0) {
        setVerification(verificationRes.data[0]);
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2:
          error?.response?.data?.message || 'Failed to fetch data',
      });
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

  const isVerified = verification?.status === 'APPROVED';
  const isPending = verification?.status === 'PENDING';

  const totalStudents = hostels.reduce((acc, h) => {
    const occupied =
      h.roomTypes?.reduce(
        (sum, rt) =>
          sum +
          (rt.totalRooms * rt.personsInRoom - rt.availableRooms),
        0
      ) || 0;
    return acc + occupied;
  }, 0);

  if (loading) {
    return <LoadingScreen />;
  }

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
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>
            {user?.email?.split('@')[0] || 'Manager'} 👋
          </Text>
        </View>

        {/* Verification Status */}
        {!isVerified && (
          <Card style={styles.verificationCard}>
            <View style={styles.verificationHeader}>
              {isPending ? (
                <Clock size={24} color={COLORS.warning} />
              ) : (
                <AlertCircle size={24} color={COLORS.error} />
              )}
              <View style={styles.verificationText}>
                <Text style={styles.verificationTitle}>
                  {isPending
                    ? 'Verification pending'
                    : 'Verification required'}
                </Text>
                <Text style={styles.verificationDesc}>
                  {isPending
                    ? 'Your verification is under review.'
                    : 'Complete verification to add hostels.'}
                </Text>
              </View>
            </View>

            {!isPending && (
              <TouchableOpacity
                style={styles.verificationButton}
                onPress={() =>
                  router.push('/(app)/manager/verification')
                }
                activeOpacity={0.8}
              >
                <Text style={styles.verificationButtonText}>
                  Start verification
                </Text>
                <ChevronRight size={18} color={COLORS.primary} />
              </TouchableOpacity>
            )}
          </Card>
        )}

        {/* Stats */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Building2 size={28} color={COLORS.primary} />
            <Text style={styles.statNumber}>{hostels.length}</Text>
            <Text style={styles.statLabel}>Hostels</Text>
          </Card>

          <Card style={styles.statCard}>
            <Users size={28} color={COLORS.success} />
            <Text style={styles.statNumber}>{totalStudents}</Text>
            <Text style={styles.statLabel}>Students</Text>
          </Card>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(app)/manager/hostels')}
            activeOpacity={0.85}
          >
            <View
              style={[
                styles.actionIcon,
                { backgroundColor: COLORS.primary + '20' },
              ]}
            >
              <Building2 size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.actionText}>My hostels</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(app)/manager/reservations')}
            activeOpacity={0.85}
          >
            <View
              style={[
                styles.actionIcon,
                { backgroundColor: COLORS.warning + '20' },
              ]}
            >
              <Calendar size={24} color={COLORS.warning} />
            </View>
            <Text style={styles.actionText}>Reservations</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(app)/manager/bookings')}
            activeOpacity={0.85}
          >
            <View
              style={[
                styles.actionIcon,
                { backgroundColor: COLORS.success + '20' },
              ]}
            >
              <CheckCircle size={24} color={COLORS.success} />
            </View>
            <Text style={styles.actionText}>Bookings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(app)/manager/chat')}
            activeOpacity={0.85}
          >
            <View
              style={[
                styles.actionIcon,
                { backgroundColor: COLORS.info + '20' },
              ]}
            >
              <Users size={24} color={COLORS.info} />
            </View>
            <Text style={styles.actionText}>Messages</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Hostels */}
        {hostels.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your hostels</Text>
              <TouchableOpacity
                onPress={() => router.push('/(app)/manager/hostels')}
                activeOpacity={0.7}
              >
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>

            {hostels.slice(0, 2).map((h) => (
              <Card key={h.id} style={styles.hostelCard}>
                <View style={styles.hostelHeader}>
                  <Text style={styles.hostelName}>
                    {h.hostelName}
                  </Text>
                  <Badge
                    label={h.isActive ? 'ACTIVE' : 'INACTIVE'}
                    variant={h.isActive ? 'success' : 'error'}
                  />
                </View>
                <Text style={styles.hostelLocation}>
                  {h.city}, {h.address}
                </Text>
                <View style={styles.hostelStats}>
                  <Text style={styles.hostelStat}>
                    {h.roomTypes?.length || 0} room types
                  </Text>
                  <Text style={styles.hostelDot}>•</Text>
                  <Text style={styles.hostelStat}>{h.hostelFor}</Text>
                </View>
              </Card>
            ))}
          </>
        )}

        <View style={{ height: 24 }} />
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
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  name: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  // Verification
  verificationCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: COLORS.bgSecondary,
  },
  verificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  verificationText: {
    flex: 1,
  },
  verificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  verificationDesc: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  verificationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 4,
  },
  verificationButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },

  // Stats
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 18,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },

  // Sections
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },

  // Actions
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    width: '47%',
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  // Hostel cards
  hostelCard: {
    marginHorizontal: 24,
    marginBottom: 12,
  },
  hostelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  hostelName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 10,
  },
  hostelLocation: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  hostelStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hostelStat: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  hostelDot: {
    color: COLORS.textMuted,
  },
});