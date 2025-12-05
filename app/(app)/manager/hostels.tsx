import { useRouter } from 'expo-router';
import { Building2, MapPin, Plus, Star, Users } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { hostelsApi } from '@/api/hostels';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  LoadingScreen,
} from '@/components/ui';
import { COLORS } from '@/constants/colors';
import { Hostel } from '@/types';

export default function HostelsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hostels, setHostels] = useState<Hostel[]>([]);

  const fetchHostels = async () => {
    try {
      const response = await hostelsApi.getMyHostels();
      if (response.success) {
        setHostels(response.data);
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2:
          error?.response?.data?.message ||
          'Failed to fetch hostels',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHostels();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHostels();
  };

  const renderHostel = ({ item }: { item: Hostel }) => {
    const minPrice = Math.min(
      ...(item.roomTypes?.map((rt) => rt.price) || [0])
    );

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() =>
          router.push(`/(app)/manager/hostel/${item.id}`)
        }
      >
        <Card style={styles.hostelCard}>
          {/* Image */}
          {item.roomImages && item.roomImages.length > 0 ? (
            <Image
              source={{ uri: item.roomImages[0] }}
              style={styles.hostelImage}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Building2
                size={40}
                color={COLORS.textMuted}
              />
            </View>
          )}

          {/* Content */}
          <View style={styles.hostelContent}>
            <View style={styles.hostelHeader}>
              <Text
                style={styles.hostelName}
                numberOfLines={1}
              >
                {item.hostelName}
              </Text>
              <Badge
                label={item.isActive ? 'ACTIVE' : 'INACTIVE'}
                variant={item.isActive ? 'success' : 'error'}
              />
            </View>

            <View style={styles.locationRow}>
              <MapPin
                size={14}
                color={COLORS.textMuted}
              />
              <Text
                style={styles.locationText}
                numberOfLines={1}
              >
                {item.city}, {item.address}
              </Text>
            </View>

            <View style={styles.hostelFooter}>
              <View style={styles.footerItem}>
                <Users
                  size={14}
                  color={COLORS.textSecondary}
                />
                <Text style={styles.footerText}>
                  {item.hostelFor}
                </Text>
              </View>

              {item.rating > 0 && (
                <View style={styles.footerItem}>
                  <Star
                    size={14}
                    color={COLORS.warning}
                    fill={COLORS.warning}
                  />
                  <Text style={styles.footerText}>
                    {item.rating.toFixed(1)}
                  </Text>
                </View>
              )}

              <Text style={styles.priceText}>
                Rs. {minPrice.toLocaleString()}/mo
              </Text>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'bottom']}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My hostels</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            router.push('/(app)/manager/hostel/create')
          }
        >
          <Plus
            size={24}
            color={COLORS.textInverse}
          />
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={hostels}
        keyExtractor={(item) => item.id}
        renderItem={renderHostel}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon={
              <Building2
                size={64}
                color={COLORS.textMuted}
              />
            }
            title="No hostels yet"
            description="Add your first hostel to start receiving bookings."
            action={
              <Button
                title="Add hostel"
                onPress={() =>
                  router.push('/(app)/manager/hostel/create')
                }
                icon={
                  <Plus
                    size={20}
                    color={COLORS.textInverse}
                  />
                }
              />
            }
          />
        }
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    flexGrow: 1,
  },
  hostelCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 16,
  },
  hostelImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: 160,
    backgroundColor: COLORS.bgSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hostelContent: {
    padding: 16,
  },
  hostelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  hostelName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.textMuted,
    flex: 1,
  },
  hostelFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 'auto',
  },
});