import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useConversations } from '../../hooks/useChat';
import { ChatWindow } from './ChatWindow';
import { palette, radius, shadow, typography } from '../../styles/theme';
import type { Conversation } from '../../types/chat';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatModal({ isOpen, onClose }: ChatModalProps) {
  const { language, direction } = useLanguage();
  const { user } = useAuth();
  const isArabic = language === 'ar';
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const { conversations, isLoading } = useConversations();

  if (!isOpen) {
    return null;
  }

  // Get or create conversation for investor
  const getOrCreateConversation = (): Conversation | null => {
    if (user?.role === 'admin') {
      // Admin can select from list
      return null;
    }
    // Investor uses first conversation or creates new one
    // If no conversation exists, create a placeholder that will be created on first message
    return conversations[0] || (user?.id ? {
      id: '',
      investorId: user.id,
      adminId: null,
      lastMessageAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } : null);
  };

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleBack = () => {
    setSelectedConversation(null);
  };

  const currentConversation = selectedConversation || getOrCreateConversation();

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
        direction,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '800px',
          maxHeight: '90vh',
          background: palette.backgroundBase,
          borderRadius: radius.lg,
          boxShadow: shadow.medium,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {user?.role === 'admin' && !currentConversation ? (
          // Admin conversation list
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              height: '600px',
              maxHeight: '80vh',
            }}
          >
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
              <h3
                style={{
                  margin: 0,
                  fontSize: typography.sizes.heading,
                  fontWeight: typography.weights.semibold,
                  color: palette.textPrimary,
                }}
              >
                {isArabic ? 'المحادثات' : 'Conversations'}
              </h3>
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
                }}
              >
                ×
              </button>
            </div>
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1rem',
              }}
            >
              {isLoading ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '2rem',
                    color: palette.textSecondary,
                  }}
                >
                  {isArabic ? 'جاري التحميل...' : 'Loading...'}
                </div>
              ) : conversations.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '2rem',
                    color: palette.textSecondary,
                  }}
                >
                  {isArabic
                    ? 'لا توجد محادثات'
                    : 'No conversations'}
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  {conversations.map((conv) => (
                    <button
                      key={conv.id}
                      type="button"
                      onClick={() => handleConversationSelect(conv)}
                      style={{
                        padding: '1rem',
                        borderRadius: radius.md,
                        border: `1px solid ${palette.neutralBorderMuted}`,
                        background: palette.backgroundBase,
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = palette.backgroundSurface;
                        e.currentTarget.style.borderColor = palette.brandPrimary;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = palette.backgroundBase;
                        e.currentTarget.style.borderColor = palette.neutralBorderMuted;
                      }}
                    >
                      <div
                        style={{
                          fontWeight: typography.weights.semibold,
                          color: palette.textPrimary,
                          marginBottom: '0.25rem',
                        }}
                      >
                        {conv.participant?.fullName || conv.participant?.email || 'Unknown'}
                      </div>
                      {conv.lastMessage && (
                        <div
                          style={{
                            fontSize: typography.sizes.caption,
                            color: palette.textSecondary,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {conv.lastMessage.content}
                        </div>
                      )}
                      {conv.unreadCount && conv.unreadCount > 0 && (
                        <div
                          style={{
                            marginTop: '0.5rem',
                            display: 'inline-block',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '999px',
                            background: palette.brandPrimaryStrong,
                            color: '#ffffff',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}
                        >
                          {conv.unreadCount}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : currentConversation ? (
          // Chat window
          <div style={{ position: 'relative' }}>
            {selectedConversation && user?.role === 'admin' && (
              <button
                type="button"
                onClick={handleBack}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  left: '1rem',
                  zIndex: 10,
                  padding: '0.5rem 1rem',
                  borderRadius: radius.md,
                  border: `1px solid ${palette.neutralBorderMuted}`,
                  background: palette.backgroundBase,
                  color: palette.textPrimary,
                  cursor: 'pointer',
                }}
              >
                ← {isArabic ? 'رجوع' : 'Back'}
              </button>
            )}
            <ChatWindow
              conversation={currentConversation}
              onClose={onClose}
            />
          </div>
        ) : (
          // Empty state for investor
          <div
            style={{
              padding: '3rem',
              textAlign: 'center',
              color: palette.textSecondary,
            }}
          >
            <p>{isArabic ? 'لا توجد محادثة' : 'No conversation'}</p>
          </div>
        )}
      </div>
    </div>
  );
}

