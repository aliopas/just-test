import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useConversations, useInvestorsForChat } from '../../hooks/useChat';
import { ChatWindow } from './ChatWindow';
import { Avatar } from './Avatar';
import { palette, radius, shadow, typography } from '../../styles/theme';
import type { Conversation, ConversationWithParticipant } from '../../types/chat';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatTime(dateString: string | null | undefined): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function ChatModal({ isOpen, onClose }: ChatModalProps) {
  const { language, direction } = useLanguage();
  const { user } = useAuth();
  const isArabic = language === 'ar';
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithParticipant | Conversation | null>(null);
  const [activeTab, setActiveTab] = useState<'conversations' | 'users'>('conversations');
  const [userSearch, setUserSearch] = useState('');
  const { conversations, isLoading, error, isError } = useConversations();
  const { data: investors, isLoading: isLoadingInvestors } = useInvestorsForChat(
    user?.role === 'admin' ? userSearch : undefined
  );

  // Debug logging
  useEffect(() => {
    console.log('[ChatModal] Conversations state:', {
      conversations: conversations.length,
      isLoading,
      isError,
      error: error instanceof Error ? error.message : error,
      user: user?.id,
      role: user?.role,
    });
  }, [conversations, isLoading, isError, error, user]);

  if (!isOpen) {
    return null;
  }

  // Get or create conversation for investor
  const getOrCreateConversation = (): Conversation | null => {
    if (user?.role === 'admin') {
      return null;
    }
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

  const handleUserSelect = (investorId: string) => {
    const existingConv = conversations.find(c => c.investorId === investorId);
    if (existingConv) {
      setSelectedConversation(existingConv);
    } else {
      setSelectedConversation({
        id: '',
        investorId,
        adminId: user?.id || null,
        lastMessageAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  };

  const handleBack = () => {
    setSelectedConversation(null);
    setActiveTab('conversations');
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
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
        direction,
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}
      </style>
      <div
        style={{
          width: '100%',
          maxWidth: '900px',
          maxHeight: '90vh',
          background: palette.backgroundBase,
          borderRadius: radius.lg,
          boxShadow: shadow.medium,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUp 0.3s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {user?.role === 'admin' && !currentConversation ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              height: '650px',
              maxHeight: '85vh',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: `1px solid ${palette.neutralBorderMuted}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: `linear-gradient(135deg, ${palette.backgroundSurface} 0%, ${palette.backgroundBase} 100%)`,
              }}
            >
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flex: 1 }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('conversations')}
                  style={{
                    padding: '0.625rem 1.25rem',
                    border: 'none',
                    background: activeTab === 'conversations' 
                      ? `linear-gradient(135deg, ${palette.brandPrimary} 0%, ${palette.brandPrimaryStrong} 100%)`
                      : 'transparent',
                    color: activeTab === 'conversations' ? '#ffffff' : palette.textSecondary,
                    cursor: 'pointer',
                    borderRadius: radius.md,
                    fontWeight: typography.weights.semibold,
                    fontSize: typography.sizes.body,
                    transition: 'all 0.2s ease',
                    boxShadow: activeTab === 'conversations' ? shadow.subtle : 'none',
                  }}
                >
                  {isArabic ? 'المحادثات' : 'Conversations'}
                  {conversations.length > 0 && (
                    <span style={{ marginLeft: '0.5rem', opacity: 0.8 }}>
                      ({conversations.length})
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('users')}
                  style={{
                    padding: '0.625rem 1.25rem',
                    border: 'none',
                    background: activeTab === 'users'
                      ? `linear-gradient(135deg, ${palette.brandPrimary} 0%, ${palette.brandPrimaryStrong} 100%)`
                      : 'transparent',
                    color: activeTab === 'users' ? '#ffffff' : palette.textSecondary,
                    cursor: 'pointer',
                    borderRadius: radius.md,
                    fontWeight: typography.weights.semibold,
                    fontSize: typography.sizes.body,
                    transition: 'all 0.2s ease',
                    boxShadow: activeTab === 'users' ? shadow.subtle : 'none',
                  }}
                >
                  {isArabic ? 'جميع المستخدمين' : 'All Users'}
                </button>
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
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
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
              >
                ×
              </button>
            </div>

            {/* Search Bar */}
            {activeTab === 'users' && (
              <div
                style={{
                  padding: '1rem 1.5rem',
                  borderBottom: `1px solid ${palette.neutralBorderMuted}`,
                  background: palette.backgroundSurface,
                }}
              >
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder={isArabic ? 'ابحث عن مستخدم...' : 'Search users...'}
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 2.5rem',
                      borderRadius: radius.md,
                      border: `1px solid ${palette.neutralBorderMuted}`,
                      fontSize: typography.sizes.body,
                      background: palette.backgroundBase,
                      color: palette.textPrimary,
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
                  />
                  <span
                    style={{
                      position: 'absolute',
                      left: '0.875rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: palette.textSecondary,
                      fontSize: '1.125rem',
                    }}
                  >
                    🔍
                  </span>
                </div>
              </div>
            )}

            {/* Content */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1rem',
                background: palette.backgroundSurface,
              }}
            >
              {activeTab === 'conversations' ? (
                <>
                  {isLoading ? (
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
                  ) : isError ? (
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '2rem',
                        color: palette.error,
                        background: `${palette.error}15`,
                        borderRadius: radius.md,
                        margin: '1rem',
                      }}
                    >
                      {isArabic
                        ? `خطأ في تحميل المحادثات: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`
                        : `Error loading conversations: ${error instanceof Error ? error.message : 'Unknown error'}`}
                    </div>
                  ) : conversations.length === 0 ? (
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '3rem',
                        color: palette.textSecondary,
                      }}
                    >
                      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
                      <p style={{ fontSize: typography.sizes.body, margin: 0 }}>
                        {isArabic ? 'لا توجد محادثات' : 'No conversations'}
                      </p>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                      }}
                    >
                      {conversations.map((conv) => {
                        const participantName = conv.participant?.fullName || conv.participant?.email || 'Unknown';
                        const participantEmail = conv.participant?.email || '';
                        const isSelected = Boolean(
                          selectedConversation && 
                          conv.id && 
                          (selectedConversation as Conversation).id === conv.id
                        );
                        
                        return (
                          <button
                            key={conv.id || `conv-${conv.investorId}-${conv.adminId}`}
                            type="button"
                            onClick={() => handleConversationSelect(conv)}
                            style={{
                              padding: '1rem',
                              borderRadius: radius.lg,
                              border: `1px solid ${isSelected ? palette.brandPrimary : palette.neutralBorderMuted}`,
                              background: isSelected 
                                ? `${palette.brandPrimary}10`
                                : palette.backgroundBase,
                              textAlign: 'left',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              gap: '0.75rem',
                              alignItems: 'flex-start',
                              boxShadow: isSelected ? shadow.subtle : 'none',
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) {
                                e.currentTarget.style.background = palette.backgroundSurface;
                                e.currentTarget.style.borderColor = palette.brandPrimary;
                                e.currentTarget.style.boxShadow = shadow.subtle;
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) {
                                e.currentTarget.style.background = palette.backgroundBase;
                                e.currentTarget.style.borderColor = palette.neutralBorderMuted;
                                e.currentTarget.style.boxShadow = 'none';
                              }
                            }}
                          >
                            <Avatar
                              name={participantName}
                              email={participantEmail}
                              size={48}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'flex-start',
                                  marginBottom: '0.25rem',
                                }}
                              >
                                <div
                                  style={{
                                    fontWeight: typography.weights.semibold,
                                    color: palette.textPrimary,
                                    fontSize: typography.sizes.body,
                                  }}
                                >
                                  {participantName}
                                </div>
                                {conv.lastMessageAt && (
                                  <span
                                    style={{
                                      fontSize: typography.sizes.caption,
                                      color: palette.textMuted,
                                      whiteSpace: 'nowrap',
                                      marginLeft: '0.5rem',
                                    }}
                                  >
                                    {formatTime(conv.lastMessageAt)}
                                  </span>
                                )}
                              </div>
                              {conv.lastMessage && (
                                <div
                                  style={{
                                    fontSize: typography.sizes.caption,
                                    color: palette.textSecondary,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    marginBottom: '0.25rem',
                                  }}
                                >
                                  {conv.lastMessage.content}
                                </div>
                              )}
                              {conv.unreadCount !== undefined && conv.unreadCount > 0 && (
                                <div
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    padding: '0.125rem 0.5rem',
                                    borderRadius: radius.pill,
                                    background: palette.brandPrimaryStrong,
                                    color: '#ffffff',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    marginTop: '0.25rem',
                                  }}
                                >
                                  {conv.unreadCount}
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {isLoadingInvestors ? (
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
                  ) : !investors || investors.length === 0 ? (
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '3rem',
                        color: palette.textSecondary,
                      }}
                    >
                      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
                      <p style={{ fontSize: typography.sizes.body, margin: 0 }}>
                        {isArabic ? 'لا يوجد مستخدمون' : 'No users found'}
                      </p>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                      }}
                    >
                      {investors.map((investor) => {
                        const existingConv = conversations.find(c => c.investorId === investor.id);
                        return (
                          <button
                            key={investor.id}
                            type="button"
                            onClick={() => handleUserSelect(investor.id)}
                            style={{
                              padding: '1rem',
                              borderRadius: radius.lg,
                              border: `1px solid ${palette.neutralBorderMuted}`,
                              background: existingConv 
                                ? `${palette.brandPrimary}08`
                                : palette.backgroundBase,
                              textAlign: 'left',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              gap: '0.75rem',
                              alignItems: 'center',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = palette.backgroundSurface;
                              e.currentTarget.style.borderColor = palette.brandPrimary;
                              e.currentTarget.style.boxShadow = shadow.subtle;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = existingConv 
                                ? `${palette.brandPrimary}08`
                                : palette.backgroundBase;
                              e.currentTarget.style.borderColor = palette.neutralBorderMuted;
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          >
                            <Avatar
                              name={investor.fullName}
                              email={investor.email}
                              size={48}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div
                                style={{
                                  fontWeight: typography.weights.semibold,
                                  color: palette.textPrimary,
                                  marginBottom: '0.25rem',
                                  fontSize: typography.sizes.body,
                                }}
                              >
                                {investor.fullName || investor.email}
                              </div>
                              <div
                                style={{
                                  fontSize: typography.sizes.caption,
                                  color: palette.textSecondary,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                }}
                              >
                                <span>{investor.email}</span>
                                {existingConv && (
                                  <span
                                    style={{
                                      padding: '0.125rem 0.5rem',
                                      borderRadius: radius.pill,
                                      background: palette.brandPrimary,
                                      color: '#ffffff',
                                      fontSize: '0.7rem',
                                      fontWeight: 600,
                                    }}
                                  >
                                    {isArabic ? 'محادثة' : 'Chat'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ) : currentConversation ? (
          <div style={{ position: 'relative' }}>
            {selectedConversation && user?.role === 'admin' && (
              <button
                type="button"
                onClick={handleBack}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  [direction === 'rtl' ? 'right' : 'left']: '1rem',
                  zIndex: 10,
                  padding: '0.5rem 1rem',
                  borderRadius: radius.md,
                  border: `1px solid ${palette.neutralBorderMuted}`,
                  background: palette.backgroundBase,
                  color: palette.textPrimary,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: shadow.subtle,
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
                <span>{direction === 'rtl' ? '→' : '←'}</span>
                {isArabic ? 'رجوع' : 'Back'}
              </button>
            )}
            <ChatWindow
              conversation={currentConversation}
              onClose={onClose}
            />
          </div>
        ) : (
          <div
            style={{
              padding: '3rem',
              textAlign: 'center',
              color: palette.textSecondary,
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
            <p>{isArabic ? 'لا توجد محادثة' : 'No conversation'}</p>
          </div>
        )}
      </div>
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
