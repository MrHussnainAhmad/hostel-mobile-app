// app/(app)/manager/chat.tsx

import { COLORS, OPACITY } from '@/constants/colors';
import { useRouter } from 'expo-router';
import { ChevronRight, MessageCircle } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { chatApi } from '@/api/chat';
import AppText from "@/components/common/AppText";
import { EmptyState, LoadingScreen } from '@/components/ui';
import { Conversation } from '@/types';


// Avatar colors
const AVATAR_COLORS = [
  '#5856D6',
  '#34C759',
  '#007AFF',
  '#FF9500',
  '#AF52DE',
  '#FF2D55',
];

export default function ManagerChatScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const fetchConversations = async () => {
    try {
      const response = await chatApi.getMyConversations();
      if (response.success) {
        setConversations(response.data);
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2:
          error?.response?.data?.message ||
          t('manager.chat.fetch_failed'),
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchConversations();
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return t('manager.chat.yesterday');
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getAvatarColor = (name: string) => {
    const index = name.charCodeAt(0) % AVATAR_COLORS.length;
    return AVATAR_COLORS[index];
  };

  const renderConversation = ({ item }: { item: Conversation }) => {
    const studentName =
      item.student?.fullName ||
      item.student?.user?.email ||
      t('manager.chat.student_fallback_name');

    const initial = studentName.charAt(0).toUpperCase();
    const avatarColor = getAvatarColor(studentName);

    return (
      <Pressable
        style={({ pressed }) => [
          styles.conversationCard,
          pressed && { opacity: OPACITY.pressed },
        ]}
        onPress={() => router.push(`/(app)/manager/conversation/${item.id}`)}
      >
        {/* Avatar */}
        <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
          <AppText style={styles.avatarText}>{initial}</AppText>
        </View>

        {/* Content */}
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <AppText style={styles.conversationName} numberOfLines={1}>
              {studentName}
            </AppText>
            {item.lastMessageAt && (
              <AppText style={styles.conversationTime}>
                {formatTime(item.lastMessageAt)}
              </AppText>
            )}
          </View>

          <AppText style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage || t('manager.chat.last_message_fallback')}
          </AppText>
        </View>

        {/* Arrow */}
        <ChevronRight size={18} color={COLORS.textMuted} strokeWidth={1.5} />
      </Pressable>
    );
  };

  if (loading) {
    return <LoadingScreen />;
  }

  const count = conversations.length;
  const conversationLabel =
    count === 1
      ? t('manager.chat.conversation_singular')
      : t('manager.chat.conversation_plural');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <AppText style={styles.title}>{t('manager.chat.title')}</AppText>
        <AppText style={styles.subtitle}>
          {count} {conversationLabel}
        </AppText>
      </View>

      {/* List */}
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={renderConversation}
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
            icon={
              <MessageCircle
                size={48}
                color={COLORS.textMuted}
                strokeWidth={1.5}
              />
            }
            title={t('manager.chat.empty_title')}
            description={t('manager.chat.empty_description')}
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

  // List
  list: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    flexGrow: 1,
  },
  separator: {
    height: 8,
  },

  // Conversation Card
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textInverse,
  },
  conversationContent: {
    flex: 1,
    marginRight: 8,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 12,
    letterSpacing: -0.2,
  },
  conversationTime: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  lastMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});