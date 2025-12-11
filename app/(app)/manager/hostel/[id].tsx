import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Check,
  Clock,
  Droplets,
  Edit,
  FileText,
  MapPin,
  Star,
  Trash2,
  Users,
  Wifi,
  Zap,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import { hostelsApi } from "@/api/hostels";
import AppText from "@/components/common/AppText";
import { Badge, Button, Card, LoadingScreen } from "@/components/ui";
import { COLORS } from "@/constants/colors";

import { Hostel } from "@/types";

const { width } = Dimensions.get("window");

export default function ManagerHostelDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hostel, setHostel] = useState<Hostel | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  const fetchHostel = async () => {
    try {
      const response = await hostelsApi.getById(id);
      if (response.success) {
        setHostel(response.data);
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: t("manager.hostel_detail.fetch_error_title"),
        text2:
          error?.response?.data?.message ||
          t("manager.hostel_detail.fetch_error_message"),
      });
      handleGoBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostel();
  }, [id]);

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(app)/manager/hostels");
    }
  };

  const handleDelete = () => {
    Alert.alert(
      t("manager.hostel_detail.delete_alert_title"),
      t("manager.hostel_detail.delete_alert_message"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("manager.hostel_detail.delete_button"),
          style: "destructive",
          onPress: async () => {
            try {
              setDeleting(true);
              await hostelsApi.deleteHostel(id);
              Toast.show({
                type: "success",
                text1: t("manager.hostel_detail.delete_success_title"),
                text2: t("manager.hostel_detail.delete_success_message"),
              });
              router.replace("/(app)/manager/hostels");
            } catch (error: any) {
              Toast.show({
                type: "error",
                text1: t("manager.hostel_detail.delete_error_title"),
                text2:
                  error?.response?.data?.message ||
                  t("manager.hostel_detail.delete_error_message"),
              });
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!hostel) {
    return null;
  }

  const facilities = hostel.facilities;

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          {hostel.roomImages && hostel.roomImages.length > 0 ? (
            <>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={(e) => {
                  const index = Math.round(
                    e.nativeEvent.contentOffset.x / width
                  );
                  setActiveImageIndex(index);
                }}
                scrollEventThrottle={16}
              >
                {hostel.roomImages.map((image, index) => (
                  <Image
                    key={`image-${index}`}
                    source={{ uri: image }}
                    style={styles.image}
                  />
                ))}
              </ScrollView>

              <View style={styles.indicators}>
                {hostel.roomImages.map((_, index) => (
                  <View
                    key={`indicator-${index}`}
                    style={[
                      styles.indicator,
                      activeImageIndex === index && styles.indicatorActive,
                    ]}
                  />
                ))}
              </View>
            </>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Building2 size={60} color={COLORS.textMuted} />
              <AppText style={styles.placeholderText}>
                {t("manager.hostel_detail.no_images")}
              </AppText>
            </View>
          )}

          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>

          {/* Status Badge */}
          <View style={styles.statusBadge}>
            <Badge
              label={
                hostel.isActive
                  ? t("manager.hostel_detail.status.active")
                  : t("manager.hostel_detail.status.inactive")
              }
              variant={hostel.isActive ? "success" : "error"}
            />
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <AppText style={styles.hostelName}>{hostel.hostelName}</AppText>
            <View style={styles.locationRow}>
              <MapPin size={16} color={COLORS.textMuted} />
              <AppText style={styles.locationText}>
                {hostel.city}, {hostel.address}
              </AppText>
            </View>
          </View>

          {/* Rating & Stats */}
          <Card style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Star size={18} color={COLORS.warning} fill={COLORS.warning} />
                <AppText style={styles.statText}>
                  {hostel.rating > 0
                    ? hostel.rating.toFixed(1)
                    : t("manager.hostel_detail.rating_na")}
                </AppText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Users size={18} color={COLORS.info} />
                <AppText style={styles.statText}>
                  {t("manager.hostel_detail.reviews_count", {
                    count: hostel.reviewCount,
                  })}
                </AppText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <AppText style={styles.statText}>{hostel.hostelFor}</AppText>
              </View>
            </View>
          </Card>

          {/* Quick Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push(`/(app)/manager/students/${id}`)}
            >
              <Users size={20} color={COLORS.primary} />
              <AppText style={styles.actionText}>
                {t("manager.hostel_detail.action_students")}
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                router.push(`/(app)/manager/reservations?hostelId=${id}`)
              }
            >
              <Calendar size={20} color={COLORS.warning} />
              <AppText style={styles.actionText}>
                {t("manager.hostel_detail.action_reservations")}
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                router.push(`/(app)/manager/bookings?hostelId=${id}`)
              }
            >
              <FileText size={20} color={COLORS.success} />
              <AppText style={styles.actionText}>
                {t("manager.hostel_detail.action_bookings")}
              </AppText>
            </TouchableOpacity>
          </View>

          {/* Room Types */}
          <AppText style={styles.sectionTitle}>
            {t("manager.hostel_detail.section_room_types")}
          </AppText>
          {hostel.roomTypes?.map((roomType, index) => (
            <Card
              key={roomType.id || `room-${index}`}
              style={styles.roomTypeCard}
            >
              <View style={styles.roomTypeHeader}>
                <AppText style={styles.roomTypeName}>
                  {roomType.type.replace("_", " ")}
                </AppText>
                <AppText style={styles.roomTypePrice}>
                  {t("manager.hostel_detail.price_format", {
                    price: roomType.price.toLocaleString(),
                  })}
                </AppText>
              </View>

              <View style={styles.roomTypeDetails}>
                <AppText style={styles.roomTypeDetail}>
                  {t("manager.hostel_detail.persons_per_room", {
                    count: roomType.personsInRoom,
                  })}
                </AppText>
                <AppText style={styles.roomTypeDetail}>
                  {t("manager.hostel_detail.rooms_info", {
                    total: roomType.totalRooms,
                    available: roomType.availableRooms,
                  })}
                </AppText>
              </View>

              {/* Urgent Booking Price */}
              {roomType.urgentBookingPrice &&
                roomType.urgentBookingPrice > 0 && (
                  <View style={styles.urgentBookingContainer}>
                    <View style={styles.urgentBookingBadge}>
                      <Clock size={14} color={COLORS.warning} />
                      <AppText style={styles.urgentBookingLabel}>
                        {t("manager.hostel_detail.urgent_booking")}
                      </AppText>
                    </View>
                    <AppText style={styles.urgentBookingPrice}>
                      {t("manager.hostel_detail.price_only", {
                        price: roomType.urgentBookingPrice.toLocaleString(),
                      })}
                    </AppText>
                  </View>
                )}

              {/* Full Room Discounted Price for SHARED_FULLROOM */}
              {roomType.type === "SHARED_FULLROOM" &&
                roomType.fullRoomPriceDiscounted && (
                  <View style={styles.fullRoomDiscountContainer}>
                    <AppText style={styles.fullRoomDiscountLabel}>
                      {t("manager.hostel_detail.full_room_discount_label")}
                    </AppText>
                    <AppText style={styles.fullRoomDiscountPrice}>
                      {t("manager.hostel_detail.price_format", {
                        price:
                          roomType.fullRoomPriceDiscounted.toLocaleString(),
                      })}
                    </AppText>
                  </View>
                )}
            </Card>
          ))}

          {/* Facilities */}
          <AppText style={styles.sectionTitle}>
            {t("manager.hostel_detail.section_facilities")}
          </AppText>
          <Card style={styles.facilitiesCard}>
            <View style={styles.facilitiesGrid}>
              {facilities?.hotColdWaterBath && (
                <View style={styles.facilityItem}>
                  <Droplets size={20} color={COLORS.info} />
                  <AppText style={styles.facilityText}>
                    {t("manager.hostel_detail.facility_hot_cold_water")}
                  </AppText>
                </View>
              )}
              {facilities?.drinkingWater && (
                <View style={styles.facilityItem}>
                  <Droplets size={20} color={COLORS.info} />
                  <AppText style={styles.facilityText}>
                    {t("manager.hostel_detail.facility_drinking_water")}
                  </AppText>
                </View>
              )}
              {facilities?.electricityBackup && (
                <View style={styles.facilityItem}>
                  <Zap size={20} color={COLORS.warning} />
                  <AppText style={styles.facilityText}>
                    {t("manager.hostel_detail.facility_electricity_backup")}
                  </AppText>
                </View>
              )}
              {facilities?.wifiEnabled && (
                <View style={styles.facilityItem}>
                  <Wifi size={20} color={COLORS.success} />
                  <AppText style={styles.facilityText}>
                    {t("manager.hostel_detail.facility_wifi")}
                  </AppText>
                </View>
              )}
            </View>

            {facilities?.customFacilities &&
              facilities.customFacilities.length > 0 && (
                <View style={styles.customFacilities}>
                  {facilities.customFacilities.map((facility, index) => (
                    <View
                      key={`facility-${index}`}
                      style={styles.customFacilityItem}
                    >
                      <Check size={16} color={COLORS.success} />
                      <AppText style={styles.customFacilityText}>{facility}</AppText>
                    </View>
                  ))}
                </View>
              )}
          </Card>

          {/* Rules */}
          {hostel.rules && (
            <>
              <AppText style={styles.sectionTitle}>
                {t("manager.hostel_detail.section_rules")}
              </AppText>
              <Card style={styles.rulesCard}>
                <AppText style={styles.rulesText}>{hostel.rules}</AppText>
              </Card>
            </>
          )}

          {/* Nearby Locations */}
          {hostel.nearbyLocations && hostel.nearbyLocations.length > 0 && (
            <>
              <AppText style={styles.sectionTitle}>
                {t("manager.hostel_detail.section_nearby_locations")}
              </AppText>
              <View style={styles.tagsContainer}>
                {hostel.nearbyLocations.map((location, index) => (
                  <View key={`location-${index}`} style={styles.tag}>
                    <AppText style={styles.tagText}>{location}</AppText>
                  </View>
                ))}
              </View>
            </>
          )}

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          disabled={deleting}
        >
          <Trash2 size={22} color={COLORS.error} />
        </TouchableOpacity>

        <Button
          title={t("manager.hostel_detail.edit_button")}
          onPress={() => router.push(`/(app)/manager/hostel/edit/${id}`)}
          style={styles.editButton}
          icon={<Edit size={20} color={COLORS.textInverse} />}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },

  imageContainer: {
    position: "relative",
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    overflow: "hidden",
  },
  image: {
    width,
    height: 280,
    resizeMode: "cover",
  },
  imagePlaceholder: {
    width,
    height: 280,
    backgroundColor: COLORS.bgSecondary,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  placeholderText: {
    color: COLORS.textMuted,
    fontSize: 16,
  },
  indicators: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  indicatorActive: {
    backgroundColor: COLORS.textInverse,
    width: 22,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.bgSecondary,
    justifyContent: "center",
    alignItems: "center",
  },
  statusBadge: {
    position: "absolute",
    top: 50,
    right: 20,
  },

  content: {
    padding: 24,
  },
  header: {
    marginBottom: 16,
  },
  hostelName: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.textMuted,
    flex: 1,
  },

  statsCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  statText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.border,
  },

  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 12,
    marginTop: 8,
  },

  roomTypeCard: {
    marginBottom: 12,
    borderRadius: 16,
  },
  roomTypeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  roomTypeName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    textTransform: "capitalize",
  },
  roomTypePrice: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primary,
  },
  roomTypeDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  roomTypeDetail: {
    fontSize: 13,
    color: COLORS.textMuted,
  },

  // Urgent Booking Styles
  urgentBookingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  urgentBookingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.warning + "15",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  urgentBookingLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.warning,
  },
  urgentBookingPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.warning,
  },

  // Full Room Discount Styles
  fullRoomDiscountContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  fullRoomDiscountLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  fullRoomDiscountPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.success,
  },

  facilitiesCard: {
    marginBottom: 16,
    borderRadius: 16,
  },
  facilitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  facilityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "45%",
  },
  facilityText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  customFacilities: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 10,
  },
  customFacilityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  customFacilityText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  rulesCard: {
    marginBottom: 16,
    borderRadius: 16,
  },
  rulesText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },

  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: COLORS.bgSecondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 32,
    backgroundColor: COLORS.bgPrimary,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },
  deleteButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.error + "20",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  editButton: {
    flex: 1,
    height: 56,
  },
});
