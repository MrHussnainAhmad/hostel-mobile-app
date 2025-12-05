// app/(app)/manager/students/[hostelId].tsx

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
        text2:
          error?.response?.data?.message ||
          'Failed to fetch students',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (hostelId) {
      fetchStudents();
    } else {
      setLoading(false);
    }
  }, [hostelId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStudents();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderStudent = ({ item }: { item: Student }) => (
    <Card style={styles.studentCard}>
      <View style={styles.studentHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.fullName?.charAt(0) || 'S'}
          </Text>
        </View>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>
            {item.fullName}
          </Text>
          <Badge
            label={item.booking.roomType.replace(
              '_',
              ' '
            )}
            variant="info"
          />
        </View>
      </View>

      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <Mail
            size={16}
            color={COLORS.textMuted}
          />
          <Text style={styles.detailText}>
            {item.user.email}
          </Text>
        </View>

        {item.phoneNumber && (
          <View style={styles.detailItem}>
            <Phone
              size={16}
              color={COLORS.textMuted}
            />
            <Text style={styles.detailText}>
              {item.phoneNumber}
            </Text>
          </View>
        )}

        {item.whatsappNumber && (
          <View style={styles.detailItem}>
            <MessageCircle
              size={16}
              color={COLORS.textMuted}
            />
            <Text style={styles.detailText}>
              {item.whatsappNumber}
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.joinedDate}>
        Joined: {formatDate(item.booking.createdAt)}
      </Text>
    </Card>
  );

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
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft
            size={24}
            color={COLORS.textPrimary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Hostel students
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Count */}
      <View style={styles.countContainer}>
        <Text style={styles.countText}>
          {students.length} student
          {students.length !== 1 ? 's' : ''} currently
          staying
        </Text>
      </View>

      {/* List */}
      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        renderItem={renderStudent}
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
              <Users
                size={64}
                color={COLORS.textMuted}
              />
            }
            title="No students"
            description="No students are currently staying at this hostel."
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
  countContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
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
    marginBottom: 16,
  },
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textInverse,
    textTransform: 'uppercase',
  },
  studentInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  detailsGrid: {
    gap: 8,
    marginBottom: 12,
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