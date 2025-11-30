import { useEffect, type CSSProperties } from 'react';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { useLanguage, LanguageProvider } from '../context/LanguageContext';
import { ToastProvider, useToast } from '../context/ToastContext';
import { ToastStack } from '../components/ToastStack';
import { useInvestorNewsDetail } from '../hooks/useInvestorNews';
import { tInvestorNews } from '../locales/investorNews';
import { palette } from '../styles/theme';
import { resolveCoverUrl, NEWS_IMAGES_BUCKET } from '../utils/supabase-storage';
import { OptimizedImage } from '../components/OptimizedImage';
import type { InvestorInternalNewsAttachment } from '../types/news';

const queryClient = new QueryClient();

function formatDate(
  value: string | null,
  language: 'ar' | 'en'
): string | null {
  if (!value) {
    return null;
  }

  try {
    return new Date(value).toLocaleString(
      language === 'ar' ? 'ar-SA' : 'en-US',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }
    );
  } catch {
    return value;
  }
}


function formatFileSize(bytes?: number | null): string | null {
  if (bytes === null || bytes === undefined) {
    return null;
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const units = ['KB', 'MB', 'GB', 'TB'] as const;
  let size = bytes / 1024;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  const formatted = size % 1 === 0 ? size.toFixed(0) : size.toFixed(1);
  return `${formatted} ${units[unitIndex]}`;
}


function renderMarkdown(
  markdown: string,
  language: 'ar' | 'en'
) {
  const blocks = markdown.split(/\n{2,}/);

  return blocks
    .map(block => block.trim())
    .filter(Boolean)
    .map((block, index) => {
      const headingMatch = block.match(/^#{1,6}\s+/);
      if (headingMatch) {
        const level = Math.min(headingMatch[0].trim().length, 6);
        const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
        const text = block.slice(headingMatch[0].length).trim();
        return (
          <HeadingTag
            key={`heading-${index}`}
            style={{
              marginTop: index === 0 ? 0 : '1.75rem',
              color: 'var(--color-text-primary)',
              fontWeight: 700,
              lineHeight: 1.4,
              direction: language === 'ar' ? 'rtl' : 'ltr',
            }}
          >
            {text}
          </HeadingTag>
        );
      }

      if (/^[-*]\s+/m.test(block)) {
        const items = block
          .split('\n')
          .map(item => item.trim())
          .filter(line => /^[-*]\s+/.test(line))
          .map(line => line.replace(/^[-*]\s+/, '').trim());

        return (
          <ul
            key={`list-${index}`}
            style={{
              margin: '1rem 0',
              paddingInlineStart: language === 'ar' ? '1.5rem' : '2rem',
              lineHeight: 1.6,
            }}
          >
            {items.map((item, itemIndex) => (
              <li key={`list-item-${index}-${itemIndex}`}>{item}</li>
            ))}
          </ul>
        );
      }

      return (
        <p
          key={`paragraph-${index}`}
          style={{
            margin: '1rem 0',
            color: 'var(--color-text-primary)',
            fontSize: '1.05rem',
            lineHeight: 1.8,
            whiteSpace: 'pre-line',
            direction: language === 'ar' ? 'rtl' : 'ltr',
          }}
        >
          {block}
        </p>
      );
    });
}

const attachmentsContainerStyle: CSSProperties = {
  borderRadius: '1.25rem',
  border: `1px solid ${palette.neutralBorderSoft}`,
  background: palette.backgroundSurface,
  padding: '1.75rem',
  boxShadow: '0 18px 40px rgba(15, 23, 42, 0.1)',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const attachmentsSectionHeaderStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '0.75rem',
};

const attachmentsSubheadingStyle: CSSProperties = {
  margin: 0,
  fontSize: '1.05rem',
  fontWeight: 600,
  color: palette.textPrimary,
};

const imageGalleryStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '1rem',
};

const imageThumbnailStyle: CSSProperties = {
  borderRadius: '0.85rem',
  width: '100%',
  height: '100%',
};

const attachmentListStyle: CSSProperties = {
  listStyle: 'none',
  padding: 0,
  margin: '0.75rem 0 0',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.85rem',
};

const attachmentItemStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '1rem',
  padding: '0.95rem 1.1rem',
  borderRadius: '1rem',
  border: `1px solid ${palette.neutralBorderSoft}`,
  background: palette.backgroundBase,
  flexWrap: 'wrap',
};

const attachmentInfoStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.2rem',
  minWidth: 0,
  flex: 1,
};

const attachmentFileNameStyle: CSSProperties = {
  fontWeight: 600,
  color: palette.textPrimary,
  fontSize: '1rem',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const attachmentMetaStyle: CSSProperties = {
  color: palette.textSecondary,
  fontSize: '0.85rem',
};

function InvestorNewsDetailPageInner() {
  const { language, direction } = useLanguage();
  const { pushToast } = useToast();
  const { id: newsId } = useParams<{ id: string }>();

  const { data, isLoading, isError } = useInvestorNewsDetail(newsId ?? null);

  useEffect(() => {
    if (!isError) {
      return;
    }

    pushToast({
      message: tInvestorNews('toast.detailError', language),
      variant: 'error',
    });
  }, [isError, pushToast, language]);

  const coverUrl = resolveCoverUrl(data?.coverKey ?? null, NEWS_IMAGES_BUCKET);
  const publishedAt = formatDate(data?.publishedAt ?? null, language);
  const updatedAt =
    data?.updatedAt && data?.updatedAt !== data?.publishedAt
      ? formatDate(data.updatedAt, language)
      : null;
  const attachments = data?.attachments ?? [];
  const imageAttachments = attachments.filter(
    (
      attachment
    ): attachment is InvestorInternalNewsAttachment & {
      downloadUrl: string;
    } => attachment.type === 'image' && Boolean(attachment.downloadUrl)
  );
  const fileAttachments = attachments.filter(
    attachment => attachment.type !== 'image'
  );
  const hasImageAttachments = imageAttachments.length > 0;
  const hasFileAttachments = fileAttachments.length > 0;
  const showAttachmentsSection = hasImageAttachments || hasFileAttachments;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-background-surface)',
      }}
    >
      <header
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '2.5rem 1.5rem 1.5rem',
          direction,
        }}
      >
        <Link
          to="/home"
          style={{
            display: 'inline-block',
            marginBottom: '1.5rem',
            color: palette.brandPrimaryStrong,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          {tInvestorNews('detail.back', language)}
        </Link>

        {isLoading && (
          <p
            style={{
              color: palette.textSecondary,
              fontSize: '1.05rem',
            }}
          >
            {tInvestorNews('detail.loading', language)}
          </p>
        )}

        {!isLoading && !data && (
          <p
            style={{
              color: '#DC2626',
              fontWeight: 600,
            }}
          >
            {tInvestorNews('detail.error', language)}
          </p>
        )}

        {data && (
          <>
            <h1
              style={{
                margin: 0,
                fontSize: '2.4rem',
                fontWeight: 700,
            color: palette.textPrimary,
                lineHeight: 1.3,
              }}
            >
              {data.title}
            </h1>
            <div
              style={{
                marginTop: '1rem',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1.5rem',
                color: palette.textSecondary,
                fontSize: '0.95rem',
              }}
            >
              {publishedAt && (
                <span>
                  {tInvestorNews('detail.publishedAt', language)}: {publishedAt}
                </span>
              )}
              {updatedAt && (
                <span>
                  {tInvestorNews('detail.updatedAt', language)}: {updatedAt}
                </span>
              )}
            </div>
          </>
        )}
      </header>

      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '0 1.5rem',
        }}
      >
        <div
          style={{
            borderRadius: '1.2rem',
            overflow: 'hidden',
            boxShadow: '0 25px 55px rgba(15, 23, 42, 0.18)',
          }}
        >
          <OptimizedImage
            src={coverUrl}
            alt={data?.title ?? 'Cover image'}
            aspectRatio={2.08} // 48% padding = ~2.08:1
            fallbackText={data?.title ? data.title.charAt(0).toUpperCase() : undefined}
            objectFit="cover"
            style={{
              borderRadius: '1.2rem',
            }}
          />
        </div>
      </div>

      {data && (
        <>
          <article
            style={{
              maxWidth: '900px',
              margin: '2.5rem auto 4rem',
              padding: '0 1.5rem',
              color: palette.textPrimary,
              direction,
            }}
          >
            {renderMarkdown(data.bodyMd, language)}
          </article>

          {showAttachmentsSection && (
            <section
              style={{
                maxWidth: '900px',
                margin: '-2rem auto 4.5rem',
                padding: '0 1.5rem',
                direction,
              }}
            >
              <div style={attachmentsContainerStyle}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: '1.4rem',
                    fontWeight: 700,
                    color: palette.textPrimary,
                  }}
                >
                  {tInvestorNews('detail.attachments.title', language)}
                </h2>

                {hasImageAttachments && (
                  <div style={{ marginTop: '1.2rem' }}>
                    <div style={attachmentsSectionHeaderStyle}>
                      <h3 style={attachmentsSubheadingStyle}>
                        {tInvestorNews('detail.attachments.imagesTitle', language)} (
                        {imageAttachments.length})
                      </h3>
                    </div>
                    <div style={imageGalleryStyle}>
                      {imageAttachments.map(image => {
                        const fallbackInitial =
                          image.name?.trim().charAt(0).toUpperCase() ??
                          (data.title?.charAt(0).toUpperCase() ?? 'N');
                        return (
                          <a
                            key={image.id}
                            href={image.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'block',
                              borderRadius: '0.85rem',
                              overflow: 'hidden',
                              border: `1px solid ${palette.neutralBorderSoft}`,
                            }}
                          >
                            <OptimizedImage
                              src={image.downloadUrl}
                              alt={image.name}
                              aspectRatio={4 / 3}
                              fallbackText={fallbackInitial}
                              objectFit="cover"
                              style={imageThumbnailStyle}
                            />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}

                {hasFileAttachments && (
                  <div style={{ marginTop: hasImageAttachments ? '2rem' : '1.2rem' }}>
                    <div style={attachmentsSectionHeaderStyle}>
                      <h3 style={attachmentsSubheadingStyle}>
                        {tInvestorNews('detail.attachments.filesTitle', language)} (
                        {fileAttachments.length})
                      </h3>
                    </div>
                    <ul style={attachmentListStyle}>
                      {fileAttachments.map(attachment => {
                        const sizeLabel = formatFileSize(attachment.size);
                        return (
                          <li key={attachment.id} style={attachmentItemStyle}>
                            <div style={attachmentInfoStyle}>
                              <span style={attachmentFileNameStyle}>{attachment.name}</span>
                              <span style={attachmentMetaStyle}>
                                {attachment.mimeType ?? '—'}
                                {sizeLabel ? ` · ${sizeLabel}` : ''}
                              </span>
                            </div>
                            <a
                              href={attachment.downloadUrl ?? undefined}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                padding: '0.55rem 1.4rem',
                                borderRadius: '999px',
                                border: `1px solid ${palette.brandPrimaryStrong}`,
                                background: palette.brandSecondarySoft,
                                color: palette.brandPrimaryStrong,
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                textDecoration: 'none',
                                cursor: attachment.downloadUrl ? 'pointer' : 'not-allowed',
                                opacity: attachment.downloadUrl ? 1 : 0.6,
                                whiteSpace: 'nowrap',
                              }}
                              aria-disabled={!attachment.downloadUrl}
                            >
                              {tInvestorNews('detail.attachments.download', language)}
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

export function InvestorNewsDetailPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ToastProvider>
          <InvestorNewsDetailPageInner />
          <ToastStack />
        </ToastProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

// Default export for Next.js page validation (not used, App Router uses named export)
export default InvestorNewsDetailPage;

