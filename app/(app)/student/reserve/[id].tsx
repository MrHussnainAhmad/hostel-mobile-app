// app/(app)/student/reserve/[id].tsx

import { COLORS, OPACITY } from '@/constants/colors';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Check } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { hostelsApi } from '@/api/hostels';
import { reservationsApi } from '@/api/reservations';
import { Button, LoadingScreen } from '@/components/ui';
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
          text1: 'Reservation Sent',
          text2: 'The manager will review your request',
        });
        router.back();
        router.push('/(app)/student/reservations');
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Failed to create reservation',
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
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            pressed && { opacity: OPACITY.pressed },
          ]}
        >
          <ArrowLeft size={22} color={COLORS.textPrimary} strokeWidth={1.5} />
        </Pressable>
        <Text style={styles.headerTitle}>Reserve Hostel</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {/* Hostel Info */}
          <View style={styles.hostelCard}>
            <Text style={styles.hostelName}>{hostel.hostelName}</Text>
            <Text style={styles.hostelLocation}>
              {hostel.city}, {hostel.address}
            </Text>
          </View>

          {/* Info Note */}
          <View style={styles.infoNote}>
            <Text style={styles.infoNoteText}>
              Send a reservation request to the manager. Once accepted, you can proceed with booking and payment.
            </Text>
          </View>

          {/* Room Type Selection */}
          <Text style={styles.sectionTitle}>Select Room Type</Text>
          
          {hostel.roomTypes?.map((roomType, index) => {
            const isSelected = selectedRoomType === roomType.type;
            
            return (
              <Pressable
                key={roomType.id ?? `${roomType.type}-${index}`}
                style={({ pressed }) => [
                  styles.roomTypeCard,
                  isSelected && styles.roomTypeCardSelected,
                  pressed && { opacity: OPACITY.pressed },
                ]}
                onPress={() => setSelectedRoomType(roomType.type)}
              >
                <View style={styles.roomTypeContent}>
                  <View style={styles.roomTypeLeft}>
                    <Text style={[
                      styles.roomTypeName,
                      isSelected && styles.roomTypeNameSelected,
                    ]}>
                      {roomType.type.replace('_', ' ')}
                    </Text>
                    <Text style={styles.roomTypeDetail}>
                      {roomType.personsInRoom} person(s) • {roomType.availableRooms} available
                    </Text>
                  </View>
                  
                  <View style={styles.roomTypeRight}>
                    <Text style={[
                      styles.roomTypePrice,
                      isSelected && styles.roomTypePriceSelected,
                    ]}>
                      Rs. {roomType.price.toLocaleString()}
                    </Text>
                    <Text style={styles.roomTypePriceLabel}>/month</Text>
                  </View>
                </View>

                {/* Check Icon */}
                {isSelected && (
                  <View style={styles.checkIcon}>
                    <Check size={14} color={COLORS.textInverse} strokeWidth={2.5} />
                  </View>
                )}
              </Pressable>
            );
          })}

          {/* Message */}
          <Text style={styles.sectionTitle}>Message to Manager</Text>
          <Text style={styles.sectionSubtitle}>Optional - introduce yourself or ask questions</Text>
          
          <TextInput
            style={styles.messageInput}
            placeholder="Hi, I'm interested in this hostel..."
            placeholderTextColor={COLORS.inputPlaceholder}
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            selectionColor={COLORS.primary}
          />

          <View style={{ height: 120 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Action */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomContent}>
          {selectedRoomType && (
            <View style={styles.selectedInfo}>
              <Text style={styles.selectedLabel}>Selected:</Text>
              <Text style={styles.selectedValue}>
                {selectedRoomType.replace('_', ' ')}
              </Text>
            </View>
          )}
          <Button
            title="Send Request"
            onPress={handleSubmit}
            loading={submitting}
          />
        </View>
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
    padding: 20,
  },

  // Hostel Card
  hostelCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  hostelName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  hostelLocation: {
    fontSize: 14,
    color: COLORS.textMuted,
  },

  // Info Note
  infoNote: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 28,
  },
  infoNoteText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  // Section
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 14,
  },

  // Room Type Card
  roomTypeCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 18,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    position: 'relative',
  },
  roomTypeCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  roomTypeContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomTypeLeft: {
    flex: 1,
    marginRight: 16,
  },
  roomTypeName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  roomTypeNameSelected: {
    color: COLORS.primaryDark,
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
    color: COLORS.textPrimary,
  },
  roomTypePriceSelected: {
    color: COLORS.primary,
  },
  roomTypePriceLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  checkIcon: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    // Subtle shadow
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },

  // Message Input
  messageInput: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    color: COLORS.textPrimary,
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
    minHeight: 120,
    lineHeight: 22,
  },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.bgPrimary,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  bottomContent: {
    gap: 14,
  },
  selectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  selectedLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  selectedValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    textTransform: 'capitalize',
  },
});