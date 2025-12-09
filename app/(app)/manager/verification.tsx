// app/(app)/manager/verification.tsx

import { COLORS, OPACITY } from '@/constants/colors';
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
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { verificationApi } from '@/api/verification';
import { Button, Input } from '@/components/ui';

export default function VerificationScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form state
  const [ownerName, setOwnerName] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [hostelFor, setHostelFor] = useState<'BOYS' | 'GIRLS'>('BOYS');
  const [initialHostelNames, setInitialHostelNames] = useState<string[]>(['']);
  const [buildingImages, setBuildingImages] = useState<string[]>([]);
  const [easypaisaNumber, setEasypaisaNumber] = useState('');
  const [jazzcashNumber, setJazzcashNumber] = useState('');
  const [customBanks, setCustomBanks] = useState<
    { bankName: string; accountNumber: string; iban: string }[]
  >([]);
  const [acceptedRules, setAcceptedRules] = useState(false);

  // Image handlers
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setBuildingImages((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    setBuildingImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Hostel names
  const addHostelName = () =>
    setInitialHostelNames((prev) => [...prev, '']);

  const updateHostelName = (index: number, value: string) => {
    const updated = [...initialHostelNames];
    updated[index] = value;
    setInitialHostelNames(updated);
  };

  const removeHostelName = (index: number) => {
    if (initialHostelNames.length > 1) {
      setInitialHostelNames((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Banks
  const addBank = () =>
    setCustomBanks((prev) => [...prev, { bankName: '', accountNumber: '', iban: '' }]);

  const updateBank = (
    index: number,
    field: keyof (typeof customBanks)[number],
    value: string
  ) => {
    const updated = [...customBanks];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setCustomBanks(updated);
  };

  const removeBank = (index: number) =>
    setCustomBanks((prev) => prev.filter((_, i) => i !== index));

  // Validation
  const showError = (msg: string) => {
    Toast.show({ type: 'error', text1: 'Error', text2: msg });
    return false;
  };

  const validateStep1 = () => {
    if (!ownerName.trim()) return showError('Owner name is required');
    if (!city.trim()) return showError('City is required');
    if (!address.trim()) return showError('Address is required');
    if (!initialHostelNames.filter((n) => n.trim()).length)
      return showError('At least one hostel name is required');
    return true;
  };

  const validateStep2 = () => {
    if (buildingImages.length === 0)
      return showError('At least one building image is required');
    return true;
  };

  const validateStep3 = () => {
    // Check if Easypaisa number is provided
    const hasEasypaisa = easypaisaNumber.trim().length > 0;
    
    // Check if JazzCash number is provided
    const hasJazzcash = jazzcashNumber.trim().length > 0;
    
    // Check if at least one valid bank account is provided (must have bankName AND accountNumber)
    const hasValidBank = customBanks.some(
      (bank) => bank.bankName.trim() && bank.accountNumber.trim()
    );

    // If none of the payment methods are provided, show error
    if (!hasEasypaisa && !hasJazzcash && !hasValidBank) {
      return showError('Need to add atleast one Bank Detail');
    }
    
    if (!acceptedRules) return showError('You must accept the rules');
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
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
          formData.append(`initialHostelNames[${index}]`, name.trim());
        });

      if (easypaisaNumber.trim())
        formData.append('easypaisaNumber', easypaisaNumber.trim());
      if (jazzcashNumber.trim())
        formData.append('jazzcashNumber', jazzcashNumber.trim());

      customBanks.forEach((bank, index) => {
        if (bank.bankName.trim() && bank.accountNumber.trim()) {
          formData.append(
            `customBanks[${index}][bankName]`,
            bank.bankName.trim()
          );
          formData.append(
            `customBanks[${index}][accountNumber]`,
            bank.accountNumber.trim()
          );
          if (bank.iban.trim())
            formData.append(`customBanks[${index}][iban]`, bank.iban.trim());
        }
      });

      buildingImages.forEach((uri, index) => {
        const filename = uri.split('/').pop() || `image${index}.jpg`;
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        formData.append(
          'buildingImages',
          { uri, name: filename, type } as any
        );
      });

      const response = await verificationApi.submit(formData);
      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Submitted',
          text2: 'Your verification is under review',
        });
        router.back();
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Failed to submit verification',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep((prev) => (prev - 1) as 1 | 2 | 3);
    else router.back();
  };

  // Step renderers (UI only)
  const renderStep1 = () => (
    <>
      <Text style={styles.stepTitle}>Basic Information</Text>
      <Text style={styles.stepDesc}>Provide your hostel ownership details.</Text>

      <Input
        label="Owner Name"
        placeholder="Enter owner's full name"
        leftIcon={<Building2 size={20} color={COLORS.textMuted} strokeWidth={1.5} />}
        value={ownerName}
        onChangeText={setOwnerName}
      />

      <Input
        label="City"
        placeholder="Enter city"
        leftIcon={<MapPin size={20} color={COLORS.textMuted} strokeWidth={1.5} />}
        value={city}
        onChangeText={setCity}
      />

      <Input
        label="Address"
        placeholder="Enter complete address"
        leftIcon={<MapPin size={20} color={COLORS.textMuted} strokeWidth={1.5} />}
        value={address}
        onChangeText={setAddress}
        multiline
      />

      <Text style={styles.label}>Hostel For</Text>
      <View style={styles.genderRow}>
        {(['BOYS', 'GIRLS'] as const).map((type) => (
          <Pressable
            key={type}
            style={({ pressed }) => [
              styles.genderOption,
              hostelFor === type && styles.genderOptionActive,
              pressed && { opacity: OPACITY.pressed },
            ]}
            onPress={() => setHostelFor(type)}
          >
            <Text
              style={[
                styles.genderText,
                hostelFor === type && styles.genderTextActive,
              ]}
            >
              {type === 'BOYS' ? 'Boys' : 'Girls'}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Hostel Name(s)</Text>
      {initialHostelNames.map((name, index) => (
        <View key={index} style={styles.hostelNameRow}>
          <TextInput
            style={styles.hostelNameInput}
            placeholder={`Hostel name ${index + 1}`}
            placeholderTextColor={COLORS.textMuted}
            value={name}
            onChangeText={(v) => updateHostelName(index, v)}
          />
          {initialHostelNames.length > 1 && (
            <Pressable
              style={({ pressed }) => [
                styles.removeButton,
                pressed && { opacity: OPACITY.pressed },
              ]}
              onPress={() => removeHostelName(index)}
            >
              <X size={18} color={COLORS.error} strokeWidth={1.5} />
            </Pressable>
          )}
        </View>
      ))}
      <Pressable
        style={({ pressed }) => [
          styles.addButton,
          pressed && { opacity: OPACITY.pressed },
        ]}
        onPress={addHostelName}
      >
        <Plus size={18} color={COLORS.primary} strokeWidth={1.5} />
        <Text style={styles.addButtonText}>Add another hostel</Text>
      </Pressable>
    </>
  );

  const renderStep2 = () => (
    <>
      <Text style={styles.stepTitle}>Building Images</Text>
      <Text style={styles.stepDesc}>
        Upload photos of your hostel building exterior.
      </Text>

      <View style={styles.imagesGrid}>
        {buildingImages.map((uri, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={{ uri }} style={styles.uploadedImage} />
            <Pressable
              style={({ pressed }) => [
                styles.removeImageButton,
                pressed && { opacity: OPACITY.pressed },
              ]}
              onPress={() => removeImage(index)}
            >
              <X size={14} color={COLORS.textInverse} strokeWidth={2} />
            </Pressable>
          </View>
        ))}

        {buildingImages.length < 5 && (
          <Pressable
            style={({ pressed }) => [
              styles.addImageButton,
              pressed && { opacity: OPACITY.pressed },
            ]}
            onPress={pickImage}
          >
            <Camera size={28} color={COLORS.textMuted} strokeWidth={1.5} />
            <Text style={styles.addImageText}>Add Photo</Text>
          </Pressable>
        )}
      </View>

      <Text style={styles.imageHint}>
        Upload 1–5 images of your building exterior.
      </Text>
    </>
  );

  const renderStep3 = () => (
    <>
      <Text style={styles.stepTitle}>Payment Methods</Text>
      <Text style={styles.stepDesc}>
        Add at least one payment method for receiving payments.
      </Text>

      <Input
        label="Easypaisa Number"
        placeholder="03XX XXXXXXX"
        leftIcon={<CreditCard size={20} color={COLORS.textMuted} strokeWidth={1.5} />}
        value={easypaisaNumber}
        onChangeText={setEasypaisaNumber}
        keyboardType="phone-pad"
      />

      <Input
        label="JazzCash Number"
        placeholder="03XX XXXXXXX"
        leftIcon={<CreditCard size={20} color={COLORS.textMuted} strokeWidth={1.5} />}
        value={jazzcashNumber}
        onChangeText={setJazzcashNumber}
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Bank Accounts</Text>
      {customBanks.map((bank, index) => (
        <View key={index} style={styles.bankCard}>
          <View style={styles.bankHeader}>
            <Text style={styles.bankTitle}>Bank {index + 1}</Text>
            <Pressable onPress={() => removeBank(index)}>
              <X size={18} color={COLORS.error} strokeWidth={1.5} />
            </Pressable>
          </View>
          <TextInput
            style={styles.bankInput}
            placeholder="Bank name"
            placeholderTextColor={COLORS.textMuted}
            value={bank.bankName}
            onChangeText={(v) => updateBank(index, 'bankName', v)}
          />
          <TextInput
            style={styles.bankInput}
            placeholder="Account number"
            placeholderTextColor={COLORS.textMuted}
            value={bank.accountNumber}
            onChangeText={(v) => updateBank(index, 'accountNumber', v)}
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.bankInput, { marginBottom: 0 }]}
            placeholder="IBAN (optional)"
            placeholderTextColor={COLORS.textMuted}
            value={bank.iban}
            onChangeText={(v) => updateBank(index, 'iban', v)}
          />
        </View>
      ))}
      <Pressable
        style={({ pressed }) => [
          styles.addButton,
          pressed && { opacity: OPACITY.pressed },
        ]}
        onPress={addBank}
      >
        <Plus size={18} color={COLORS.primary} strokeWidth={1.5} />
        <Text style={styles.addButtonText}>Add bank account</Text>
      </Pressable>

      {/* Info hint about required payment method */}
      <Text style={styles.paymentHint}>
        * At least one payment method (Easypaisa, JazzCash, or Bank Account) is required
      </Text>

      {/* Rules */}
      <View style={styles.rulesCard}>
        <Text style={styles.rulesTitle}>Platform Rules</Text>
        <Text style={styles.rulesText}>
          • You agree to provide accurate information{'\n'}
          • You will respond to bookings within 24 hours{'\n'}
          • You will maintain hostel standards{'\n'}
          • Platform fee applies on each booking{'\n'}
          • You agree to our terms and conditions
        </Text>

        <View style={styles.acceptRow}>
          <Switch
            value={acceptedRules}
            onValueChange={setAcceptedRules}
            trackColor={{ false: COLORS.border, true: COLORS.primary + '55' }}
            thumbColor={acceptedRules ? COLORS.primary : COLORS.textMuted}
          />
          <Text style={styles.acceptText}>I accept all rules and terms</Text>
        </View>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => [
            styles.backButton,
            pressed && { opacity: OPACITY.pressed },
          ]}
        >
          <ArrowLeft size={22} color={COLORS.textPrimary} strokeWidth={1.5} />
        </Pressable>
        <Text style={styles.headerTitle}>Verification</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressLine}>
          <View
            style={[
              styles.progressLineFill,
              { width: `${((step - 1) / 2) * 100}%` },
            ]}
          />
        </View>
        {[1, 2, 3].map((s) => {
          const isComplete = s < step;
          const isActive = s === step;
          return (
            <View
              key={s}
              style={[
                styles.progressStep,
                isActive && styles.progressStepActive,
                isComplete && styles.progressStepComplete,
              ]}
            >
              {isComplete ? (
                <Check
                  size={14}
                  color={COLORS.textInverse}
                  strokeWidth={2.5}
                />
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
          );
        })}
      </View>

      {/* Content: plain ScrollView, no KeyboardAvoidingView, no Animated */}
      <ScrollView
        style={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
        {step < 3 ? (
          <Button title="Continue" onPress={handleNext} />
        ) : (
          <Button
            title="Submit Verification"
            onPress={handleSubmit}
            loading={loading}
          />
        )}
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  headerSpacer: {
    width: 44,
  },

  // Progress
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 50,
    position: 'relative',
  },
  progressLine: {
    position: 'absolute',
    left: 80,
    right: 80,
    height: 3,
    backgroundColor: COLORS.borderLight,
    top: '50%',
    marginTop: -1.5,
  },
  progressLineFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  progressStep: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.bgCard,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    marginHorizontal: 28,
  },
  progressStepActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
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
    color: COLORS.textInverse,
  },

  // Step titles
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
    letterSpacing: -0.4,
  },
  stepDesc: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 28,
    lineHeight: 22,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: 10,
    marginTop: 8,
  },

  // Gender Selection
  genderRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  genderOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  genderText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  genderTextActive: {
    color: COLORS.primary,
  },

  // Hostel Names
  hostelNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  hostelNameInput: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: COLORS.textPrimary,
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
  },
  removeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.errorLight,
    borderRadius: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    marginTop: 8,
    marginBottom: 20,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },

  // Images
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
    borderRadius: 14,
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
    borderRadius: 14,
    backgroundColor: COLORS.bgCard,
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
    fontWeight: '500',
  },
  imageHint: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 24,
  },

  // Banks
  bankCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  bankHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  bankTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  bankInput: {
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: COLORS.textPrimary,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
  },

  // Payment hint
  paymentHint: {
    fontSize: 13,
    color: COLORS.warning,
    fontStyle: 'italic',
    marginBottom: 16,
  },

  // Rules
  rulesCard: {
    marginTop: 4,
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  rulesTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 14,
    letterSpacing: -0.2,
  },
  rulesText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 26,
    marginBottom: 18,
  },
  acceptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  acceptText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    flex: 1,
    fontWeight: '500',
  },

  // Bottom Bar
  bottomBar: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 32,
    backgroundColor: COLORS.bgPrimary,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
});