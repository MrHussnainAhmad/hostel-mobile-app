import { useRouter } from 'expo-router';
import { ArrowLeft, Calendar, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { reservationsApi } from '@/api/reservations';
import { Badge, Button, Card, EmptyState, LoadingScreen } from '@/components/ui';
import { COLORS } from '@/constants/colors';
import { Reservation } from '@/types';

export default function ReservationsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  const fetchReservations = async () => {
    try {
      const response = await reservationsApi.getMyReservations();
      if (response.success) {
        setReservations(response.data);
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2:
          error?.response?.data?.message || 'Failed to fetch reservations',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReservations();
  };

  const handleCancel = async (id: string) => {
    Alert.alert(
      'Cancel reservation',
      'Are you sure you want to cancel this reservation?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await reservationsApi.cancel(id);
              Toast.show({
                type: 'success',
                text1: 'Cancelled',
                text2: 'Reservation cancelled successfully',
              });
              fetchReservations();
            } catch (error: any) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error?.response?.data?.message || 'Failed to cancel',
              });
            }
          },
        },
      ]
    );
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return 'success';
      case 'REJECTED':
        return 'error';
      case 'CANCELLED':
        return 'default';
      default:
        return 'warning';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderReservation = ({ item }: { item: Reservation }) => (
    <Card style={styles.reservationCard}>
      <View style={styles.reservationHeader}>
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
      <Text style={styles.date}>
        Requested: {formatDate(item.createdAt)}
      </Text>

      {item.rejectReason && (
        <View style={styles.rejectBox}>
          <Text style={styles.rejectLabel}>Rejection reason:</Text>
          <Text style={styles.rejectText}>{item.rejectReason}</Text>
        </View>
      )}

      {item.status === 'PENDING' && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => handleCancel(item.id)}
        >
          <X size={16} color={COLORS.error} />
          <Text style={styles.cancelText}>Cancel request</Text>
        </TouchableOpacity>
      )}

      {item.status === 'ACCEPTED' && (
        <Button
          title="Proceed to booking"
          onPress={() =>
            router.push(
              `/(app)/student/book/${item.hostel.id}?roomType=${item.roomType}`
            )
          }
          size="sm"
          style={styles.bookButton}
        />
      )}
    </Card>
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
        <Text style={styles.headerTitle}>My reservations</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={reservations}
        keyExtractor={(item) => item.id}
        renderItem={renderReservation}
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
            icon={<Calendar size={64} color={COLORS.textMuted} />}
            title="No reservations"
            description="Your reservation requests will appear here."
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
  reservationCard: {
    marginBottom: 16,
  },
  reservationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  hostelName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 12,
  },
  details: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  date: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  rejectBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: COLORS.error + '15',
    borderRadius: 8,
  },
  rejectLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.error,
    marginBottom: 4,
  },
  rejectText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 6,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.error,
  },
  bookButton: {
    marginTop: 12,
  },
});