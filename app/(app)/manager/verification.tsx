import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Building2,
  Camera,
  Check,
  CreditCard,
  MapPin,
  Plus,
  X,
} from 'lucide-react-native';
import React, { useState } from 'react';
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

import { verificationApi } from '@/api/verification';
import { Button, Card, Input } from '@/components/ui';
import { COLORS } from '@/constants/colors';

export default function VerificationScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Form state
  const [ownerName, setOwnerName] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [hostelFor, setHostelFor] = useState<'BOYS' | 'GIRLS'>(
    'BOYS'
  );
  const [initialHostelNames, setInitialHostelNames] = useState<
    string[]
  >(['']);
  const [buildingImages, setBuildingImages] = useState<string[]>(
    []
  );
  const [easypaisaNumber, setEasypaisaNumber] =
    useState('');
  const [jazzcashNumber, setJazzcashNumber] =
    useState('');
  const [customBanks, setCustomBanks] = useState<
    { bankName: string; accountNumber: string; iban: string }[]
  >([]);
  const [acceptedRules, setAcceptedRules] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes:
        ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setBuildingImages([
        ...buildingImages,
        result.assets[0].uri,
      ]);
    }
  };

  const removeImage = (index: number) => {
    setBuildingImages(
      buildingImages.filter((_, i) => i !== index)
    );
  };

  const addHostelName = () => {
    setInitialHostelNames([...initialHostelNames, '']);
  };

  const updateHostelName = (
    index: number,
    value: string
  ) => {
    const updated = [...initialHostelNames];
    updated[index] = value;
    setInitialHostelNames(updated);
  };

  const removeHostelName = (index: number) => {
    if (initialHostelNames.length > 1) {
      setInitialHostelNames(
        initialHostelNames.filter((_, i) => i !== index)
      );
    }
  };

  const addBank = () => {
    setCustomBanks([
      ...customBanks,
      { bankName: '', accountNumber: '', iban: '' },
    ]);
  };

  const updateBank = (
    index: number,
    field: string,
    value: string
  ) => {
    const updated = [...customBanks];
    (updated[index] as any)[field] = value;
    setCustomBanks(updated);
  };

  const removeBank = (index: number) => {
    setCustomBanks(
      customBanks.filter((_, i) => i !== index)
    );
  };

  const validateStep1 = () => {
    if (!ownerName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Owner name is required',
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
    const validNames = initialHostelNames.filter((n) =>
      n.trim()
    );
    if (validNames.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2:
          'At least one hostel name is required',
      });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (buildingImages.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2:
          'At least one building image is required',
      });
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (
      !easypaisaNumber.trim() &&
      !jazzcashNumber.trim() &&
      customBanks.length === 0
    ) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2:
          'At least one payment method is required',
      });
      return false;
    }
    if (!acceptedRules) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'You must accept the rules',
      });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('ownerName', ownerName.trim());
      formData.append('city', city.trim());
      formData.append('address', address.trim());
      formData.append('hostelFor', hostelFor);
      formData.append('acceptedRules', 'true');

      initialHostelNames
        .filter((n) => n.trim())
        .forEach((name, index) => {
          formData.append(
            `initialHostelNames[${index}]`,
            name.trim()
          );
        });

      if (easypaisaNumber.trim()) {
        formData.append(
          'easypaisaNumber',
          easypaisaNumber.trim()
        );
      }
      if (jazzcashNumber.trim()) {
        formData.append(
          'jazzcashNumber',
          jazzcashNumber.trim()
        );
      }

      customBanks.forEach((bank, index) => {
        if (
          bank.bankName.trim() &&
          bank.accountNumber.trim()
        ) {
          formData.append(
            `customBanks[${index}][bankName]`,
            bank.bankName.trim()
          );
          formData.append(
            `customBanks[${index}][accountNumber]`,
            bank.accountNumber.trim()
          );
          if (bank.iban.trim()) {
            formData.append(
              `customBanks[${index}][iban]`,
              bank.iban.trim()
            );
          }
        }
      });

      buildingImages.forEach((uri, index) => {
        const filename =
          uri.split('/').pop() || `image${index}.jpg`;
        const match = /\.(\w+)$/.exec(filename);
        const type = match
          ? `image/${match[1]}`
          : 'image/jpeg';
        formData.append('buildingImages', {
          uri,
          name: filename,
          type,
        } as any);
      });

      const response = await verificationApi.submit(
        formData
      );

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Verification submitted!',
          text2: 'Your verification is under review',
        });
        router.back();
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2:
          error?.response?.data?.message ||
          'Failed to submit verification',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <>
      <Text style={styles.stepTitle}>
        Basic information
      </Text>
      <Text style={styles.stepDesc}>
        Provide your hostel ownership details.
      </Text>

      <Input
        label="Owner name"
        placeholder="Enter owner's full name"
        leftIcon={
          <Building2
            size={20}
            color={COLORS.textMuted}
          />
        }
        value={ownerName}
        onChangeText={setOwnerName}
      />

      <Input
        label="City"
        placeholder="Enter city"
        leftIcon={
          <MapPin size={20} color={COLORS.textMuted} />
        }
        value={city}
        onChangeText={setCity}
      />

      <Input
        label="Address"
        placeholder="Enter complete address"
        leftIcon={
          <MapPin size={20} color={COLORS.textMuted} />
        }
        value={address}
        onChangeText={setAddress}
        multiline
      />

      {/* Hostel For */}
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

      {/* Initial Hostel Names */}
      <Text style={styles.label}>Hostel name(s)</Text>
      {initialHostelNames.map((name, index) => (
        <View
          key={index}
          style={styles.hostelNameRow}
        >
          <TextInput
            style={styles.hostelNameInput}
            placeholder={`Hostel name ${index + 1}`}
            placeholderTextColor={COLORS.textMuted}
            value={name}
            onChangeText={(v) =>
              updateHostelName(index, v)
            }
          />
          {initialHostelNames.length > 1 && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeHostelName(index)}
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
        style={styles.addButton}
        onPress={addHostelName}
      >
        <Plus
          size={18}
          color={COLORS.primary}
        />
        <Text style={styles.addButtonText}>
          Add another hostel
        </Text>
      </TouchableOpacity>
    </>
  );

  const renderStep2 = () => (
    <>
      <Text style={styles.stepTitle}>
        Building images
      </Text>
      <Text style={styles.stepDesc}>
        Upload photos of your hostel building.
      </Text>

      <View style={styles.imagesGrid}>
        {buildingImages.map((uri, index) => (
          <View
            key={index}
            style={styles.imageContainer}
          >
            <Image
              source={{ uri }}
              style={styles.uploadedImage}
            />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => removeImage(index)}
            >
              <X
                size={16}
                color={COLORS.textInverse}
              />
            </TouchableOpacity>
          </View>
        ))}

        {buildingImages.length < 5 && (
          <TouchableOpacity
            style={styles.addImageButton}
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
        Upload 1–5 images of your building
        exterior.
      </Text>
    </>
  );

  const renderStep3 = () => (
    <>
      <Text style={styles.stepTitle}>
        Payment methods
      </Text>
      <Text style={styles.stepDesc}>
        Add at least one payment method.
      </Text>

      <Input
        label="Easypaisa number (optional)"
        placeholder="03XX XXXXXXX"
        leftIcon={
          <CreditCard
            size={20}
            color={COLORS.textMuted}
          />
        }
        value={easypaisaNumber}
        onChangeText={setEasypaisaNumber}
        keyboardType="phone-pad"
      />

      <Input
        label="JazzCash number (optional)"
        placeholder="03XX XXXXXXX"
        leftIcon={
          <CreditCard
            size={20}
            color={COLORS.textMuted}
          />
        }
        value={jazzcashNumber}
        onChangeText={setJazzcashNumber}
        keyboardType="phone-pad"
      />

      {/* Custom Banks */}
      <Text style={styles.label}>
        Bank accounts (optional)
      </Text>
      {customBanks.map((bank, index) => (
        <Card
          key={index}
          style={styles.bankCard}
        >
          <View style={styles.bankHeader}>
            <Text style={styles.bankTitle}>
              Bank {index + 1}
            </Text>
            <TouchableOpacity
              onPress={() => removeBank(index)}
            >
              <X
                size={18}
                color={COLORS.error}
              />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.bankInput}
            placeholder="Bank name"
            placeholderTextColor={COLORS.textMuted}
            value={bank.bankName}
            onChangeText={(v) =>
              updateBank(index, 'bankName', v)
            }
          />
          <TextInput
            style={styles.bankInput}
            placeholder="Account number"
            placeholderTextColor={COLORS.textMuted}
            value={bank.accountNumber}
            onChangeText={(v) =>
              updateBank(index, 'accountNumber', v)
            }
            keyboardType="numeric"
          />
          <TextInput
            style={styles.bankInput}
            placeholder="IBAN (optional)"
            placeholderTextColor={COLORS.textMuted}
            value={bank.iban}
            onChangeText={(v) =>
              updateBank(index, 'iban', v)
            }
          />
        </Card>
      ))}
      <TouchableOpacity
        style={styles.addButton}
        onPress={addBank}
      >
        <Plus
          size={18}
          color={COLORS.primary}
        />
        <Text style={styles.addButtonText}>
          Add bank account
        </Text>
      </TouchableOpacity>

      {/* Rules */}
      <Card style={styles.rulesCard}>
        <Text style={styles.rulesTitle}>
          Platform rules
        </Text>
        <Text style={styles.rulesText}>
          • You agree to provide accurate
          information{'\n'}
          • You will respond to bookings within 24
          hours{'\n'}
          • You will maintain hostel
          standards{'\n'}
          • Platform fee of 5% applies on each
          booking{'\n'}
          • You agree to our terms and conditions
        </Text>

        <View style={styles.acceptRow}>
          <Switch
            value={acceptedRules}
            onValueChange={setAcceptedRules}
            trackColor={{
              false: COLORS.border,
              true: COLORS.primary + '50',
            }}
            thumbColor={
              acceptedRules
                ? COLORS.primary
                : COLORS.textMuted
            }
          />
          <Text style={styles.acceptText}>
            I accept all rules and terms
          </Text>
        </View>
      </Card>
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
          <ArrowLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Verification
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        {[1, 2, 3].map((s) => (
          <View
            key={s}
            style={[
              styles.progressStep,
              s <= step &&
                styles.progressStepActive,
              s < step &&
                styles.progressStepComplete,
            ]}
          >
            {s < step ? (
              <Check
                size={16}
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
                width: `${((step - 1) / 2) * 100}%`,
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

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
        {step < 3 ? (
          <Button
            title="Next"
            onPress={handleNext}
            style={styles.nextButton}
          />
        ) : (
          <Button
            title="Submit verification"
            onPress={handleSubmit}
            loading={loading}
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
    paddingHorizontal: 40,
    position: 'relative',
  },
  progressStep: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.bgSecondary,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    marginHorizontal: 30,
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
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  progressTextActive: {
    color: COLORS.primary,
  },
  progressLine: {
    position: 'absolute',
    left: 70,
    right: 70,
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
  hostelNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  hostelNameInput: {
    flex: 1,
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  removeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.error + '15',
    borderRadius: 10,
  },
  addButton: {
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
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
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
  removeImageButton: {
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
  addImageButton: {
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
  bankCard: {
    marginBottom: 12,
  },
  bankHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bankTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  bankInput: {
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rulesCard: {
    marginTop: 16,
    marginBottom: 24,
  },
  rulesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  rulesText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginBottom: 16,
  },
  acceptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  acceptText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    flex: 1,
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