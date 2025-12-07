// screens/StudentHomeScreen.tsx

import { COLORS, OPACITY } from '@/constants/colors';
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
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { bookingsApi } from '@/api/bookings';
import { reservationsApi } from '@/api/reservations';
import { usersApi } from '@/api/users';
import { Badge, LoadingScreen } from '@/components/ui';
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
  const firstName = (profile?.fullName || user?.fullName || 'Student').split(' ')[0];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.name}>{firstName} 👋</Text>
          </View>
        </View>

        {/* Verification Alert */}
        {!isVerified && (
          <Pressable
            style={({ pressed }) => [
              styles.alertCard,
              pressed && { opacity: OPACITY.pressed },
            ]}
            onPress={() => router.push('/(app)/student/verify')}
          >
            <View style={styles.alertIcon}>
              <AlertCircle size={22} color={COLORS.warning} strokeWidth={1.5} />
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>Complete your profile</Text>
              <Text style={styles.alertDesc}>
                Verify yourself to book hostels
              </Text>
            </View>
            <ChevronRight size={20} color={COLORS.textMuted} strokeWidth={1.5} />
          </Pressable>
        )}

        {/* Current Booking */}
        {currentBooking && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Current Stay</Text>
            
            <Pressable
              style={({ pressed }) => [
                styles.bookingCard,
                pressed && { opacity: OPACITY.pressed },
              ]}
              onPress={() => router.push(`/(app)/student/booking/${currentBooking.id}`)}
            >
              {currentBooking.hostel?.roomImages?.[0] ? (
                <Image
                  source={{ uri: currentBooking.hostel.roomImages[0] }}
                  style={styles.bookingImage}
                />
              ) : (
                <View style={styles.bookingImagePlaceholder}>
                  <Home size={28} color={COLORS.textMuted} strokeWidth={1.5} />
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
                    variant="primary"
                    size="sm"
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
              
              <ChevronRight size={20} color={COLORS.textMuted} strokeWidth={1.5} />
            </Pressable>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionsGrid}>
            <ActionCard
              icon={<Search size={24} color={COLORS.primary} strokeWidth={1.5} />}
              label="Find Hostel"
              color={COLORS.primaryLight}
              onPress={() => router.push('/(app)/student/search')}
            />
            
            <ActionCard
              icon={<Calendar size={24} color={COLORS.warning} strokeWidth={1.5} />}
              label="Reservations"
              color={COLORS.warningLight}
              badge={pendingReservations.length > 0 ? pendingReservations.length : undefined}
              onPress={() => router.push('/(app)/student/reservations')}
            />
            
            <ActionCard
              icon={<Home size={24} color={COLORS.success} strokeWidth={1.5} />}
              label="Bookings"
              color={COLORS.successLight}
              onPress={() => router.push('/(app)/student/bookings')}
            />
            
            <ActionCard
              icon={<MessageCircle size={24} color={COLORS.info} strokeWidth={1.5} />}
              label="Messages"
              color={COLORS.infoLight}
              onPress={() => router.push('/(app)/student/chat')}
            />
          </View>
        </View>

        {/* Pending Reservations */}
        {pendingReservations.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Pending Reservations</Text>
              <Pressable
                onPress={() => router.push('/(app)/student/reservations')}
                style={({ pressed }) => pressed && { opacity: OPACITY.pressed }}
              >
                <Text style={styles.seeAll}>See all</Text>
              </Pressable>
            </View>

            {pendingReservations.slice(0, 2).map((reservation) => (
              <View key={reservation.id} style={styles.reservationCard}>
                <View style={styles.reservationHeader}>
                  <Text style={styles.reservationName} numberOfLines={1}>
                    {reservation.hostel?.hostelName || 'Hostel'}
                  </Text>
                  <Badge
                    label={reservation.status}
                    variant={reservation.status === 'ACCEPTED' ? 'success' : 'warning'}
                    size="sm"
                  />
                </View>
                <Text style={styles.reservationLocation}>
                  {reservation.hostel?.city || 'City'} •{' '}
                  {reservation.roomType.replace('_', ' ')}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Action Card Component
interface ActionCardProps {
  icon: React.ReactNode;
  label: string;
  color: string;
  badge?: number;
  onPress: () => void;
}

const ActionCard: React.FC<ActionCardProps> = ({
  icon,
  label,
  color,
  badge,
  onPress,
}) => (
  <Pressable
    style={({ pressed }) => [
      styles.actionCard,
      pressed && { opacity: OPACITY.pressed },
    ]}
    onPress={onPress}
  >
    <View style={[styles.actionIcon, { backgroundColor: color }]}>
      {icon}
    </View>
    <Text style={styles.actionText}>{label}</Text>
    
    {badge !== undefined && badge > 0 && (
      <View style={styles.actionBadge}>
        <Text style={styles.actionBadgeText}>{badge}</Text>
      </View>
    )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  
  // Alert Card
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 16,
    backgroundColor: COLORS.warningLight,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.warningMuted,
  },
  alertIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  alertDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  
  // Section
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    paddingHorizontal: 24,
    marginBottom: 14,
    letterSpacing: -0.2,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  
  // Booking Card
  bookingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    padding: 14,
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  bookingImage: {
    width: 80,
    height: 80,
    borderRadius: 14,
  },
  bookingImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 14,
    backgroundColor: COLORS.bgSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookingContent: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },
  bookingName: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  bookingLocation: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 10,
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
  
  // Actions Grid
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  actionCard: {
    width: '47%',
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    position: 'relative',
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    letterSpacing: -0.1,
  },
  actionBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: COLORS.error,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  actionBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
  
  // Reservation Card
  reservationCard: {
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 16,
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
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
    letterSpacing: -0.1,
  },
  reservationLocation: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
});