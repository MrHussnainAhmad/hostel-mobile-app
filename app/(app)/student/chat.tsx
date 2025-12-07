// screens/ChatScreen.tsx

import { COLORS, OPACITY } from '@/constants/colors';
import { useRouter } from 'expo-router';
import { ChevronRight, MessageCircle } from 'lucide-react-native';
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

import { chatApi } from '@/api/chat';
import { EmptyState, LoadingScreen } from '@/components/ui';
import { Conversation } from '@/types';

// Avatar colors - subtle, professional palette
const AVATAR_COLORS = [
  '#5856D6', // Primary
  '#34C759', // Success
  '#007AFF', // Info
  '#FF9500', // Warning
  '#AF52DE', // Purple
  '#FF2D55', // Pink
];

export default function StudentChatScreen() {
  const router = useRouter();
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
        text1: 'Error',
        text2: error?.response?.data?.message || 'Failed to fetch conversations',
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
      return 'Yesterday';
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

  const renderConversation = ({ item, index }: { item: Conversation; index: number }) => {
    const managerName =
      item.manager?.fullName || item.manager?.user?.email || 'Manager';
    const initial = managerName.charAt(0).toUpperCase();
    const avatarColor = getAvatarColor(managerName);

    return (
      <Pressable
        style={({ pressed }) => [
          styles.conversationCard,
          pressed && { opacity: OPACITY.pressed },
        ]}
        onPress={() => router.push(`/(app)/student/conversation/${item.id}`)}
      >
        {/* Avatar */}
        <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>

        {/* Content */}
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={styles.conversationName} numberOfLines={1}>
              {managerName}
            </Text>
            {item.lastMessageAt && (
              <Text style={styles.conversationTime}>
                {formatTime(item.lastMessageAt)}
              </Text>
            )}
          </View>

          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage || 'No messages yet'}
          </Text>
        </View>

        {/* Arrow */}
        <ChevronRight size={18} color={COLORS.textMuted} strokeWidth={1.5} />
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
        <Text style={styles.title}>Messages</Text>
        <Text style={styles.subtitle}>
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
        </Text>
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
            icon={<MessageCircle size={48} color={COLORS.textMuted} strokeWidth={1.5} />}
            title="No messages"
            description="Start a conversation with a hostel manager from any hostel page."
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