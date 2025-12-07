// app/(app)/manager/bookings.tsx

import { COLORS, OPACITY } from '@/constants/colors';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  FileText,
  X,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { bookingsApi } from '@/api/bookings';
import { hostelsApi } from '@/api/hostels';
import { Badge, EmptyState, LoadingScreen } from '@/components/ui';
import { Booking, Hostel } from '@/types';

export default function ManagerBookingsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ hostelId?: string }>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [selectedHostelId, setSelectedHostelId] = useState<string | null>(
    params.hostelId || null
  );
  const [showHostelPicker, setShowHostelPicker] = useState(false);

  const fetchHostels = async () => {
    try {
      const response = await hostelsApi.getMyHostels();
      if (response.success) {
        setHostels(response.data);
        if (!selectedHostelId && response.data.length > 0) {
          setSelectedHostelId(response.data[0].id);
        }
      }
    } catch (error) {
      console.log('Error fetching hostels:', error);
    }
  };

  const fetchBookings = async () => {
    if (!selectedHostelId) {
      setLoading(false);
      return;
    }

    try {
      const response = await bookingsApi.getHostelBookings(selectedHostelId);
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
    fetchHostels();
  }, []);

  useEffect(() => {
    if (selectedHostelId) {
      setLoading(true);
      fetchBookings();
    }
  }, [selectedHostelId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const handleApprove = async (id: string) => {
    Alert.alert(
      'Approve Booking',
      'Are you sure you want to approve this booking?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            try {
              await bookingsApi.approve(id);
              Toast.show({
                type: 'success',
                text1: 'Approved',
                text2: 'Booking approved successfully',
              });
              fetchBookings();
            } catch (error: any) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error?.response?.data?.message || 'Failed to approve',
              });
            }
          },
        },
      ]
    );
  };

  const handleKick = async (id: string, reason: 'LEFT_HOSTEL' | 'VIOLATED_RULES') => {
    Alert.alert(
      'Remove Student',
      'Are you sure you want to remove this student from the hostel?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await bookingsApi.kick(id, { kickReason: reason });
              Toast.show({
                type: 'success',
                text1: 'Removed',
                text2: 'Student removed successfully',
              });
              fetchBookings();
            } catch (error: any) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error?.response?.data?.message || 'Failed to remove student',
              });
            }
          },
        },
      ]
    );
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'DISAPPROVED': return 'error';
      case 'PENDING': return 'warning';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const selectedHostel = hostels.find((h) => h.id === selectedHostelId);

  const renderBooking = ({ item }: { item: Booking }) => (
    <View style={styles.bookingCard}>
      {/* Header */}
      <View style={styles.bookingHeader}>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>
            {(item as any).student?.fullName || 'Student'}
          </Text>
          <Text style={styles.studentEmail}>
            {(item as any).student?.user?.email}
          </Text>
        </View>
        <Badge label={item.status} variant={getStatusVariant(item.status)} size="sm" />
      </View>

      {/* Details */}
      <View style={styles.bookingDetails}>
        <DetailRow label="Room Type" value={item.roomType.replace('_', ' ')} />
        <DetailRow label="Transaction" value={`${item.transactionDate} at ${item.transactionTime}`} />
        <DetailRow label="From → To" value={`${item.fromAccount} → ${item.toAccount}`} />
      </View>

      {/* Transaction Image */}
      {item.transactionImage && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.transactionImage }}
            style={styles.transactionImage}
            resizeMode="cover"
          />
          <Text style={styles.imageLabel}>Payment Proof</Text>
        </View>
      )}

      {/* Pending Actions */}
      {item.status === 'PENDING' && (
        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.disapproveButton,
              pressed && { opacity: OPACITY.pressed },
            ]}
            onPress={() => {
              Toast.show({
                type: 'info',
                text1: 'Coming Soon',
                text2: 'Disapprove with refund feature',
              });
            }}
          >
            <X size={18} color={COLORS.error} strokeWidth={1.5} />
            <Text style={styles.disapproveButtonText}>Disapprove</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.approveButton,
              pressed && { opacity: OPACITY.pressed },
            ]}
            onPress={() => handleApprove(item.id)}
          >
            <Check size={18} color={COLORS.textInverse} strokeWidth={1.5} />
            <Text style={styles.approveButtonText}>Approve</Text>
          </Pressable>
        </View>
      )}

      {/* Approved Actions */}
      {item.status === 'APPROVED' && (
        <View style={styles.kickActions}>
          <Pressable
            style={({ pressed }) => [
              styles.kickButton,
              pressed && { opacity: OPACITY.pressed },
            ]}
            onPress={() => handleKick(item.id, 'LEFT_HOSTEL')}
          >
            <Text style={styles.kickButtonText}>Mark as Left</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.kickButton,
              styles.kickViolatedButton,
              pressed && { opacity: OPACITY.pressed },
            ]}
            onPress={() => handleKick(item.id, 'VIOLATED_RULES')}
          >
            <Text style={styles.kickViolatedButtonText}>Kick (Violated Rules)</Text>
          </Pressable>
        </View>
      )}
    </View>
  );

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            pressed && { opacity: OPACITY.pressed },
          ]}
        >
          <ArrowLeft size={22} color={COLORS.textPrimary} strokeWidth={1.5} />
        </Pressable>
        <Text style={styles.headerTitle}>Bookings</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Hostel Picker */}
      {hostels.length > 0 && (
        <Pressable
          style={({ pressed }) => [
            styles.hostelPicker,
            pressed && { opacity: OPACITY.pressed },
          ]}
          onPress={() => setShowHostelPicker(!showHostelPicker)}
        >
          <Text style={styles.hostelPickerText}>
            {selectedHostel?.hostelName || 'Select Hostel'}
          </Text>
          <ChevronDown size={20} color={COLORS.textMuted} strokeWidth={1.5} />
        </Pressable>
      )}

      {/* Hostel Dropdown */}
      {showHostelPicker && (
        <View style={styles.hostelDropdown}>
          {hostels.map((hostel) => (
            <Pressable
              key={hostel.id}
              style={({ pressed }) => [
                styles.hostelOption,
                selectedHostelId === hostel.id && styles.hostelOptionSelected,
                pressed && { opacity: OPACITY.pressed },
              ]}
              onPress={() => {
                setSelectedHostelId(hostel.id);
                setShowHostelPicker(false);
              }}
            >
              <Text
                style={[
                  styles.hostelOptionText,
                  selectedHostelId === hostel.id && styles.hostelOptionTextSelected,
                ]}
              >
                {hostel.hostelName}
              </Text>
              {selectedHostelId === hostel.id && (
                <Check size={18} color={COLORS.primary} strokeWidth={2} />
              )}
            </Pressable>
          ))}
        </View>
      )}

      {/* Bookings List */}
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
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon={<FileText size={48} color={COLORS.textMuted} strokeWidth={1.5} />}
            title="No bookings"
            description="Booking requests will appear here when students book your hostel."
          />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

// Detail Row Component
const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.bgPrimary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  headerSpacer: {
    width: 44,
  },

  // Hostel Picker
  hostelPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  hostelPickerText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  hostelDropdown: {
    marginHorizontal: 20,
    marginTop: 8,
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    overflow: 'hidden',
  },
  hostelOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  hostelOptionSelected: {
    backgroundColor: COLORS.primaryLight,
  },
  hostelOptionText: {
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  hostelOptionTextSelected: {
    fontWeight: '600',
    color: COLORS.primary,
  },

  // List
  list: {
    padding: 20,
    flexGrow: 1,
  },
  separator: {
    height: 12,
  },

  // Booking Card
  bookingCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  studentInfo: {
    flex: 1,
    marginRight: 12,
  },
  studentName: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  studentEmail: {
    fontSize: 13,
    color: COLORS.textMuted,
  },

  // Details
  bookingDetails: {
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },

  // Image
  imageContainer: {
    marginBottom: 14,
  },
  transactionImage: {
    width: '100%',
    height: 140,
    borderRadius: 12,
  },
  imageLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 6,
    textAlign: 'center',
  },

  // Actions
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  disapproveButton: {
    backgroundColor: COLORS.errorLight,
    borderWidth: 1,
    borderColor: COLORS.errorMuted,
  },
  disapproveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.error,
  },
  approveButton: {
    backgroundColor: COLORS.success,
  },
  approveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textInverse,
  },

  // Kick Actions
  kickActions: {
    gap: 10,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  kickButton: {
    paddingVertical: 14,
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 12,
    alignItems: 'center',
  },
  kickButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  kickViolatedButton: {
    backgroundColor: COLORS.errorLight,
    borderWidth: 1,
    borderColor: COLORS.errorMuted,
  },
  kickViolatedButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.error,
  },
});