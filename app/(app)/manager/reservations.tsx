// app/(app)/manager/reservations.tsx

import { COLORS, OPACITY } from "@/constants/colors";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Calendar,
  Check,
  ChevronDown,
  X,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import { hostelsApi } from "@/api/hostels";
import { reservationsApi } from "@/api/reservations";
import AppText from "@/components/common/AppText";
import { Badge, Button, EmptyState, LoadingScreen } from "@/components/ui";
import { Hostel, Reservation } from "@/types";


export default function ManagerReservationsScreen() {
  const { t } = useTranslation();
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
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

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
      console.log("Error fetching hostels:", error);
    }
  };

  const fetchReservations = async () => {
    if (!selectedHostelId) {
      setLoading(false);
      return;
    }

    try {
      const response = await reservationsApi.getHostelReservations(
        selectedHostelId
      );
      if (response.success) {
        setReservations(response.data);
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: t("manager.reservations.fetch_error_title"),
        text2:
          error?.response?.data?.message ||
          t("manager.reservations.fetch_error_message"),
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
      t("manager.reservations.accept_alert_title"),
      t("manager.reservations.accept_alert_message"),
      [
        { text: t("manager.reservations.button_cancel"), style: "cancel" },
        {
          text: t("manager.reservations.button_accept"),
          onPress: async () => {
            try {
              await reservationsApi.review(id, { status: "ACCEPTED" });
              Toast.show({
                type: "success",
                text1: t("manager.reservations.accept_success_title"),
                text2: t("manager.reservations.accept_success_message"),
              });
              fetchReservations();
            } catch (error: any) {
              Toast.show({
                type: "error",
                text1: t("manager.reservations.fetch_error_title"),
                text2:
                  error?.response?.data?.message ||
                  t("manager.reservations.accept_error_message"),
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
        type: "error",
        text1: t("manager.reservations.fetch_error_title"),
        text2: t("manager.reservations.reject_reason_required"),
      });
      return;
    }

    try {
      await reservationsApi.review(id, {
        status: "REJECTED",
        rejectReason: rejectReason.trim(),
      });
      Toast.show({
        type: "success",
        text1: t("manager.reservations.reject_success_title"),
        text2: t("manager.reservations.reject_success_message"),
      });
      setRejectingId(null);
      setRejectReason("");
      fetchReservations();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: t("manager.reservations.fetch_error_title"),
        text2:
          error?.response?.data?.message ||
          t("manager.reservations.reject_error_message"),
      });
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "success";
      case "REJECTED":
        return "error";
      case "CANCELLED":
        return "default";
      default:
        return "warning";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const selectedHostel = hostels.find((h) => h.id === selectedHostelId);

  const renderReservation = ({ item }: { item: Reservation }) => (
    <View style={styles.reservationCard}>
      {/* Header */}
      <View style={styles.reservationHeader}>
        <View style={styles.studentInfo}>
          <AppText style={styles.studentName}>
            {(item as any).student?.fullName ||
              t("manager.reservations.student_fallback_name")}
          </AppText>
          <AppText style={styles.studentEmail}>
            {(item as any).student?.user?.email}
          </AppText>
        </View>
        <Badge
          label={item.status}
          variant={getStatusVariant(item.status)}
          size="sm"
        />
      </View>

      {/* Details */}
      <View style={styles.reservationDetails}>
        <DetailRow
          label={t("manager.reservations.detail_room_type")}
          value={item.roomType.replace("_", " ")}
        />
        <DetailRow
          label={t("manager.reservations.detail_requested")}
          value={formatDate(item.createdAt)}
        />
      </View>

      {/* Message */}
      {item.message && (
        <View style={styles.messageBox}>
          <AppText style={styles.messageLabel}>
            {t("manager.reservations.message_label")}
          </AppText>
          <AppText style={styles.messageText}>{item.message}</AppText>
        </View>
      )}

      {/* Pending Actions */}
      {item.status === "PENDING" && (
        <>
          {rejectingId === item.id ? (
            <View style={styles.rejectForm}>
              <TextInput
                style={styles.rejectInput}
                placeholder={t("manager.reservations.reject_placeholder")}
                placeholderTextColor={COLORS.inputPlaceholder}
                value={rejectReason}
                onChangeText={setRejectReason}
                multiline
                textAlignVertical="top"
              />
              <View style={styles.rejectActions}>
                <Button
                  title={t("manager.reservations.button_cancel")}
                  onPress={() => {
                    setRejectingId(null);
                    setRejectReason("");
                  }}
                  variant="secondary"
                  size="sm"
                  style={styles.rejectActionButton}
                />
                <Button
                  title={t("manager.reservations.button_reject")}
                  onPress={() => handleReject(item.id)}
                  size="sm"
                  style={[
                    styles.rejectActionButton,
                    { backgroundColor: COLORS.error },
                  ]}
                />
              </View>
            </View>
          ) : (
            <View style={styles.actions}>
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.rejectButton,
                  pressed && { opacity: OPACITY.pressed },
                ]}
                onPress={() => setRejectingId(item.id)}
              >
                <X size={18} color={COLORS.error} strokeWidth={1.5} />
                <AppText style={styles.rejectButtonText}>
                  {t("manager.reservations.button_reject")}
                </AppText>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.acceptButton,
                  pressed && { opacity: OPACITY.pressed },
                ]}
                onPress={() => handleAccept(item.id)}
              >
                <Check size={18} color={COLORS.textInverse} strokeWidth={1.5} />
                <AppText style={styles.acceptButtonText}>
                  {t("manager.reservations.button_accept")}
                </AppText>
              </Pressable>
            </View>
          )}
        </>
      )}
    </View>
  );

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
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
          {t("manager.reservations.title")}
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
              t("manager.reservations.hostel_picker_placeholder")}
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
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon={
              <Calendar size={48} color={COLORS.textMuted} strokeWidth={1.5} />
            }
            title={t("manager.reservations.empty_title")}
            description={t("manager.reservations.empty_description")}
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

  // Hostel Picker
  hostelPicker: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  hostelDropdown: {
    marginHorizontal: 20,
    marginTop: 8,
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    overflow: "hidden",
  },
  hostelOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    fontWeight: "600",
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

  // Reservation Card
  reservationCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  reservationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  studentInfo: {
    flex: 1,
    marginRight: 12,
  },
  studentName: {
    fontSize: 17,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  studentEmail: {
    fontSize: 13,
    color: COLORS.textMuted,
  },

  // Details
  reservationDetails: {
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.textPrimary,
    textTransform: "capitalize",
  },

  // Message
  messageBox: {
    backgroundColor: COLORS.bgSecondary,
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
  },
  messageLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textMuted,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  messageText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  // Actions
  actions: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  rejectButton: {
    backgroundColor: COLORS.errorLight,
    borderWidth: 1,
    borderColor: COLORS.errorMuted,
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.error,
  },
  acceptButton: {
    backgroundColor: COLORS.success,
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textInverse,
  },

  // Reject Form
  rejectForm: {
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  rejectInput: {
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: COLORS.textPrimary,
    minHeight: 80,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
  },
  rejectActions: {
    flexDirection: "row",
    gap: 12,
  },
  rejectActionButton: {
    flex: 1,
  },
});
