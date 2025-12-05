import { useRouter } from 'expo-router';
import {
  Building2,
  MapPin,
  Search as SearchIcon,
  Star,
  X,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { hostelsApi } from '@/api/hostels';
import { Badge, Card, EmptyState, LoadingScreen } from '@/components/ui';
import { COLORS } from '@/constants/colors';
import { Hostel } from '@/types';

export default function SearchScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGender, setSelectedGender] = useState<'BOYS' | 'GIRLS' | null>(
    null
  );

  const fetchHostels = async () => {
    try {
      const params: any = {};
      if (searchQuery.trim()) {
        params.city = searchQuery.trim();
      }
      if (selectedGender) {
        params.hostelFor = selectedGender;
      }

      const response = await hostelsApi.search(params);
      if (response.success) {
        setHostels(response.data);
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Failed to search hostels',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHostels();
  }, [selectedGender]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHostels();
  };

  const handleSearch = () => {
    setLoading(true);
    fetchHostels();
  };

  const renderHostel = ({ item }: { item: Hostel }) => {
    const minPrice = Math.min(
      ...(item.roomTypes?.map((rt) => rt.price) || [0])
    );

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push(`/(app)/student/hostel/${item.id}`)}
      >
        <Card style={styles.hostelCard}>
          {item.roomImages && item.roomImages.length > 0 ? (
            <Image
              source={{ uri: item.roomImages[0] }}
              style={styles.hostelImage}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Building2 size={40} color={COLORS.textMuted} />
            </View>
          )}

          <View style={styles.hostelContent}>
            <View style={styles.hostelHeader}>
              <Text style={styles.hostelName} numberOfLines={1}>
                {item.hostelName}
              </Text>
              <Badge label={item.hostelFor} variant="info" />
            </View>

            <View style={styles.locationRow}>
              <MapPin size={14} color={COLORS.textMuted} />
              <Text style={styles.locationText} numberOfLines={1}>
                {item.city}, {item.address}
              </Text>
            </View>

            <View style={styles.hostelFooter}>
              {item.rating > 0 && (
                <View style={styles.footerItem}>
                  <Star
                    size={14}
                    color={COLORS.warning}
                    fill={COLORS.warning}
                  />
                  <Text style={styles.footerText}>
                    {item.rating.toFixed(1)} ({item.reviewCount})
                  </Text>
                </View>
              )}

              <Text style={styles.priceText}>
                From Rs. {minPrice.toLocaleString()}/mo
              </Text>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Find hostels</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <SearchIcon size={20} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by city..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Gender Filter */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterChip,
            selectedGender === null && styles.filterChipActive,
          ]}
          onPress={() => setSelectedGender(null)}
        >
          <Text
            style={[
              styles.filterChipText,
              selectedGender === null && styles.filterChipTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            selectedGender === 'BOYS' && styles.filterChipActive,
          ]}
          onPress={() => setSelectedGender('BOYS')}
        >
          <Text
            style={[
              styles.filterChipText,
              selectedGender === 'BOYS' && styles.filterChipTextActive,
            ]}
          >
            Boys
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            selectedGender === 'GIRLS' && styles.filterChipActive,
          ]}
          onPress={() => setSelectedGender('GIRLS')}
        >
          <Text
            style={[
              styles.filterChipText,
              selectedGender === 'GIRLS' && styles.filterChipTextActive,
            ]}
          >
            Girls
          </Text>
        </TouchableOpacity>
      </View>

      {/* Results */}
      {loading ? (
        <LoadingScreen />
      ) : (
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
              icon={<SearchIcon size={64} color={COLORS.textMuted} />}
              title="No hostels found"
              description="Try adjusting your search or filters."
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 10,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.bgSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: COLORS.textInverse,
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
    justifyContent: 'space-between',
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
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },
});