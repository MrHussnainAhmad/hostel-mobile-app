import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
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
import {
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import { hostelsApi } from "@/api/hostels";
import { Button, Card, Input } from "@/components/ui";
import { COLORS } from "@/constants/colors";

type RoomTypeConfig = {
  type: "SHARED" | "PRIVATE" | "SHARED_FULLROOM";
  totalRooms: number;
  personsInRoom: number;
  price: number;
  fullRoomPriceDiscounted?: number;
  urgentBookingPrice?: number;
};

type RoomTypeForm = {
  type: RoomTypeConfig["type"];
  totalRooms: string;
  personsInRoom: string;
  price: string;
  fullRoomPriceDiscounted: string;
  urgentBookingPrice: string;
};

export default function CreateHostelScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
  const [roomTypes, setRoomTypes] = useState<RoomTypeForm[]>([
    {
      type: "SHARED",
      totalRooms: "",
      personsInRoom: "",
      price: "",
      fullRoomPriceDiscounted: "",
      urgentBookingPrice: "",
    },
  ]);

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
  const [roomImages, setRoomImages] = useState<string[]>([]);

  // Light transition between steps
  const stepAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    stepAnim.setValue(0);
    Animated.timing(stepAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [step, stepAnim]);

  // Image handlers
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setRoomImages((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    setRoomImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Nearby locations handlers
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

  // SEO keywords handlers
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

  // Room type handlers
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
        text1: "Info",
        text2: "All room types already added",
      });
    }
  };

  const updateRoomType = (
    index: number,
    field: keyof RoomTypeForm,
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

  // Custom facilities handlers
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
        text1: "Error",
        text2: "Hostel name is required",
      });
      return false;
    }
    if (!city.trim()) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "City is required",
      });
      return false;
    }
    if (!address.trim()) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Address is required",
      });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    for (const rt of roomTypes) {
      if (!rt.totalRooms || !rt.personsInRoom || !rt.price) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "All room type fields are required",
        });
        return false;
      }
      if (
        parseInt(rt.totalRooms, 10) <= 0 ||
        parseInt(rt.personsInRoom, 10) <= 0 ||
        parseInt(rt.price, 10) <= 0
      ) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Room values must be greater than 0",
        });
        return false;
      }
    }
    return true;
  };

  const validateStep3 = () => true;

  const validateStep4 = () => {
    if (roomImages.length === 0) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "At least one image is required",
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

  const handleSubmit = async () => {
    if (!validateStep4()) return;

    try {
      setLoading(true);

      const hostelData = {
        hostelName: hostelName.trim(),
        city: city.trim(),
        address: address.trim(),
        hostelFor,
        rules: rules.trim(),
        nearbyLocations: nearbyLocations.filter((l) => l.trim()),
        seoKeywords: seoKeywords.filter((k) => k.trim()),
        roomTypes: roomTypes.map((rt) => ({
          type: rt.type,
          totalRooms: parseInt(rt.totalRooms, 10),
          personsInRoom: parseInt(rt.personsInRoom, 10),
          price: parseFloat(rt.price),
          availableRooms: parseInt(rt.totalRooms, 10),
          fullRoomPriceDiscounted: rt.fullRoomPriceDiscounted
            ? parseFloat(rt.fullRoomPriceDiscounted)
            : undefined,
          urgentBookingPrice: rt.urgentBookingPrice
            ? parseFloat(rt.urgentBookingPrice)
            : undefined,
        })),
        facilities: {
          ...facilities,
          electricityRatePerUnit: facilities.electricityRatePerUnit
            ? parseFloat(facilities.electricityRatePerUnit)
            : undefined,
          wifiMaxUsers: facilities.wifiMaxUsers
            ? parseInt(facilities.wifiMaxUsers, 10)
            : undefined,
          customFacilities: facilities.customFacilities.filter((f) => f.trim()),
        },
      };

      const formData = new FormData();
      formData.append("data", JSON.stringify(hostelData));

      roomImages.forEach((uri, index) => {
        const filename = uri.split("/").pop() || `image${index}.jpg`;
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";

        formData.append("roomImages", {
          uri,
          name: filename,
          type,
        } as any);
      });

      const response = await hostelsApi.createHostel(formData);

      if (response.success) {
        Toast.show({
          type: "success",
          text1: "Hostel created!",
          text2: "Your hostel has been added successfully",
        });
        router.replace("/(app)/manager/hostels");
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.errors
        ? Object.values(error.response.data.errors as Record<string, string[]>)
            .flat()
            .join("\n")
        : error?.response?.data?.message || "Failed to create hostel";

      Toast.show({
        type: "error",
        text1: "Error",
        text2: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // Step renderers

  const renderStep1 = () => (
    <>
      <Text style={styles.stepTitle}>Basic information</Text>
      <Text style={styles.stepDesc}>Tell us about your hostel.</Text>

      <Input
        label="Hostel name"
        placeholder="Enter hostel name"
        value={hostelName}
        onChangeText={setHostelName}
      />

      <Input
        label="City"
        placeholder="Enter city"
        value={city}
        onChangeText={setCity}
      />

      <Input
        label="Address"
        placeholder="Enter complete address"
        value={address}
        onChangeText={setAddress}
        multiline
      />

      <Text style={styles.label}>Hostel for</Text>
      <View style={styles.segmentRow}>
        <TouchableOpacity
          style={[
            styles.segmentOption,
            hostelFor === "BOYS" && styles.segmentOptionActive,
          ]}
          onPress={() => setHostelFor("BOYS")}
        >
          <Text
            style={[
              styles.segmentText,
              hostelFor === "BOYS" && styles.segmentTextActive,
            ]}
          >
            Boys
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.segmentOption,
            hostelFor === "GIRLS" && styles.segmentOptionActive,
          ]}
          onPress={() => setHostelFor("GIRLS")}
        >
          <Text
            style={[
              styles.segmentText,
              hostelFor === "GIRLS" && styles.segmentTextActive,
            ]}
          >
            Girls
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Nearby locations (optional)</Text>
      {nearbyLocations.map((location, index) => (
        <View key={index} style={styles.inputRow}>
          <TextInput
            style={styles.rowInput}
            placeholder={`Location ${index + 1} (e.g., University, Market)`}
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
        <Text style={styles.addBtnText}>Add location</Text>
      </TouchableOpacity>

      <Text style={styles.label}>SEO keywords (optional)</Text>
      {seoKeywords.map((keyword, index) => (
        <View key={index} style={styles.inputRow}>
          <TextInput
            style={styles.rowInput}
            placeholder={`Keyword ${index + 1} (e.g., boys hostel Lahore)`}
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
        <Text style={styles.addBtnText}>Add keyword</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Hostel rules (optional)</Text>
      <TextInput
        style={styles.textArea}
        placeholder="Enter hostel rules..."
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
      <Text style={styles.stepTitle}>Room types</Text>
      <Text style={styles.stepDesc}>Configure rooms and pricing.</Text>

      {roomTypes.map((rt, index) => (
        <Card key={index} style={styles.roomTypeCard}>
          <View style={styles.roomTypeHeader}>
            <Text style={styles.roomTypeTitle}>
              {rt.type.replace("_", " ")}
            </Text>
            {roomTypes.length > 1 && (
              <TouchableOpacity onPress={() => removeRoomType(index)}>
                <X size={20} color={COLORS.error} />
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.inputLabel}>Room type</Text>
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
                  <Text
                    style={[
                      styles.typeChipText,
                      isActive && styles.typeChipTextActive,
                    ]}
                  >
                    {type.replace("_", " ")}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>Total rooms</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 10"
                placeholderTextColor={COLORS.textMuted}
                value={rt.totalRooms}
                onChangeText={(v) => updateRoomType(index, "totalRooms", v)}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>Persons / room</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 4"
                placeholderTextColor={COLORS.textMuted}
                value={rt.personsInRoom}
                onChangeText={(v) => updateRoomType(index, "personsInRoom", v)}
                keyboardType="numeric"
              />
            </View>
          </View>

          <Text style={styles.inputLabel}>Price per month (Rs.)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 8000"
            placeholderTextColor={COLORS.textMuted}
            value={rt.price}
            onChangeText={(v) => updateRoomType(index, "price", v)}
            keyboardType="numeric"
          />

          <Text style={styles.inputLabel}>Urgent booking price (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 25000"
            placeholderTextColor={COLORS.textMuted}
            value={rt.urgentBookingPrice}
            onChangeText={(v) => updateRoomType(index, "urgentBookingPrice", v)}
            keyboardType="numeric"
          />

          {rt.type === "SHARED_FULLROOM" && (
            <>
              <Text style={styles.inputLabel}>
                Full room discounted price (optional)
              </Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 28000"
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
          <Text style={styles.addBtnText}>Add room type</Text>
        </TouchableOpacity>
      )}
    </>
  );

  const renderStep3 = () => (
    <>
      <Text style={styles.stepTitle}>Facilities</Text>
      <Text style={styles.stepDesc}>Select what your hostel offers.</Text>

      <Card style={styles.facilityCard}>
        <View style={styles.facilityRow}>
          <View style={styles.facilityInfo}>
            <Droplets size={20} color={COLORS.info} />
            <Text style={styles.facilityText}>Hot / Cold water bath</Text>
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
            <Text style={styles.facilityText}>Drinking water</Text>
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
            <Text style={styles.facilityText}>Electricity backup</Text>
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

      <Text style={styles.label}>Electricity billing</Text>
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
          <Text
            style={[
              styles.segmentText,
              facilities.electricityType === "INCLUDED" &&
                styles.segmentTextActive,
            ]}
          >
            Included
          </Text>
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
          <Text
            style={[
              styles.segmentText,
              facilities.electricityType === "SELF" && styles.segmentTextActive,
            ]}
          >
            Self (per unit)
          </Text>
        </TouchableOpacity>
      </View>

      {facilities.electricityType === "SELF" && (
        <>
          <Text style={styles.inputLabel}>Rate per unit (Rs.)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 35"
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
            <Text style={styles.facilityText}>WiFi available</Text>
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
              placeholder="WiFi plan (e.g., 50 Mbps Unlimited)"
              placeholderTextColor={COLORS.textMuted}
              value={facilities.wifiPlan}
              onChangeText={(v) =>
                setFacilities((prev) => ({ ...prev, wifiPlan: v }))
              }
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Max users"
                placeholderTextColor={COLORS.textMuted}
                value={facilities.wifiMaxUsers}
                onChangeText={(v) =>
                  setFacilities((prev) => ({ ...prev, wifiMaxUsers: v }))
                }
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Avg speed"
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

      <Text style={styles.label}>Custom facilities</Text>
      {facilities.customFacilities.map((facility, index) => (
        <View key={index} style={styles.inputRow}>
          <TextInput
            style={styles.rowInput}
            placeholder={`Facility ${index + 1} (e.g., Laundry, Gym)`}
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
        <Text style={styles.addBtnText}>Add facility</Text>
      </TouchableOpacity>
    </>
  );

  const renderStep4 = () => (
    <>
      <Text style={styles.stepTitle}>Room images</Text>
      <Text style={styles.stepDesc}>Upload clear, bright photos.</Text>

      <View style={styles.imagesGrid}>
        {roomImages.map((uri, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={{ uri }} style={styles.uploadedImage} />
            <TouchableOpacity
              style={styles.removeImageBtn}
              onPress={() => removeImage(index)}
            >
              <X size={16} color={COLORS.textInverse} />
            </TouchableOpacity>
          </View>
        ))}

        {roomImages.length < 10 && (
          <TouchableOpacity style={styles.addImageBtn} onPress={pickImage}>
            <Camera size={30} color={COLORS.textMuted} />
            <Text style={styles.addImageText}>Add photo</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.imageHint}>
        Upload between 1–10 images of rooms and shared spaces.
      </Text>

      <Card style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Hostel name</Text>
          <Text style={styles.summaryValue}>{hostelName || "-"}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Location</Text>
          <Text style={styles.summaryValue}>
            {[city, address].filter(Boolean).join(", ") || "-"}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>For</Text>
          <Text style={styles.summaryValue}>{hostelFor}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Room types</Text>
          <Text style={styles.summaryValue}>{roomTypes.length}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Images</Text>
          <Text style={styles.summaryValue}>{roomImages.length}</Text>
        </View>
      </Card>
    </>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add hostel</Text>
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
                  <Text
                    style={[
                      styles.progressText,
                      (isActive || isComplete) && styles.progressTextActive,
                    ]}
                  >
                    {s}
                  </Text>
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
          title={step < 4 ? "Next" : "Create hostel"}
          onPress={step < 4 ? handleNext : handleSubmit}
          loading={step === 4 && loading}
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
    marginTop: 8,
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

  // Summary
  summaryCard: {
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
    maxWidth: "60%",
    textAlign: "right",
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
