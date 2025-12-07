// screens/SearchScreen.tsx

import { COLORS, OPACITY } from '@/constants/colors';
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
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { hostelsApi } from '@/api/hostels';
import { Badge, EmptyState, LoadingScreen } from '@/components/ui';
import { Hostel } from '@/types';

export default function SearchScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGender, setSelectedGender] = useState<'BOYS' | 'GIRLS' | null>(null);

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
    const minPrice = Math.min(...(item.roomTypes?.map((rt) => rt.price) || [0]));

    return (
      <Pressable
        style={({ pressed }) => [
          styles.hostelCard,
          pressed && { opacity: OPACITY.pressed },
        ]}
        onPress={() => router.push(`/(app)/student/hostel/${item.id}`)}
      >
        {/* Image */}
        {item.roomImages && item.roomImages.length > 0 ? (
          <Image
            source={{ uri: item.roomImages[0] }}
            style={styles.hostelImage}
          />
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
            <Badge label={item.hostelFor} variant="primary" size="sm" />
          </View>

          <View style={styles.locationRow}>
            <MapPin size={14} color={COLORS.textMuted} strokeWidth={1.5} />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.city}, {item.address}
            </Text>
          </View>

          <View style={styles.hostelFooter}>
            {item.rating > 0 && (
              <View style={styles.ratingRow}>
                <Star size={14} color={COLORS.warning} fill={COLORS.warning} />
                <Text style={styles.ratingText}>
                  {item.rating.toFixed(1)}
                </Text>
                <Text style={styles.reviewCount}>({item.reviewCount})</Text>
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

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Find Hostels</Text>
        <Text style={styles.subtitle}>
          {hostels.length} hostel{hostels.length !== 1 ? 's' : ''} available
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <SearchIcon size={20} color={COLORS.textMuted} strokeWidth={1.5} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by city..."
            placeholderTextColor={COLORS.inputPlaceholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            selectionColor={COLORS.primary}
          />
          {searchQuery.length > 0 && (
            <Pressable
              onPress={() => setSearchQuery('')}
              style={({ pressed }) => pressed && { opacity: OPACITY.pressed }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={18} color={COLORS.textMuted} strokeWidth={1.5} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Gender Filter */}
      <View style={styles.filterContainer}>
        <FilterChip
          label="All"
          isActive={selectedGender === null}
          onPress={() => setSelectedGender(null)}
        />
        <FilterChip
          label="Boys"
          isActive={selectedGender === 'BOYS'}
          onPress={() => setSelectedGender('BOYS')}
        />
        <FilterChip
          label="Girls"
          isActive={selectedGender === 'GIRLS'}
          onPress={() => setSelectedGender('GIRLS')}
        />
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
              colors={[COLORS.primary]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon={<SearchIcon size={48} color={COLORS.textMuted} strokeWidth={1.5} />}
              title="No hostels found"
              description="Try adjusting your search or filters to find what you're looking for."
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
}

// Filter Chip Component
interface FilterChipProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

const FilterChip: React.FC<FilterChipProps> = ({ label, isActive, onPress }) => (
  <Pressable
    style={({ pressed }) => [
      styles.filterChip,
      isActive && styles.filterChipActive,
      pressed && { opacity: OPACITY.pressed },
    ]}
    onPress={onPress}
  >
    <Text
      style={[
        styles.filterChipText,
        isActive && styles.filterChipTextActive,
      ]}
    >
      {label}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  
  // Header
  header: {
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
  
  // Search
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    letterSpacing: 0.1,
  },
  
  // Filters
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1.5,
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
    height: 180,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: 180,
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
    letterSpacing: -0.3,
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
    justifyContent: 'space-between',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  reviewCount: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: -0.2,
  },
  priceUnit: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
});