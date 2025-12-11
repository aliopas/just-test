import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useMessages, useSendMessage, useMarkMessagesRead } from '../../hooks/useChat';
import { palette, radius, shadow, typography } from '../../styles/theme';
import type { Conversation } from '../../types/chat';

interface ChatWindowProps {
  conversation: Conversation;
  onClose: () => void;
}

export function ChatWindow({ conversation, onClose }: ChatWindowProps) {
  const { language, direction } = useLanguage();
  const { user } = useAuth();
  const isArabic = language === 'ar';
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { messages, isLoading } = useMessages(conversation.id || undefined);
  const sendMessageMutation = useSendMessage();
  const markReadMutation = useMarkMessagesRead();

  const isInvestor = user?.role === 'investor';
  const otherUserId = isInvestor ? conversation.adminId : conversation.investorId;
  const isNewConversation = !conversation.id;

  // Mark messages as read when window opens
  useEffect(() => {
    if (conversation.id && messages.length > 0) {
      const unreadMessages = messages.filter(
        (msg) => !msg.readAt && msg.senderId !== user?.id
      );
      if (unreadMessages.length > 0) {
        markReadMutation.mutate(conversation.id);
      }
    }
  }, [conversation.id, messages.length, user?.id]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || sendMessageMutation.isPending) {
      return;
    }

    try {
      await sendMessageMutation.mutateAsync({
        conversationId: conversation.id || undefined,
        content: messageText.trim(),
        ...(isInvestor && !conversation.id ? { investorId: user?.id } : {}),
        ...(!isInvestor && !conversation.id ? { adminId: user?.id } : {}),
      });
      setMessageText('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '600px',
        maxHeight: '80vh',
        background: palette.backgroundBase,
        borderRadius: radius.lg,
        boxShadow: shadow.medium,
        border: `1px solid ${palette.neutralBorderMuted}`,
        direction,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '1rem 1.5rem',
          borderBottom: `1px solid ${palette.neutralBorderMuted}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: palette.backgroundSurface,
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: typography.sizes.heading,
              fontWeight: typography.weights.semibold,
              color: palette.textPrimary,
            }}
          >
            {isArabic ? 'الدردشة' : 'Chat'}
          </h3>
          <p
            style={{
              margin: '0.25rem 0 0',
              fontSize: typography.sizes.caption,
              color: palette.textSecondary,
            }}
          >
            {isArabic
              ? isInvestor
                ? 'مع الإدارة'
                : `مع المستثمر`
              : isInvestor
                ? 'With Admin'
                : 'With Investor'}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{
            padding: '0.5rem',
            border: 'none',
            background: 'transparent',
            color: palette.textSecondary,
            cursor: 'pointer',
            borderRadius: radius.md,
            fontSize: '1.5rem',
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label={isArabic ? 'إغلاق' : 'Close'}
        >
          ×
        </button>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        {isNewConversation ? (
          <div
            style={{
              textAlign: 'center',
              padding: '2rem',
              color: palette.textSecondary,
            }}
          >
            {isArabic
              ? 'ابدأ المحادثة مع الإدارة'
              : 'Start a conversation with admin'}
          </div>
        ) : isLoading ? (
          <div
            style={{
              textAlign: 'center',
              padding: '2rem',
              color: palette.textSecondary,
            }}
          >
            {isArabic ? 'جاري التحميل...' : 'Loading...'}
          </div>
        ) : messages.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '2rem',
              color: palette.textSecondary,
            }}
          >
            {isArabic
              ? 'لا توجد رسائل بعد. ابدأ المحادثة!'
              : 'No messages yet. Start the conversation!'}
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.senderId === user?.id;
            return (
              <div
                key={message.id}
                style={{
                  display: 'flex',
                  justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                }}
              >
                <div
                  style={{
                    maxWidth: '70%',
                    padding: '0.75rem 1rem',
                    borderRadius: radius.lg,
                    background: isOwnMessage
                      ? palette.brandPrimaryStrong
                      : palette.backgroundSurface,
                    color: isOwnMessage ? palette.textOnBrand : palette.textPrimary,
                    border: isOwnMessage
                      ? 'none'
                      : `1px solid ${palette.neutralBorderMuted}`,
                    boxShadow: shadow.subtle,
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: typography.sizes.body,
                      lineHeight: 1.5,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {message.content}
                  </p>
                  <div
                    style={{
                      marginTop: '0.5rem',
                      fontSize: typography.sizes.caption,
                      opacity: 0.7,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <span>
                      {new Date(message.createdAt).toLocaleTimeString(
                        isArabic ? 'ar-SA' : 'en-US',
                        { hour: '2-digit', minute: '2-digit' }
                      )}
                    </span>
                    {isOwnMessage && message.readAt && (
                      <span>✓✓</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        style={{
          padding: '1rem',
          borderTop: `1px solid ${palette.neutralBorderMuted}`,
          background: palette.backgroundSurface,
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'flex-end',
          }}
        >
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder={
              isArabic ? 'اكتب رسالتك...' : 'Type your message...'
            }
            rows={2}
            style={{
              flex: 1,
              padding: '0.75rem',
              borderRadius: radius.md,
              border: `1px solid ${palette.neutralBorderMuted}`,
              background: palette.backgroundBase,
              color: palette.textPrimary,
              fontSize: typography.sizes.body,
              fontFamily: 'inherit',
              resize: 'none',
              minHeight: '44px',
              maxHeight: '120px',
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
          />
          <button
            type="submit"
            disabled={!messageText.trim() || sendMessageMutation.isPending}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: radius.md,
              border: 'none',
              background:
                messageText.trim() && !sendMessageMutation.isPending
                  ? palette.brandPrimaryStrong
                  : palette.neutralBorderMuted,
              color:
                messageText.trim() && !sendMessageMutation.isPending
                  ? palette.textOnBrand
                  : palette.textSecondary,
              cursor:
                messageText.trim() && !sendMessageMutation.isPending
                  ? 'pointer'
                  : 'not-allowed',
              fontWeight: typography.weights.semibold,
              fontSize: typography.sizes.body,
              minWidth: '80px',
            }}
          >
            {sendMessageMutation.isPending
              ? isArabic
                ? 'جاري الإرسال...'
                : 'Sending...'
              : isArabic
                ? 'إرسال'
                : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}

