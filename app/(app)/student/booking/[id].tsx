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
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { bookingsApi } from '@/api/bookings';
import { reportsApi } from '@/api/reports';
import { Badge, Button, Card, LoadingScreen } from '@/components/ui';
import { COLORS } from '@/constants/colors';
import { Booking } from '@/types';

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<Booking | null>(null);

  // Leave form state
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Report form state
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
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please write a review',
      });
      return;
    }

    Alert.alert(
      'Leave hostel',
      'Are you sure you want to leave this hostel? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, leave',
          style: 'destructive',
          onPress: async () => {
            try {
              setSubmitting(true);
              await bookingsApi.leave({
                rating,
                review: review.trim(),
                reason: reason.trim() || undefined,
              });

              Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'You have left the hostel',
              });
              router.back();
            } catch (error: any) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2:
                  error?.response?.data?.message ||
                  'Failed to leave hostel',
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
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please describe your complaint',
      });
      return;
    }

    try {
      setSubmittingReport(true);
      await reportsApi.create({
        bookingId: id,
        description: reportDescription.trim(),
      });

      Toast.show({
        type: 'success',
        text1: 'Report submitted',
        text2: 'Admin will review your complaint',
      });
      setShowReportForm(false);
      setReportDescription('');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2:
          error?.response?.data?.message || 'Failed to submit report',
      });
    } finally {
      setSubmittingReport(false);
    }
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
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Booking details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Booking not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hostel Info */}
        <Card style={styles.hostelCard}>
          {booking.hostel.roomImages?.[0] && (
            <Image
              source={{ uri: booking.hostel.roomImages[0] }}
              style={styles.hostelImage}
            />
          )}
          <View style={styles.hostelInfo}>
            <View style={styles.hostelHeader}>
              <Text style={styles.hostelName}>
                {booking.hostel.hostelName}
              </Text>
              <Badge
                label={booking.status}
                variant={getStatusVariant(booking.status)}
              />
            </View>
            <View style={styles.locationRow}>
              <MapPin size={14} color={COLORS.textMuted} />
              <Text style={styles.locationText}>
                {booking.hostel.city}, {booking.hostel.address}
              </Text>
            </View>
          </View>
        </Card>

        {/* Booking Details */}
        <Text style={styles.sectionTitle}>Booking information</Text>
        <Card style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Room type</Text>
            <Text style={styles.detailValue}>
              {booking.roomType.replace('_', ' ')}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Booking date</Text>
            <Text style={styles.detailValue}>
              {formatDate(booking.createdAt)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Transaction date</Text>
            <Text style={styles.detailValue}>
              {booking.transactionDate}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>From account</Text>
            <Text style={styles.detailValue}>
              {booking.fromAccount}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>To account</Text>
            <Text style={styles.detailValue}>{booking.toAccount}</Text>
          </View>
        </Card>

        {/* Transaction Image */}
        {booking.transactionImage && (
          <>
            <Text style={styles.sectionTitle}>Payment proof</Text>
            <Card style={styles.imageCard}>
              <Image
                source={{ uri: booking.transactionImage }}
                style={styles.transactionImage}
                resizeMode="contain"
              />
            </Card>
          </>
        )}

        {/* Refund Info */}
        {booking.status === 'DISAPPROVED' && booking.refundImage && (
          <>
            <Text style={styles.sectionTitle}>Refund information</Text>
            <Card style={styles.refundCard}>
              <Text style={styles.refundText}>
                Refund date: {booking.refundDate} at {booking.refundTime}
              </Text>
              <Image
                source={{ uri: booking.refundImage }}
                style={styles.transactionImage}
                resizeMode="contain"
              />
            </Card>
          </>
        )}

        {/* Kick Reason */}
        {booking.status === 'KICKED' && booking.kickReason && (
          <Card style={styles.kickCard}>
            <AlertTriangle size={24} color={COLORS.error} />
            <View style={styles.kickContent}>
              <Text style={styles.kickTitle}>Removed from hostel</Text>
              <Text style={styles.kickReason}>
                Reason: {booking.kickReason.replace('_', ' ')}
              </Text>
            </View>
          </Card>
        )}

        {/* Leave / Review */}
        {booking.status === 'APPROVED' && (
          <>
            {!showLeaveForm && !showReportForm ? (
              <Button
                title="Leave hostel"
                onPress={() => setShowLeaveForm(true)}
                variant="outline"
                style={styles.leaveButton}
              />
            ) : showLeaveForm ? (
              <Card style={styles.leaveForm}>
                <Text style={styles.leaveTitle}>
                  Leave hostel &amp; review
                </Text>

                <Text style={styles.ratingLabel}>Your rating</Text>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setRating(star)}
                    >
                      <Star
                        size={32}
                        color={COLORS.warning}
                        fill={
                          star <= rating ? COLORS.warning : 'transparent'
                        }
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.inputLabel}>Review *</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Share your experience..."
                  placeholderTextColor={COLORS.textMuted}
                  value={review}
                  onChangeText={setReview}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />

                <Text style={styles.inputLabel}>
                  Reason for leaving (optional)
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Why are you leaving?"
                  placeholderTextColor={COLORS.textMuted}
                  value={reason}
                  onChangeText={setReason}
                />

                <View style={styles.leaveActions}>
                  <Button
                    title="Cancel"
                    onPress={() => setShowLeaveForm(false)}
                    variant="ghost"
                    style={styles.cancelButton}
                  />
                  <Button
                    title="Submit & leave"
                    onPress={handleLeave}
                    loading={submitting}
                    style={styles.submitButton}
                  />
                </View>
              </Card>
            ) : null}
          </>
        )}

        {/* Report Issue */}
        {booking.status === 'APPROVED' && !showLeaveForm && (
          <>
            {!showReportForm ? (
              <TouchableOpacity
                style={styles.reportButton}
                onPress={() => setShowReportForm(true)}
              >
                <AlertTriangle size={18} color={COLORS.warning} />
                <Text style={styles.reportButtonText}>
                  Report an issue
                </Text>
              </TouchableOpacity>
            ) : (
              <Card style={styles.reportForm}>
                <Text style={styles.reportTitle}>Report an issue</Text>
                <Text style={styles.reportDesc}>
                  Describe your complaint. Admin will review and take
                  action.
                </Text>

                <TextInput
                  style={styles.textArea}
                  placeholder="Describe the issue in detail..."
                  placeholderTextColor={COLORS.textMuted}
                  value={reportDescription}
                  onChangeText={setReportDescription}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />

                <View style={styles.reportActions}>
                  <Button
                    title="Cancel"
                    onPress={() => {
                      setShowReportForm(false);
                      setReportDescription('');
                    }}
                    variant="ghost"
                    style={styles.cancelButton}
                  />
                  <Button
                    title="Submit report"
                    onPress={handleReport}
                    loading={submittingReport}
                    style={styles.submitButton}
                  />
                </View>
              </Card>
            )}
          </>
        )}

        {/* Previous Review */}
        {booking.review && (
          <>
            <Text style={styles.sectionTitle}>Your review</Text>
            <Card style={styles.reviewCard}>
              <View style={styles.reviewRating}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={18}
                    color={COLORS.warning}
                    fill={
                      star <= (booking.rating || 0)
                        ? COLORS.warning
                        : 'transparent'
                    }
                  />
                ))}
              </View>
              <Text style={styles.reviewText}>{booking.review}</Text>
            </Card>
          </>
        )}

        <View style={{ height: 40 }} />
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
  content: {
    flex: 1,
    padding: 24,
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
  hostelCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 24,
  },
  hostelImage: {
    width: '100%',
    height: 150,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  detailsCard: {
    marginBottom: 24,
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
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  imageCard: {
    marginBottom: 24,
    padding: 8,
  },
  transactionImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  refundCard: {
    marginBottom: 24,
  },
  refundText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  kickCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
    backgroundColor: COLORS.error + '15',
    borderColor: COLORS.error + '30',
  },
  kickContent: {
    flex: 1,
  },
  kickTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.error,
  },
  kickReason: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  leaveButton: {
    marginBottom: 16,
  },
  leaveForm: {
    marginBottom: 24,
  },
  leaveTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  ratingLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: COLORS.textPrimary,
    minHeight: 100,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    textAlignVertical: 'top',
  },
  input: {
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: COLORS.textPrimary,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  leaveActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: COLORS.warning + '15',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.warning + '30',
    marginBottom: 24,
  },
  reportButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.warning,
  },
  reportForm: {
    marginBottom: 24,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  reportDesc: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 16,
  },
  reportActions: {
    flexDirection: 'row',
    gap: 12,
  },
  reviewCard: {
    marginBottom: 24,
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  reviewText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
});