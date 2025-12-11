// app/(app)/student/reserve/[id].tsx

import { COLORS, OPACITY } from "@/constants/colors";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Check } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
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

import { hostelsApi } from "@/api/hostels";
import { reservationsApi } from "@/api/reservations";
import AppText from "@/components/common/AppText";
import { Button, LoadingScreen } from "@/components/ui";
import { Hostel } from "@/types";

export default function ReserveScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hostel, setHostel] = useState<Hostel | null>(null);
  const [selectedRoomType, setSelectedRoomType] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const fetchHostel = async () => {
    try {
      const response = await hostelsApi.getById(id);
      if (response.success) {
        setHostel(response.data);
        if (response.data.roomTypes?.length > 0) {
          setSelectedRoomType(response.data.roomTypes[0].type);
        }
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: t("student.reserve.error_title"),
        text2:
          error?.response?.data?.message ||
          t("student.reserve.error_fetch_hostel"),
      });
      router.back();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostel();
  }, [id]);

  const handleSubmit = async () => {
    if (!selectedRoomType) {
      Toast.show({
        type: "error",
        text1: t("student.reserve.error_title"),
        text2: t("student.reserve.error_select_room"),
      });
      return;
    }

    try {
      setSubmitting(true);
      const response = await reservationsApi.create({
        hostelId: id,
        roomType: selectedRoomType,
        message: message.trim() || undefined,
      });

      if (response.success) {
        Toast.show({
          type: "success",
          text1: t("student.reserve.success_title"),
          text2: t("student.reserve.success_message"),
        });
        router.back();
        router.push("/(app)/student/reservations");
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: t("student.reserve.error_title"),
        text2:
          error?.response?.data?.message ||
          t("student.reserve.error_create_reservation"),
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!hostel) {
    return null;
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
        <AppText style={styles.headerTitle}>{t("student.reserve.title")}</AppText>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {/* Hostel Info */}
          <View style={styles.hostelCard}>
            <AppText style={styles.hostelName}>{hostel.hostelName}</AppText>
            <AppText style={styles.hostelLocation}>
              {hostel.city}, {hostel.address}
            </AppText>
          </View>

          {/* Info Note */}
          <View style={styles.infoNote}>
            <AppText style={styles.infoNoteText}>
              {t("student.reserve.info_note")}
            </AppText>
          </View>

          {/* Room Type Selection */}
          <AppText style={styles.sectionTitle}>
            {t("student.reserve.select_room_type")}
          </AppText>

          {hostel.roomTypes?.map((roomType, index) => {
            const isSelected = selectedRoomType === roomType.type;

            return (
              <Pressable
                key={roomType.id ?? `${roomType.type}-${index}`}
                style={({ pressed }) => [
                  styles.roomTypeCard,
                  isSelected && styles.roomTypeCardSelected,
                  pressed && { opacity: OPACITY.pressed },
                ]}
                onPress={() => setSelectedRoomType(roomType.type)}
              >
                <View style={styles.roomTypeContent}>
                  <View style={styles.roomTypeLeft}>
                    <AppText
                      style={[
                        styles.roomTypeName,
                        isSelected && styles.roomTypeNameSelected,
                      ]}
                    >
                      {roomType.type.replace("_", " ")}
                    </AppText>

                    <AppText style={styles.roomTypeDetail}>
                      {roomType.personsInRoom} {t("student.reserve.persons")} •{" "}
                      {roomType.availableRooms} {t("student.reserve.available")}
                    </AppText>
                  </View>

                  <View style={styles.roomTypeRight}>
                    <AppText
                      style={[
                        styles.roomTypePrice,
                        isSelected && styles.roomTypePriceSelected,
                      ]}
                    >
                      Rs. {roomType.price.toLocaleString()}
                    </AppText>
                    <AppText style={styles.roomTypePriceLabel}>
                      {t("student.reserve.per_month")}
                    </AppText>
                  </View>
                </View>

                {/* Check Icon */}
                {isSelected && (
                  <View style={styles.checkIcon}>
                    <Check
                      size={14}
                      color={COLORS.textInverse}
                      strokeWidth={2.5}
                    />
                  </View>
                )}
              </Pressable>
            );
          })}

          {/* Message */}
          <AppText style={styles.sectionTitle}>
            {t("student.reserve.message_title")}
          </AppText>
          <AppText style={styles.sectionSubtitle}>
            {t("student.reserve.message_subtitle")}
          </AppText>

          <TextInput
            style={styles.messageInput}
            placeholder={t("student.reserve.message_placeholder")}
            placeholderTextColor={COLORS.inputPlaceholder}
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            selectionColor={COLORS.primary}
          />

          <View style={{ height: 120 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Action */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomContent}>
          {selectedRoomType && (
            <View style={styles.selectedInfo}>
              <AppText style={styles.selectedLabel}>
                {t("student.reserve.selected")}:
              </AppText>
              <AppText style={styles.selectedValue}>
                {selectedRoomType.replace("_", " ")}
              </AppText>
            </View>
          )}
          <Button
            title={t("student.reserve.send_request")}
            onPress={handleSubmit}
            loading={submitting}
          />
        </View>
      </View>
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

  // Content
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },

  // Hostel Card
  hostelCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  hostelName: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  hostelLocation: {
    fontSize: 14,
    color: COLORS.textMuted,
  },

  // Info Note
  infoNote: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 28,
  },
  infoNoteText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  // Section
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 14,
  },

  // Room Type Card
  roomTypeCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 18,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    position: "relative",
  },
  roomTypeCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  roomTypeContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  roomTypeLeft: {
    flex: 1,
    marginRight: 16,
  },
  roomTypeName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    textTransform: "capitalize",
    marginBottom: 4,
  },
  roomTypeNameSelected: {
    color: COLORS.primaryDark,
  },
  roomTypeDetail: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  roomTypeRight: {
    alignItems: "flex-end",
  },
  roomTypePrice: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  roomTypePriceSelected: {
    color: COLORS.primary,
  },
  roomTypePriceLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  checkIcon: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    // Subtle shadow
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },

  // Message Input
  messageInput: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    color: COLORS.textPrimary,
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
    minHeight: 120,
    lineHeight: 22,
  },

  // Bottom Bar
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.bgPrimary,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  bottomContent: {
    gap: 14,
  },
  selectedInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  selectedLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  selectedValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
    textTransform: "capitalize",
  },
});
