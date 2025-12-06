import { useFocusEffect, useRouter } from 'expo-router';
import {
  AlertCircle,
  Calendar,
  ChevronRight,
  Home,
  MessageCircle,
  Search,
  Star,
} from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { bookingsApi } from '@/api/bookings';
import { reservationsApi } from '@/api/reservations';
import { usersApi } from '@/api/users';
import { Badge, Card, LoadingScreen } from '@/components/ui';
import { COLORS } from '@/constants/colors';
import { useAuthStore } from '@/stores/authStore';
import { Booking, Reservation, StudentProfile } from '@/types';

export default function StudentHomeScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [pendingReservations, setPendingReservations] = useState<Reservation[]>([]);

  const fetchData = async () => {
    try {
      const [profileRes, bookingsRes, reservationsRes] = await Promise.all([
        usersApi.getStudentProfile(),
        bookingsApi.getMyBookings(),
        reservationsApi.getMyReservations(),
      ]);

      if (profileRes.success) {
        setProfile(profileRes.data);
      }

      if (bookingsRes.success) {
        const activeBooking = bookingsRes.data.find(
          (b) => b.status === 'APPROVED'
        );
        setCurrentBooking(activeBooking || null);
      }

      if (reservationsRes.success) {
        const pending = reservationsRes.data.filter(
          (r) => r.status === 'PENDING' || r.status === 'ACCEPTED'
        );
        setPendingReservations(pending);
      }
    } catch (error: any) {
      console.log('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
    return <LoadingScreen />;
  }

  const isVerified = user?.studentProfile?.selfVerified;

  return (
    <SafeAreaView style={styles.container}>
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
          <View>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.name}>
              {profile?.fullName || user?.fullName || 'Student'} 👋
            </Text>
          </View>
        </View>

        {/* Self Verification Alert */}
        {!isVerified && (
          <TouchableOpacity
            onPress={() => router.push('/(app)/student/verify')}
            activeOpacity={0.8}
          >
            <Card style={styles.alertCard}>
              <AlertCircle size={24} color={COLORS.warning} />
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>Complete your profile</Text>
                <Text style={styles.alertDesc}>
                  Verify yourself to book hostels
                </Text>
              </View>
              <ChevronRight size={20} color={COLORS.textMuted} />
            </Card>
          </TouchableOpacity>
        )}

        {/* Current Booking */}
        {currentBooking && (
          <>
            <Text style={styles.sectionTitle}>Your current hostel</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                router.push(
                  `/(app)/student/booking/${currentBooking.id}`
                )
              }
            >
              <Card style={styles.bookingCard}>
                {currentBooking.hostel?.roomImages?.[0] ? (
                  <Image
                    source={{ uri: currentBooking.hostel.roomImages[0] }}
                    style={styles.bookingImage}
                  />
                ) : (
                  <View style={styles.bookingImagePlaceholder}>
                    <Home size={30} color={COLORS.textMuted} />
                  </View>
                )}
                <View style={styles.bookingContent}>
                  <Text style={styles.bookingName} numberOfLines={1}>
                    {currentBooking.hostel?.hostelName || 'Hostel'}
                  </Text>
                  <Text style={styles.bookingLocation} numberOfLines={1}>
                    {currentBooking.hostel?.city || 'City'}
                  </Text>
                  <View style={styles.bookingFooter}>
                    <Badge
                      label={currentBooking.roomType.replace('_', ' ')}
                      variant="info"
                    />
                    {currentBooking.hostel?.rating > 0 && (
                      <View style={styles.ratingRow}>
                        <Star
                          size={14}
                          color={COLORS.warning}
                          fill={COLORS.warning}
                        />
                        <Text style={styles.ratingText}>
                          {currentBooking.hostel.rating.toFixed(1)}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          </>
        )}

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(app)/student/search')}
          >
            <View
              style={[
                styles.actionIcon,
                { backgroundColor: COLORS.primary + '20' },
              ]}
            >
              <Search size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.actionText}>Find hostel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(app)/student/reservations')}
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
            {pendingReservations.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {pendingReservations.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(app)/student/bookings')}
          >
            <View
              style={[
                styles.actionIcon,
                { backgroundColor: COLORS.success + '20' },
              ]}
            >
              <Home size={24} color={COLORS.success} />
            </View>
            <Text style={styles.actionText}>My bookings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(app)/student/chat')}
          >
            <View
              style={[
                styles.actionIcon,
                { backgroundColor: COLORS.info + '20' },
              ]}
            >
              <MessageCircle size={24} color={COLORS.info} />
            </View>
            <Text style={styles.actionText}>Messages</Text>
          </TouchableOpacity>
        </View>

        {/* Pending Reservations */}
        {pendingReservations.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Pending reservations</Text>
              <TouchableOpacity
                onPress={() => router.push('/(app)/student/reservations')}
              >
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>

            {pendingReservations.slice(0, 2).map((reservation) => (
              <Card key={reservation.id} style={styles.reservationCard}>
                <View style={styles.reservationHeader}>
                  <Text
                    style={styles.reservationName}
                    numberOfLines={1}
                  >
                    {reservation.hostel?.hostelName || 'Hostel'}
                  </Text>
                  <Badge
                    label={reservation.status}
                    variant={
                      reservation.status === 'ACCEPTED'
                        ? 'success'
                        : 'warning'
                    }
                  />
                </View>
                <Text style={styles.reservationLocation}>
                  {reservation.hostel?.city || 'City'} •{' '}
                  {reservation.roomType.replace('_', ' ')}
                </Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
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
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 24,
    gap: 12,
    backgroundColor: COLORS.warning + '15',
    borderColor: COLORS.warning + '30',
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  alertDesc: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
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
  bookingCard: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 12,
  },
  bookingImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  bookingImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: COLORS.bgSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookingContent: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  bookingName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  bookingLocation: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  bookingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
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
    position: 'relative',
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
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: COLORS.error,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
  reservationCard: {
    marginHorizontal: 24,
    marginBottom: 12,
  },
  reservationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  reservationName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 12,
  },
  reservationLocation: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
});