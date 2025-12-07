import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Check,
  Clock,
  Droplets,
  Edit,
  FileText,
  MapPin,
  Star,
  Trash2,
  Users,
  Wifi,
  Zap,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { hostelsApi } from '@/api/hostels';
import { Badge, Button, Card, LoadingScreen } from '@/components/ui';
import { COLORS } from '@/constants/colors';
import { Hostel } from '@/types';

const { width } = Dimensions.get('window');

export default function ManagerHostelDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hostel, setHostel] = useState<Hostel | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

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
        text2:
          error?.response?.data?.message ||
          'Failed to fetch hostel',
      });
      handleGoBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostel();
  }, [id]);

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(app)/manager/hostels');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete hostel',
      'Are you sure you want to delete this hostel? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await hostelsApi.deleteHostel(id);
              Toast.show({
                type: 'success',
                text1: 'Deleted',
                text2: 'Hostel deleted successfully',
              });
              router.replace('/(app)/manager/hostels');
            } catch (error: any) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2:
                  error?.response?.data?.message ||
                  'Failed to delete hostel',
              });
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!hostel) {
    return null;
  }

  const facilities = hostel.facilities;

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'bottom']}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          {hostel.roomImages && hostel.roomImages.length > 0 ? (
            <>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={(e) => {
                  const index = Math.round(
                    e.nativeEvent.contentOffset.x / width
                  );
                  setActiveImageIndex(index);
                }}
                scrollEventThrottle={16}
              >
                {hostel.roomImages.map((image, index) => (
                  <Image
                    key={`image-${index}`}
                    source={{ uri: image }}
                    style={styles.image}
                  />
                ))}
              </ScrollView>

              <View style={styles.indicators}>
                {hostel.roomImages.map((_, index) => (
                  <View
                    key={`indicator-${index}`}
                    style={[
                      styles.indicator,
                      activeImageIndex === index &&
                        styles.indicatorActive,
                    ]}
                  />
                ))}
              </View>
            </>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Building2 size={60} color={COLORS.textMuted} />
              <Text style={styles.placeholderText}>
                No images
              </Text>
            </View>
          )}

          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleGoBack}
          >
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>

          {/* Status Badge */}
          <View style={styles.statusBadge}>
            <Badge
              label={hostel.isActive ? 'ACTIVE' : 'INACTIVE'}
              variant={hostel.isActive ? 'success' : 'error'}
            />
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.hostelName}>
              {hostel.hostelName}
            </Text>
            <View style={styles.locationRow}>
              <MapPin size={16} color={COLORS.textMuted} />
              <Text style={styles.locationText}>
                {hostel.city}, {hostel.address}
              </Text>
            </View>
          </View>

          {/* Rating & Stats */}
          <Card style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Star
                  size={18}
                  color={COLORS.warning}
                  fill={COLORS.warning}
                />
                <Text style={styles.statText}>
                  {hostel.rating > 0
                    ? hostel.rating.toFixed(1)
                    : 'N/A'}
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Users size={18} color={COLORS.info} />
                <Text style={styles.statText}>
                  {hostel.reviewCount} reviews
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statText}>
                  {hostel.hostelFor}
                </Text>
              </View>
            </View>
          </Card>

          {/* Quick Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                router.push(`/(app)/manager/students/${id}`)
              }
            >
              <Users size={20} color={COLORS.primary} />
              <Text style={styles.actionText}>Students</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                router.push(
                  `/(app)/manager/reservations?hostelId=${id}`
                )
              }
            >
              <Calendar size={20} color={COLORS.warning} />
              <Text style={styles.actionText}>Reservations</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                router.push(
                  `/(app)/manager/bookings?hostelId=${id}`
                )
              }
            >
              <FileText size={20} color={COLORS.success} />
              <Text style={styles.actionText}>Bookings</Text>
            </TouchableOpacity>
          </View>

          {/* Room Types */}
          <Text style={styles.sectionTitle}>Room types</Text>
          {hostel.roomTypes?.map((roomType, index) => (
            <Card
              key={roomType.id || `room-${index}`}
              style={styles.roomTypeCard}
            >
              <View style={styles.roomTypeHeader}>
                <Text style={styles.roomTypeName}>
                  {roomType.type.replace('_', ' ')}
                </Text>
                <Text style={styles.roomTypePrice}>
                  Rs. {roomType.price.toLocaleString()}/mo
                </Text>
              </View>

              <View style={styles.roomTypeDetails}>
                <Text style={styles.roomTypeDetail}>
                  {roomType.personsInRoom} person(s) per room
                </Text>
                <Text style={styles.roomTypeDetail}>
                  {roomType.totalRooms} total • {roomType.availableRooms} available
                </Text>
              </View>

              {/* Urgent Booking Price */}
              {roomType.urgentBookingPrice &&
                roomType.urgentBookingPrice > 0 && (
                  <View style={styles.urgentBookingContainer}>
                    <View style={styles.urgentBookingBadge}>
                      <Clock size={14} color={COLORS.warning} />
                      <Text style={styles.urgentBookingLabel}>
                        Urgent Booking
                      </Text>
                    </View>
                    <Text style={styles.urgentBookingPrice}>
                      Rs. {roomType.urgentBookingPrice.toLocaleString()}
                    </Text>
                  </View>
                )}

              {/* Full Room Discounted Price for SHARED_FULLROOM */}
              {roomType.type === 'SHARED_FULLROOM' &&
                roomType.fullRoomPriceDiscounted && (
                  <View style={styles.fullRoomDiscountContainer}>
                    <Text style={styles.fullRoomDiscountLabel}>
                      Full room discount:
                    </Text>
                    <Text style={styles.fullRoomDiscountPrice}>
                      Rs. {roomType.fullRoomPriceDiscounted.toLocaleString()}/mo
                    </Text>
                  </View>
                )}
            </Card>
          ))}

          {/* Facilities */}
          <Text style={styles.sectionTitle}>Facilities</Text>
          <Card style={styles.facilitiesCard}>
            <View style={styles.facilitiesGrid}>
              {facilities?.hotColdWaterBath && (
                <View style={styles.facilityItem}>
                  <Droplets size={20} color={COLORS.info} />
                  <Text style={styles.facilityText}>
                    Hot/Cold water
                  </Text>
                </View>
              )}
              {facilities?.drinkingWater && (
                <View style={styles.facilityItem}>
                  <Droplets size={20} color={COLORS.info} />
                  <Text style={styles.facilityText}>
                    Drinking water
                  </Text>
                </View>
              )}
              {facilities?.electricityBackup && (
                <View style={styles.facilityItem}>
                  <Zap size={20} color={COLORS.warning} />
                  <Text style={styles.facilityText}>
                    Electricity backup
                  </Text>
                </View>
              )}
              {facilities?.wifiEnabled && (
                <View style={styles.facilityItem}>
                  <Wifi size={20} color={COLORS.success} />
                  <Text style={styles.facilityText}>
                    WiFi available
                  </Text>
                </View>
              )}
            </View>

            {facilities?.customFacilities &&
              facilities.customFacilities.length > 0 && (
                <View style={styles.customFacilities}>
                  {facilities.customFacilities.map(
                    (facility, index) => (
                      <View
                        key={`facility-${index}`}
                        style={styles.customFacilityItem}
                      >
                        <Check size={16} color={COLORS.success} />
                        <Text style={styles.customFacilityText}>
                          {facility}
                        </Text>
                      </View>
                    )
                  )}
                </View>
              )}
          </Card>

          {/* Rules */}
          {hostel.rules && (
            <>
              <Text style={styles.sectionTitle}>Hostel rules</Text>
              <Card style={styles.rulesCard}>
                <Text style={styles.rulesText}>
                  {hostel.rules}
                </Text>
              </Card>
            </>
          )}

          {/* Nearby Locations */}
          {hostel.nearbyLocations &&
            hostel.nearbyLocations.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>
                  Nearby locations
                </Text>
                <View style={styles.tagsContainer}>
                  {hostel.nearbyLocations.map(
                    (location, index) => (
                      <View
                        key={`location-${index}`}
                        style={styles.tag}
                      >
                        <Text style={styles.tagText}>
                          {location}
                        </Text>
                      </View>
                    )
                  )}
                </View>
              </>
            )}

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          disabled={deleting}
        >
          <Trash2 size={22} color={COLORS.error} />
        </TouchableOpacity>

        <Button
          title="Edit hostel"
          onPress={() =>
            router.push(`/(app)/manager/hostel/edit/${id}`)
          }
          style={styles.editButton}
          icon={
            <Edit
              size={20}
              color={COLORS.textInverse}
            />
          }
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

  imageContainer: {
    position: 'relative',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    overflow: 'hidden',
  },
  image: {
    width,
    height: 280,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width,
    height: 280,
    backgroundColor: COLORS.bgSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  placeholderText: {
    color: COLORS.textMuted,
    fontSize: 16,
  },
  indicators: {
    position: 'absolute',
    bottom: 16,
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
    backgroundColor: COLORS.textInverse,
    width: 22,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.bgSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 50,
    right: 20,
  },

  content: {
    padding: 24,
  },
  header: {
    marginBottom: 16,
  },
  hostelName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.textMuted,
    flex: 1,
  },

  statsCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.border,
  },

  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
    marginTop: 8,
  },

  roomTypeCard: {
    marginBottom: 12,
    borderRadius: 16,
  },
  roomTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roomTypeName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textTransform: 'capitalize',
  },
  roomTypePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  roomTypeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roomTypeDetail: {
    fontSize: 13,
    color: COLORS.textMuted,
  },

  // Urgent Booking Styles
  urgentBookingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  urgentBookingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.warning + '15',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  urgentBookingLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.warning,
  },
  urgentBookingPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.warning,
  },

  // Full Room Discount Styles
  fullRoomDiscountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  fullRoomDiscountLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  fullRoomDiscountPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.success,
  },

  facilitiesCard: {
    marginBottom: 16,
    borderRadius: 16,
  },
  facilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  facilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '45%',
  },
  facilityText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  customFacilities: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 10,
  },
  customFacilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customFacilityText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  rulesCard: {
    marginBottom: 16,
    borderRadius: 16,
  },
  rulesText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },

  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: COLORS.bgSecondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 32,
    backgroundColor: COLORS.bgPrimary,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },
  deleteButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.error + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  editButton: {
    flex: 1,
    height: 56,
  },
});
