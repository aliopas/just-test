import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useMessages, useSendMessage, useMarkMessagesRead } from '../../hooks/useChat';
import { Avatar } from './Avatar';
import { palette, radius, shadow, typography } from '../../styles/theme';
import type { Conversation, ConversationWithParticipant } from '../../types/chat';

interface ChatWindowProps {
  conversation: Conversation | ConversationWithParticipant;
  onClose: () => void;
}

function formatMessageTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const isToday = date.toDateString() === now.toDateString();
  const isYesterday = diffMs < 86400000 && diffMs > 0 && !isToday;

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (isToday) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  }
  if (isYesterday) return 'Yesterday';
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function shouldShowAvatar(messages: any[], currentIndex: number, userId: string | undefined): boolean {
  if (currentIndex === 0) return true;
  const currentMsg = messages[currentIndex];
  const prevMsg = messages[currentIndex - 1];
  
  return (
    prevMsg.senderId !== currentMsg.senderId ||
    new Date(currentMsg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() > 300000 // 5 minutes
  );
}

export function ChatWindow({ conversation, onClose }: ChatWindowProps) {
  const { language, direction } = useLanguage();
  const { user } = useAuth();
  const isArabic = language === 'ar';
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { messages, isLoading } = useMessages(conversation.id || undefined);
  const sendMessageMutation = useSendMessage();
  const markReadMutation = useMarkMessagesRead();

  const isInvestor = user?.role === 'investor';
  const participant = (conversation as ConversationWithParticipant).participant;
  const participantName = participant?.fullName || participant?.email || (isInvestor ? 'Admin' : 'Investor');
  const participantEmail = participant?.email || '';
  const isNewConversation = !conversation.id;

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [messageText]);

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
        ...(!isInvestor && !conversation.id ? { investorId: conversation.investorId, adminId: user?.id } : {}),
      });
      setMessageText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
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
        height: '650px',
        maxHeight: '85vh',
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
          background: `linear-gradient(135deg, ${palette.backgroundSurface} 0%, ${palette.backgroundBase} 100%)`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
          <Avatar
            name={participantName}
            email={participantEmail}
            size={40}
          />
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: typography.sizes.body,
                fontWeight: typography.weights.semibold,
                color: palette.textPrimary,
              }}
            >
              {participantName}
            </h3>
            <p
              style={{
                margin: 0,
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
            width: '32px',
            height: '32px',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = palette.backgroundSurface;
            e.currentTarget.style.color = palette.textPrimary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = palette.textSecondary;
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
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          background: palette.backgroundSurface,
        }}
      >
        {isNewConversation ? (
          <div
            style={{
              textAlign: 'center',
              padding: '3rem 2rem',
              color: palette.textSecondary,
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
            <p style={{ fontSize: typography.sizes.body, margin: 0 }}>
              {isArabic
                ? 'ابدأ المحادثة مع الإدارة'
                : 'Start a conversation with admin'}
            </p>
          </div>
        ) : isLoading ? (
          <div
            style={{
              textAlign: 'center',
              padding: '3rem',
              color: palette.textSecondary,
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                border: `3px solid ${palette.neutralBorderMuted}`,
                borderTopColor: palette.brandPrimary,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1rem',
              }}
            />
            {isArabic ? 'جاري التحميل...' : 'Loading...'}
          </div>
        ) : messages.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '3rem 2rem',
              color: palette.textSecondary,
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💭</div>
            <p style={{ fontSize: typography.sizes.body, margin: 0 }}>
              {isArabic
                ? 'لا توجد رسائل بعد. ابدأ المحادثة!'
                : 'No messages yet. Start the conversation!'}
            </p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwnMessage = message.senderId === user?.id;
            const showAvatar = !isOwnMessage && shouldShowAvatar(messages, index, user?.id);
            const showTime = index === messages.length - 1 || 
              new Date(messages[index + 1].createdAt).getTime() - new Date(message.createdAt).getTime() > 300000;

            return (
              <div
                key={message.id}
                style={{
                  display: 'flex',
                  justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-end',
                  gap: '0.5rem',
                  marginBottom: showTime ? '0.75rem' : '0',
                }}
              >
                {!isOwnMessage && (
                  <div style={{ width: '32px', flexShrink: 0 }}>
                    {showAvatar ? (
                      <Avatar
                        name={participantName}
                        email={participantEmail}
                        size={32}
                      />
                    ) : (
                      <div style={{ width: '32px', height: '32px' }} />
                    )}
                  </div>
                )}
                <div
                  style={{
                    maxWidth: '70%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isOwnMessage ? 'flex-end' : 'flex-start',
                    gap: '0.25rem',
                  }}
                >
                  <div
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: isOwnMessage 
                        ? `${radius.lg} ${radius.lg} ${radius.sm} ${radius.lg}`
                        : `${radius.lg} ${radius.lg} ${radius.lg} ${radius.sm}`,
                      background: isOwnMessage
                        ? `linear-gradient(135deg, ${palette.brandPrimary} 0%, ${palette.brandPrimaryStrong} 100%)`
                        : palette.backgroundBase,
                      color: isOwnMessage ? palette.textOnBrand : palette.textPrimary,
                      boxShadow: shadow.subtle,
                      wordBreak: 'break-word',
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: typography.sizes.body,
                        lineHeight: typography.lineHeights.relaxed,
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {message.content}
                    </p>
                  </div>
                  {showTime && (
                    <div
                      style={{
                        fontSize: typography.sizes.caption,
                        color: palette.textMuted,
                        padding: '0 0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      <span>{formatMessageTime(message.createdAt)}</span>
                      {isOwnMessage && message.readAt && (
                        <span style={{ fontSize: '0.875rem' }}>✓✓</span>
                      )}
                    </div>
                  )}
                </div>
                {isOwnMessage && (
                  <div style={{ width: '32px', flexShrink: 0 }}>
                    <Avatar
                      name={user?.email}
                      email={user?.email}
                      size={32}
                    />
                  </div>
                )}
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
          padding: '1rem 1.25rem',
          borderTop: `1px solid ${palette.neutralBorderMuted}`,
          background: palette.backgroundBase,
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'flex-end',
          }}
        >
          <textarea
            ref={textareaRef}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder={
              isArabic ? 'اكتب رسالتك...' : 'Type your message...'
            }
            rows={1}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              borderRadius: radius.md,
              border: `1px solid ${palette.neutralBorderMuted}`,
              background: palette.backgroundSurface,
              color: palette.textPrimary,
              fontSize: typography.sizes.body,
              fontFamily: 'inherit',
              resize: 'none',
              minHeight: '44px',
              maxHeight: '120px',
              transition: 'all 0.2s ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = palette.brandPrimary;
              e.currentTarget.style.boxShadow = shadow.focus;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = palette.neutralBorderMuted;
              e.currentTarget.style.boxShadow = 'none';
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
                  ? `linear-gradient(135deg, ${palette.brandPrimary} 0%, ${palette.brandPrimaryStrong} 100%)`
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
              transition: 'all 0.2s ease',
              boxShadow: messageText.trim() && !sendMessageMutation.isPending ? shadow.subtle : 'none',
            }}
            onMouseEnter={(e) => {
              if (messageText.trim() && !sendMessageMutation.isPending) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = shadow.medium;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = messageText.trim() && !sendMessageMutation.isPending ? shadow.subtle : 'none';
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
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
