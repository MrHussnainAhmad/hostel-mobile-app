import { COLORS, OPACITY } from "@/constants/colors";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AlertTriangle, ArrowLeft, MapPin, Star } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import { bookingsApi } from "@/api/bookings";
import { reportsApi } from "@/api/reports";
import AppText from "@/components/common/AppText";
import { Badge, Button, LoadingScreen } from "@/components/ui";
import { Booking } from "@/types";


export default function BookingDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<Booking | null>(null);

  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [showReportForm, setShowReportForm] = useState(false);
  const [reportDescription, setReportDescription] = useState("");
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
        type: "error",
        text1: t("student.booking.error_title"),
        text2:
          error?.response?.data?.message ||
          t("student.booking.error_fetch_booking"),
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
        type: "error",
        text1: t("student.booking.error_title"),
        text2: t("student.booking.error_review_required"),
      });
      return;
    }

    Alert.alert(
      t("student.booking.leave_confirm_title"),
      t("student.booking.leave_confirm_message"),
      [
        { text: t("student.booking.cancel"), style: "cancel" },
        {
          text: t("student.booking.leave_confirm_button"),
          style: "destructive",
          onPress: async () => {
            try {
              setSubmitting(true);
              await bookingsApi.leave({
                rating,
                review: review.trim(),
                reason: reason.trim() || undefined,
              });
              Toast.show({
                type: "success",
                text1: t("student.booking.success_title"),
                text2: t("student.booking.success_left"),
              });
              router.back();
            } catch (error: any) {
              Toast.show({
                type: "error",
                text1: t("student.booking.error_title"),
                text2:
                  error?.response?.data?.message ||
                  t("student.booking.error_leave_failed"),
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
        type: "error",
        text1: t("student.booking.error_title"),
        text2: t("student.booking.error_report_required"),
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
        type: "success",
        text1: t("student.booking.report_success_title"),
        text2: t("student.booking.report_success_message"),
      });
      setShowReportForm(false);
      setReportDescription("");
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: t("student.booking.error_title"),
        text2:
          error?.response?.data?.message ||
          t("student.booking.error_report_failed"),
      });
    } finally {
      setSubmittingReport(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "success";
      case "DISAPPROVED":
        return "error";
      case "PENDING":
        return "warning";
      default:
        return "default";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!booking) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
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
            {t("student.booking.header_title")}
          </AppText>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.notFound}>
          <AppText style={styles.notFoundText}>
            {t("student.booking.not_found")}
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
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
          {t("student.booking.header_title")}
        </AppText>

        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {/* Hostel Card */}
          <View style={styles.hostelCard}>
            {booking.hostel.roomImages?.[0] && (
              <Image
                source={{ uri: booking.hostel.roomImages[0] }}
                style={styles.hostelImage}
              />
            )}
            <View style={styles.hostelInfo}>
              <View style={styles.hostelHeader}>
                <AppText style={styles.hostelName} numberOfLines={1}>
                  {booking.hostel.hostelName}
                </AppText>
                <Badge
                  label={booking.status}
                  variant={getStatusVariant(booking.status)}
                  size="sm"
                />
              </View>

              <View style={styles.locationRow}>
                <MapPin size={14} color={COLORS.textMuted} strokeWidth={1.5} />
                <AppText style={styles.locationText}>
                  {booking.hostel.city}, {booking.hostel.address}
                </AppText>
              </View>
            </View>
          </View>

          {/* Booking Information */}
          <AppText style={styles.sectionTitle}>
            {t("student.booking.section_booking_information")}
          </AppText>

          <View style={styles.detailsCard}>
            <DetailRow
              label={t("student.booking.room_type")}
              value={booking.roomType.replace("_", " ")}
            />
            <DetailRow
              label={t("student.booking.booking_date")}
              value={formatDate(booking.createdAt)}
            />
            <DetailRow
              label={t("student.booking.transaction_date")}
              value={booking.transactionDate}
            />
            <DetailRow
              label={t("student.booking.from_account")}
              value={booking.fromAccount}
            />
            <DetailRow
              label={t("student.booking.to_account")}
              value={booking.toAccount}
              isLast
            />
          </View>

          {/* Transaction Image */}
          {booking.transactionImage && (
            <>
              <AppText style={styles.sectionTitle}>
                {t("student.booking.payment_proof")}
              </AppText>
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
          {booking.status === "DISAPPROVED" && booking.refundImage && (
            <>
              <AppText style={styles.sectionTitle}>
                {t("student.booking.refund_info")}
              </AppText>

              <View style={styles.refundCard}>
                <AppText style={styles.refundText}>
                  {t("student.booking.refund_on", {
                    date: booking.refundDate,
                    time: booking.refundTime,
                  })}
                </AppText>

                <Image
                  source={{ uri: booking.refundImage }}
                  style={styles.transactionImage}
                  resizeMode="contain"
                />
              </View>
            </>
          )}

          {/* Kick Reason */}
          {booking.status === "KICKED" && booking.kickReason && (
            <View style={styles.kickCard}>
              <AlertTriangle size={22} color={COLORS.error} strokeWidth={1.5} />

              <View style={styles.kickContent}>
                <AppText style={styles.kickTitle}>
                  {t("student.booking.removed_from_hostel")}
                </AppText>

                <AppText style={styles.kickReason}>
                  {t("student.booking.kick_reason", {
                    reason: booking.kickReason.replace("_", " "),
                  })}
                </AppText>
              </View>
            </View>
          )}

          {/* Leave Form Button */}
          {booking.status === "APPROVED" &&
            !showLeaveForm &&
            !showReportForm && (
              <Button
                title={t("student.booking.leave_hostel")}
                onPress={() => setShowLeaveForm(true)}
                variant="outline"
                style={styles.leaveButton}
              />
            )}

          {/* Leave Form */}
          {showLeaveForm && (
            <View style={styles.formCard}>
              <AppText style={styles.formTitle}>
                {t("student.booking.leave_review_title")}
              </AppText>

              <AppText style={styles.inputLabel}>
                {t("student.booking.your_rating")}
              </AppText>

              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Pressable key={star} onPress={() => setRating(star)}>
                    <Star
                      size={32}
                      color={COLORS.warning}
                      fill={star <= rating ? COLORS.warning : "transparent"}
                      strokeWidth={1.5}
                    />
                  </Pressable>
                ))}
              </View>

              <AppText style={styles.inputLabel}>
                {t("student.booking.review_required")}
              </AppText>

              <TextInput
                style={styles.textArea}
                placeholder={t("student.booking.placeholder_review")}
                placeholderTextColor={COLORS.inputPlaceholder}
                value={review}
                onChangeText={setReview}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <AppText style={styles.inputLabel}>
                {t("student.booking.reason_optional")}
              </AppText>

              <TextInput
                style={styles.input}
                placeholder={t("student.booking.placeholder_reason")}
                placeholderTextColor={COLORS.inputPlaceholder}
                value={reason}
                onChangeText={setReason}
              />

              <View style={styles.formActions}>
                <Button
                  title={t("student.booking.cancel")}
                  onPress={() => setShowLeaveForm(false)}
                  variant="secondary"
                  style={styles.actionBtn}
                />

                <Button
                  title={t("student.booking.submit_leave")}
                  onPress={handleLeave}
                  loading={submitting}
                  style={styles.actionBtn}
                />
              </View>
            </View>
          )}

          {/* Report Button */}
          {booking.status === "APPROVED" &&
            !showLeaveForm &&
            !showReportForm && (
              <Pressable
                style={({ pressed }) => [
                  styles.reportButton,
                  pressed && { opacity: OPACITY.pressed },
                ]}
                onPress={() => setShowReportForm(true)}
              >
                <AlertTriangle
                  size={18}
                  color={COLORS.warning}
                  strokeWidth={1.5}
                />

                <AppText style={styles.reportButtonText}>
                  {t("student.booking.report_issue")}
                </AppText>
              </Pressable>
            )}

          {/* Report Form */}
          {showReportForm && (
            <View style={styles.formCard}>
              <AppText style={styles.formTitle}>
                {t("student.booking.report_issue")}
              </AppText>

              <AppText style={styles.formDesc}>
                {t("student.booking.report_description")}
              </AppText>

              <TextInput
                style={styles.textArea}
                placeholder={t("student.booking.placeholder_report")}
                placeholderTextColor={COLORS.inputPlaceholder}
                value={reportDescription}
                onChangeText={setReportDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <View style={styles.formActions}>
                <Button
                  title={t("student.booking.cancel")}
                  onPress={() => {
                    setShowReportForm(false);
                    setReportDescription("");
                  }}
                  variant="secondary"
                  style={styles.actionBtn}
                />

                <Button
                  title={t("student.booking.submit_report")}
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
              <AppText style={styles.sectionTitle}>
                {t("student.booking.your_review")}
              </AppText>

              <View style={styles.reviewCard}>
                <View style={styles.reviewRating}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={18}
                      color={COLORS.warning}
                      fill={
                        star <= (booking.rating || 0)
                          ? COLORS.warning
                          : "transparent"
                      }
                      strokeWidth={1.5}
                    />
                  ))}
                </View>

                <AppText style={styles.reviewText}>
                  {booking.review}
                </AppText>
              </View>
            </>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const DetailRow = ({
  label,
  value,
  isLast = false,
}: {
  label: string;
  value: string;
  isLast?: boolean;
}) => (
  <>
    <View style={styles.detailRow}>
      <AppText style={styles.detailLabel}>{label}</AppText>
      <AppText style={styles.detailValue}>{value}</AppText>
    </View>
    {!isLast && <View style={styles.divider} />}
  </>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },

  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },

  headerSpacer: {
    width: 44,
  },

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
    justifyContent: "center",
    alignItems: "center",
  },

  notFoundText: {
    fontSize: 16,
    color: COLORS.textMuted,
  },

  hostelCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },

  hostelImage: {
    width: "100%",
    height: 160,
  },

  hostelInfo: {
    padding: 16,
  },

  hostelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  hostelName: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 12,
    letterSpacing: -0.2,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  locationText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 14,
    letterSpacing: -0.2,
  },

  detailsCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  detailLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
  },

  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: 14,
  },

  imageCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },

  transactionImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },

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

  kickCard: {
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "600",
    color: COLORS.error,
    marginBottom: 4,
  },

  kickReason: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  leaveButton: {
    marginBottom: 16,
  },

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
    fontWeight: "600",
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
    fontWeight: "500",
    color: COLORS.textSecondary,
    marginBottom: 10,
  },

  starsRow: {
    flexDirection: "row",
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
    textAlignVertical: "top",
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
    flexDirection: "row",
    gap: 12,
  },

  actionBtn: {
    flex: 1,
  },

  reportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
    fontWeight: "600",
    color: COLORS.warning,
  },

  reviewCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },

  reviewRating: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 12,
  },

  reviewText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
});
