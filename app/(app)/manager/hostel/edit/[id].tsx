import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Camera,
  Check,
  Droplets,
  Plus,
  Wifi,
  X,
  Zap,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { hostelsApi } from '@/api/hostels';
import { Button, Card, Input, LoadingScreen } from '@/components/ui';
import { COLORS } from '@/constants/colors';

type RoomTypeConfig = {
  id?: string;
  type: 'SHARED' | 'PRIVATE' | 'SHARED_FULLROOM';
  totalRooms: string;
  personsInRoom: string;
  price: string;
  fullRoomPriceDiscounted: string;
};

export default function EditHostelScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(1);

  // Step 1: Basic Info
  const [hostelName, setHostelName] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [hostelFor, setHostelFor] = useState<'BOYS' | 'GIRLS'>('BOYS');
  const [nearbyLocations, setNearbyLocations] = useState<string[]>(['']);
  const [rules, setRules] = useState('');
  const [seoKeywords, setSeoKeywords] = useState<string[]>(['']);

  // Step 2: Room Types
  const [roomTypes, setRoomTypes] = useState<RoomTypeConfig[]>([]);

  // Step 3: Facilities
  const [facilities, setFacilities] = useState({
    hotColdWaterBath: false,
    drinkingWater: false,
    electricityBackup: false,
    electricityType: 'INCLUDED' as 'INCLUDED' | 'SELF',
    electricityRatePerUnit: '',
    wifiEnabled: false,
    wifiPlan: '',
    wifiMaxUsers: '',
    wifiAvgSpeed: '',
    customFacilities: [''],
  });

  // Step 4: Images
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<string[]>([]);

  useEffect(() => {
    fetchHostel();
  }, [id]);

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
          hostel.nearbyLocations?.length
            ? hostel.nearbyLocations
            : ['']
        );
        setRules(hostel.rules || '');
        setSeoKeywords(
          hostel.seoKeywords?.length
            ? hostel.seoKeywords
            : ['']
        );

        // Room types
        if (hostel.roomTypes?.length) {
          setRoomTypes(
            hostel.roomTypes.map((rt) => ({
              id: rt.id,
              type: rt.type,
              totalRooms: String(rt.totalRooms),
              personsInRoom: String(rt.personsInRoom),
              price: String(rt.price),
              fullRoomPriceDiscounted:
                rt.fullRoomPriceDiscounted
                  ? String(
                      rt.fullRoomPriceDiscounted
                    )
                  : '',
            }))
          );
        }

        // Facilities
        if (hostel.facilities) {
          setFacilities({
            hotColdWaterBath:
              hostel.facilities.hotColdWaterBath ||
              false,
            drinkingWater:
              hostel.facilities.drinkingWater ||
              false,
            electricityBackup:
              hostel.facilities.electricityBackup ||
              false,
            electricityType:
              hostel.facilities.electricityType ||
              'INCLUDED',
            electricityRatePerUnit:
              hostel.facilities.electricityRatePerUnit
                ? String(
                    hostel.facilities
                      .electricityRatePerUnit
                  )
                : '',
            wifiEnabled:
              hostel.facilities.wifiEnabled || false,
            wifiPlan: hostel.facilities.wifiPlan || '',
            wifiMaxUsers:
              hostel.facilities.wifiMaxUsers
                ? String(
                    hostel.facilities.wifiMaxUsers
                  )
                : '',
            wifiAvgSpeed:
              hostel.facilities.wifiAvgSpeed || '',
            customFacilities:
              hostel.facilities
                .customFacilities?.length
                ? hostel.facilities.customFacilities
                : [''],
          });
        }

        // Images
        setExistingImages(hostel.roomImages || []);
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2:
          error?.response?.data?.message ||
          'Failed to fetch hostel',
      });
      router.back();
    } finally {
      setLoading(false);
    }
  };

  // Image handlers
  const pickImage = async () => {
    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes:
          ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

    if (!result.canceled && result.assets[0]) {
      setNewImages([
        ...newImages,
        result.assets[0].uri,
      ]);
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(
      existingImages.filter((_, i) => i !== index)
    );
  };

  const removeNewImage = (index: number) => {
    setNewImages(
      newImages.filter((_, i) => i !== index)
    );
  };

  // Nearby locations
  const addNearbyLocation = () => {
    setNearbyLocations([...nearbyLocations, '']);
  };

  const updateNearbyLocation = (
    index: number,
    value: string
  ) => {
    const updated = [...nearbyLocations];
    updated[index] = value;
    setNearbyLocations(updated);
  };

  const removeNearbyLocation = (index: number) => {
    if (nearbyLocations.length > 1) {
      setNearbyLocations(
        nearbyLocations.filter((_, i) => i !== index)
      );
    }
  };

  // Room types
  const addRoomType = () => {
    const usedTypes = roomTypes.map((rt) => rt.type);
    const availableTypes: (
      | 'SHARED'
      | 'PRIVATE'
      | 'SHARED_FULLROOM'
    )[] = ['SHARED', 'PRIVATE', 'SHARED_FULLROOM'];
    const nextType = availableTypes.find(
      (t) => !usedTypes.includes(t)
    );

    if (nextType) {
      setRoomTypes([
        ...roomTypes,
        {
          type: nextType,
          totalRooms: '',
          personsInRoom: '',
          price: '',
          fullRoomPriceDiscounted: '',
        },
      ]);
    } else {
      Toast.show({
        type: 'info',
        text1: 'Info',
        text2: 'All room types already added',
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
      setRoomTypes(
        roomTypes.filter((_, i) => i !== index)
      );
    }
  };

  // Custom facilities
  const addCustomFacility = () => {
    setFacilities({
      ...facilities,
      customFacilities: [
        ...facilities.customFacilities,
        '',
      ],
    });
  };

  const updateCustomFacility = (
    index: number,
    value: string
  ) => {
    const updated = [
      ...facilities.customFacilities,
    ];
    updated[index] = value;
    setFacilities({
      ...facilities,
      customFacilities: updated,
    });
  };

  const removeCustomFacility = (
    index: number
  ) => {
    if (facilities.customFacilities.length > 1) {
      setFacilities({
        ...facilities,
        customFacilities:
          facilities.customFacilities.filter(
            (_, i) => i !== index
          ),
      });
    }
  };

  // Validation
  const validateStep1 = () => {
    if (!hostelName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Hostel name is required',
      });
      return false;
    }
    if (!city.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'City is required',
      });
      return false;
    }
    if (!address.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Address is required',
      });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (roomTypes.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'At least one room type is required',
      });
      return false;
    }
    for (const rt of roomTypes) {
      if (
        !rt.totalRooms ||
        !rt.personsInRoom ||
        !rt.price
      ) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2:
            'All room type fields are required',
        });
        return false;
      }
    }
    return true;
  };

  const validateStep3 = () => true;

  const validateStep4 = () => {
    if (
      existingImages.length === 0 &&
      newImages.length === 0
    ) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'At least one image is required',
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

  const handleSubmit = async () => {
    if (!validateStep4()) return;

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append('hostelName', hostelName.trim());
      formData.append('city', city.trim());
      formData.append('address', address.trim());
      formData.append('hostelFor', hostelFor);

      if (rules.trim()) {
        formData.append('rules', rules.trim());
      }

      // Nearby locations
      nearbyLocations
        .filter((l) => l.trim())
        .forEach((location, index) => {
          formData.append(
            `nearbyLocations[${index}]`,
            location.trim()
          );
        });

      // SEO keywords
      seoKeywords
        .filter((k) => k.trim())
        .forEach((keyword, index) => {
          formData.append(
            `seoKeywords[${index}]`,
            keyword.trim()
          );
        });

      // Room types
      roomTypes.forEach((rt, index) => {
        formData.append(
          `roomTypes[${index}][type]`,
          rt.type
        );
        formData.append(
          `roomTypes[${index}][totalRooms]`,
          rt.totalRooms
        );
        formData.append(
          `roomTypes[${index}][personsInRoom]`,
          rt.personsInRoom
        );
        formData.append(
          `roomTypes[${index}][price]`,
          rt.price
        );
        if (
          rt.type === 'SHARED_FULLROOM' &&
          rt.fullRoomPriceDiscounted
        ) {
          formData.append(
            `roomTypes[${index}][fullRoomPriceDiscounted]`,
            rt.fullRoomPriceDiscounted
          );
        }
      });

      // Facilities
      formData.append(
        'facilities[hotColdWaterBath]',
        String(facilities.hotColdWaterBath)
      );
      formData.append(
        'facilities[drinkingWater]',
        String(facilities.drinkingWater)
      );
      formData.append(
        'facilities[electricityBackup]',
        String(facilities.electricityBackup)
      );
      formData.append(
        'facilities[electricityType]',
        facilities.electricityType
      );

      if (
        facilities.electricityType === 'SELF' &&
        facilities.electricityRatePerUnit
      ) {
        formData.append(
          'facilities[electricityRatePerUnit]',
          facilities.electricityRatePerUnit
        );
      }

      formData.append(
        'facilities[wifiEnabled]',
        String(facilities.wifiEnabled)
      );

      if (facilities.wifiEnabled) {
        if (facilities.wifiPlan)
          formData.append(
            'facilities[wifiPlan]',
            facilities.wifiPlan
          );
        if (facilities.wifiMaxUsers)
          formData.append(
            'facilities[wifiMaxUsers]',
            facilities.wifiMaxUsers
          );
        if (facilities.wifiAvgSpeed)
          formData.append(
            'facilities[wifiAvgSpeed]',
            facilities.wifiAvgSpeed
          );
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
        formData.append(
          `existingImages[${index}]`,
          url
        );
      });

      // New images
      newImages.forEach((uri, index) => {
        const filename =
          uri.split('/').pop() || `image${index}.jpg`;
        const match = /\.(\w+)$/.exec(filename);
        const type = match
          ? `image/${match[1]}`
          : 'image/jpeg';
        formData.append('roomImages', {
          uri,
          name: filename,
          type,
        } as any);
      });

      const response =
        await hostelsApi.updateHostel(id, formData);

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Hostel updated',
          text2: 'Changes saved successfully',
        });
        router.back();
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2:
          error?.response?.data?.message ||
          'Failed to update hostel',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  // Reuse the same 4-step UI pattern as create
  const renderStep1 = () => (
    <>
      <Text style={styles.stepTitle}>
        Basic information
      </Text>
      <Text style={styles.stepDesc}>
        Update your hostel details.
      </Text>

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
      <View style={styles.genderRow}>
        <TouchableOpacity
          style={[
            styles.genderOption,
            hostelFor === 'BOYS' &&
              styles.genderOptionActive,
          ]}
          onPress={() => setHostelFor('BOYS')}
        >
          <Text
            style={[
              styles.genderText,
              hostelFor === 'BOYS' &&
                styles.genderTextActive,
            ]}
          >
            Boys
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.genderOption,
            hostelFor === 'GIRLS' &&
              styles.genderOptionActive,
          ]}
          onPress={() => setHostelFor('GIRLS')}
        >
          <Text
            style={[
              styles.genderText,
              hostelFor === 'GIRLS' &&
                styles.genderTextActive,
            ]}
          >
            Girls
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>
        Nearby locations
      </Text>
      {nearbyLocations.map((location, index) => (
        <View
          key={index}
          style={styles.inputRow}
        >
          <TextInput
            style={styles.rowInput}
            placeholder={`Location ${index + 1}`}
            placeholderTextColor={COLORS.textMuted}
            value={location}
            onChangeText={(v) =>
              updateNearbyLocation(index, v)
            }
          />
          {nearbyLocations.length > 1 && (
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() =>
                removeNearbyLocation(index)
              }
            >
              <X
                size={18}
                color={COLORS.error}
              />
            </TouchableOpacity>
          )}
        </View>
      ))}
      <TouchableOpacity
        style={styles.addBtn}
        onPress={addNearbyLocation}
      >
        <Plus
          size={18}
          color={COLORS.primary}
        />
        <Text style={styles.addBtnText}>
          Add location
        </Text>
      </TouchableOpacity>

      <Text style={styles.label}>
        Hostel rules
      </Text>
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
      <Text style={styles.stepTitle}>
        Room types
      </Text>
      <Text style={styles.stepDesc}>
        Update room types and pricing.
      </Text>

      {roomTypes.map((rt, index) => (
        <Card
          key={rt.id || index}
          style={styles.roomTypeCard}
        >
          <View style={styles.roomTypeHeader}>
            <Text style={styles.roomTypeTitle}>
              {rt.type.replace('_', ' ')}
            </Text>
            {roomTypes.length > 1 && (
              <TouchableOpacity
                onPress={() =>
                  removeRoomType(index)
                }
              >
                <X
                  size={20}
                  color={COLORS.error}
                />
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.inputLabel}>
            Room type
          </Text>
          <View style={styles.typeRow}>
            {(['SHARED', 'PRIVATE', 'SHARED_FULLROOM'] as const).map(
              (type) => {
                const isUsed = roomTypes.some(
                  (r, i) =>
                    r.type === type && i !== index
                );
                return (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeChip,
                      rt.type === type &&
                        styles.typeChipActive,
                      isUsed &&
                        styles.typeChipDisabled,
                    ]}
                    onPress={() =>
                      !isUsed &&
                      updateRoomType(
                        index,
                        'type',
                        type
                      )
                    }
                    disabled={isUsed}
                  >
                    <Text
                      style={[
                        styles.typeChipText,
                        rt.type === type &&
                          styles
                            .typeChipTextActive,
                        isUsed &&
                          styles
                            .typeChipTextDisabled,
                      ]}
                    >
                      {type.replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                );
              }
            )}
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>
                Total rooms
              </Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 10"
                placeholderTextColor={
                  COLORS.textMuted
                }
                value={rt.totalRooms}
                onChangeText={(v) =>
                  updateRoomType(
                    index,
                    'totalRooms',
                    v
                  )
                }
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>
                Persons / room
              </Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 4"
                placeholderTextColor={
                  COLORS.textMuted
                }
                value={rt.personsInRoom}
                onChangeText={(v) =>
                  updateRoomType(
                    index,
                    'personsInRoom',
                    v
                  )
                }
                keyboardType="numeric"
              />
            </View>
          </View>

          <Text style={styles.inputLabel}>
            Price per month (Rs.)
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 8000"
            placeholderTextColor={
              COLORS.textMuted
            }
            value={rt.price}
            onChangeText={(v) =>
              updateRoomType(index, 'price', v)
            }
            keyboardType="numeric"
          />

          {rt.type === 'SHARED_FULLROOM' && (
            <>
              <Text style={styles.inputLabel}>
                Full room discounted price
              </Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 28000"
                placeholderTextColor={
                  COLORS.textMuted
                }
                value={rt.fullRoomPriceDiscounted}
                onChangeText={(v) =>
                  updateRoomType(
                    index,
                    'fullRoomPriceDiscounted',
                    v
                  )
                }
                keyboardType="numeric"
              />
            </>
          )}
        </Card>
      ))}

      {roomTypes.length < 3 && (
        <TouchableOpacity
          style={styles.addBtn}
          onPress={addRoomType}
        >
          <Plus
            size={18}
            color={COLORS.primary}
          />
          <Text style={styles.addBtnText}>
            Add room type
          </Text>
        </TouchableOpacity>
      )}
    </>
  );

  const renderStep3 = () => (
    <>
      <Text style={styles.stepTitle}>
        Facilities
      </Text>
      <Text style={styles.stepDesc}>
        Update available facilities.
      </Text>

      <Card style={styles.facilityCard}>
        <View style={styles.facilityRow}>
          <View style={styles.facilityInfo}>
            <Droplets
              size={20}
              color={COLORS.info}
            />
            <Text style={styles.facilityText}>
              Hot/Cold water bath
            </Text>
          </View>
          <Switch
            value={facilities.hotColdWaterBath}
            onValueChange={(v) =>
              setFacilities({
                ...facilities,
                hotColdWaterBath: v,
              })
            }
            trackColor={{
              false: COLORS.border,
              true: COLORS.primary + '50',
            }}
            thumbColor={
              facilities.hotColdWaterBath
                ? COLORS.primary
                : COLORS.textMuted
            }
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.facilityRow}>
          <View style={styles.facilityInfo}>
            <Droplets
              size={20}
              color={COLORS.info}
            />
            <Text style={styles.facilityText}>
              Drinking water
            </Text>
          </View>
          <Switch
            value={facilities.drinkingWater}
            onValueChange={(v) =>
              setFacilities({
                ...facilities,
                drinkingWater: v,
              })
            }
            trackColor={{
              false: COLORS.border,
              true: COLORS.primary + '50',
            }}
            thumbColor={
              facilities.drinkingWater
                ? COLORS.primary
                : COLORS.textMuted
            }
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.facilityRow}>
          <View style={styles.facilityInfo}>
            <Zap
              size={20}
              color={COLORS.warning}
            />
            <Text style={styles.facilityText}>
              Electricity backup
            </Text>
          </View>
          <Switch
            value={facilities.electricityBackup}
            onValueChange={(v) =>
              setFacilities({
                ...facilities,
                electricityBackup: v,
              })
            }
            trackColor={{
              false: COLORS.border,
              true: COLORS.primary + '50',
            }}
            thumbColor={
              facilities.electricityBackup
                ? COLORS.primary
                : COLORS.textMuted
            }
          />
        </View>
      </Card>

      <Text style={styles.label}>
        Electricity billing
      </Text>
      <View style={styles.genderRow}>
        <TouchableOpacity
          style={[
            styles.genderOption,
            facilities.electricityType ===
              'INCLUDED' &&
              styles.genderOptionActive,
          ]}
          onPress={() =>
            setFacilities({
              ...facilities,
              electricityType: 'INCLUDED',
            })
          }
        >
          <Text
            style={[
              styles.genderText,
              facilities.electricityType ===
                'INCLUDED' &&
                styles.genderTextActive,
            ]}
          >
            Included
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.genderOption,
            facilities.electricityType ===
              'SELF' &&
              styles.genderOptionActive,
          ]}
          onPress={() =>
            setFacilities({
              ...facilities,
              electricityType: 'SELF',
            })
          }
        >
          <Text
            style={[
              styles.genderText,
              facilities.electricityType ===
                'SELF' &&
                styles.genderTextActive,
            ]}
          >
            Self (per unit)
          </Text>
        </TouchableOpacity>
      </View>

      {facilities.electricityType === 'SELF' && (
        <>
          <Text style={styles.inputLabel}>
            Rate per unit (Rs.)
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 35"
            placeholderTextColor={
              COLORS.textMuted
            }
            value={facilities.electricityRatePerUnit}
            onChangeText={(v) =>
              setFacilities({
                ...facilities,
                electricityRatePerUnit: v,
              })
            }
            keyboardType="numeric"
          />
        </>
      )}

      <Card style={styles.facilityCard}>
        <View style={styles.facilityRow}>
          <View style={styles.facilityInfo}>
            <Wifi
              size={20}
              color={COLORS.success}
            />
            <Text style={styles.facilityText}>
              WiFi available
            </Text>
          </View>
          <Switch
            value={facilities.wifiEnabled}
            onValueChange={(v) =>
              setFacilities({
                ...facilities,
                wifiEnabled: v,
              })
            }
            trackColor={{
              false: COLORS.border,
              true: COLORS.primary + '50',
            }}
            thumbColor={
              facilities.wifiEnabled
                ? COLORS.primary
                : COLORS.textMuted
            }
          />
        </View>

        {facilities.wifiEnabled && (
          <>
            <View style={styles.divider} />
            <TextInput
              style={styles.input}
              placeholder="WiFi plan"
              placeholderTextColor={
                COLORS.textMuted
              }
              value={facilities.wifiPlan}
              onChangeText={(v) =>
                setFacilities({
                  ...facilities,
                  wifiPlan: v,
                })
              }
            />
            <View style={styles.row}>
              <TextInput
                style={[
                  styles.input,
                  styles.halfInput,
                ]}
                placeholder="Max users"
                placeholderTextColor={
                  COLORS.textMuted
                }
                value={facilities.wifiMaxUsers}
                onChangeText={(v) =>
                  setFacilities({
                    ...facilities,
                    wifiMaxUsers: v,
                  })
                }
                keyboardType="numeric"
              />
              <TextInput
                style={[
                  styles.input,
                  styles.halfInput,
                ]}
                placeholder="Avg speed"
                placeholderTextColor={
                  COLORS.textMuted
                }
                value={facilities.wifiAvgSpeed}
                onChangeText={(v) =>
                  setFacilities({
                    ...facilities,
                    wifiAvgSpeed: v,
                  })
                }
              />
            </View>
          </>
        )}
      </Card>

      <Text style={styles.label}>
        Custom facilities
      </Text>
      {facilities.customFacilities.map(
        (facility, index) => (
          <View
            key={index}
            style={styles.inputRow}
          >
            <TextInput
              style={styles.rowInput}
              placeholder={`Facility ${index + 1}`}
              placeholderTextColor={
                COLORS.textMuted
              }
              value={facility}
              onChangeText={(v) =>
                updateCustomFacility(index, v)
              }
            />
            {facilities.customFacilities
              .length > 1 && (
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() =>
                  removeCustomFacility(index)
                }
              >
                <X
                  size={18}
                  color={COLORS.error}
                />
              </TouchableOpacity>
            )}
          </View>
        )
      )}
      <TouchableOpacity
        style={styles.addBtn}
        onPress={addCustomFacility}
      >
        <Plus
          size={18}
          color={COLORS.primary}
        />
        <Text style={styles.addBtnText}>
          Add facility
        </Text>
      </TouchableOpacity>
    </>
  );

  const renderStep4 = () => (
    <>
      <Text style={styles.stepTitle}>
        Room images
      </Text>
      <Text style={styles.stepDesc}>
        Update hostel photos.
      </Text>

      {existingImages.length > 0 && (
        <>
          <Text style={styles.label}>
            Current images
          </Text>
          <View style={styles.imagesGrid}>
            {existingImages.map(
              (uri, index) => (
                <View
                  key={`existing-${index}`}
                  style={styles.imageContainer}
                >
                  <Image
                    source={{ uri }}
                    style={styles.uploadedImage}
                  />
                  <TouchableOpacity
                    style={styles.removeImageBtn}
                    onPress={() =>
                      removeExistingImage(index)
                    }
                  >
                    <X
                      size={16}
                      color={COLORS.textInverse}
                    />
                  </TouchableOpacity>
                </View>
              )
            )}
          </View>
        </>
      )}

      <Text style={styles.label}>
        Add new images
      </Text>
      <View style={styles.imagesGrid}>
        {newImages.map((uri, index) => (
          <View
            key={`new-${index}`}
            style={styles.imageContainer}
          >
            <Image
              source={{ uri }}
              style={styles.uploadedImage}
            />
            <TouchableOpacity
              style={styles.removeImageBtn}
              onPress={() =>
                removeNewImage(index)
              }
            >
              <X
                size={16}
                color={COLORS.textInverse}
              />
            </TouchableOpacity>
          </View>
        ))}

        {existingImages.length + newImages.length <
          10 && (
          <TouchableOpacity
            style={styles.addImageBtn}
            onPress={pickImage}
          >
            <Camera
              size={32}
              color={COLORS.textMuted}
            />
            <Text style={styles.addImageText}>
              Add photo
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.imageHint}>
        Total:{' '}
        {existingImages.length +
          newImages.length}
        /10 images
      </Text>
    </>
  );

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'bottom']}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() =>
            step > 1 ? setStep(step - 1) : router.back()
          }
          style={styles.backButton}
        >
          <ArrowLeft
            size={24}
            color={COLORS.textPrimary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Edit hostel
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        {[1, 2, 3, 4].map((s) => (
          <View
            key={s}
            style={[
              styles.progressStep,
              s <= step && styles.progressStepActive,
              s < step && styles.progressStepComplete,
            ]}
          >
            {s < step ? (
              <Check
                size={14}
                color={COLORS.textInverse}
              />
            ) : (
              <Text
                style={[
                  styles.progressText,
                  s <= step &&
                    styles.progressTextActive,
                ]}
              >
                {s}
              </Text>
            )}
          </View>
        ))}
        <View style={styles.progressLine}>
          <View
            style={[
              styles.progressLineFill,
              {
                width: `${((step - 1) / 3) * 100}%`,
              },
            ]}
          />
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={
          Platform.OS === 'ios' ? 'padding' : 'height'
        }
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

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom actions */}
      <View style={styles.bottomBar}>
        {step < 4 ? (
          <Button
            title="Next"
            onPress={handleNext}
            style={styles.nextButton}
          />
        ) : (
          <Button
            title="Save changes"
            onPress={handleSubmit}
            loading={saving}
            style={styles.nextButton}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 30,
    position: 'relative',
  },
  progressStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.bgSecondary,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    marginHorizontal: 20,
  },
  progressStepActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '20',
  },
  progressStepComplete: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  progressTextActive: {
    color: COLORS.primary,
  },
  progressLine: {
    position: 'absolute',
    left: 60,
    right: 60,
    height: 3,
    backgroundColor: COLORS.border,
    top: '50%',
    marginTop: -1.5,
  },
  progressLineFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  stepDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
    marginTop: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: 6,
    marginTop: 12,
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
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  genderOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '15',
  },
  genderText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  genderTextActive: {
    color: COLORS.primary,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  rowInput: {
    flex: 1,
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  removeBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.error + '15',
    borderRadius: 10,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: COLORS.primary + '15',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
    borderStyle: 'dashed',
    marginTop: 8,
    marginBottom: 16,
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  roomTypeCard: {
    marginBottom: 16,
  },
  roomTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  roomTypeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textTransform: 'capitalize',
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typeChipActive: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  typeChipDisabled: {
    opacity: 0.5,
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  typeChipTextActive: {
    color: COLORS.primary,
  },
  typeChipTextDisabled: {
    color: COLORS.textMuted,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  facilityCard: {
    marginBottom: 16,
  },
  facilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  facilityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  imageContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageBtn: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: COLORS.bgSecondary,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  addImageText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  imageHint: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 24,
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 32,
    backgroundColor: COLORS.bgSecondary,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  nextButton: {
    height: 56,
  },
});