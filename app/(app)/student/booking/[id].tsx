// app/(app)/student/booking/[id].tsx

import { COLORS, OPACITY } from '@/constants/colors';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AlertTriangle,
  ArrowLeft,
  MapPin,
  Star,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { bookingsApi } from '@/api/bookings';
import { reportsApi } from '@/api/reports';
import { Badge, Button, LoadingScreen } from '@/components/ui';
import { Booking } from '@/types';

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<Booking | null>(null);

  // Leave form
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Report form
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportDescription, setReportDescription] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  const fetchBooking = async () => {
    try {
      const response = await bookingsApi.getMyBookings();
      if (response.success) {
        const found = response.data.find((b) => b.id === id);
        setBooking(found || null);
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Failed to fetch booking',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const handleLeave = async () => {
    if (!review.trim()) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please write a review' });
      return;
    }

    Alert.alert(
      'Leave Hostel',
      'Are you sure you want to leave? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              setSubmitting(true);
              await bookingsApi.leave({
                rating,
                review: review.trim(),
                reason: reason.trim() || undefined,
              });
              Toast.show({ type: 'success', text1: 'Success', text2: 'You have left the hostel' });
              router.back();
            } catch (error: any) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error?.response?.data?.message || 'Failed to leave',
              });
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };

  const handleReport = async () => {
    if (!reportDescription.trim()) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please describe your complaint' });
      return;
    }

    try {
      setSubmittingReport(true);
      await reportsApi.create({ bookingId: id, description: reportDescription.trim() });
      Toast.show({ type: 'success', text1: 'Report Submitted', text2: 'Admin will review your complaint' });
      setShowReportForm(false);
      setReportDescription('');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Failed to submit report',
      });
    } finally {
      setSubmittingReport(false);
    }
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
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!booking) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backButton, pressed && { opacity: OPACITY.pressed }]}
          >
            <ArrowLeft size={22} color={COLORS.textPrimary} strokeWidth={1.5} />
          </Pressable>
          <Text style={styles.headerTitle}>Booking Details</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Booking not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && { opacity: OPACITY.pressed }]}
        >
          <ArrowLeft size={22} color={COLORS.textPrimary} strokeWidth={1.5} />
        </Pressable>
        <Text style={styles.headerTitle}>Booking Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {/* Hostel Info */}
          <View style={styles.hostelCard}>
            {booking.hostel.roomImages?.[0] && (
              <Image
                source={{ uri: booking.hostel.roomImages[0] }}
                style={styles.hostelImage}
              />
            )}
            <View style={styles.hostelInfo}>
              <View style={styles.hostelHeader}>
                <Text style={styles.hostelName} numberOfLines={1}>
                  {booking.hostel.hostelName}
                </Text>
                <Badge label={booking.status} variant={getStatusVariant(booking.status)} size="sm" />
              </View>
              <View style={styles.locationRow}>
                <MapPin size={14} color={COLORS.textMuted} strokeWidth={1.5} />
                <Text style={styles.locationText}>
                  {booking.hostel.city}, {booking.hostel.address}
                </Text>
              </View>
            </View>
          </View>

          {/* Booking Details */}
          <Text style={styles.sectionTitle}>Booking Information</Text>
          <View style={styles.detailsCard}>
            <DetailRow label="Room Type" value={booking.roomType.replace('_', ' ')} />
            <DetailRow label="Booking Date" value={formatDate(booking.createdAt)} />
            <DetailRow label="Transaction Date" value={booking.transactionDate} />
            <DetailRow label="From Account" value={booking.fromAccount} />
            <DetailRow label="To Account" value={booking.toAccount} isLast />
          </View>

          {/* Transaction Image */}
          {booking.transactionImage && (
            <>
              <Text style={styles.sectionTitle}>Payment Proof</Text>
              <View style={styles.imageCard}>
                <Image
                  source={{ uri: booking.transactionImage }}
                  style={styles.transactionImage}
                  resizeMode="contain"
                />
              </View>
            </>
          )}

          {/* Refund Info */}
          {booking.status === 'DISAPPROVED' && booking.refundImage && (
            <>
              <Text style={styles.sectionTitle}>Refund Information</Text>
              <View style={styles.refundCard}>
                <Text style={styles.refundText}>
                  Refund on {booking.refundDate} at {booking.refundTime}
                </Text>
                <Image
                  source={{ uri: booking.refundImage }}
                  style={styles.transactionImage}
                  resizeMode="contain"
                />
              </View>
            </>
          )}

          {/* Kick Reason */}
          {booking.status === 'KICKED' && booking.kickReason && (
            <View style={styles.kickCard}>
              <AlertTriangle size={22} color={COLORS.error} strokeWidth={1.5} />
              <View style={styles.kickContent}>
                <Text style={styles.kickTitle}>Removed from Hostel</Text>
                <Text style={styles.kickReason}>
                  Reason: {booking.kickReason.replace('_', ' ')}
                </Text>
              </View>
            </View>
          )}

          {/* Leave Form */}
          {booking.status === 'APPROVED' && !showLeaveForm && !showReportForm && (
            <Button
              title="Leave Hostel"
              onPress={() => setShowLeaveForm(true)}
              variant="outline"
              style={styles.leaveButton}
            />
          )}

          {showLeaveForm && (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Leave & Review</Text>

              <Text style={styles.inputLabel}>Your Rating</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Pressable key={star} onPress={() => setRating(star)}>
                    <Star
                      size={32}
                      color={COLORS.warning}
                      fill={star <= rating ? COLORS.warning : 'transparent'}
                      strokeWidth={1.5}
                    />
                  </Pressable>
                ))}
              </View>

              <Text style={styles.inputLabel}>Review *</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Share your experience..."
                placeholderTextColor={COLORS.inputPlaceholder}
                value={review}
                onChangeText={setReview}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <Text style={styles.inputLabel}>Reason for Leaving (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Why are you leaving?"
                placeholderTextColor={COLORS.inputPlaceholder}
                value={reason}
                onChangeText={setReason}
              />

              <View style={styles.formActions}>
                <Button
                  title="Cancel"
                  onPress={() => setShowLeaveForm(false)}
                  variant="secondary"
                  style={styles.actionBtn}
                />
                <Button
                  title="Submit & Leave"
                  onPress={handleLeave}
                  loading={submitting}
                  style={styles.actionBtn}
                />
              </View>
            </View>
          )}

          {/* Report Button */}
          {booking.status === 'APPROVED' && !showLeaveForm && !showReportForm && (
            <Pressable
              style={({ pressed }) => [
                styles.reportButton,
                pressed && { opacity: OPACITY.pressed },
              ]}
              onPress={() => setShowReportForm(true)}
            >
              <AlertTriangle size={18} color={COLORS.warning} strokeWidth={1.5} />
              <Text style={styles.reportButtonText}>Report an Issue</Text>
            </Pressable>
          )}

          {/* Report Form */}
          {showReportForm && (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Report an Issue</Text>
              <Text style={styles.formDesc}>
                Describe your complaint. Admin will review and take action.
              </Text>

              <TextInput
                style={styles.textArea}
                placeholder="Describe the issue in detail..."
                placeholderTextColor={COLORS.inputPlaceholder}
                value={reportDescription}
                onChangeText={setReportDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <View style={styles.formActions}>
                <Button
                  title="Cancel"
                  onPress={() => {
                    setShowReportForm(false);
                    setReportDescription('');
                  }}
                  variant="secondary"
                  style={styles.actionBtn}
                />
                <Button
                  title="Submit Report"
                  onPress={handleReport}
                  loading={submittingReport}
                  style={styles.actionBtn}
                />
              </View>
            </View>
          )}

          {/* Previous Review */}
          {booking.review && (
            <>
              <Text style={styles.sectionTitle}>Your Review</Text>
              <View style={styles.reviewCard}>
                <View style={styles.reviewRating}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={18}
                      color={COLORS.warning}
                      fill={star <= (booking.rating || 0) ? COLORS.warning : 'transparent'}
                      strokeWidth={1.5}
                    />
                  ))}
                </View>
                <Text style={styles.reviewText}>{booking.review}</Text>
              </View>
            </>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Detail Row Component
const DetailRow = ({ label, value, isLast = false }: { label: string; value: string; isLast?: boolean }) => (
  <>
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
    {!isLast && <View style={styles.divider} />}
  </>
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

  // Content
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: 16,
    color: COLORS.textMuted,
  },

  // Hostel Card
  hostelCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  hostelImage: {
    width: '100%',
    height: 160,
  },
  hostelInfo: {
    padding: 16,
  },
  hostelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  hostelName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 12,
    letterSpacing: -0.2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },

  // Section
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 14,
    letterSpacing: -0.2,
  },

  // Details Card
  detailsCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: 14,
  },

  // Image Card
  imageCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  transactionImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },

  // Refund Card
  refundCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  refundText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 14,
  },

  // Kick Card
  kickCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: COLORS.errorLight,
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.errorMuted,
  },
  kickContent: {
    flex: 1,
  },
  kickTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.error,
    marginBottom: 4,
  },
  kickReason: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  // Leave Button
  leaveButton: {
    marginBottom: 16,
  },

  // Form Card
  formCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  formTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 18,
    letterSpacing: -0.2,
  },
  formDesc: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 16,
    lineHeight: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  textArea: {
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    color: COLORS.textPrimary,
    minHeight: 100,
    marginBottom: 18,
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
    textAlignVertical: 'top',
  },
  input: {
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    color: COLORS.textPrimary,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
  },

  // Report Button
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    backgroundColor: COLORS.warningLight,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.warningMuted,
    marginBottom: 24,
  },
  reportButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.warning,
  },

  // Review Card
  reviewCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 12,
  },
  reviewText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
});