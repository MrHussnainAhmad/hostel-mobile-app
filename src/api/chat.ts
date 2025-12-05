import { Conversation, Message } from '@/types';
import apiClient from './client';

export const chatApi = {
  // Get my conversations
  getMyConversations: async (): Promise<{ success: boolean; data: Conversation[] }> => {
    const response = await apiClient.get('/chat/conversations');
    return response.data;
  },

  // Get messages
  getMessages: async (conversationId: string): Promise<{ success: boolean; data: Message[] }> => {
    const response = await apiClient.get(`/chat/conversation/${conversationId}/messages`);
    return response.data;
  },

  // Send message
  sendMessage: async (data: { conversationId: string; text: string }): Promise<{ success: boolean; data: Message }> => {
    const response = await apiClient.post('/chat/message', data);
    return response.data;
  },

  // Student: Start conversation
  startConversation: async (managerId: string): Promise<{ success: boolean; data: Conversation }> => {
    const response = await apiClient.post('/chat/conversation', { managerId });
    return response.data;
  },
};