import Echo from 'laravel-echo';
import type { Message, TypingEvent, ReadReceiptEvent } from '@wunabuy/types';

/**
 * Subscribe to real-time chat messages, typing indicators, and read receipts.
 */
export function subscribeToChatChannel(
  echo: Echo<any>,
  conversationId: string,
  onMessageSent: (message: Message) => void,
  onUserTyping?: (event: TypingEvent) => void,
  onMessageRead?: (event: ReadReceiptEvent) => void
) {
  const channel = echo.private(`chat.${conversationId}`);

  channel.listen('.message.sent', (payload: Message) => {
    onMessageSent(payload);
  });

  if (onUserTyping) {
    channel.listen('.user.typing', (payload: TypingEvent) => {
      onUserTyping(payload);
    });
  }

  if (onMessageRead) {
    channel.listen('.message.read', (payload: ReadReceiptEvent) => {
      onMessageRead(payload);
    });
  }

  return () => {
    echo.leave(`chat.${conversationId}`);
  };
}
