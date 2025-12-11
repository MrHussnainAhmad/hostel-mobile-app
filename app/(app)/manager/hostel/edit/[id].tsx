import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Camera,
  Check,
  Droplets,
  Plus,
  Wifi,
  X,
  Zap,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import { hostelsApi } from "@/api/hostels";
import AppText from "@/components/common/AppText";
import { Button, Card, Input, LoadingScreen } from "@/components/ui";
import { COLORS } from "@/constants/colors";


type RoomTypeConfig = {
  id?: string;
  type: "SHARED" | "PRIVATE" | "SHARED_FULLROOM";
  totalRooms: string;
  personsInRoom: string;
  price: string;
  fullRoomPriceDiscounted: string;
  urgentBookingPrice: string;
};

export default function EditHostelScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Basic Info
  const [hostelName, setHostelName] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [hostelFor, setHostelFor] = useState<"BOYS" | "GIRLS">("BOYS");
  const [nearbyLocations, setNearbyLocations] = useState<string[]>([""]);
  const [rules, setRules] = useState("");
  const [seoKeywords, setSeoKeywords] = useState<string[]>([""]);

  // Step 2: Room Types
  const [roomTypes, setRoomTypes] = useState<RoomTypeConfig[]>([]);

  // Step 3: Facilities
  const [facilities, setFacilities] = useState({
    hotColdWaterBath: false,
    drinkingWater: false,
    electricityBackup: false,
    electricityType: "INCLUDED" as "INCLUDED" | "SELF",
    electricityRatePerUnit: "",
    wifiEnabled: false,
    wifiPlan: "",
    wifiMaxUsers: "",
    wifiAvgSpeed: "",
    customFacilities: [""],
  });

  // Step 4: Images
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<string[]>([]);

  // Light transition between steps
  const stepAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fetchHostel();
  }, [id]);

  useEffect(() => {
    stepAnim.setValue(0);
    Animated.timing(stepAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [step, stepAnim]);

  const fetchHostel = async () => {
    try {
      const response = await hostelsApi.getById(id);
      if (response.success) {
        const hostel = response.data;

        // Basic info
        setHostelName(hostel.hostelName);
        setCity(hostel.city);
        setAddress(hostel.address);
        setHostelFor(hostel.hostelFor);
        setNearbyLocations(
          hostel.nearbyLocations?.length ? hostel.nearbyLocations : [""]
        );
        setRules(hostel.rules || "");
        setSeoKeywords(hostel.seoKeywords?.length ? hostel.seoKeywords : [""]);

        // Room types (with urgentBookingPrice)
        if (hostel.roomTypes?.length) {
          setRoomTypes(
            hostel.roomTypes.map((rt) => ({
              id: rt.id,
              type: rt.type,
              totalRooms: String(rt.totalRooms),
              personsInRoom: String(rt.personsInRoom),
              price: String(rt.price),
              fullRoomPriceDiscounted: rt.fullRoomPriceDiscounted
                ? String(rt.fullRoomPriceDiscounted)
                : "",
              urgentBookingPrice: rt.urgentBookingPrice
                ? String(rt.urgentBookingPrice)
                : "",
            }))
          );
        }

        // Facilities
        if (hostel.facilities) {
          setFacilities({
            hotColdWaterBath: hostel.facilities.hotColdWaterBath || false,
            drinkingWater: hostel.facilities.drinkingWater || false,
            electricityBackup: hostel.facilities.electricityBackup || false,
            electricityType: hostel.facilities.electricityType || "INCLUDED",
            electricityRatePerUnit: hostel.facilities.electricityRatePerUnit
              ? String(hostel.facilities.electricityRatePerUnit)
              : "",
            wifiEnabled: hostel.facilities.wifiEnabled || false,
            wifiPlan: hostel.facilities.wifiPlan || "",
            wifiMaxUsers: hostel.facilities.wifiMaxUsers
              ? String(hostel.facilities.wifiMaxUsers)
              : "",
            wifiAvgSpeed: hostel.facilities.wifiAvgSpeed || "",
            customFacilities: hostel.facilities.customFacilities?.length
              ? hostel.facilities.customFacilities
              : [""],
          });
        }

        // Images
        setExistingImages(hostel.roomImages || []);
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: t("manager.edit_hostel.fetch_error_title"),
        text2:
          error?.response?.data?.message ||
          t("manager.edit_hostel.fetch_error_message"),
      });
      router.back();
    } finally {
      setLoading(false);
    }
  };

  // Image handlers
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setNewImages((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Nearby locations
  const addNearbyLocation = () => {
    setNearbyLocations((prev) => [...prev, ""]);
  };

  const updateNearbyLocation = (index: number, value: string) => {
    const updated = [...nearbyLocations];
    updated[index] = value;
    setNearbyLocations(updated);
  };

  const removeNearbyLocation = (index: number) => {
    if (nearbyLocations.length > 1) {
      setNearbyLocations((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // SEO keywords
  const addSeoKeyword = () => {
    setSeoKeywords((prev) => [...prev, ""]);
  };

  const updateSeoKeyword = (index: number, value: string) => {
    const updated = [...seoKeywords];
    updated[index] = value;
    setSeoKeywords(updated);
  };

  const removeSeoKeyword = (index: number) => {
    if (seoKeywords.length > 1) {
      setSeoKeywords((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Room types (with urgentBookingPrice)
  const addRoomType = () => {
    const usedTypes = roomTypes.map((rt) => rt.type);
    const availableTypes: RoomTypeConfig["type"][] = [
      "SHARED",
      "PRIVATE",
      "SHARED_FULLROOM",
    ];
    const nextType = availableTypes.find((t) => !usedTypes.includes(t));

    if (nextType) {
      setRoomTypes((prev) => [
        ...prev,
        {
          type: nextType,
          totalRooms: "",
          personsInRoom: "",
          price: "",
          fullRoomPriceDiscounted: "",
          urgentBookingPrice: "",
        },
      ]);
    } else {
      Toast.show({
        type: "info",
        text1: t("manager.edit_hostel.toast.info_title"),
        text2: t("manager.edit_hostel.toast.all_room_types_added"),
      });
    }
  };

  const updateRoomType = (
    index: number,
    field: keyof RoomTypeConfig,
    value: string
  ) => {
    const updated = [...roomTypes];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setRoomTypes(updated);
  };

  const removeRoomType = (index: number) => {
    if (roomTypes.length > 1) {
      setRoomTypes((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Custom facilities
  const addCustomFacility = () => {
    setFacilities((prev) => ({
      ...prev,
      customFacilities: [...prev.customFacilities, ""],
    }));
  };

  const updateCustomFacility = (index: number, value: string) => {
    const updated = [...facilities.customFacilities];
    updated[index] = value;
    setFacilities((prev) => ({
      ...prev,
      customFacilities: updated,
    }));
  };

  const removeCustomFacility = (index: number) => {
    if (facilities.customFacilities.length > 1) {
      setFacilities((prev) => ({
        ...prev,
        customFacilities: prev.customFacilities.filter((_, i) => i !== index),
      }));
    }
  };

  // Validation
  const validateStep1 = () => {
    if (!hostelName.trim()) {
      Toast.show({
        type: "error",
        text1: t("common.error"),
        text2: t("manager.edit_hostel.toast.error_hostel_name_required"),
      });
      return false;
    }
    if (!city.trim()) {
      Toast.show({
        type: "error",
        text1: t("common.error"),
        text2: t("manager.edit_hostel.toast.error_city_required"),
      });
      return false;
    }
    if (!address.trim()) {
      Toast.show({
        type: "error",
        text1: t("common.error"),
        text2: t("manager.edit_hostel.toast.error_address_required"),
      });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (roomTypes.length === 0) {
      Toast.show({
        type: "error",
        text1: t("common.error"),
        text2: t("manager.edit_hostel.toast.error_room_type_required"),
      });
      return false;
    }
    for (const rt of roomTypes) {
      if (!rt.totalRooms || !rt.personsInRoom || !rt.price) {
        Toast.show({
          type: "error",
          text1: t("common.error"),
          text2: t("manager.edit_hostel.toast.error_room_fields_required"),
        });
        return false;
      }
    }
    return true;
  };

  const validateStep3 = () => true;

  const validateStep4 = () => {
    if (existingImages.length === 0 && newImages.length === 0) {
      Toast.show({
        type: "error",
        text1: t("common.error"),
        text2: t("manager.edit_hostel.toast.error_image_required"),
      });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
    else if (step === 3 && validateStep3()) setStep(4);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    } else {
      router.back();
    }
  };

  // Submit (with urgentBookingPrice)
  const handleSubmit = async () => {
    if (!validateStep4()) return;

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("hostelName", hostelName.trim());
      formData.append("city", city.trim());
      formData.append("address", address.trim());
      formData.append("hostelFor", hostelFor);

      if (rules.trim()) {
        formData.append("rules", rules.trim());
      }

      // Nearby locations
      nearbyLocations
        .filter((l) => l.trim())
        .forEach((location, index) => {
          formData.append(`nearbyLocations[${index}]`, location.trim());
        });

      // SEO keywords
      seoKeywords
        .filter((k) => k.trim())
        .forEach((keyword, index) => {
          formData.append(`seoKeywords[${index}]`, keyword.trim());
        });

      // Room types
      roomTypes.forEach((rt, index) => {
        formData.append(`roomTypes[${index}][type]`, rt.type);
        formData.append(`roomTypes[${index}][totalRooms]`, rt.totalRooms);
        formData.append(`roomTypes[${index}][personsInRoom]`, rt.personsInRoom);
        formData.append(`roomTypes[${index}][price]`, rt.price);

        if (rt.urgentBookingPrice) {
          formData.append(
            `roomTypes[${index}][urgentBookingPrice]`,
            rt.urgentBookingPrice
          );
        }

        if (rt.type === "SHARED_FULLROOM" && rt.fullRoomPriceDiscounted) {
          formData.append(
            `roomTypes[${index}][fullRoomPriceDiscounted]`,
            rt.fullRoomPriceDiscounted
          );
        }
      });

      // Facilities
      formData.append(
        "facilities[hotColdWaterBath]",
        String(facilities.hotColdWaterBath)
      );
      formData.append(
        "facilities[drinkingWater]",
        String(facilities.drinkingWater)
      );
      formData.append(
        "facilities[electricityBackup]",
        String(facilities.electricityBackup)
      );
      formData.append(
        "facilities[electricityType]",
        facilities.electricityType
      );

      if (
        facilities.electricityType === "SELF" &&
        facilities.electricityRatePerUnit
      ) {
        formData.append(
          "facilities[electricityRatePerUnit]",
          facilities.electricityRatePerUnit
        );
      }

      formData.append(
        "facilities[wifiEnabled]",
        String(facilities.wifiEnabled)
      );

      if (facilities.wifiEnabled) {
        if (facilities.wifiPlan) {
          formData.append("facilities[wifiPlan]", facilities.wifiPlan);
        }
        if (facilities.wifiMaxUsers) {
          formData.append("facilities[wifiMaxUsers]", facilities.wifiMaxUsers);
        }
        if (facilities.wifiAvgSpeed) {
          formData.append("facilities[wifiAvgSpeed]", facilities.wifiAvgSpeed);
        }
      }

      facilities.customFacilities
        .filter((f) => f.trim())
        .forEach((facility, index) => {
          formData.append(
            `facilities[customFacilities][${index}]`,
            facility.trim()
          );
        });

      // Existing images
      existingImages.forEach((url, index) => {
        formData.append(`existingImages[${index}]`, url);
      });

      // New images
      newImages.forEach((uri, index) => {
        const filename = uri.split("/").pop() || `image${index}.jpg`;
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";

        formData.append("roomImages", {
          uri,
          name: filename,
          type,
        } as any);
      });

      const response = await hostelsApi.updateHostel(id, formData);

      if (response.success) {
        Toast.show({
          type: "success",
          text1: t("manager.edit_hostel.toast.success_title"),
          text2: t("manager.edit_hostel.toast.success_message"),
        });
        router.back();
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: t("common.error"),
        text2:
          error?.response?.data?.message ||
          t("manager.edit_hostel.toast.error_update_failed"),
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  // Step renderers
  const renderStep1 = () => (
    <>
      <AppText style={styles.stepTitle}>
        {t("manager.edit_hostel.step1.title")}
      </AppText>
      <AppText style={styles.stepDesc}>
        {t("manager.edit_hostel.step1.description")}
      </AppText>

      <Input
        label={t("manager.edit_hostel.step1.hostel_name_label")}
        placeholder={t("manager.edit_hostel.step1.hostel_name_placeholder")}
        value={hostelName}
        onChangeText={setHostelName}
      />

      <Input
        label={t("manager.edit_hostel.step1.city_label")}
        placeholder={t("manager.edit_hostel.step1.city_placeholder")}
        value={city}
        onChangeText={setCity}
      />

      <Input
        label={t("manager.edit_hostel.step1.address_label")}
        placeholder={t("manager.edit_hostel.step1.address_placeholder")}
        value={address}
        onChangeText={setAddress}
        multiline
      />

      <AppText style={styles.label}>
        {t("manager.edit_hostel.step1.hostel_for_label")}
      </AppText>
      <View style={styles.segmentRow}>
        <TouchableOpacity
          style={[
            styles.segmentOption,
            hostelFor === "BOYS" && styles.segmentOptionActive,
          ]}
          onPress={() => setHostelFor("BOYS")}
        >
          <AppText
            style={[
              styles.segmentText,
              hostelFor === "BOYS" && styles.segmentTextActive,
            ]}
          >
            {t("manager.edit_hostel.step1.boys")}
          </AppText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.segmentOption,
            hostelFor === "GIRLS" && styles.segmentOptionActive,
          ]}
          onPress={() => setHostelFor("GIRLS")}
        >
          <AppText
            style={[
              styles.segmentText,
              hostelFor === "GIRLS" && styles.segmentTextActive,
            ]}
          >
            {t("manager.edit_hostel.step1.girls")}
          </AppText>
        </TouchableOpacity>
      </View>

      <AppText style={styles.label}>
        {t("manager.edit_hostel.step1.nearby_locations_label")}
      </AppText>
      {nearbyLocations.map((location, index) => (
        <View key={index} style={styles.inputRow}>
          <TextInput
            style={styles.rowInput}
            placeholder={t(
              "manager.edit_hostel.step1.nearby_location_placeholder",
              { index: index + 1 }
            )}
            placeholderTextColor={COLORS.textMuted}
            value={location}
            onChangeText={(v) => updateNearbyLocation(index, v)}
          />
          {nearbyLocations.length > 1 && (
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => removeNearbyLocation(index)}
            >
              <X size={18} color={COLORS.error} />
            </TouchableOpacity>
          )}
        </View>
      ))}
      <TouchableOpacity style={styles.addBtn} onPress={addNearbyLocation}>
        <Plus size={18} color={COLORS.primary} />
        <AppText style={styles.addBtnText}>
          {t("manager.edit_hostel.step1.add_location")}
        </AppText>
      </TouchableOpacity>

      <AppText style={styles.label}>
        {t("manager.edit_hostel.step1.seo_keywords_label")}
      </AppText>
      {seoKeywords.map((keyword, index) => (
        <View key={index} style={styles.inputRow}>
          <TextInput
            style={styles.rowInput}
            placeholder={t(
              "manager.edit_hostel.step1.seo_keyword_placeholder",
              { index: index + 1 }
            )}
            placeholderTextColor={COLORS.textMuted}
            value={keyword}
            onChangeText={(v) => updateSeoKeyword(index, v)}
          />
          {seoKeywords.length > 1 && (
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => removeSeoKeyword(index)}
            >
              <X size={18} color={COLORS.error} />
            </TouchableOpacity>
          )}
        </View>
      ))}
      <TouchableOpacity style={styles.addBtn} onPress={addSeoKeyword}>
        <Plus size={18} color={COLORS.primary} />
        <AppText style={styles.addBtnText}>
          {t("manager.edit_hostel.step1.add_keyword")}
        </AppText>
      </TouchableOpacity>

      <AppText style={styles.label}>
        {t("manager.edit_hostel.step1.rules_label")}
      </AppText>
      <TextInput
        style={styles.textArea}
        placeholder={t("manager.edit_hostel.step1.rules_placeholder")}
        placeholderTextColor={COLORS.textMuted}
        value={rules}
        onChangeText={setRules}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />
    </>
  );

  const renderStep2 = () => (
    <>
      <AppText style={styles.stepTitle}>
        {t("manager.edit_hostel.step2.title")}
      </AppText>
      <AppText style={styles.stepDesc}>
        {t("manager.edit_hostel.step2.description")}
      </AppText>

      {roomTypes.map((rt, index) => (
        <Card key={rt.id || index} style={styles.roomTypeCard}>
          <View style={styles.roomTypeHeader}>
            <AppText style={styles.roomTypeTitle}>
              {rt.type.replace("_", " ")}
            </AppText>
            {roomTypes.length > 1 && (
              <TouchableOpacity onPress={() => removeRoomType(index)}>
                <X size={20} color={COLORS.error} />
              </TouchableOpacity>
            )}
          </View>

          <AppText style={styles.inputLabel}>
            {t("manager.edit_hostel.step2.room_type_label")}
          </AppText>
          <View style={styles.typeRow}>
            {(["SHARED", "PRIVATE", "SHARED_FULLROOM"] as const).map((type) => {
              const isUsed = roomTypes.some(
                (r, i) => r.type === type && i !== index
              );
              const isActive = rt.type === type;

              return (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeChip,
                    isActive && styles.typeChipActive,
                    isUsed && styles.typeChipDisabled,
                  ]}
                  disabled={isUsed}
                  onPress={() => !isUsed && updateRoomType(index, "type", type)}
                >
                  <AppText
                    style={[
                      styles.typeChipText,
                      isActive && styles.typeChipTextActive,
                      isUsed && styles.typeChipTextDisabled,
                    ]}
                  >
                    {type === "SHARED"
                      ? t("manager.edit_hostel.step2.type_shared")
                      : type === "PRIVATE"
                      ? t("manager.edit_hostel.step2.type_private")
                      : t("manager.edit_hostel.step2.type_shared_fullroom")}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <AppText style={styles.inputLabel}>
                {t("manager.edit_hostel.step2.total_rooms_label")}
              </AppText>
              <TextInput
                style={styles.input}
                placeholder={t(
                  "manager.edit_hostel.step2.total_rooms_placeholder"
                )}
                placeholderTextColor={COLORS.textMuted}
                value={rt.totalRooms}
                onChangeText={(v) => updateRoomType(index, "totalRooms", v)}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfInput}>
              <AppText style={styles.inputLabel}>
                {t("manager.edit_hostel.step2.persons_per_room_label")}
              </AppText>
              <TextInput
                style={styles.input}
                placeholder={t(
                  "manager.edit_hostel.step2.persons_per_room_placeholder"
                )}
                placeholderTextColor={COLORS.textMuted}
                value={rt.personsInRoom}
                onChangeText={(v) => updateRoomType(index, "personsInRoom", v)}
                keyboardType="numeric"
              />
            </View>
          </View>

          <AppText style={styles.inputLabel}>
            {t("manager.edit_hostel.step2.price_label")}
          </AppText>
          <TextInput
            style={styles.input}
            placeholder={t("manager.edit_hostel.step2.price_placeholder")}
            placeholderTextColor={COLORS.textMuted}
            value={rt.price}
            onChangeText={(v) => updateRoomType(index, "price", v)}
            keyboardType="numeric"
          />

          <AppText style={styles.inputLabel}>
            {t("manager.edit_hostel.step2.urgent_price_label")}
          </AppText>
          <TextInput
            style={styles.input}
            placeholder={t(
              "manager.edit_hostel.step2.urgent_price_placeholder"
            )}
            placeholderTextColor={COLORS.textMuted}
            value={rt.urgentBookingPrice}
            onChangeText={(v) => updateRoomType(index, "urgentBookingPrice", v)}
            keyboardType="numeric"
          />

          {rt.type === "SHARED_FULLROOM" && (
            <>
              <AppText style={styles.inputLabel}>
                {t("manager.edit_hostel.step2.fullroom_discount_label")}
              </AppText>
              <TextInput
                style={styles.input}
                placeholder={t(
                  "manager.edit_hostel.step2.fullroom_discount_placeholder"
                )}
                placeholderTextColor={COLORS.textMuted}
                value={rt.fullRoomPriceDiscounted}
                onChangeText={(v) =>
                  updateRoomType(index, "fullRoomPriceDiscounted", v)
                }
                keyboardType="numeric"
              />
            </>
          )}
        </Card>
      ))}

      {roomTypes.length < 3 && (
        <TouchableOpacity style={styles.addBtn} onPress={addRoomType}>
          <Plus size={18} color={COLORS.primary} />
          <AppText style={styles.addBtnText}>
            {t("manager.edit_hostel.step2.add_room_type")}
          </AppText>
        </TouchableOpacity>
      )}
    </>
  );

  const renderStep3 = () => (
    <>
      <AppText style={styles.stepTitle}>
        {t("manager.edit_hostel.step3.title")}
      </AppText>
      <AppText style={styles.stepDesc}>
        {t("manager.edit_hostel.step3.description")}
      </AppText>

      <Card style={styles.facilityCard}>
        <View style={styles.facilityRow}>
          <View style={styles.facilityInfo}>
            <Droplets size={20} color={COLORS.info} />
            <AppText style={styles.facilityText}>
              {t("manager.edit_hostel.step3.hot_cold_water")}
            </AppText>
          </View>
          <Switch
            value={facilities.hotColdWaterBath}
            onValueChange={(v) =>
              setFacilities((prev) => ({ ...prev, hotColdWaterBath: v }))
            }
            trackColor={{ false: COLORS.border, true: COLORS.primary + "50" }}
            thumbColor={
              facilities.hotColdWaterBath ? COLORS.primary : COLORS.textMuted
            }
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.facilityRow}>
          <View style={styles.facilityInfo}>
            <Droplets size={20} color={COLORS.info} />
            <AppText style={styles.facilityText}>
              {t("manager.edit_hostel.step3.drinking_water")}
            </AppText>
          </View>
          <Switch
            value={facilities.drinkingWater}
            onValueChange={(v) =>
              setFacilities((prev) => ({ ...prev, drinkingWater: v }))
            }
            trackColor={{ false: COLORS.border, true: COLORS.primary + "50" }}
            thumbColor={
              facilities.drinkingWater ? COLORS.primary : COLORS.textMuted
            }
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.facilityRow}>
          <View style={styles.facilityInfo}>
            <Zap size={20} color={COLORS.warning} />
            <AppText style={styles.facilityText}>
              {t("manager.edit_hostel.step3.electricity_backup")}
            </AppText>
          </View>
          <Switch
            value={facilities.electricityBackup}
            onValueChange={(v) =>
              setFacilities((prev) => ({ ...prev, electricityBackup: v }))
            }
            trackColor={{ false: COLORS.border, true: COLORS.primary + "50" }}
            thumbColor={
              facilities.electricityBackup ? COLORS.primary : COLORS.textMuted
            }
          />
        </View>
      </Card>

      <AppText style={styles.label}>
        {t("manager.edit_hostel.step3.electricity_billing_label")}
      </AppText>
      <View style={styles.segmentRow}>
        <TouchableOpacity
          style={[
            styles.segmentOption,
            facilities.electricityType === "INCLUDED" &&
              styles.segmentOptionActive,
          ]}
          onPress={() =>
            setFacilities((prev) => ({ ...prev, electricityType: "INCLUDED" }))
          }
        >
          <AppText
            style={[
              styles.segmentText,
              facilities.electricityType === "INCLUDED" &&
                styles.segmentTextActive,
            ]}
          >
            {t("manager.edit_hostel.step3.electricity_included")}
          </AppText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.segmentOption,
            facilities.electricityType === "SELF" && styles.segmentOptionActive,
          ]}
          onPress={() =>
            setFacilities((prev) => ({ ...prev, electricityType: "SELF" }))
          }
        >
          <AppText
            style={[
              styles.segmentText,
              facilities.electricityType === "SELF" && styles.segmentTextActive,
            ]}
          >
            {t("manager.edit_hostel.step3.electricity_self")}
          </AppText>
        </TouchableOpacity>
      </View>

      {facilities.electricityType === "SELF" && (
        <>
          <AppText style={styles.inputLabel}>
            {t("manager.edit_hostel.step3.rate_per_unit_label")}
          </AppText>
          <TextInput
            style={styles.input}
            placeholder={t(
              "manager.edit_hostel.step3.rate_per_unit_placeholder"
            )}
            placeholderTextColor={COLORS.textMuted}
            value={facilities.electricityRatePerUnit}
            onChangeText={(v) =>
              setFacilities((prev) => ({ ...prev, electricityRatePerUnit: v }))
            }
            keyboardType="numeric"
          />
        </>
      )}

      <Card style={styles.facilityCard}>
        <View style={styles.facilityRow}>
          <View style={styles.facilityInfo}>
            <Wifi size={20} color={COLORS.success} />
            <AppText style={styles.facilityText}>
              {t("manager.edit_hostel.step3.wifi_available")}
            </AppText>
          </View>
          <Switch
            value={facilities.wifiEnabled}
            onValueChange={(v) =>
              setFacilities((prev) => ({ ...prev, wifiEnabled: v }))
            }
            trackColor={{ false: COLORS.border, true: COLORS.primary + "50" }}
            thumbColor={
              facilities.wifiEnabled ? COLORS.primary : COLORS.textMuted
            }
          />
        </View>

        {facilities.wifiEnabled && (
          <>
            <View style={styles.divider} />
            <TextInput
              style={styles.input}
              placeholder={t("manager.edit_hostel.step3.wifi_plan_placeholder")}
              placeholderTextColor={COLORS.textMuted}
              value={facilities.wifiPlan}
              onChangeText={(v) =>
                setFacilities((prev) => ({ ...prev, wifiPlan: v }))
              }
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder={t(
                  "manager.edit_hostel.step3.wifi_max_users_placeholder"
                )}
                placeholderTextColor={COLORS.textMuted}
                value={facilities.wifiMaxUsers}
                onChangeText={(v) =>
                  setFacilities((prev) => ({ ...prev, wifiMaxUsers: v }))
                }
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder={t(
                  "manager.edit_hostel.step3.wifi_avg_speed_placeholder"
                )}
                placeholderTextColor={COLORS.textMuted}
                value={facilities.wifiAvgSpeed}
                onChangeText={(v) =>
                  setFacilities((prev) => ({ ...prev, wifiAvgSpeed: v }))
                }
              />
            </View>
          </>
        )}
      </Card>

      <AppText style={styles.label}>
        {t("manager.edit_hostel.step3.custom_facilities_label")}
      </AppText>
      {facilities.customFacilities.map((facility, index) => (
        <View key={index} style={styles.inputRow}>
          <TextInput
            style={styles.rowInput}
            placeholder={t(
              "manager.edit_hostel.step3.custom_facility_placeholder",
              { index: index + 1 }
            )}
            placeholderTextColor={COLORS.textMuted}
            value={facility}
            onChangeText={(v) => updateCustomFacility(index, v)}
          />
          {facilities.customFacilities.length > 1 && (
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => removeCustomFacility(index)}
            >
              <X size={18} color={COLORS.error} />
            </TouchableOpacity>
          )}
        </View>
      ))}
      <TouchableOpacity style={styles.addBtn} onPress={addCustomFacility}>
        <Plus size={18} color={COLORS.primary} />
        <AppText style={styles.addBtnText}>
          {t("manager.edit_hostel.step3.add_facility")}
        </AppText>
      </TouchableOpacity>
    </>
  );

  const renderStep4 = () => (
    <>
      <AppText style={styles.stepTitle}>
        {t("manager.edit_hostel.step4.title")}
      </AppText>
      <AppText style={styles.stepDesc}>
        {t("manager.edit_hostel.step4.description")}
      </AppText>

      {existingImages.length > 0 && (
        <>
          <AppText style={styles.label}>
            {t("manager.edit_hostel.step4.current_images")}
          </AppText>
          <View style={styles.imagesGrid}>
            {existingImages.map((uri, index) => (
              <View key={`existing-${index}`} style={styles.imageContainer}>
                <Image source={{ uri }} style={styles.uploadedImage} />
                <TouchableOpacity
                  style={styles.removeImageBtn}
                  onPress={() => removeExistingImage(index)}
                >
                  <X size={16} color={COLORS.textInverse} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </>
      )}

      <AppText style={styles.label}>
        {t("manager.edit_hostel.step4.add_new_images")}
      </AppText>
      <View style={styles.imagesGrid}>
        {newImages.map((uri, index) => (
          <View key={`new-${index}`} style={styles.imageContainer}>
            <Image source={{ uri }} style={styles.uploadedImage} />
            <TouchableOpacity
              style={styles.removeImageBtn}
              onPress={() => removeNewImage(index)}
            >
              <X size={16} color={COLORS.textInverse} />
            </TouchableOpacity>
          </View>
        ))}

        {existingImages.length + newImages.length < 10 && (
          <TouchableOpacity style={styles.addImageBtn} onPress={pickImage}>
            <Camera size={32} color={COLORS.textMuted} />
            <AppText style={styles.addImageText}>
              {t("manager.edit_hostel.step4.add_photo")}
            </AppText>
          </TouchableOpacity>
        )}
      </View>

      <AppText style={styles.imageHint}>
        {t("manager.edit_hostel.step4.image_count", {
          count: existingImages.length + newImages.length,
        })}
      </AppText>
    </>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <AppText style={styles.headerTitle}>
          {t("manager.edit_hostel.header_title")}
        </AppText>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        {[1, 2, 3, 4].map((s) => {
          const isComplete = s < step;
          const isActive = s === step;
          return (
            <View key={s} style={styles.progressItem}>
              <View
                style={[
                  styles.progressStep,
                  isActive && styles.progressStepActive,
                  isComplete && styles.progressStepComplete,
                ]}
              >
                {isComplete ? (
                  <Check size={14} color={COLORS.textInverse} />
                ) : (
                  <AppText
                    style={[
                      styles.progressText,
                      (isActive || isComplete) && styles.progressTextActive,
                    ]}
                  >
                    {s}
                  </AppText>
                )}
              </View>
              {s < 4 && <View style={styles.progressSpacer} />}
            </View>
          );
        })}
        <View style={styles.progressLine}>
          <View
            style={[
              styles.progressLineFill,
              { width: `${((step - 1) / 3) * 100}%` },
            ]}
          />
        </View>
      </View>

      {/* Content */}
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Animated.View
          style={[
            styles.stepContainer,
            {
              opacity: stepAnim,
              transform: [
                {
                  translateY: stepAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [16, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}

            <View style={{ height: 120 }} />
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>

      {/* Bottom actions */}
      <View style={styles.bottomBar}>
        <Button
          title={
            step < 4
              ? t("manager.edit_hostel.button_next")
              : t("manager.edit_hostel.button_save")
          }
          onPress={step < 4 ? handleNext : handleSubmit}
          loading={step === 4 && saving}
          style={styles.nextButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  keyboardView: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.bgPrimary,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },

  // Progress
  progressContainer: {
    paddingHorizontal: 32,
    paddingVertical: 18,
    position: "relative",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressStep: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bgSecondary,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  progressStepActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + "15",
  },
  progressStepComplete: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  progressText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textMuted,
  },
  progressTextActive: {
    color: COLORS.textInverse,
  },
  progressSpacer: {
    width: 32,
  },
  progressLine: {
    position: "absolute",
    left: 48,
    right: 48,
    top: "50%",
    height: 2,
    backgroundColor: COLORS.border,
  },
  progressLineFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
  },

  // Step titles
  stepTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginTop: 8,
    marginBottom: 6,
  },
  stepDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },

  // Labels / Inputs
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.textSecondary,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 100,
    textAlignVertical: "top",
    marginBottom: 16,
  },

  // Segmented controls
  segmentRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  segmentOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bgSecondary,
    alignItems: "center",
  },
  segmentOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + "10",
  },
  segmentText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textMuted,
  },
  segmentTextActive: {
    color: COLORS.primary,
  },

  // Dynamic rows
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  rowInput: {
    flex: 1,
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  removeBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.error + "16",
    alignItems: "center",
    justifyContent: "center",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    marginTop: 4,
    marginBottom: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.primary + "40",
    backgroundColor: COLORS.primary + "10",
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },

  // Room types
  roomTypeCard: {
    marginBottom: 14,
  },
  roomTypeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  roomTypeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    textTransform: "capitalize",
  },
  typeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  typeChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bgSecondary,
  },
  typeChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + "16",
  },
  typeChipDisabled: {
    opacity: 0.4,
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  typeChipTextActive: {
    color: COLORS.primary,
  },
  typeChipTextDisabled: {
    color: COLORS.textMuted,
  },

  row: {
    flexDirection: "row",
    gap: 10,
  },
  halfInput: {
    flex: 1,
  },

  // Facilities
  facilityCard: {
    marginTop: 10,
    marginBottom: 14,
  },
  facilityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  facilityInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  facilityText: {
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 14,
  },

  // Images
  imagesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 12,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: COLORS.bgSecondary,
  },
  uploadedImage: {
    width: "100%",
    height: "100%",
  },
  removeImageBtn: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.error,
    alignItems: "center",
    justifyContent: "center",
  },
  addImageBtn: {
    width: 100,
    height: 100,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: "dashed",
    backgroundColor: COLORS.bgSecondary,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  addImageText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  imageHint: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 18,
  },

  // Bottom bar
  bottomBar: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.bgPrimary,
  },
  nextButton: {
    height: 52,
  },
});
