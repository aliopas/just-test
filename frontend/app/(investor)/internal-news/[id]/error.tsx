'use client';

import React, { useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { palette, radius, shadow, typography } from '@/styles/theme';
import { useNextNavigate } from '@/utils/next-router';

export const dynamic = 'force-dynamic';

export default function InternalNewsDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { language, direction } = useLanguage();
  const navigate = useNextNavigate();
  const isArabic = language === 'ar';

  useEffect(() => {
    console.error('Internal news detail error:', error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '2rem',
        background: palette.backgroundSurface,
        direction,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          maxWidth: '600px',
          width: '100%',
          margin: '0 auto',
          padding: '3rem 2rem',
          borderRadius: radius.lg,
          background: palette.backgroundBase,
          boxShadow: shadow.medium,
          border: `1px solid ${palette.neutralBorderMuted}`,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: '4rem',
            marginBottom: '1.5rem',
            lineHeight: 1,
          }}
        >
          ⚠️
        </div>
        <h2
          style={{
            margin: 0,
            marginBottom: '1rem',
            fontSize: typography.sizes.heading,
            fontWeight: typography.weights.bold,
            color: palette.textPrimary,
          }}
        >
          {isArabic ? 'خطأ في تحميل الخبر' : 'Failed to Load News'}
        </h2>
        <p
          style={{
            margin: 0,
            marginBottom: '2rem',
            fontSize: typography.sizes.body,
            color: palette.textSecondary,
            lineHeight: typography.lineHeights.relaxed,
          }}
        >
          {error.message ||
            (isArabic
              ? 'حدث خطأ أثناء تحميل تفاصيل الخبر. يرجى المحاولة مرة أخرى.'
              : 'An error occurred while loading the news details. Please try again.')}
        </p>
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={reset}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: radius.md,
              border: `1px solid ${palette.brandPrimaryStrong}`,
              background: palette.brandPrimaryStrong,
              color: palette.textOnBrand,
              fontSize: typography.sizes.body,
              fontWeight: typography.weights.semibold,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = shadow.medium;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {isArabic ? 'إعادة المحاولة' : 'Retry'}
          </button>
          <button
            onClick={() => navigate('/internal-news')}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: radius.md,
              border: `1px solid ${palette.neutralBorderMuted}`,
              background: palette.backgroundBase,
              color: palette.textPrimary,
              fontSize: typography.sizes.body,
              fontWeight: typography.weights.semibold,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = palette.brandPrimary;
              e.currentTarget.style.color = palette.brandPrimaryStrong;
              e.currentTarget.style.backgroundColor = palette.backgroundHighlight;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = palette.neutralBorderMuted;
              e.currentTarget.style.color = palette.textPrimary;
              e.currentTarget.style.backgroundColor = palette.backgroundBase;
            }}
          >
            {isArabic ? 'العودة إلى الأخبار' : 'Back to News'}
          </button>
        </div>
      </div>
    </div>
  );
}

