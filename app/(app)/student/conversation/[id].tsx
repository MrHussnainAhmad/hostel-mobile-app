import { COLORS, OPACITY } from "@/constants/colors";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Send } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import { chatApi } from "@/api/chat";
import AppText from "@/components/common/AppText";
import { LoadingScreen } from "@/components/ui";
import { useAuthStore } from "@/stores/authStore";
import { Message } from "@/types";


export default function StudentConversationScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const flatListRef = useRef<FlatList>(null);

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const fetchMessages = async () => {
    try {
      const response = await chatApi.getMessages(id);
      if (response.success) {
        setMessages(response.data);
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: t("student.conversations.error_title"),
        text2:
          error?.response?.data?.message ||
          t("student.conversations.error_fetch_messages"),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const response = await chatApi.sendMessage({
        conversationId: id,
        text: newMessage.trim(),
      });

      if (response.success) {
        setMessages((prev) => [...prev, response.data]);
        setNewMessage("");
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: t("student.conversations.error_title"),
        text2:
          error?.response?.data?.message ||
          t("student.conversations.error_send_message"),
      });
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.senderId === user?.id;

    return (
      <View style={[styles.messageRow, isMe && styles.messageRowMe]}>
        <View
          style={[
            styles.messageBubble,
            isMe ? styles.bubbleMe : styles.bubbleOther,
          ]}
        >
          <AppText style={[styles.messageText, isMe && styles.messageTextMe]}>
            {item.text}
          </AppText>
          <AppText style={[styles.messageTime, isMe && styles.messageTimeMe]}>
            {formatTime(item.createdAt)}
          </AppText>
        </View>
      </View>
    );
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
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
        <AppText style={styles.headerTitle}>
          {t("student.conversations.header_title")}
        </AppText>
        <View style={styles.headerSpacer} />
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <AppText style={styles.emptyText}>
                {t("student.conversations.empty_title")}
              </AppText>
              <AppText style={styles.emptySubtext}>
                {t("student.conversations.empty_subtitle")}
              </AppText>
            </View>
          }
        />

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={t("student.conversations.placeholder_message")}
            placeholderTextColor={COLORS.inputPlaceholder}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={500}
          />
          <Pressable
            style={({ pressed }) => [
              styles.sendButton,
              !newMessage.trim() && styles.sendButtonDisabled,
              pressed && newMessage.trim() && { opacity: OPACITY.pressed },
            ]}
            onPress={handleSend}
            disabled={!newMessage.trim() || sending}
          >
            <Send
              size={20}
              color={newMessage.trim() ? COLORS.textInverse : COLORS.textMuted}
              strokeWidth={1.5}
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  headerSpacer: {
    width: 44,
  },

  // Content
  keyboardView: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexGrow: 1,
  },

  // Message Bubble
  messageRow: {
    marginBottom: 12,
    flexDirection: "row",
  },
  messageRowMe: {
    justifyContent: "flex-end",
  },
  messageBubble: {
    maxWidth: "78%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  bubbleMe: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 6,
  },
  bubbleOther: {
    backgroundColor: COLORS.bgCard,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  messageText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    lineHeight: 21,
  },
  messageTextMe: {
    color: COLORS.textInverse,
  },
  messageTime: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 6,
    alignSelf: "flex-end",
  },
  messageTimeMe: {
    color: "rgba(255, 255, 255, 0.7)",
  },

  // Empty
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 6,
  },

  // Input
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: COLORS.bgPrimary,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.textPrimary,
    maxHeight: 100,
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.bgSecondary,
  },
});
