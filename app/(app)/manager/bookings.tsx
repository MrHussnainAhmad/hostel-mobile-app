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
import { useTranslation } from 'react-i18next';
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { bookingsApi } from '@/api/bookings';
import { hostelsApi } from '@/api/hostels';
import AppText from "@/components/common/AppText";
import { Badge, EmptyState, LoadingScreen } from '@/components/ui';
import { Booking, Hostel } from '@/types';


export default function ManagerBookingsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ hostelId?: string }>();
  const { t } = useTranslation();

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
        text1: t('common.error'),
        text2:
          error?.response?.data?.message ||
          t('manager.bookings.fetch_failed'),
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

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'DISAPPROVED': return 'error';
      case 'PENDING': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return t('manager.bookings.status.approved');
      case 'DISAPPROVED':
        return t('manager.bookings.status.disapproved');
      case 'PENDING':
      default:
        return t('manager.bookings.status.pending');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleApprove = async (id: string) => {
    Alert.alert(
      t('manager.bookings.approve_alert_title'),
      t('manager.bookings.approve_alert_message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.approve'),
          onPress: async () => {
            try {
              await bookingsApi.approve(id);
              Toast.show({
                type: 'success',
                text1: t('manager.bookings.approve_success_title'),
                text2: t('manager.bookings.approve_success_message'),
              });
              fetchBookings();
            } catch (error: any) {
              Toast.show({
                type: 'error',
                text1: t('common.error'),
                text2:
                  error?.response?.data?.message ||
                  t('manager.bookings.approve_error_message'),
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
      t('manager.bookings.remove_alert_title'),
      t('manager.bookings.remove_alert_message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.remove'),
          style: 'destructive',
          onPress: async () => {
            try {
              await bookingsApi.kick(id, { kickReason: reason });
              Toast.show({
                type: 'success',
                text1: t('manager.bookings.remove_success_title'),
                text2: t('manager.bookings.remove_success_message'),
              });
              fetchBookings();
            } catch (error: any) {
              Toast.show({
                type: 'error',
                text1: t('common.error'),
                text2:
                  error?.response?.data?.message ||
                  t('manager.bookings.remove_error_message'),
              });
            }
          },
        },
      ]
    );
  };

  const selectedHostel = hostels.find((h) => h.id === selectedHostelId);

  const renderBooking = ({ item }: { item: Booking }) => (
    <View style={styles.bookingCard}>
      {/* Header */}
      <View style={styles.bookingHeader}>
        <View style={styles.studentInfo}>
          <AppText style={styles.studentName}>
            {(item as any).student?.fullName ||
              t('manager.bookings.student_fallback_name')}
          </AppText>
          <AppText style={styles.studentEmail}>
            {(item as any).student?.user?.email}
          </AppText>
        </View>
        <Badge
          label={getStatusLabel(item.status)}
          variant={getStatusVariant(item.status)}
          size="sm"
        />
      </View>

      {/* Details */}
      <View style={styles.bookingDetails}>
        <DetailRow
          label={t('manager.bookings.detail_room_type')}
          value={item.roomType.replace('_', ' ')}
        />
        <DetailRow
          label={t('manager.bookings.detail_transaction_label')}
          value={t('manager.bookings.detail_transaction_value', {
            date: item.transactionDate,
            time: item.transactionTime,
          })}
        />
        <DetailRow
          label={t('manager.bookings.detail_from_to')}
          value={`${item.fromAccount} → ${item.toAccount}`}
        />
      </View>

      {/* Transaction Image */}
      {item.transactionImage && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.transactionImage }}
            style={styles.transactionImage}
            resizeMode="cover"
          />
          <AppText style={styles.imageLabel}>
            {t('manager.bookings.payment_proof_label')}
          </AppText>
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
                text1: t('manager.bookings.coming_soon_title'),
                text2: t('manager.bookings.coming_soon_description'),
              });
            }}
          >
            <X size={18} color={COLORS.error} strokeWidth={1.5} />
            <AppText style={styles.disapproveButtonText}>
              {t('manager.bookings.disapprove_button')}
            </AppText>
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
            <AppText style={styles.approveButtonText}>
              {t('common.approve')}
            </AppText>
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
            <AppText style={styles.kickButtonText}>
              {t('manager.bookings.mark_left_button')}
            </AppText>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.kickButton,
              styles.kickViolatedButton,
              pressed && { opacity: OPACITY.pressed },
            ]}
            onPress={() => handleKick(item.id, 'VIOLATED_RULES')}
          >
            <AppText style={styles.kickViolatedButtonText}>
              {t('manager.bookings.kick_violated_button')}
            </AppText>
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
        <AppText style={styles.headerTitle}>
          {t('manager.bookings.title')}
        </AppText>
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
          <AppText style={styles.hostelPickerText}>
            {selectedHostel?.hostelName ||
              t('manager.bookings.hostel_picker_placeholder')}
          </AppText>
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
              <AppText
                style={[
                  styles.hostelOptionText,
                  selectedHostelId === hostel.id &&
                    styles.hostelOptionTextSelected,
                ]}
              >
                {hostel.hostelName}
              </AppText>
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
            title={t('manager.bookings.empty_title')}
            description={t('manager.bookings.empty_description')}
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
    <AppText style={styles.detailLabel}>{label}</AppText>
    <AppText style={styles.detailValue}>{value}</AppText>
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