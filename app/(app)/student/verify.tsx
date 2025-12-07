// screens/VerifyScreen.tsx

import { COLORS, OPACITY } from '@/constants/colors';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { ArrowLeft, Building, MapPin, Phone, User } from 'lucide-react-native';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { z } from 'zod';

import { usersApi } from '@/api/users';
import { Button, Input } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';

const verifySchema = z.object({
  fatherName: z.string().min(1, "Father's name is required"),
  instituteName: z.string().min(1, 'Institute name is required'),
  permanentAddress: z.string().min(1, 'Permanent address is required'),
  phoneNumber: z.string().min(10, 'Valid phone number is required'),
  whatsappNumber: z.string().min(10, 'Valid WhatsApp number is required'),
});

type VerifyFormData = z.infer<typeof verifySchema>;

export default function VerifyScreen() {
  const router = useRouter();
  const { setUser, user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyFormData>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      fatherName: '',
      instituteName: '',
      permanentAddress: '',
      phoneNumber: '',
      whatsappNumber: '',
    },
  });

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(app)/student');
    }
  };

  const onSubmit = async (data: VerifyFormData) => {
    try {
      setLoading(true);
      const response = await usersApi.selfVerify(data);

      if (response.success) {
        if (user) {
          const newUser = {
            ...user,
            studentProfile: {
              ...user.studentProfile,
              selfVerified: true,
            },
          };
          // @ts-ignore
          setUser(newUser);
        }

        Toast.show({
          type: 'success',
          text1: 'Verification Complete',
          text2: 'You can now book hostels',
        });

        router.replace('/(app)/student');
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Verification Failed',
        text2: error?.response?.data?.message || 'Something went wrong',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={handleGoBack}
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

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {/* Intro Section */}
          <View style={styles.introSection}>
            <Text style={styles.introTitle}>Complete Your Profile</Text>
            <Text style={styles.introDesc}>
              Please provide your details to verify your account. This information 
              will be shared with hostel managers when you make a booking.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formSection}>
            {/* Father Name */}
            <Controller
              control={control}
              name="fatherName"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Father's Name"
                  placeholder="Enter father's name"
                  leftIcon={<User size={20} color={COLORS.textMuted} strokeWidth={1.5} />}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.fatherName?.message}
                />
              )}
            />

            {/* Institute */}
            <Controller
              control={control}
              name="instituteName"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Institute / University"
                  placeholder="Enter institute name"
                  leftIcon={<Building size={20} color={COLORS.textMuted} strokeWidth={1.5} />}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.instituteName?.message}
                />
              )}
            />

            {/* Address */}
            <Controller
              control={control}
              name="permanentAddress"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Permanent Address"
                  placeholder="Enter your permanent address"
                  leftIcon={<MapPin size={20} color={COLORS.textMuted} strokeWidth={1.5} />}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.permanentAddress?.message}
                  multiline
                />
              )}
            />

            {/* Phone */}
            <Controller
              control={control}
              name="phoneNumber"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Phone Number"
                  placeholder="03XX XXXXXXX"
                  leftIcon={<Phone size={20} color={COLORS.textMuted} strokeWidth={1.5} />}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.phoneNumber?.message}
                  keyboardType="phone-pad"
                />
              )}
            />

            {/* WhatsApp */}
            <Controller
              control={control}
              name="whatsappNumber"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="WhatsApp Number"
                  placeholder="03XX XXXXXXX"
                  leftIcon={<Phone size={20} color={COLORS.textMuted} strokeWidth={1.5} />}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.whatsappNumber?.message}
                  keyboardType="phone-pad"
                />
              )}
            />

            {/* Submit Button */}
            <View style={styles.buttonContainer}>
              <Button
                title="Complete Verification"
                onPress={handleSubmit(onSubmit)}
                loading={loading}
              />
            </View>

            {/* Note */}
            <View style={styles.noteBox}>
              <Text style={styles.noteText}>
                Your information is securely stored and only shared with hostel 
                managers for booking purposes.
              </Text>
            </View>
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  
  // Content
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  
  // Intro Section
  introSection: {
    marginBottom: 28,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 10,
    letterSpacing: -0.4,
  },
  introDesc: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  
  // Form Section
  formSection: {
    flex: 1,
  },
  buttonContainer: {
    marginTop: 8,
  },
  
  // Note Box
  noteBox: {
    marginTop: 20,
    padding: 16,
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 12,
  },
  noteText: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 20,
    textAlign: 'center',
  },
});