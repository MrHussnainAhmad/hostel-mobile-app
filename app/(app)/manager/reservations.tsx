import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Calendar,
  Check,
  ChevronDown,
  X,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { hostelsApi } from '@/api/hostels';
import { reservationsApi } from '@/api/reservations';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  LoadingScreen,
} from '@/components/ui';
import { COLORS } from '@/constants/colors';
import { Hostel, Reservation } from '@/types';

export default function ManagerReservationsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ hostelId?: string }>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [selectedHostelId, setSelectedHostelId] = useState<string | null>(
    params.hostelId || null
  );
  const [showHostelPicker, setShowHostelPicker] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(
    null
  );
  const [rejectReason, setRejectReason] = useState('');

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

  const fetchReservations = async () => {
    if (!selectedHostelId) {
      setLoading(false);
      return;
    }

    try {
      const response =
        await reservationsApi.getHostelReservations(
          selectedHostelId
        );
      if (response.success) {
        setReservations(response.data);
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2:
          error?.response?.data?.message ||
          'Failed to fetch reservations',
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
      fetchReservations();
    }
  }, [selectedHostelId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReservations();
  };

  const handleAccept = async (id: string) => {
    Alert.alert(
      'Accept reservation',
      'Are you sure you want to accept this reservation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              await reservationsApi.review(id, {
                status: 'ACCEPTED',
              });
              Toast.show({
                type: 'success',
                text1: 'Accepted',
                text2:
                  'Reservation accepted successfully',
              });
              fetchReservations();
            } catch (error: any) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2:
                  error?.response?.data?.message ||
                  'Failed to accept',
              });
            }
          },
        },
      ]
    );
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please provide a rejection reason',
      });
      return;
    }

    try {
      await reservationsApi.review(id, {
        status: 'REJECTED',
        rejectReason: rejectReason.trim(),
      });
      Toast.show({
        type: 'success',
        text1: 'Rejected',
        text2:
          'Reservation rejected successfully',
      });
      setRejectingId(null);
      setRejectReason('');
      fetchReservations();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2:
          error?.response?.data?.message ||
          'Failed to reject',
      });
    }
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

  const selectedHostel = hostels.find(
    (h) => h.id === selectedHostelId
  );

  const renderReservation = ({ item }: { item: Reservation }) => (
    <Card style={styles.reservationCard}>
      <View style={styles.reservationHeader}>
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

      <View style={styles.reservationDetails}>
        <Text style={styles.detailText}>
          Room type: {item.roomType.replace('_', ' ')}
        </Text>
        <Text style={styles.detailText}>
          Requested: {formatDate(item.createdAt)}
        </Text>
      </View>

      {item.message && (
        <View style={styles.messageBox}>
          <Text style={styles.messageLabel}>Message:</Text>
          <Text style={styles.messageText}>{item.message}</Text>
        </View>
      )}

      {/* Actions for Pending */}
      {item.status === 'PENDING' && (
        <>
          {rejectingId === item.id ? (
            <View style={styles.rejectForm}>
              <TextInput
                style={styles.rejectInput}
                placeholder="Reason for rejection..."
                placeholderTextColor={COLORS.textMuted}
                value={rejectReason}
                onChangeText={setRejectReason}
                multiline
              />
              <View style={styles.rejectActions}>
                <Button
                  title="Cancel"
                  onPress={() => {
                    setRejectingId(null);
                    setRejectReason('');
                  }}
                  variant="ghost"
                  size="sm"
                  style={styles.rejectActionButton}
                />
                <Button
                  title="Reject"
                  onPress={() => handleReject(item.id)}
                  variant="secondary"
                  size="sm"
                  style={[
                    styles.rejectActionButton,
                    {
                      backgroundColor: COLORS.error,
                    },
                  ]}
                  textStyle={{ color: COLORS.textInverse }}
                />
              </View>
            </View>
          ) : (
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.rejectButton}
                onPress={() => setRejectingId(item.id)}
              >
                <X size={18} color={COLORS.error} />
                <Text style={styles.rejectButtonText}>
                  Reject
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => handleAccept(item.id)}
              >
                <Check
                  size={18}
                  color={COLORS.textInverse}
                />
                <Text style={styles.acceptButtonText}>
                  Accept
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </>
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
        <Text style={styles.headerTitle}>Reservations</Text>
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
            icon={
              <Calendar
                size={64}
                color={COLORS.textMuted}
              />
            }
            title="No reservations"
            description="Reservation requests will appear here."
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
  reservationCard: {
    marginBottom: 16,
  },
  reservationHeader: {
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
  reservationDetails: {
    gap: 4,
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  messageBox: {
    backgroundColor: COLORS.bgSecondary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  messageLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  rejectButton: {
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
  rejectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.error,
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    backgroundColor: COLORS.success,
    borderRadius: 10,
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textInverse,
  },
  rejectForm: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  rejectInput: {
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  rejectActions: {
    flexDirection: 'row',
    gap: 12,
  },
  rejectActionButton: {
    flex: 1,
  },
});