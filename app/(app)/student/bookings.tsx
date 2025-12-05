import { useRouter } from 'expo-router';
import { ArrowLeft, ChevronRight, Home } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { bookingsApi } from '@/api/bookings';
import { Badge, Button, Card, EmptyState, LoadingScreen } from '@/components/ui';
import { COLORS } from '@/constants/colors';
import { Booking } from '@/types';

export default function BookingsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const fetchBookings = async () => {
    try {
      const response = await bookingsApi.getMyBookings();
      if (response.success) {
        setBookings(response.data);
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Failed to fetch bookings',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'success';
      case 'DISAPPROVED':
        return 'error';
      case 'PENDING':
        return 'warning';
      case 'LEFT':
      case 'KICKED':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderBooking = ({ item }: { item: Booking }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(`/(app)/student/booking/${item.id}`)}
    >
      <Card style={styles.bookingCard}>
        <View style={styles.bookingRow}>
          {item.hostel.roomImages?.[0] ? (
            <Image
              source={{ uri: item.hostel.roomImages[0] }}
              style={styles.bookingImage}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Home size={24} color={COLORS.textMuted} />
            </View>
          )}

          <View style={styles.bookingContent}>
            <View style={styles.bookingHeader}>
              <Text style={styles.hostelName} numberOfLines={1}>
                {item.hostel.hostelName}
              </Text>
              <Badge
                label={item.status}
                variant={getStatusVariant(item.status)}
              />
            </View>

            <Text style={styles.details}>
              {item.hostel.city} • {item.roomType.replace('_', ' ')}
            </Text>
            <Text style={styles.date}>Booked: {formatDate(item.createdAt)}</Text>
          </View>

          <ChevronRight size={20} color={COLORS.textMuted} />
        </View>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My bookings</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        renderItem={renderBooking}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon={<Home size={64} color={COLORS.textMuted} />}
            title="No bookings"
            description="Your hostel bookings will appear here."
            action={
              <Button
                title="Find hostels"
                onPress={() => router.push('/(app)/student/search')}
              />
            }
          />
        }
      />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.bgPrimary,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  list: {
    padding: 24,
    flexGrow: 1,
  },
  bookingCard: {
    marginBottom: 16,
    padding: 12,
  },
  bookingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookingImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
  },
  imagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: COLORS.bgSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookingContent: {
    flex: 1,
    marginLeft: 14,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  hostelName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  details: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
});