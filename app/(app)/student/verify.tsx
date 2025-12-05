import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { ArrowLeft, Building, MapPin, Phone, User } from 'lucide-react-native';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { z } from 'zod';

import { usersApi } from '@/api/users';
import { Button, Card, Input } from '@/components/ui';
import { COLORS } from '@/constants/colors';
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
  const { checkAuth } = useAuthStore();
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
        await checkAuth();

        Toast.show({
          type: 'success',
          text1: 'Verification complete',
          text2: 'You can now book hostels',
        });

        router.replace('/(app)/student');
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Verification failed',
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
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <ArrowLeft size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Self verification</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Card style={styles.formCard}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Your details</Text>
              <View style={styles.formDivider} />
            </View>

            <Text style={styles.description}>
              Please provide your details to complete verification. This
              information is shared with hostel managers when you book.
            </Text>

            {/* Father Name */}
            <Controller
              control={control}
              name="fatherName"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Father's name"
                  placeholder="Enter father's name"
                  leftIcon={<User size={20} color={COLORS.textMuted} />}
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
                  label="Institute / university"
                  placeholder="Enter institute name"
                  leftIcon={<Building size={20} color={COLORS.textMuted} />}
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
                  label="Permanent address"
                  placeholder="Enter your permanent address"
                  leftIcon={<MapPin size={20} color={COLORS.textMuted} />}
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
                  label="Phone number"
                  placeholder="03XX XXXXXXX"
                  leftIcon={<Phone size={20} color={COLORS.textMuted} />}
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
                  label="WhatsApp number"
                  placeholder="03XX XXXXXXX"
                  leftIcon={<Phone size={20} color={COLORS.textMuted} />}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.whatsappNumber?.message}
                  keyboardType="phone-pad"
                />
              )}
            />

            <Button
              title="Complete verification"
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              style={styles.button}
            />
          </Card>

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.bgPrimary,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  formCard: {
    padding: 20,
    borderRadius: 18,
  },
  formHeader: {
    marginBottom: 14,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  formDivider: {
    height: 2,
    width: 36,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 18,
  },
  button: {
    marginTop: 8,
  },
});