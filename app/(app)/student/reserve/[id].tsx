import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Check } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { hostelsApi } from '@/api/hostels';
import { reservationsApi } from '@/api/reservations';
import { Button, Card, LoadingScreen } from '@/components/ui';
import { COLORS } from '@/constants/colors';
import { Hostel } from '@/types';

export default function ReserveScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hostel, setHostel] = useState<Hostel | null>(null);
  const [selectedRoomType, setSelectedRoomType] = useState<string | null>(null);
  const [message, setMessage] = useState('');

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
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Failed to fetch hostel',
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
        type: 'error',
        text1: 'Error',
        text2: 'Please select a room type',
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
          type: 'success',
          text1: 'Reservation sent!',
          text2: 'The manager will review your request',
        });
        router.back();
        router.push('/(app)/student/reservations');
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2:
          error?.response?.data?.message ||
          'Failed to create reservation',
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
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reserve hostel</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
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
          {hostel.roomTypes?.map((roomType) => (
            <TouchableOpacity
              key={roomType.id}
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
                    <Text style={styles.roomTypePriceLabel}>/month</Text>
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

          {/* Message */}
          <Text style={styles.sectionTitle}>Message (optional)</Text>
          <TextInput
            style={styles.messageInput}
            placeholder="Write a message to the manager..."
            placeholderTextColor={COLORS.textMuted}
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Submit Button */}
      <View style={styles.bottomBar}>
        <Button
          title="Send reservation request"
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
  scrollContent: {
    flexGrow: 1,
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
  messageInput: {
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 120,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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