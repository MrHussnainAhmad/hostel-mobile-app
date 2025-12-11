import { COLORS, OPACITY } from "@/constants/colors";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Calendar,
  Camera,
  Check,
  Clock,
  CreditCard,
  X,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import { bookingsApi } from "@/api/bookings";
import { hostelsApi } from "@/api/hostels";
import AppText from "@/components/common/AppText";
import { Button, Input, LoadingScreen } from "@/components/ui";
import { Hostel } from "@/types";


export default function BookHostelScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const {
    id,
    roomType: preselectedRoomType,
    reservationId,
  } = useLocalSearchParams<{
    id: string;
    roomType?: string;
    reservationId?: string;
  }>();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hostel, setHostel] = useState<Hostel | null>(null);

  // Form state
  const [selectedRoomType, setSelectedRoomType] = useState<string>(
    preselectedRoomType || ""
  );
  const [transactionImage, setTransactionImage] = useState<string | null>(null);
  const [transactionDate, setTransactionDate] = useState("");
  const [transactionTime, setTransactionTime] = useState("");
  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");

  useEffect(() => {
    fetchHostel();
  }, [id]);

  const fetchHostel = async () => {
    try {
      const response = await hostelsApi.getById(id);
      if (response.success) {
        setHostel(response.data);

        if (!selectedRoomType && response.data.roomTypes?.length > 0) {
          setSelectedRoomType(
            preselectedRoomType || response.data.roomTypes[0].type
          );
        }
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: t("student.book.error_title"),
        text2:
          error?.response?.data?.message ||
          t("student.book.error_fetch_hostel"),
      });
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setTransactionImage(result.assets[0].uri);
    }
  };

  const validate = () => {
    if (!selectedRoomType) {
      Toast.show({
        type: "error",
        text1: t("student.book.error_title"),
        text2: t("student.book.error_select_room"),
      });
      return false;
    }
    if (!transactionImage) {
      Toast.show({
        type: "error",
        text1: t("student.book.error_title"),
        text2: t("student.book.error_upload_screenshot"),
      });
      return false;
    }
    if (!transactionDate.trim()) {
      Toast.show({
        type: "error",
        text1: t("student.book.error_title"),
        text2: t("student.book.error_enter_date"),
      });
      return false;
    }
    if (!transactionTime.trim()) {
      Toast.show({
        type: "error",
        text1: t("student.book.error_title"),
        text2: t("student.book.error_enter_time"),
      });
      return false;
    }
    if (!fromAccount.trim()) {
      Toast.show({
        type: "error",
        text1: t("student.book.error_title"),
        text2: t("student.book.error_enter_from_account"),
      });
      return false;
    }
    if (!toAccount.trim()) {
      Toast.show({
        type: "error",
        text1: t("student.book.error_title"),
        text2: t("student.book.error_enter_to_account"),
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("hostelId", id);
      formData.append("roomType", selectedRoomType);
      formData.append("transactionDate", transactionDate.trim());
      formData.append("transactionTime", transactionTime.trim());
      formData.append("fromAccount", fromAccount.trim());
      formData.append("toAccount", toAccount.trim());

      if (reservationId) {
        formData.append("reservationId", reservationId);
      }

      if (transactionImage) {
        const filename = transactionImage.split("/").pop() || "payment.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";

        formData.append("transactionImage", {
          uri: transactionImage,
          name: filename,
          type,
        } as any);
      }

      const response = await bookingsApi.create(formData);

      if (response.success) {
        Toast.show({
          type: "success",
          text1: t("student.book.success_title"),
          text2: t("student.book.success_message"),
        });
        router.back();
        router.push("/(app)/student/bookings");
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: t("student.book.error_title"),
        text2:
          error?.response?.data?.message ||
          t("student.book.error_failed_submit"),
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

  const selectedRoom = hostel.roomTypes?.find(
    (rt) => rt.type === selectedRoomType
  );

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

        <AppText style={styles.headerTitle}>{t("student.book.title")}</AppText>

        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {/* Hostel Info */}
          <View style={styles.hostelCard}>
            <AppText style={styles.hostelName}>{hostel.hostelName}</AppText>
            <AppText style={styles.hostelLocation}>
              {hostel.city}, {hostel.address}
            </AppText>
          </View>

          {/* Room Type Selection */}
          <AppText style={styles.sectionTitle}>
            {t("student.book.select_room_type")}
          </AppText>

          {hostel.roomTypes?.map((roomType, index) => (
            <Pressable
              key={roomType.id ?? `${roomType.type}-${index}`}
              style={({ pressed }) => [
                styles.roomTypeCard,
                selectedRoomType === roomType.type &&
                  styles.roomTypeCardSelected,
                pressed && { opacity: OPACITY.pressed },
              ]}
              onPress={() => setSelectedRoomType(roomType.type)}
            >
              <View style={styles.roomTypeContent}>
                <View>
                  <AppText style={styles.roomTypeName}>
                    {roomType.type.replace("_", " ")}
                  </AppText>
                  <AppText style={styles.roomTypeDetail}>
                    {roomType.personsInRoom} {t("student.book.persons")} •{" "}
                    {roomType.availableRooms} {t("student.book.available")}
                  </AppText>
                </View>
                <View style={styles.roomTypeRight}>
                  <AppText style={styles.roomTypePrice}>
                    Rs. {roomType.price.toLocaleString()}
                  </AppText>
                  <AppText style={styles.roomTypePriceLabel}>
                    {t("student.book.per_month")}
                  </AppText>
                </View>
              </View>

              {selectedRoomType === roomType.type && (
                <View style={styles.checkIcon}>
                  <Check size={16} color={COLORS.textInverse} strokeWidth={2} />
                </View>
              )}
            </Pressable>
          ))}

          {/* Payment Amount */}
          {selectedRoom && (
            <View style={styles.paymentCard}>
              <AppText style={styles.paymentLabel}>
                {t("student.book.amount_to_pay")}
              </AppText>
              <AppText style={styles.paymentAmount}>
                Rs. {selectedRoom.price.toLocaleString()}
              </AppText>
              <AppText style={styles.paymentNote}>
                {t("student.book.transfer_note")}
              </AppText>
            </View>
          )}

          {/* Payment Screenshot */}
          <AppText style={styles.sectionTitle}>
            {t("student.book.payment_proof")}
          </AppText>

          {transactionImage ? (
            <View style={styles.imagePreview}>
              <Image
                source={{ uri: transactionImage }}
                style={styles.previewImage}
              />
              <Pressable
                style={({ pressed }) => [
                  styles.removeImageBtn,
                  pressed && { opacity: OPACITY.pressed },
                ]}
                onPress={() => setTransactionImage(null)}
              >
                <X size={18} color={COLORS.textInverse} strokeWidth={2} />
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={({ pressed }) => [
                styles.uploadButton,
                pressed && { opacity: OPACITY.pressed },
              ]}
              onPress={pickImage}
            >
              <Camera size={28} color={COLORS.textMuted} strokeWidth={1.5} />
              <AppText style={styles.uploadText}>
                {t("student.book.upload_screenshot")}
              </AppText>
            </Pressable>
          )}

          {/* Transaction Details */}
          <AppText style={styles.sectionTitle}>
            {t("student.book.transaction_details")}
          </AppText>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input
                label={t("student.book.date")}
                placeholder="2024-01-15"
                leftIcon={
                  <Calendar
                    size={18}
                    color={COLORS.textMuted}
                    strokeWidth={1.5}
                  />
                }
                value={transactionDate}
                onChangeText={setTransactionDate}
              />
            </View>

            <View style={styles.halfInput}>
              <Input
                label={t("student.book.time")}
                placeholder="14:30"
                leftIcon={
                  <Clock size={18} color={COLORS.textMuted} strokeWidth={1.5} />
                }
                value={transactionTime}
                onChangeText={setTransactionTime}
              />
            </View>
          </View>

          <Input
            label={t("student.book.from_account")}
            placeholder="0300-1234567"
            leftIcon={
              <CreditCard
                size={18}
                color={COLORS.textMuted}
                strokeWidth={1.5}
              />
            }
            value={fromAccount}
            onChangeText={setFromAccount}
          />

          <Input
            label={t("student.book.to_account")}
            placeholder="0321-9876543"
            leftIcon={
              <CreditCard
                size={18}
                color={COLORS.textMuted}
                strokeWidth={1.5}
              />
            }
            value={toAccount}
            onChangeText={setToAccount}
          />

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Action */}
      <View style={styles.bottomBar}>
        <Button
          title={t("student.book.submit_button")}
          onPress={handleSubmit}
          loading={submitting}
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
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },

  // Hostel Card
  hostelCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  hostelName: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  hostelLocation: {
    fontSize: 14,
    color: COLORS.textMuted,
  },

  // Section
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 14,
    letterSpacing: -0.2,
  },

  // Room Type Card
  roomTypeCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    padding: 16,
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
  roomTypeName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    textTransform: "capitalize",
    marginBottom: 4,
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
    color: COLORS.primary,
  },
  roomTypePriceLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  checkIcon: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  // Payment Card
  paymentCard: {
    backgroundColor: COLORS.successLight,
    borderRadius: 16,
    padding: 20,
    marginTop: 14,
    marginBottom: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.successMuted,
  },
  paymentLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  paymentAmount: {
    fontSize: 32,
    fontWeight: "700",
    color: COLORS.success,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  paymentNote: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "center",
  },

  // Upload
  uploadButton: {
    height: 140,
    borderRadius: 16,
    backgroundColor: COLORS.bgCard,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginBottom: 24,
  },
  uploadText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: "500",
  },

  // Image Preview
  imagePreview: {
    position: "relative",
    marginBottom: 24,
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 16,
  },
  removeImageBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.error,
    justifyContent: "center",
    alignItems: "center",
  },

  // Row
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },

  // Bottom Bar
  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    backgroundColor: COLORS.bgPrimary,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
});
