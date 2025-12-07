// screens/ReportsScreen.tsx

import { COLORS, OPACITY } from '@/constants/colors';
import { useRouter } from 'expo-router';
import { AlertTriangle, ArrowLeft, FileText } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { reportsApi } from '@/api/reports';
import { Badge, EmptyState, LoadingScreen } from '@/components/ui';
import { Report } from '@/types';

export default function ReportsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);

  const fetchReports = async () => {
    try {
      const response = await reportsApi.getMyReports();
      if (response.success) {
        setReports(response.data);
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Failed to fetch reports',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  const getStatusVariant = (status: string) => {
    return status === 'RESOLVED' ? 'success' : 'warning';
  };

  const getDecisionVariant = (decision?: string) => {
    switch (decision) {
      case 'STUDENT_FAULT':
        return 'error';
      case 'MANAGER_FAULT':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderReport = ({ item }: { item: Report }) => (
    <View style={styles.reportCard}>
      {/* Header */}
      <View style={styles.reportHeader}>
        <View style={styles.reportIcon}>
          <AlertTriangle size={18} color={COLORS.warning} strokeWidth={1.5} />
        </View>
        
        <View style={styles.reportInfo}>
          <Text style={styles.hostelName} numberOfLines={1}>
            {item.booking?.hostel?.hostelName || 'Hostel'}
          </Text>
          <Text style={styles.reportDate}>
            {formatDate(item.createdAt)}
          </Text>
        </View>
        
        <Badge
          label={item.status}
          variant={getStatusVariant(item.status)}
          size="sm"
        />
      </View>

      {/* Description */}
      <Text style={styles.description}>{item.description}</Text>

      {/* Resolution */}
      {item.status === 'RESOLVED' && (
        <View style={styles.resolutionBox}>
          {item.decision && (
            <View style={styles.decisionRow}>
              <Text style={styles.decisionLabel}>Decision</Text>
              <Badge
                label={item.decision.replace('_', ' ')}
                variant={getDecisionVariant(item.decision)}
                size="sm"
              />
            </View>
          )}
          {item.finalResolution && (
            <Text style={styles.resolutionText}>
              {item.finalResolution}
            </Text>
          )}
        </View>
      )}
    </View>
  );

  if (loading) {
    return <LoadingScreen />;
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
        
        <Text style={styles.headerTitle}>My Reports</Text>
        
        <View style={styles.headerSpacer} />
      </View>

      {/* List */}
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        renderItem={renderReport}
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
            icon={<FileText size={48} color={COLORS.textMuted} strokeWidth={1.5} />}
            title="No reports yet"
            description="Your complaint reports will appear here when you submit them."
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
  
  // List
  list: {
    padding: 20,
    flexGrow: 1,
  },
  separator: {
    height: 12,
  },
  
  // Report Card
  reportCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  reportIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.warningLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reportInfo: {
    flex: 1,
    marginRight: 10,
  },
  hostelName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  reportDate: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  description: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  
  // Resolution Box
  resolutionBox: {
    marginTop: 14,
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 12,
    padding: 14,
  },
  decisionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  decisionLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  resolutionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});