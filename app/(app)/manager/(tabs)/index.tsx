// app/(app)/manager/index.tsx

import { COLORS, OPACITY } from "@/constants/colors";
import { useRouter } from "expo-router";
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  Cog,
  MessageCircle,
  Users,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import { bookingsApi } from "@/api/bookings";
import { hostelsApi } from "@/api/hostels";
import { Verification, verificationApi } from "@/api/verification";
import AppText from "@/components/common/AppText";
import { Badge, LoadingScreen } from "@/components/ui";
import { useAuthStore } from "@/stores/authStore";
import { Booking, Hostel } from "@/types";


export default function ManagerDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [verification, setVerification] = useState<Verification | null>(null);

  const fetchData = async () => {
    try {
      const [hostelsRes, verificationRes, bookingsRes] = await Promise.all([
        hostelsApi.getMyHostels(),
        verificationApi.getMyVerifications(),
        bookingsApi.getManagerBookings(),
      ]);

      if (hostelsRes.success) setHostels(hostelsRes.data);
      if (bookingsRes.success) setBookings(bookingsRes.data);
      if (verificationRes.success && verificationRes.data.length > 0) {
        setVerification(verificationRes.data[0]);
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.response?.data?.message || "Failed to fetch data",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const isVerified = verification?.status === "APPROVED";
  const isPending = verification?.status === "PENDING";
  const totalStudents = bookings.filter((b) => b.status === "APPROVED").length;
  const pendingBookings = bookings.filter((b) => b.status === "PENDING").length;

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <AppText style={styles.greeting}>Welcome back,</AppText>
            <AppText style={styles.name}>
              {user?.email?.split("@")[0] || "Manager"} 👋
            </AppText>
          </View>
          {/* Settings Button */}
          <Pressable
            onPress={() => router.push("/(app)/settings")}
            style={({ pressed }) => [
              styles.settingsButton,
              pressed && { opacity: OPACITY.pressed },
            ]}
          >
            <Cog size={24} color={COLORS.textSecondary} strokeWidth={1.5} />
          </Pressable>
        </View>

        {/* Verification Status */}
        {!isVerified && (
          <View style={styles.verificationCard}>
            <View style={styles.verificationHeader}>
              <View
                style={[
                  styles.verificationIcon,
                  {
                    backgroundColor: isPending
                      ? COLORS.warningLight
                      : COLORS.errorLight,
                  },
                ]}
              >
                {isPending ? (
                  <Clock size={22} color={COLORS.warning} strokeWidth={1.5} />
                ) : (
                  <AlertCircle
                    size={22}
                    color={COLORS.error}
                    strokeWidth={1.5}
                  />
                )}
              </View>
              <View style={styles.verificationText}>
                <AppText style={styles.verificationTitle}>
                  {isPending ? "Verification Pending" : "Verification Required"}
                </AppText>
                <AppText style={styles.verificationDesc}>
                  {isPending
                    ? "Your verification is under review"
                    : "Complete verification to add hostels"}
                </AppText>
              </View>
            </View>

            {!isPending && (
              <Pressable
                style={({ pressed }) => [
                  styles.verificationButton,
                  pressed && { opacity: OPACITY.pressed },
                ]}
                onPress={() => router.push("/(app)/manager/verification")}
              >
                <AppText style={styles.verificationButtonText}>
                  Start Verification
                </AppText>
                <ChevronRight
                  size={18}
                  color={COLORS.primary}
                  strokeWidth={2}
                />
              </Pressable>
            )}
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                { backgroundColor: COLORS.primaryLight },
              ]}
            >
              <Building2 size={22} color={COLORS.primary} strokeWidth={1.5} />
            </View>
            <AppText style={styles.statNumber}>{hostels.length}</AppText>
            <AppText style={styles.statLabel}>Hostels</AppText>
          </View>

          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                { backgroundColor: COLORS.successLight },
              ]}
            >
              <Users size={22} color={COLORS.success} strokeWidth={1.5} />
            </View>
            <AppText style={styles.statNumber}>{totalStudents}</AppText>
            <AppText style={styles.statLabel}>Students</AppText>
          </View>

          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                { backgroundColor: COLORS.warningLight },
              ]}
            >
              <Clock size={22} color={COLORS.warning} strokeWidth={1.5} />
            </View>
            <AppText style={styles.statNumber}>{pendingBookings}</AppText>
            <AppText style={styles.statLabel}>Pending</AppText>
          </View>
        </View>

        {/* Quick Actions */}
        <AppText style={styles.sectionTitle}>Quick Actions</AppText>
        <View style={styles.actionsGrid}>
          <ActionCard
            icon={
              <Building2 size={24} color={COLORS.primary} strokeWidth={1.5} />
            }
            label="My Hostels"
            color={COLORS.primaryLight}
            onPress={() => router.push("/(app)/manager/hostels")}
          />
          <ActionCard
            icon={
              <Calendar size={24} color={COLORS.warning} strokeWidth={1.5} />
            }
            label="Reservations"
            color={COLORS.warningLight}
            onPress={() => router.push("/(app)/manager/reservations")}
          />
          <ActionCard
            icon={
              <CheckCircle size={24} color={COLORS.success} strokeWidth={1.5} />
            }
            label="Bookings"
            color={COLORS.successLight}
            badge={pendingBookings > 0 ? pendingBookings : undefined}
            onPress={() => router.push("/(app)/manager/bookings")}
          />
          <ActionCard
            icon={
              <MessageCircle size={24} color={COLORS.info} strokeWidth={1.5} />
            }
            label="Messages"
            color={COLORS.infoLight}
            onPress={() => router.push("/(app)/manager/chat")}
          />
        </View>

        {/* Recent Hostels */}
        {hostels.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <AppText style={styles.sectionTitle}>Your Hostels</AppText>
              <Pressable
                onPress={() => router.push("/(app)/manager/hostels")}
                style={({ pressed }) => pressed && { opacity: OPACITY.pressed }}
              >
                <AppText style={styles.seeAll}>See all</AppText>
              </Pressable>
            </View>

            {hostels.slice(0, 2).map((h) => (
              <Pressable
                key={h.id}
                style={({ pressed }) => [
                  styles.hostelCard,
                  pressed && { opacity: OPACITY.pressed },
                ]}
                onPress={() => router.push(`/(app)/manager/hostel/${h.id}`)}
              >
                <View style={styles.hostelHeader}>
                  <AppText style={styles.hostelName} numberOfLines={1}>
                    {h.hostelName}
                  </AppText>
                  <Badge
                    label={h.isActive ? "ACTIVE" : "INACTIVE"}
                    variant={h.isActive ? "success" : "error"}
                    size="sm"
                  />
                </View>
                <AppText style={styles.hostelLocation}>
                  {h.city}, {h.address}
                </AppText>
                <View style={styles.hostelStats}>
                  <AppText style={styles.hostelStat}>
                    {h.roomTypes?.length || 0} room types
                  </AppText>
                  <AppText style={styles.hostelDot}>•</AppText>
                  <AppText style={styles.hostelStat}>{h.hostelFor}</AppText>
                </View>
              </Pressable>
            ))}
          </>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Action Card Component
interface ActionCardProps {
  icon: React.ReactNode;
  label: string;
  color: string;
  badge?: number;
  onPress: () => void;
}

const ActionCard: React.FC<ActionCardProps> = ({
  icon,
  label,
  color,
  badge,
  onPress,
}) => (
  <Pressable
    style={({ pressed }) => [
      styles.actionCard,
      pressed && { opacity: OPACITY.pressed },
    ]}
    onPress={onPress}
  >
    <View style={[styles.actionIcon, { backgroundColor: color }]}>{icon}</View>
    <AppText style={styles.actionText}>{label}</AppText>

    {badge !== undefined && badge > 0 && (
      <View style={styles.actionBadge}>
        <AppText style={styles.actionBadgeText}>{badge}</AppText>
      </View>
    )}
  </Pressable>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  scrollContent: {
    paddingBottom: 24,
  },

  // Header
  header: {
    flexDirection: "row", // Changed to row
    justifyContent: "space-between", // Pushes content to ends
    alignItems: "center", // Vertically aligns items
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerLeft: {
    // No specific styles needed here for now, as greeting and name are in a View
  },
  greeting: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  name: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  settingsButton: {
    padding: 8, // Add some padding for easier tapping
    borderRadius: 12, // Make it circular
    backgroundColor: COLORS.bgSecondary, // Optional: add a subtle background
  },

  // Verification
  verificationCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  verificationHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  verificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  verificationText: {
    flex: 1,
  },
  verificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  verificationDesc: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  verificationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    gap: 4,
  },
  verificationButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.primary,
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },

  // Section
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
    paddingHorizontal: 24,
    marginBottom: 14,
    letterSpacing: -0.2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 14,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },

  // Actions Grid
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 28,
  },
  actionCard: {
    width: "47%",
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    position: "relative",
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
    letterSpacing: -0.1,
  },
  actionBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: COLORS.error,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  actionBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textInverse,
  },

  // Hostel Card
  hostelCard: {
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  hostelHeader: {
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
    marginRight: 12,
    letterSpacing: -0.1,
  },
  hostelLocation: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  hostelStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  hostelStat: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  hostelDot: {
    color: COLORS.textMuted,
  },
});
