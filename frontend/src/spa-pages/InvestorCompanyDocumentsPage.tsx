import React, { useMemo, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { palette, radius, shadow, typography } from '../styles/theme';
import {
  useInvestorDocuments,
  type InvestorDocumentCamel,
} from '../hooks/useSupabaseTables';

type DocumentCategory = InvestorDocumentCamel['category'];

interface CategoryConfig {
  id: DocumentCategory;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  icon: string;
}

const CATEGORY_CONFIG: CategoryConfig[] = [
  {
    id: 'company_static',
    titleAr: 'ملفات الشركة الثابتة',
    titleEn: 'Company Static Files',
    descriptionAr:
      'ملفات تعريفية واستراتيجية ثابتة للاطلاع فقط، مثل بروفايل الشركة، نموذج العمل، اللوائح، الخطط الاستراتيجية، القوائم المالية السابقة، والشهادات الرسمية.',
    descriptionEn:
      'Read‑only company reference files such as company profile, business model, bylaws, strategic & financial plans, historical financial statements, and official certificates.',
    icon: '📂',
  },
  {
    id: 'financial_report',
    titleAr: 'التقارير المالية الداخلية',
    titleEn: 'Internal Financial Reports',
    descriptionAr:
      'تقارير دورية أو خاصة عن الأداء المالي للشركة مخصصة للمستثمرين.',
    descriptionEn:
      'Periodic or ad‑hoc internal financial performance reports dedicated to investors.',
    icon: '📊',
  },
  {
    id: 'external_resource',
    titleAr: 'تقارير الموارد المالية الخارجية',
    titleEn: 'External Financial Resource Reports',
    descriptionAr:
      'تقارير وملفات عن الموارد المالية أو الجهات الاستثمارية الخارجية، كل مورد في ملف مستقل.',
    descriptionEn:
      'Reports and documents about external financial resources or investment providers, each in a dedicated file.',
    icon: '🌐',
  },
];

export function InvestorCompanyDocumentsPage() {
  const { language, direction } = useLanguage();
  const isArabic = language === 'ar';

  const { data: documents, isLoading, isError, refetch } = useInvestorDocuments({
    includeInactive: false,
  });

  const [selectedDoc, setSelectedDoc] = useState<InvestorDocumentCamel | null>(
    null,
  );

  const grouped = useMemo(() => {
    const map: Record<DocumentCategory, InvestorDocumentCamel[]> = {
      company_static: [],
      financial_report: [],
      external_resource: [],
    };
    for (const doc of documents ?? []) {
      map[doc.category]?.push(doc);
    }
    (Object.keys(map) as DocumentCategory[]).forEach((key) => {
      map[key].sort((a, b) => a.displayOrder - b.displayOrder);
    });
    return map;
  }, [documents]);

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '2rem',
        background: palette.backgroundSurface,
        direction,
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        {/* Header */}
        <header
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: typography.sizes.heading,
              fontWeight: typography.weights.bold,
              color: palette.textPrimary,
            }}
          >
            {isArabic ? 'ملفات وتقارير الشركة للمستثمر' : 'Company Documents & Reports'}
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: typography.sizes.body,
              color: palette.textSecondary,
              maxWidth: '680px',
            }}
          >
            {isArabic
              ? 'يمكنك هنا الاطلاع على ملفات الشركة الأساسية والتقارير المالية الداخلية وتقارير الموارد المالية الخارجية. جميع الملفات مخصصة للاطلاع فقط وغير قابلة للتنزيل من داخل المنصة.'
              : 'Here you can view core company files, internal financial reports, and reports about external financial resources. All files are view‑only and are not downloadable from within the portal.'}
          </p>
        </header>

        {/* Actions */}
        <section
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isLoading}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: radius.md,
              border: `1px solid ${palette.neutralBorderMuted}`,
              background: palette.backgroundBase,
              color: palette.textSecondary,
              fontSize: '0.9rem',
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {'\u21BB '}
            {isArabic ? 'تحديث القائمة' : 'Refresh'}
          </button>
          {isLoading && (
            <span
              style={{
                fontSize: '0.85rem',
                color: palette.textSecondary,
              }}
            >
              {isArabic ? 'جارٍ تحميل الملفات…' : 'Loading documents…'}
            </span>
          )}
        </section>

        {/* Error state */}
        {isError && !isLoading && (
          <section
            style={{
              padding: '1.25rem 1.5rem',
              borderRadius: radius.lg,
              background: palette.backgroundBase,
              boxShadow: shadow.subtle,
              border: `1px solid ${palette.error}33`,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: '0.95rem',
                color: palette.error,
              }}
            >
              {isArabic
                ? 'حدث خطأ أثناء تحميل الملفات. يرجى المحاولة مرة أخرى.'
                : 'An error occurred while loading the documents. Please try again.'}
            </p>
          </section>
        )}

        {/* Categories */}
        {CATEGORY_CONFIG.map((cat) => {
          const items = grouped[cat.id] ?? [];
          return (
            <section
              key={cat.id}
              style={{
                padding: '1.5rem',
                borderRadius: radius.lg,
                background: palette.backgroundBase,
                boxShadow: shadow.subtle,
                border: `1px solid ${palette.neutralBorderMuted}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>{cat.icon}</span>
                  <div>
                    <h2
                      style={{
                        margin: 0,
                        fontSize: typography.sizes.subheading,
                        fontWeight: typography.weights.semibold,
                        color: palette.textPrimary,
                      }}
                    >
                      {isArabic ? cat.titleAr : cat.titleEn}
                    </h2>
                    <p
                      style={{
                        margin: 0,
                        marginTop: '0.25rem',
                        fontSize: typography.sizes.caption,
                        color: palette.textSecondary,
                        maxWidth: '720px',
                      }}
                    >
                      {isArabic ? cat.descriptionAr : cat.descriptionEn}
                    </p>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '0.85rem',
                    color: palette.textSecondary,
                  }}
                >
                  {isArabic ? 'للاطلاع فقط' : 'View‑only'}
                </span>
              </div>

              {items.length === 0 ? (
                <p
                  style={{
                    margin: 0,
                    padding: '0.75rem 0.25rem',
                    fontSize: '0.9rem',
                    color: palette.textSecondary,
                  }}
                >
                  {isArabic
                    ? 'لا توجد ملفات حالياً ضمن هذا القسم.'
                    : 'No documents are currently available in this section.'}
                </p>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fill, minmax(260px, 1fr))',
                    gap: '0.75rem',
                  }}
                >
                  {items.map((doc) => {
                    const hasUrl = !!doc.storageUrl;

                    return (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => hasUrl && setSelectedDoc(doc)}
                        style={{
                          textAlign: 'start',
                          padding: '0.85rem 1rem',
                          borderRadius: radius.md,
                          border: `1px solid ${palette.neutralBorderMuted}`,
                          background: palette.backgroundSurface,
                          cursor: hasUrl ? 'pointer' : 'default',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.35rem',
                          boxShadow: shadow.subtle,
                          opacity: hasUrl ? 1 : 0.6,
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '0.5rem',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '1.1rem',
                            }}
                          >
                            {doc.iconEmoji || '📄'}
                          </span>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              padding: '0.15rem 0.55rem',
                              borderRadius: radius.pill,
                              background: palette.backgroundHighlight,
                              color: palette.textSecondary,
                            }}
                          >
                            {isArabic ? 'عرض في نافذة منبثقة' : 'Open in popup'}
                          </span>
                        </div>
                        <strong
                          style={{
                            fontSize: '0.95rem',
                            color: palette.textPrimary,
                            fontWeight: typography.weights.semibold,
                          }}
                        >
                          {isArabic ? doc.titleAr : doc.titleEn}
                        </strong>
                        {((isArabic ? doc.descriptionAr : doc.descriptionEn) ??
                          '') && (
                          <p
                            style={{
                              margin: 0,
                              fontSize: '0.8rem',
                              color: palette.textSecondary,
                            }}
                          >
                            {(isArabic
                              ? doc.descriptionAr
                              : doc.descriptionEn) || ''}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Secure inline viewer modal */}
      {selectedDoc && (
        <div
          onClick={() => setSelectedDoc(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 40,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(960px, 95vw)',
              height: 'min(640px, 90vh)',
              background: palette.backgroundBase,
              borderRadius: radius.lg,
              boxShadow: shadow.medium,
              border: `1px solid ${palette.neutralBorderMuted}`,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                padding: '0.85rem 1.25rem',
                borderBottom: `1px solid ${palette.neutralBorderMuted}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>
                  {selectedDoc.iconEmoji || '📄'}
                </span>
                <div>
                  <div
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: typography.weights.semibold,
                      color: palette.textPrimary,
                    }}
                  >
                    {isArabic ? selectedDoc.titleAr : selectedDoc.titleEn}
                  </div>
                  <div
                    style={{
                      fontSize: '0.8rem',
                      color: palette.textSecondary,
                    }}
                  >
                    {isArabic
                      ? 'ملف داخلي للعرض فقط داخل المنصة'
                      : 'Internal view‑only document inside the portal'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDoc(null)}
                style={{
                  borderRadius: radius.pill,
                  border: `1px solid ${palette.neutralBorderMuted}`,
                  background: palette.backgroundSurface,
                  padding: '0.35rem 0.9rem',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  color: palette.textSecondary,
                }}
              >
                {isArabic ? 'إغلاق' : 'Close'}
              </button>
            </div>
            <div
              style={{
                flex: 1,
                borderTop: `1px solid ${palette.backgroundSurface}`,
                background: palette.backgroundSurface,
              }}
            >
              {selectedDoc.storageUrl ? (
                <iframe
                  title={isArabic ? selectedDoc.titleAr : selectedDoc.titleEn}
                  src={selectedDoc.storageUrl}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                  }}
                  // منع الصفحة داخل iframe من التحكم في نافذة المتصفح الرئيسية
                  sandbox="allow-same-origin allow-scripts allow-forms"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.95rem',
                    color: palette.textSecondary,
                    padding: '1.5rem',
                    textAlign: 'center',
                  }}
                >
                  {isArabic
                    ? 'رابط الملف غير متوفر حالياً.'
                    : 'Document URL is not available at the moment.'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

