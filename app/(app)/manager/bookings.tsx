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
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { bookingsApi } from '@/api/bookings';
import { hostelsApi } from '@/api/hostels';
import { Badge, Card, EmptyState, LoadingScreen } from '@/components/ui';
import { COLORS } from '@/constants/colors';
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
      const response =
        await bookingsApi.getHostelBookings(selectedHostelId);
      if (response.success) {
        setBookings(response.data);
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2:
          error?.response?.data?.message ||
          'Failed to fetch bookings',
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
      'Approve booking',
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
                text2:
                  error?.response?.data?.message ||
                  'Failed to approve',
              });
            }
          },
        },
      ]
    );
  };

  const handleKick = async (
    id: string,
    reason: 'LEFT_HOSTEL' | 'VIOLATED_RULES'
  ) => {
    Alert.alert(
      'Remove student',
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
                text2:
                  error?.response?.data?.message ||
                  'Failed to remove student',
              });
            }
          },
        },
      ]
    );
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'success';
      case 'DISAPPROVED':
        return 'error';
      case 'PENDING':
        return 'warning';
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

  const selectedHostel = hostels.find(
    (h) => h.id === selectedHostelId
  );

  const renderBooking = ({ item }: { item: Booking }) => (
    <Card style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View>
          <Text style={styles.studentName}>
            {(item as any).student?.fullName || 'Student'}
          </Text>
          <Text style={styles.studentEmail}>
            {(item as any).student?.user?.email}
          </Text>
        </View>
        <Badge
          label={item.status}
          variant={getStatusVariant(item.status)}
        />
      </View>

      <View style={styles.bookingDetails}>
        <Text style={styles.detailText}>
          Room type: {item.roomType.replace('_', ' ')}
        </Text>
        <Text style={styles.detailText}>
          Transaction: {item.transactionDate} at{' '}
          {item.transactionTime}
        </Text>
        <Text style={styles.detailText}>
          From: {item.fromAccount} → To: {item.toAccount}
        </Text>
      </View>

      {/* Transaction Image */}
      {item.transactionImage && (
        <TouchableOpacity
          style={styles.imagePreview}
          activeOpacity={0.8}
        >
          <Image
            source={{ uri: item.transactionImage }}
            style={styles.transactionImage}
            resizeMode="cover"
          />
          <Text style={styles.imageLabel}>Payment proof</Text>
        </TouchableOpacity>
      )}

      {/* Actions for Pending */}
      {item.status === 'PENDING' && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.disapproveButton}
            onPress={() => {
              Toast.show({
                type: 'info',
                text1: 'Coming soon',
                text2: 'Disapprove with refund feature',
              });
            }}
          >
            <X size={18} color={COLORS.error} />
            <Text style={styles.disapproveButtonText}>
              Disapprove
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.approveButton}
            onPress={() => handleApprove(item.id)}
          >
            <Check size={18} color={COLORS.textInverse} />
            <Text style={styles.approveButtonText}>Approve</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Actions for Approved */}
      {item.status === 'APPROVED' && (
        <View style={styles.kickActions}>
          <TouchableOpacity
            style={styles.kickButton}
            onPress={() => handleKick(item.id, 'LEFT_HOSTEL')}
          >
            <Text style={styles.kickButtonText}>Mark as left</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.kickButton, styles.kickViolatedButton]}
            onPress={() =>
              handleKick(item.id, 'VIOLATED_RULES')
            }
          >
            <Text style={styles.kickViolatedButtonText}>
              Kick (violated rules)
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'bottom']}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bookings</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Hostel Picker */}
      {hostels.length > 0 && (
        <TouchableOpacity
          style={styles.hostelPicker}
          onPress={() =>
            setShowHostelPicker(!showHostelPicker)
          }
          activeOpacity={0.8}
        >
          <Text style={styles.hostelPickerText}>
            {selectedHostel?.hostelName || 'Select hostel'}
          </Text>
          <ChevronDown
            size={20}
            color={COLORS.textMuted}
          />
        </TouchableOpacity>
      )}

      {showHostelPicker && (
        <Card style={styles.hostelDropdown}>
          {hostels.map((hostel) => (
            <TouchableOpacity
              key={hostel.id}
              style={[
                styles.hostelOption,
                selectedHostelId === hostel.id &&
                  styles.hostelOptionSelected,
              ]}
              onPress={() => {
                setSelectedHostelId(hostel.id);
                setShowHostelPicker(false);
              }}
            >
              <Text
                style={[
                  styles.hostelOptionText,
                  selectedHostelId === hostel.id &&
                    styles.hostelOptionTextSelected,
                ]}
              >
                {hostel.hostelName}
              </Text>
              {selectedHostelId === hostel.id && (
                <Check
                  size={18}
                  color={COLORS.primary}
                />
              )}
            </TouchableOpacity>
          ))}
        </Card>
      )}

      {/* List */}
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
            icon={
              <FileText
                size={64}
                color={COLORS.textMuted}
              />
            }
            title="No bookings"
            description="Booking requests will appear here."
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
  hostelPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 24,
    marginTop: 16,
    padding: 14,
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  hostelPickerText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  hostelDropdown: {
    marginHorizontal: 24,
    marginTop: 8,
    padding: 8,
  },
  hostelOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
  },
  hostelOptionSelected: {
    backgroundColor: COLORS.primary + '15',
  },
  hostelOptionText: {
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  hostelOptionTextSelected: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  list: {
    padding: 24,
    flexGrow: 1,
  },
  bookingCard: {
    marginBottom: 16,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  studentEmail: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  bookingDetails: {
    gap: 4,
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  imagePreview: {
    marginBottom: 12,
  },
  transactionImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
  },
  imageLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  disapproveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    backgroundColor: COLORS.error + '15',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.error + '30',
  },
  disapproveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.error,
  },
  approveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    backgroundColor: COLORS.success,
    borderRadius: 10,
  },
  approveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textInverse,
  },
  kickActions: {
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  kickButton: {
    paddingVertical: 12,
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 10,
    alignItems: 'center',
  },
  kickButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  kickViolatedButton: {
    backgroundColor: COLORS.error + '15',
    borderWidth: 1,
    borderColor: COLORS.error + '30',
  },
  kickViolatedButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.error,
  },
});