// app/(app)/student/book/[id].tsx

import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    ArrowLeft,
    Calendar,
    Camera,
    Check,
    Clock,
    CreditCard,
    X,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    Image,
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

import { bookingsApi } from '@/api/bookings';
import { hostelsApi } from '@/api/hostels';
import { Button, Card, Input, LoadingScreen } from '@/components/ui';
import { COLORS } from '@/constants/colors';
import { Hostel } from '@/types';

export default function BookHostelScreen() {
  const router = useRouter();
  const { id, roomType: preselectedRoomType, reservationId } = useLocalSearchParams<{
    id: string;
    roomType?: string;
    reservationId?: string;
  }>();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hostel, setHostel] = useState<Hostel | null>(null);

  // Form state
  const [selectedRoomType, setSelectedRoomType] = useState<string>(
    preselectedRoomType || ''
  );
  const [transactionImage, setTransactionImage] = useState<string | null>(
    null
  );
  const [transactionDate, setTransactionDate] = useState('');
  const [transactionTime, setTransactionTime] = useState('');
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');

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
        type: 'error',
        text1: 'Error',
        text2:
          error?.response?.data?.message || 'Failed to fetch hostel',
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
        type: 'error',
        text1: 'Error',
        text2: 'Select a room type',
      });
      return false;
    }
    if (!transactionImage) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Upload payment screenshot',
      });
      return false;
    }
    if (!transactionDate.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Enter transaction date',
      });
      return false;
    }
    if (!transactionTime.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Enter transaction time',
      });
      return false;
    }
    if (!fromAccount.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Enter sender account',
      });
      return false;
    }
    if (!toAccount.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Enter receiver account',
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
      formData.append('hostelId', id);
      formData.append('roomType', selectedRoomType);
      formData.append('transactionDate', transactionDate.trim());
      formData.append('transactionTime', transactionTime.trim());
      formData.append('fromAccount', fromAccount.trim());
      formData.append('toAccount', toAccount.trim());

      if (reservationId) {
        formData.append('reservationId', reservationId);
      }

      if (transactionImage) {
        const filename = transactionImage.split('/').pop() || 'payment.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('transactionImage', {
          uri: transactionImage,
          name: filename,
          type,
        } as any);
      }

      const response = await bookingsApi.create(formData);

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Booking submitted!',
          text2: 'Manager will review your payment',
        });
        router.back();
        router.push('/(app)/student/bookings');
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2:
          error?.response?.data?.message ||
          'Failed to submit booking',
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
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book hostel</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
      >
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hostel Info */}
          <Card style={styles.hostelCard}>
            <Text style={styles.hostelName}>{hostel.hostelName}</Text>
            <Text style={styles.hostelLocation}>
              {hostel.city}, {hostel.address}
            </Text>
          </Card>

          {/* Room Type Selection */}
          <Text style={styles.sectionTitle}>Select room type</Text>
          {hostel.roomTypes?.map((roomType, index) => (
            <TouchableOpacity
              key={roomType.id ?? `${roomType.type}-${index}`}
              activeOpacity={0.8}
              onPress={() => setSelectedRoomType(roomType.type)}
            >
              <Card
                style={[
                  styles.roomTypeCard,
                  selectedRoomType === roomType.type &&
                    styles.roomTypeCardSelected,
                ]}
              >
                <View style={styles.roomTypeHeader}>
                  <View>
                    <Text style={styles.roomTypeName}>
                      {roomType.type.replace('_', ' ')}
                    </Text>
                    <Text style={styles.roomTypeDetail}>
                      {roomType.personsInRoom} person(s) •{' '}
                      {roomType.availableRooms} available
                    </Text>
                  </View>
                  <View style={styles.roomTypeRight}>
                    <Text style={styles.roomTypePrice}>
                      Rs. {roomType.price.toLocaleString()}
                    </Text>
                    <Text style={styles.roomTypePriceLabel}>
                      /month
                    </Text>
                  </View>
                </View>

                {selectedRoomType === roomType.type && (
                  <View style={styles.checkIcon}>
                    <Check size={20} color={COLORS.textInverse} />
                  </View>
                )}
              </Card>
            </TouchableOpacity>
          ))}

          {/* Payment Details */}
          <Text style={styles.sectionTitle}>Payment details</Text>

          {selectedRoom && (
            <Card style={styles.paymentInfoCard}>
              <Text style={styles.paymentLabel}>Amount to pay</Text>
              <Text style={styles.paymentAmount}>
                Rs. {selectedRoom.price.toLocaleString()}
              </Text>
              <Text style={styles.paymentNote}>
                Pay to manager&apos;s account and upload screenshot.
              </Text>
            </Card>
          )}

          {/* Transaction Image */}
          <Text style={styles.label}>Payment screenshot *</Text>
          {transactionImage ? (
            <View style={styles.imagePreview}>
              <Image
                source={{ uri: transactionImage }}
                style={styles.previewImage}
              />
              <TouchableOpacity
                style={styles.removeImageBtn}
                onPress={() => setTransactionImage(null)}
              >
                <X size={20} color={COLORS.textInverse} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={pickImage}
            >
              <Camera size={32} color={COLORS.textMuted} />
              <Text style={styles.uploadText}>
                Upload payment screenshot
              </Text>
            </TouchableOpacity>
          )}

          {/* Transaction Details */}
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input
                label="Transaction date *"
                placeholder="e.g., 2024-01-15"
                leftIcon={
                  <Calendar size={18} color={COLORS.textMuted} />
                }
                value={transactionDate}
                onChangeText={setTransactionDate}
              />
            </View>
            <View style={styles.halfInput}>
              <Input
                label="Transaction time *"
                placeholder="e.g., 14:30"
                leftIcon={<Clock size={18} color={COLORS.textMuted} />}
                value={transactionTime}
                onChangeText={setTransactionTime}
              />
            </View>
          </View>

          <Input
            label="From account (your account) *"
            placeholder="e.g., 0300-1234567"
            leftIcon={
              <CreditCard size={18} color={COLORS.textMuted} />
            }
            value={fromAccount}
            onChangeText={setFromAccount}
          />

          <Input
            label="To account (manager's account) *"
            placeholder="e.g., 0321-9876543"
            leftIcon={
              <CreditCard size={18} color={COLORS.textMuted} />
            }
            value={toAccount}
            onChangeText={setToAccount}
          />

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
        <Button
          title="Submit booking"
          onPress={handleSubmit}
          loading={submitting}
          style={styles.submitButton}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.bgPrimary,
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
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  hostelCard: {
    marginBottom: 24,
  },
  hostelName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  hostelLocation: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
    marginTop: 8,
  },
  roomTypeCard: {
    marginBottom: 12,
    position: 'relative',
  },
  roomTypeCardSelected: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    backgroundColor: COLORS.primary + '10',
  },
  roomTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomTypeName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  roomTypeDetail: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  roomTypeRight: {
    alignItems: 'flex-end',
  },
  roomTypePrice: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  roomTypePriceLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  checkIcon: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentInfoCard: {
    marginBottom: 24,
    alignItems: 'center',
    backgroundColor: COLORS.success + '15',
    borderColor: COLORS.success + '30',
  },
  paymentLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  paymentAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.success,
    marginBottom: 8,
  },
  paymentNote: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  uploadButton: {
    height: 150,
    borderRadius: 12,
    backgroundColor: COLORS.bgSecondary,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  uploadText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  imagePreview: {
    position: 'relative',
    marginBottom: 16,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
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
  submitButton: {
    height: 56,
  },
});