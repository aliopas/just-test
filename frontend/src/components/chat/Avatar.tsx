import React from 'react';
import { palette, radius } from '../../styles/theme';

interface AvatarProps {
  name?: string;
  email?: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

function getInitials(name?: string, email?: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
  if (email) {
    return email.substring(0, 2).toUpperCase();
  }
  return '?';
}

function getColorFromString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colors = [
    '#2D6FA3', // brandPrimary
    '#55677A', // brandSecondary
    '#3E6A95', // brandAccent
    '#31566F', // brandAccentMid
    '#245A84', // brandPrimaryMuted
    '#7197B4', // brandSecondaryMuted
  ];
  
  return colors[Math.abs(hash) % colors.length];
}

export function Avatar({ name, email, size = 40, className, style }: AvatarProps) {
  const initials = getInitials(name, email);
  const displayName = name || email || 'User';
  const bgColor = getColorFromString(displayName);

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: radius.pill,
        background: bgColor,
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.4,
        fontWeight: 600,
        flexShrink: 0,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        ...style,
      }}
      title={displayName}
      aria-label={displayName}
    >
      {initials}
    </div>
  );
}

