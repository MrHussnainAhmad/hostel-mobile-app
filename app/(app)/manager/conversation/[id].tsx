import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Send } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import { chatApi } from "@/api/chat";
import AppText from "@/components/common/AppText";
import { LoadingScreen } from "@/components/ui";
import { COLORS } from "@/constants/colors";
import { useAuthStore } from "@/stores/authStore";
import { Message } from "@/types";


export default function ManagerConversationScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const flatListRef = useRef<FlatList>(null);

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const animateMessages = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const fetchMessages = async () => {
    try {
      const response = await chatApi.getMessages(id);
      if (response.success) {
        setMessages(response.data);
        animateMessages();
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: t("manager.conversation.fetch_error_title"),
        text2:
          error?.response?.data?.message ||
          t("manager.conversation.fetch_error_message"),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(app)/manager/chat");
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
        }, 120);
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: t("manager.conversation.send_error_title"),
        text2:
          error?.response?.data?.message ||
          t("manager.conversation.send_error_message"),
      });
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.senderId === user?.id;

    return (
      <Animated.View
        style={[
          styles.messageRow,
          isMe && styles.messageRowMe,
          { opacity: fadeAnim },
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isMe ? styles.bubbleMe : styles.bubbleOther,
          ]}
        >
          <AppText
            style={[styles.messageText, isMe && styles.messageTextMe]}
          >
            {item.text}
          </AppText>

          <AppText
            style={[styles.messageTime, isMe && styles.messageTimeMe]}
          >
            {formatTime(item.createdAt)}
          </AppText>
        </View>
      </Animated.View>
    );
  };

  if (loading) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <ArrowLeft size={26} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <AppText style={styles.headerTitle}>
          {t("manager.conversation.title")}
        </AppText>

        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >
        {/* MESSAGE LIST */}
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
                {t("manager.conversation.empty_title")}
              </AppText>
              <AppText style={styles.emptySubtext}>
                {t("manager.conversation.empty_subtitle")}
              </AppText>
            </View>
          }
        />

        {/* INPUT AREA */}
        <View style={styles.inputWrapper}>
          <View style={styles.inputFieldWrapper}>
            <TextInput
              style={styles.input}
              placeholder={t("manager.conversation.input_placeholder")}
              placeholderTextColor={COLORS.textMuted}
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
              maxLength={500}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.sendButton,
              !newMessage.trim() && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!newMessage.trim() || sending}
          >
            <Send
              size={22}
              color={
                newMessage.trim()
                  ? COLORS.textInverse
                  : COLORS.textMuted
              }
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ----------------------------------------------------------
   Styles
---------------------------------------------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: COLORS.bgPrimary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },

  content: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    flexGrow: 1,
  },

  /* MESSAGE ROWS */
  messageRow: {
    marginBottom: 14,
    flexDirection: "row",
  },
  messageRowMe: {
    justifyContent: "flex-end",
  },

  /* BUBBLES */
  messageBubble: {
    maxWidth: "78%",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  bubbleMe: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 6,
  },
  bubbleOther: {
    backgroundColor: COLORS.bgSecondary,
    borderBottomLeftRadius: 6,
  },

  messageText: {
    fontSize: 15,
    lineHeight: 20,
    color: COLORS.textPrimary,
  },
  messageTextMe: {
    color: COLORS.textInverse,
  },

  messageTime: {
    fontSize: 11,
    marginTop: 6,
    alignSelf: "flex-end",
    color: COLORS.textMuted,
  },
  messageTimeMe: {
    color: "rgba(255,255,255,0.75)",
  },

  /* EMPTY STATE */
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  emptySubtext: {
    marginTop: 6,
    color: COLORS.textMuted,
    fontSize: 14,
  },

  /* INPUT AREA */
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.bgPrimary,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },

  inputFieldWrapper: {
    flex: 1,
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 24,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  input: {
    fontSize: 15,
    color: COLORS.textPrimary,
    paddingVertical: 10,
    maxHeight: 110,
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

