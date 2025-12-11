// screens/BookingsScreen.tsx

import { COLORS, OPACITY } from "@/constants/colors";
import { useRouter } from "expo-router";
import { ArrowLeft, ChevronRight, Home } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import { bookingsApi } from "@/api/bookings";
import AppText from "@/components/common/AppText";
import { Badge, Button, EmptyState, LoadingScreen } from "@/components/ui";
import { Booking } from "@/types";


export default function BookingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const fetchBookings = async () => {
    try {
      const response = await bookingsApi.getMyBookings();
      if (response.success) {
        setBookings(response.data);
      }
    } catch (error: any) {
      // FIXED: Added "student." prefix
      Toast.show({
        type: "error",
        text1: t("student.bookings.toast_error_title"),
        text2:
          error?.response?.data?.message || t("student.bookings.toast_error_message"),
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "success";
      case "DISAPPROVED":
        return "error";
      case "PENDING":
        return "warning";
      case "LEFT":
      case "KICKED":
        return "default";
      default:
        return "default";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderBooking = ({ item }: { item: Booking }) => (
    <Pressable
      style={({ pressed }) => [
        styles.bookingCard,
        pressed && { opacity: OPACITY.pressed },
      ]}
      onPress={() => router.push(`/(app)/student/booking/${item.id}`)}
    >
      {/* Image */}
      {item.hostel.roomImages?.[0] ? (
        <Image
          source={{ uri: item.hostel.roomImages[0] }}
          style={styles.bookingImage}
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Home size={24} color={COLORS.textMuted} strokeWidth={1.5} />
        </View>
      )}

      {/* Content */}
      <View style={styles.bookingContent}>
        <View style={styles.bookingHeader}>
          <AppText style={styles.hostelName} numberOfLines={1}>
            {item.hostel.hostelName}
          </AppText>

          {/* FIXED: Added "student." prefix */}
          <Badge
            label={t(`student.bookings.status.${item.status.toLowerCase()}`)}
            variant={getStatusVariant(item.status)}
            size="sm"
          />
        </View>

        <AppText style={styles.details}>
          {item.hostel.city} • {item.roomType.replace("_", " ")}
        </AppText>

        {/* FIXED: Added "student." prefix */}
        <AppText style={styles.date}>
          {t("student.bookings.booked_on")} {formatDate(item.createdAt)}
        </AppText>
      </View>

      <ChevronRight size={20} color={COLORS.textMuted} strokeWidth={1.5} />
    </Pressable>
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
        <AppText style={styles.headerTitle}>{t("student.bookings.header_title")}</AppText>

        <View style={styles.headerSpacer} />
      </View>

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
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon={<Home size={48} color={COLORS.textMuted} strokeWidth={1.5} />}
            // FIXED: Added "student." prefix
            title={t("student.bookings.empty_title")}
            description={t("student.bookings.empty_description")}
            action={
              <Button
                title={t("student.bookings.empty_action")}
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

  // Booking Card
  bookingCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  bookingImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
  },
  imagePlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: COLORS.bgSecondary,
    justifyContent: "center",
    alignItems: "center",
  },
  bookingContent: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },
  bookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  hostelName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 10,
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
});