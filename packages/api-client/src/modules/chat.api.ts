import { AxiosInstance } from 'axios';
import type {
  ApiResponse,
  PaginatedResponse,
  Conversation,
  Message,
  SendMessagePayload,
} from '@wunabuy/types';

/**
 * Real-time In-App Messaging API Module
 */
export function createChatApi(client: AxiosInstance) {
  return {
    /**
     * Fetch user's active conversations list.
     */
    getConversations: async (): Promise<ApiResponse<Conversation[]>> => {
      const res = await client.get<ApiResponse<Conversation[]>>('/chat/conversations');
      return res.data;
    },

    /**
     * Start a new direct conversation with another user.
     */
    startConversation: async (recipientId: string): Promise<ApiResponse<Conversation>> => {
      const res = await client.post<ApiResponse<Conversation>>('/chat/conversations', { recipient_id: recipientId, type: 'direct' });
      return res.data;
    },

    /**
     * Fetch paginated messages for a conversation.
     */
    getMessages: async (conversationId: string, params?: { cursor?: string; limit?: number }): Promise<PaginatedResponse<Message>> => {
      const res = await client.get<PaginatedResponse<Message>>(`/chat/conversations/${conversationId}/messages`, { params });
      return res.data;
    },

    /**
     * Send a message (Text or Image).
     */
    sendMessage: async (conversationId: string, payload: SendMessagePayload): Promise<ApiResponse<Message>> => {
      const res = await client.post<ApiResponse<Message>>(`/chat/conversations/${conversationId}/messages`, payload);
      return res.data;
    },

    /**
     * Edit a sent message within 5 minutes.
     */
    editMessage: async (messageId: string, content: string): Promise<ApiResponse<Message>> => {
      const res = await client.put<ApiResponse<Message>>(`/chat/messages/${messageId}`, { content });
      return res.data;
    },

    /**
     * Delete a sent message within 5 minutes.
     */
    deleteMessage: async (messageId: string): Promise<ApiResponse<{ message: string }>> => {
      const res = await client.delete<ApiResponse<{ message: string }>>(`/chat/messages/${messageId}`);
      return res.data;
    },

    /**
     * Block an abusive user.
     */
    blockUser: async (targetUserId: string): Promise<ApiResponse<{ blocked: boolean }>> => {
      const res = await client.post<ApiResponse<{ blocked: boolean }>>('/chat/block', { target_user_id: targetUserId });
      return res.data;
    },

    /**
     * Report offensive chat message or participant.
     */
    reportUser: async (payload: { target_user_id: string; reason: string; message_id?: string }): Promise<ApiResponse<{ reported: boolean }>> => {
      const res = await client.post<ApiResponse<{ reported: boolean }>>('/chat/report', payload);
      return res.data;
    },
  };
}
