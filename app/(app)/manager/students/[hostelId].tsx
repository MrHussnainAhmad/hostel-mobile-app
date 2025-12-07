import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Mail,
  MessageCircle,
  Phone,
  Users,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { hostelsApi } from '@/api/hostels';
import { Badge, Card, EmptyState, LoadingScreen } from '@/components/ui';
import { COLORS } from '@/constants/colors';

interface Student {
  id: string;
  fullName: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  user: {
    email: string;
  };
  booking: {
    roomType: string;
    createdAt: string;
  };
}

export default function HostelStudentsScreen() {
  const { hostelId } = useLocalSearchParams<{ hostelId: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);

  const fadeAnim = new Animated.Value(0);

  const animateScreen = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const fetchStudents = async () => {
    try {
      const response = await hostelsApi.getHostelStudents(hostelId);
      if (response.success) {
        setStudents(response.data);
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Failed to fetch students',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
      animateScreen();
    }
  };

  useEffect(() => {
    if (hostelId) fetchStudents();
    else setLoading(false);
  }, [hostelId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStudents();
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const renderStudent = ({ item }: { item: Student }) => (
    <Animated.View style={{ opacity: fadeAnim }}>
      <Card style={styles.studentCard}>
        <View style={styles.studentHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.fullName?.charAt(0) || 'S'}</Text>
          </View>

          <View style={styles.studentInfo}>
            <Text style={styles.studentName}>{item.fullName}</Text>
            <Badge label={item.booking.roomType.replace('_', ' ')} variant="info" />
          </View>
        </View>

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Mail size={16} color={COLORS.textMuted} />
            <Text style={styles.detailText}>{item.user.email}</Text>
          </View>

          {item.phoneNumber && (
            <View style={styles.detailItem}>
              <Phone size={16} color={COLORS.textMuted} />
              <Text style={styles.detailText}>{item.phoneNumber}</Text>
            </View>
          )}

          {item.whatsappNumber && (
            <View style={styles.detailItem}>
              <MessageCircle size={16} color={COLORS.textMuted} />
              <Text style={styles.detailText}>{item.whatsappNumber}</Text>
            </View>
          )}
        </View>

        <Text style={styles.joinedDate}>Joined: {formatDate(item.booking.createdAt)}</Text>
      </Card>
    </Animated.View>
  );

  if (loading) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hostel students</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Count */}
      <View style={styles.countContainer}>
        <Text style={styles.countText}>
          {students.length} student{students.length !== 1 ? 's' : ''} currently staying
        </Text>
      </View>

      {/* List */}
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <FlatList
          data={students}
          keyExtractor={(item) => item.id}
          renderItem={renderStudent}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
          }
          ListEmptyComponent={
            <EmptyState
              icon={<Users size={64} color={COLORS.textMuted} />}
              title="No students"
              description="No students are currently staying at this hostel."
            />
          }
        />
      </Animated.View>
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
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.bgPrimary,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bgSecondary,
  },

  headerTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  countContainer: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.bgPrimary,
  },

  countText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  list: {
    padding: 24,
    flexGrow: 1,
  },

  studentCard: {
    marginBottom: 18,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 14,
  },

  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },

  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textInverse,
    textTransform: 'uppercase',
  },

  studentInfo: {
    flex: 1,
    justifyContent: 'center',
  },

  studentName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },

  detailsGrid: {
    gap: 8,
    marginBottom: 14,
  },

  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  detailText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  joinedDate: {
    fontSize: 12,
    color: COLORS.textMuted,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});
