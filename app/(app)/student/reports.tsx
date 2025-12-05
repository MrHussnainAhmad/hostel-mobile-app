import { useRouter } from 'expo-router';
import { AlertTriangle, ArrowLeft, FileText } from 'lucide-react-native';
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

import { reportsApi } from '@/api/reports';
import { Badge, Card, EmptyState, LoadingScreen } from '@/components/ui';
import { COLORS } from '@/constants/colors';
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
    <Card style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <View style={styles.reportIcon}>
          <AlertTriangle size={20} color={COLORS.warning} />
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
        />
      </View>

      <Text style={styles.description}>{item.description}</Text>

      {item.status === 'RESOLVED' && (
        <View style={styles.resolutionBox}>
          {item.decision && (
            <View style={styles.decisionRow}>
              <Text style={styles.decisionLabel}>Decision:</Text>
              <Badge
                label={item.decision.replace('_', ' ')}
                variant={getDecisionVariant(item.decision)}
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
    </Card>
  );

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My reports</Text>
        <View style={{ width: 40 }} />
      </View>

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
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon={<FileText size={64} color={COLORS.textMuted} />}
            title="No reports"
            description="Your complaint reports will appear here."
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
  list: {
    padding: 24,
    flexGrow: 1,
  },
  reportCard: {
    marginBottom: 16,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reportIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.warning + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reportInfo: {
    flex: 1,
  },
  hostelName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  reportDate: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 12,
  },
  resolutionBox: {
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 10,
    padding: 12,
  },
  decisionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  decisionLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  resolutionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});