import { UserRole } from './auth.types';

/**
 * Supported message content types.
 */
export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  PRODUCT_CARD = 'product_card',
  ORDER_CARD = 'order_card',
  STORE_CARD = 'store_card',
}

/**
 * Chat conversation types.
 */
export enum ConversationType {
  DIRECT = 'direct',
  GROUP = 'group',
}

/**
 * Represents a user participating in a chat conversation.
 */
export interface ChatParticipant {
  /** UUID of the user */
  user_id: string;
  /** Full name of the user */
  full_name: string;
  /** URL to the user's avatar */
  avatar_url: string | null;
  /** Role of the participant in the system */
  role: UserRole;
}

/**
 * Represents a message in a conversation.
 */
export interface Message {
  /** Unique UUID of the message */
  id: string;
  /** UUID of the conversation */
  conversation_id: string;
  /** UUID of the user who sent the message */
  sender_id: string;
  /** Type of the message content */
  type: MessageType;
  /** Text content of the message */
  content: string;
  /** URL to the media attachment, if any */
  media_url: string | null;
  /** Associated product UUID, if applicable */
  product_id: string | null;
  /** Associated order UUID, if applicable */
  order_id: string | null;
  /** Indicates whether the message has been edited */
  is_edited: boolean;
  /** ISO 8601 creation timestamp */
  created_at: string;
  /** ISO 8601 update timestamp */
  updated_at: string;
}

/**
 * Represents a chat conversation instance.
 */
export interface Conversation {
  /** Unique UUID of the conversation */
  id: string;
  /** Type of conversation */
  type: ConversationType;
  /** Users participating in the conversation */
  participants: ChatParticipant[];
  /** The most recent message sent in the chat */
  last_message: Message | null;
  /** Number of unread messages for the current user */
  unread_count: number;
  /** Linked order ID, useful for order-specific chats */
  active_order_id: string | null;
  /** Indicates if notifications are muted for this chat */
  is_muted: boolean;
  /** ISO 8601 date string for the last activity */
  updated_at: string;
}

/**
 * Payload to send a new chat message.
 */
export interface SendMessagePayload {
  /** Type of message to send */
  type: MessageType;
  /** Text content of the message */
  content: string;
  /** UUID of attached product, if any */
  product_id: string | null;
  /** URL of attached media, if any */
  media_url: string | null;
}

/**
 * Event for broadcast when a user is typing.
 */
export interface TypingEvent {
  /** UUID of the conversation */
  conversation_id: string;
  /** UUID of the typing user */
  user_id: string;
  /** Indicates whether the user is actively typing */
  is_typing: boolean;
}

/**
 * Event for indicating messages have been read.
 */
export interface ReadReceiptEvent {
  /** UUID of the conversation */
  conversation_id: string;
  /** UUID of the user who read the messages */
  user_id: string;
  /** ISO 8601 timestamp of when messages were read */
  last_read_at: string;
}
