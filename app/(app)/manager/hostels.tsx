// app/(app)/manager/hostels.tsx

import { COLORS, OPACITY } from '@/constants/colors';
import { useFocusEffect, useRouter } from 'expo-router';
import { Building2, MapPin, Plus, Star, Users } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { hostelsApi } from '@/api/hostels';
import { Badge, Button, EmptyState, LoadingScreen } from '@/components/ui';
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
        text2: error?.response?.data?.message || 'Failed to fetch hostels',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchHostels();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchHostels();
  };

  const renderHostel = ({ item }: { item: Hostel }) => {
    const minPrice = Math.min(...(item.roomTypes?.map((rt) => rt.price) || [0]));

    return (
      <Pressable
        style={({ pressed }) => [
          styles.hostelCard,
          pressed && { opacity: OPACITY.pressed },
        ]}
        onPress={() => router.push(`/(app)/manager/hostel/${item.id}`)}
      >
        {/* Image */}
        {item.roomImages && item.roomImages.length > 0 ? (
          <Image source={{ uri: item.roomImages[0] }} style={styles.hostelImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Building2 size={36} color={COLORS.textMuted} strokeWidth={1.5} />
          </View>
        )}

        {/* Content */}
        <View style={styles.hostelContent}>
          <View style={styles.hostelHeader}>
            <Text style={styles.hostelName} numberOfLines={1}>
              {item.hostelName}
            </Text>
            <Badge
              label={item.isActive ? 'ACTIVE' : 'INACTIVE'}
              variant={item.isActive ? 'success' : 'error'}
              size="sm"
            />
          </View>

          <View style={styles.locationRow}>
            <MapPin size={14} color={COLORS.textMuted} strokeWidth={1.5} />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.city}, {item.address}
            </Text>
          </View>

          <View style={styles.hostelFooter}>
            <View style={styles.footerItem}>
              <Users size={14} color={COLORS.textSecondary} strokeWidth={1.5} />
              <Text style={styles.footerText}>{item.hostelFor}</Text>
            </View>

            {item.rating > 0 && (
              <View style={styles.footerItem}>
                <Star size={14} color={COLORS.warning} fill={COLORS.warning} />
                <Text style={styles.footerText}>{item.rating.toFixed(1)}</Text>
              </View>
            )}

            <Text style={styles.priceText}>
              Rs. {minPrice.toLocaleString()}<Text style={styles.priceUnit}>/mo</Text>
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Hostels</Text>
          <Text style={styles.subtitle}>
            {hostels.length} hostel{hostels.length !== 1 ? 's' : ''} registered
          </Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            pressed && { opacity: OPACITY.pressed },
          ]}
          onPress={() => router.push('/(app)/manager/hostel/create')}
        >
          <Plus size={22} color={COLORS.textInverse} strokeWidth={2} />
        </Pressable>
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
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon={<Building2 size={48} color={COLORS.textMuted} strokeWidth={1.5} />}
            title="No hostels yet"
            description="Add your first hostel to start receiving bookings from students."
            action={
              <Button
                title="Add Hostel"
                onPress={() => router.push('/(app)/manager/hostel/create')}
                icon={<Plus size={18} color={COLORS.textInverse} strokeWidth={2} />}
                size="md"
              />
            }
          />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    // Subtle shadow
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  // List
  list: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    flexGrow: 1,
  },
  separator: {
    height: 14,
  },

  // Hostel Card
  hostelCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
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
    padding: 18,
  },
  hostelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  hostelName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 12,
    letterSpacing: -0.2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
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
    gap: 5,
  },
  footerText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  priceText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 'auto',
  },
  priceUnit: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
});