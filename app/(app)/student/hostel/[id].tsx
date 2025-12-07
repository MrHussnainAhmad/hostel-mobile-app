// app/(app)/student/hostel/[id].tsx

import { COLORS, OPACITY } from '@/constants/colors';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Check,
  CreditCard,
  Droplets,
  Heart,
  MapPin,
  MessageCircle,
  Share2,
  Star,
  Users,
  Wifi,
  Zap,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { chatApi } from '@/api/chat';
import { hostelsApi } from '@/api/hostels';
import { LoadingScreen } from '@/components/ui';
import { Hostel } from '@/types';

const { width } = Dimensions.get('window');

export default function HostelDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hostel, setHostel] = useState<Hostel | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [startingChat, setStartingChat] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    fetchHostel();
  }, [id]);

  const fetchHostel = async () => {
    try {
      const response = await hostelsApi.getById(id);
      if (response.success) {
        setHostel(response.data);
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Failed to fetch hostel',
      });
      handleGoBack();
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(app)/student/search');
    }
  };

  const handleStartChat = async () => {
    if (!hostel?.manager?.id) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Manager not available for chat' });
      return;
    }

    try {
      setStartingChat(true);
      const response = await chatApi.startConversation(hostel.manager.id);
      if (response.success) {
        router.push(`/(app)/student/conversation/${response.data.id}`);
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Failed to start chat',
      });
    } finally {
      setStartingChat(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!hostel) {
    return null;
  }

  const facilities = hostel.facilities;
  const minPrice = Math.min(...(hostel.roomTypes?.map((rt) => rt.price) || [0]));
  const totalRooms = hostel.roomTypes?.reduce((acc, rt) => acc + rt.availableRooms, 0) || 0;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Image */}
        <View style={styles.heroSection}>
          {hostel.roomImages && hostel.roomImages.length > 0 ? (
            <>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={(e) => {
                  const index = Math.round(e.nativeEvent.contentOffset.x / width);
                  setActiveImageIndex(index);
                }}
                scrollEventThrottle={16}
              >
                {hostel.roomImages.map((image, index) => (
                  <Image
                    key={`image-${index}`}
                    source={{ uri: image }}
                    style={styles.heroImage}
                  />
                ))}
              </ScrollView>

              {/* Image Counter */}
              <View style={styles.imageCounter}>
                <Text style={styles.imageCounterText}>
                  {activeImageIndex + 1}/{hostel.roomImages.length}
                </Text>
              </View>

              {/* Indicators */}
              <View style={styles.indicators}>
                {hostel.roomImages.map((_, index) => (
                  <View
                    key={`indicator-${index}`}
                    style={[
                      styles.indicator,
                      activeImageIndex === index && styles.indicatorActive,
                    ]}
                  />
                ))}
              </View>
            </>
          ) : (
            <View style={styles.heroPlaceholder}>
              <Building2 size={64} color={COLORS.textMuted} strokeWidth={1} />
              <Text style={styles.placeholderText}>No images available</Text>
            </View>
          )}

          {/* Header Buttons */}
          <View style={styles.headerButtons}>
            <Pressable
              style={({ pressed }) => [styles.headerBtn, pressed && { opacity: OPACITY.pressed }]}
              onPress={handleGoBack}
            >
              <ArrowLeft size={22} color={COLORS.textInverse} strokeWidth={1.5} />
            </Pressable>

            <View style={styles.headerRight}>
              <Pressable
                style={({ pressed }) => [styles.headerBtn, pressed && { opacity: OPACITY.pressed }]}
              >
                <Share2 size={20} color={COLORS.textInverse} strokeWidth={1.5} />
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.headerBtn, pressed && { opacity: OPACITY.pressed }]}
                onPress={() => setLiked(!liked)}
              >
                <Heart
                  size={20}
                  color={liked ? COLORS.error : COLORS.textInverse}
                  fill={liked ? COLORS.error : 'transparent'}
                  strokeWidth={1.5}
                />
              </Pressable>
            </View>
          </View>

          {/* Badge */}
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>{hostel.hostelFor}</Text>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Title Section */}
          <View style={styles.titleSection}>
            <View style={styles.titleRow}>
              <Text style={styles.hostelName}>{hostel.hostelName}</Text>
              {hostel.rating > 0 && (
                <View style={styles.ratingBadge}>
                  <Star size={14} color={COLORS.warning} fill={COLORS.warning} />
                  <Text style={styles.ratingText}>{hostel.rating.toFixed(1)}</Text>
                </View>
              )}
            </View>

            <View style={styles.locationRow}>
              <MapPin size={16} color={COLORS.primary} strokeWidth={1.5} />
              <Text style={styles.locationText}>
                {hostel.city}, {hostel.address}
              </Text>
            </View>

            {hostel.reviewCount > 0 && (
              <Text style={styles.reviewCount}>{hostel.reviewCount} reviews</Text>
            )}
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <StatCard value={`Rs. ${minPrice.toLocaleString()}`} label="Starting price" />
            <View style={styles.statDivider} />
            <StatCard value={totalRooms.toString()} label="Available" />
            <View style={styles.statDivider} />
            <StatCard value={(hostel.roomTypes?.length || 0).toString()} label="Room types" />
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <ActionButton
              icon={<MessageCircle size={22} color={COLORS.info} strokeWidth={1.5} />}
              label="Chat"
              color={COLORS.infoLight}
              onPress={handleStartChat}
              disabled={startingChat}
            />
            <ActionButton
              icon={<Calendar size={22} color={COLORS.warning} strokeWidth={1.5} />}
              label="Reserve"
              color={COLORS.warningLight}
              onPress={() => router.push(`/(app)/student/reserve/${id}`)}
            />
            <ActionButton
              icon={<CreditCard size={22} color={COLORS.success} strokeWidth={1.5} />}
              label="Book"
              color={COLORS.successLight}
              onPress={() => router.push(`/(app)/student/book/${id}`)}
            />
          </View>

          {/* Room Types */}
          <Section title="Available Rooms">
            {hostel.roomTypes?.map((roomType, index) => (
              <View key={roomType.id ?? `room-${index}`} style={styles.roomCard}>
                <View style={styles.roomCardLeft}>
                  <View style={styles.roomIconBox}>
                    <Users size={20} color={COLORS.primary} strokeWidth={1.5} />
                  </View>
                  <View style={styles.roomInfo}>
                    <Text style={styles.roomName}>{roomType.type.replace('_', ' ')}</Text>
                    <Text style={styles.roomDetail}>
                      {roomType.personsInRoom} {roomType.personsInRoom > 1 ? 'persons' : 'person'} per room
                    </Text>
                    <View style={styles.roomAvailability}>
                      <View
                        style={[
                          styles.availabilityDot,
                          { backgroundColor: roomType.availableRooms > 0 ? COLORS.success : COLORS.error },
                        ]}
                      />
                      <Text style={styles.availabilityText}>
                        {roomType.availableRooms > 0 ? `${roomType.availableRooms} available` : 'Not available'}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.roomCardRight}>
                  <Text style={styles.roomPrice}>Rs. {roomType.price.toLocaleString()}</Text>
                  <Text style={styles.roomPriceUnit}>/month</Text>
                </View>
              </View>
            ))}
          </Section>

          {/* Facilities */}
          <Section title="Facilities & Amenities">
            <View style={styles.facilitiesGrid}>
              {facilities?.hotColdWaterBath && (
                <FacilityChip icon={<Droplets size={16} color={COLORS.info} strokeWidth={1.5} />} label="Hot/Cold water" />
              )}
              {facilities?.drinkingWater && (
                <FacilityChip icon={<Droplets size={16} color={COLORS.info} strokeWidth={1.5} />} label="Drinking water" />
              )}
              {facilities?.electricityBackup && (
                <FacilityChip icon={<Zap size={16} color={COLORS.warning} strokeWidth={1.5} />} label="Power backup" />
              )}
              {facilities?.wifiEnabled && (
                <FacilityChip icon={<Wifi size={16} color={COLORS.success} strokeWidth={1.5} />} label="Free WiFi" />
              )}
              {facilities?.customFacilities?.map((facility, index) => (
                <FacilityChip key={`facility-${index}`} icon={<Check size={16} color={COLORS.primary} strokeWidth={1.5} />} label={facility} />
              ))}
            </View>
          </Section>

          {/* Rules */}
          {hostel.rules && (
            <Section title="House Rules">
              <View style={styles.rulesBox}>
                <Text style={styles.rulesText}>{hostel.rules}</Text>
              </View>
            </Section>
          )}

          {/* Nearby */}
          {hostel.nearbyLocations && hostel.nearbyLocations.length > 0 && (
            <Section title="Nearby Places">
              <View style={styles.nearbyContainer}>
                {hostel.nearbyLocations.map((location, index) => (
                  <View key={`location-${index}`} style={styles.nearbyChip}>
                    <MapPin size={14} color={COLORS.primary} strokeWidth={1.5} />
                    <Text style={styles.nearbyText}>{location}</Text>
                  </View>
                ))}
              </View>
            </Section>
          )}

          {/* Manager */}
          {hostel.manager && (
            <Section title="Manager">
              <Pressable
                style={({ pressed }) => [styles.managerCard, pressed && { opacity: OPACITY.pressed }]}
                onPress={handleStartChat}
              >
                <View style={styles.managerAvatar}>
                  <Text style={styles.managerAvatarText}>
                    {hostel.manager.fullName?.charAt(0) || 'M'}
                  </Text>
                </View>
                <View style={styles.managerInfo}>
                  <Text style={styles.managerName}>
                    {hostel.manager.fullName || 'Hostel Manager'}
                  </Text>
                  <Text style={styles.managerSubtext}>Tap to chat</Text>
                </View>
                <MessageCircle size={22} color={COLORS.primary} strokeWidth={1.5} />
              </Pressable>
            </Section>
          )}

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper Components
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const StatCard = ({ value, label }: { value: string; label: string }) => (
  <View style={styles.statCard}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  color: string;
  onPress: () => void;
  disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, label, color, onPress, disabled }) => (
  <Pressable
    style={({ pressed }) => [styles.actionBtn, pressed && { opacity: OPACITY.pressed }]}
    onPress={onPress}
    disabled={disabled}
  >
    <View style={[styles.actionIconBox, { backgroundColor: color }]}>{icon}</View>
    <Text style={styles.actionBtnText}>{label}</Text>
  </Pressable>
);

const FacilityChip = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <View style={styles.facilityChip}>
    {icon}
    <Text style={styles.facilityChipText}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  scrollContent: {
    paddingBottom: 0,
  },

  // Hero
  heroSection: {
    position: 'relative',
    height: 300,
  },
  heroImage: {
    width,
    height: 300,
    resizeMode: 'cover',
  },
  heroPlaceholder: {
    width,
    height: 300,
    backgroundColor: COLORS.bgSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  placeholderText: {
    fontSize: 15,
    color: COLORS.textMuted,
  },
  imageCounter: {
    position: 'absolute',
    bottom: 50,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  imageCounterText: {
    color: COLORS.textInverse,
    fontSize: 12,
    fontWeight: '600',
  },
  indicators: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  indicatorActive: {
    width: 20,
    backgroundColor: COLORS.textInverse,
  },
  headerButtons: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 10,
  },
  heroBadge: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  heroBadgeText: {
    color: COLORS.textInverse,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  // Main Content
  mainContent: {
    marginTop: -24,
    backgroundColor: COLORS.bgPrimary,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 28,
    paddingHorizontal: 20,
  },

  // Title
  titleSection: {
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  hostelName: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginRight: 12,
    letterSpacing: -0.4,
    lineHeight: 30,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.warningLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.warning,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
  },
  reviewCount: {
    fontSize: 13,
    color: COLORS.textMuted,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.borderLight,
    marginHorizontal: 8,
  },

  // Actions
  actionButtons: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 28,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 10,
  },
  actionIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },

  // Section
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 16,
    letterSpacing: -0.2,
  },

  // Room Card
  roomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  roomCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  roomIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  roomDetail: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  roomAvailability: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  availabilityText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  roomCardRight: {
    alignItems: 'flex-end',
  },
  roomPrice: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.primary,
  },
  roomPriceUnit: {
    fontSize: 12,
    color: COLORS.textMuted,
  },

  // Facilities
  facilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  facilityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.bgCard,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  facilityChipText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },

  // Rules
  rulesBox: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  rulesText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },

  // Nearby
  nearbyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  nearbyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  nearbyText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '500',
  },

  // Manager
  managerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  managerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  managerAvatarText: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.textInverse,
    textTransform: 'uppercase',
  },
  managerInfo: {
    flex: 1,
  },
  managerName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 3,
  },
  managerSubtext: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
});