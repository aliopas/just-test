import React from 'react';
import { palette, radius, shadow } from '../../styles/theme';

interface ChatIconProps {
  unreadCount?: number;
  onClick: () => void;
  isActive?: boolean;
}

export function ChatIcon({ unreadCount = 0, onClick, isActive = false }: ChatIconProps) {
  const hasUnread = unreadCount > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        position: 'relative',
        padding: '0.5rem',
        borderRadius: radius.md,
        border: isActive
          ? `1px solid ${palette.brandPrimaryStrong}`
          : `1px solid ${palette.neutralBorderMuted}`,
        background: isActive
          ? palette.brandPrimarySoft
          : palette.backgroundBase,
        color: palette.textPrimary,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
        minWidth: '44px',
        height: '44px',
      }}
      aria-label={hasUnread ? `Chat (${unreadCount} unread)` : 'Chat'}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = palette.backgroundSurface;
          e.currentTarget.style.borderColor = palette.brandPrimary;
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = palette.backgroundBase;
          e.currentTarget.style.borderColor = palette.neutralBorderMuted;
        }
      }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {hasUnread && (
        <span
          style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            minWidth: '20px',
            height: '20px',
            borderRadius: '999px',
            background: palette.brandPrimaryStrong,
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '0 4px',
            boxShadow: shadow.subtle,
          }}
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
}

