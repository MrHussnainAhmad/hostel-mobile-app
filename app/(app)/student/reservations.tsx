// screens/ReservationsScreen.tsx

import { COLORS, OPACITY } from "@/constants/colors";
import { useRouter } from "expo-router";
import { ArrowLeft, Calendar, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import { reservationsApi } from "@/api/reservations";
import AppText from "@/components/common/AppText";
import { Badge, Button, EmptyState, LoadingScreen } from "@/components/ui";
import { Reservation } from "@/types";


export default function ReservationsScreen() {
  const { t } = useTranslation();
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
      // FIXED: Added "student." prefix
      Toast.show({
        type: "error",
        text1: t("student.reservations.toast_error_title"),
        text2:
          error?.response?.data?.message ||
          t("student.reservations.toast_error_message"),
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
    // FIXED: Added "student." prefix to alerts
    Alert.alert(
      t("student.reservations.cancel_alert_title"),
      t("student.reservations.cancel_alert_message"),
      [
        { text: t("student.reservations.cancel_alert_no"), style: "cancel" },
        {
          text: t("student.reservations.cancel_alert_yes"),
          style: "destructive",
          onPress: async () => {
            try {
              await reservationsApi.cancel(id);
              // FIXED: Added "student." prefix to toast
              Toast.show({
                type: "success",
                text1: t("student.reservations.toast_cancelled_title"),
                text2: t("student.reservations.toast_cancelled_message"),
              });
              fetchReservations();
            } catch (error: any) {
              // FIXED: Added "student." prefix to toast
              Toast.show({
                type: "error",
                text1: t("student.reservations.toast_error_title"),
                text2:
                  error?.response?.data?.message ||
                  t("student.reservations.toast_cancel_failed"),
              });
            }
          },
        },
      ]
    );
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

  const renderReservation = ({ item }: { item: Reservation }) => (
    <View style={styles.reservationCard}>
      {/* Header */}
      <View style={styles.reservationHeader}>
        <AppText style={styles.hostelName} numberOfLines={1}>
          {item.hostel.hostelName}
        </AppText>
        {/* FIXED: Added "student." prefix to status lookup */}
        <Badge
          label={t(`student.reservations.status.${item.status.toLowerCase()}`)}
          variant={getStatusVariant(item.status)}
          size="sm"
        />
      </View>

      {/* Details */}
      <AppText style={styles.details}>
        {item.hostel.city} • {item.roomType.replace("_", " ")}
      </AppText>

      {/* FIXED: Added "student." prefix */}
      <AppText style={styles.date}>
        {t("student.reservations.requested_on")} {formatDate(item.createdAt)}
      </AppText>

      {/* Rejection Reason */}
      {item.rejectReason && (
        <View style={styles.rejectBox}>
          {/* FIXED: Added "student." prefix */}
          <AppText style={styles.rejectLabel}>
            {t("student.reservations.rejection_label")}
          </AppText>
          <AppText style={styles.rejectText}>{item.rejectReason}</AppText>
        </View>
      )}

      {/* Cancel Button */}
      {item.status === "PENDING" && (
        <Pressable
          style={({ pressed }) => [
            styles.cancelButton,
            pressed && { opacity: OPACITY.pressed },
          ]}
          onPress={() => handleCancel(item.id)}
        >
          <X size={16} color={COLORS.error} strokeWidth={1.5} />
          {/* FIXED: Added "student." prefix */}
          <AppText style={styles.cancelText}>
            {t("student.reservations.cancel_button")}
          </AppText>
        </Pressable>
      )}

      {/* Proceed to Booking */}
      {item.status === "ACCEPTED" && (
        <View style={styles.actionButton}>
          {/* FIXED: Added "student." prefix */}
          <Button
            title={t("student.reservations.proceed_button")}
            onPress={() =>
              router.push(
                `/(app)/student/book/${item.hostel.id}?roomType=${item.roomType}&reservationId=${item.id}`
              )
            }
            size="md"
          />
        </View>
      )}
    </View>
  );

  if (loading) return <LoadingScreen />;

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

        {/* FIXED: Added "student." prefix */}
        <AppText style={styles.headerTitle}>{t("student.reservations.header_title")}</AppText>

        <View style={styles.headerSpacer} />
      </View>

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
            // FIXED: Added "student." prefix to empty state
            title={t("student.reservations.empty_title")}
            description={t("student.reservations.empty_description")}
            action={
              <Button
                title={t("student.reservations.empty_action")}
                onPress={() => router.push("/(app)/student/search")}
                size="md"
              />
            }
          />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

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
    alignItems: "center",
    marginBottom: 8,
  },
  hostelName: {
    fontSize: 17,
    fontWeight: "600",
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 12,
    letterSpacing: -0.2,
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

  // Rejection Box
  rejectBox: {
    marginTop: 14,
    padding: 14,
    backgroundColor: COLORS.errorLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.errorMuted,
  },
  rejectLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.error,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  rejectText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  // Cancel Button
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    gap: 8,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.error,
  },

  // Action Button
  actionButton: {
    marginTop: 16,
  },
});