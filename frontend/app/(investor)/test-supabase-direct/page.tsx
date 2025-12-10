'use client';

import { useNews, useProjects, useCompanyProfiles, useMarketValue } from '@/hooks/useSupabaseTables';
import { useLanguage } from '@/context/LanguageContext';
import { getStoragePublicUrl, COMPANY_CONTENT_IMAGES_BUCKET } from '@/utils/supabase-storage';

/**
 * صفحة تجريبية لعرض البيانات مباشرة من Supabase
 * 
 * هذه الصفحة توضح كيفية استخدام Supabase MCP hooks لعرض البيانات
 */
export default function TestSupabaseDirectPage() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  // جلب الأخبار
  const { data: news, isLoading: newsLoading } = useNews({
    limit: 5,
    audience: 'public',
  });

  // جلب المشاريع
  const { data: projects, isLoading: projectsLoading } = useProjects({
    limit: 5,
  });

  // جلب ملفات الشركة
  const { data: companyProfiles, isLoading: profilesLoading } = useCompanyProfiles();

  // جلب القيمة السوقية
  const { data: marketValue, isLoading: marketValueLoading } = useMarketValue();

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem', fontSize: '2rem', fontWeight: 'bold' }}>
        {isArabic ? 'عرض البيانات من Supabase' : 'Display Data from Supabase'}
      </h1>

      {/* القيمة السوقية */}
      <section style={{ marginBottom: '3rem', padding: '1.5rem', background: '#f8f9fa', borderRadius: '8px' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>
          {isArabic ? 'القيمة السوقية' : 'Market Value'}
        </h2>
        {marketValueLoading ? (
          <p>{isArabic ? 'جاري التحميل...' : 'Loading...'}</p>
        ) : marketValue ? (
          <div>
            <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
              {marketValue.value.toLocaleString()} {marketValue.currency}
            </p>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>
              {isArabic ? 'تاريخ التقييم:' : 'Valuation Date:'} {new Date(marketValue.valuationDate).toLocaleDateString()}
            </p>
            {marketValue.isVerified && (
              <span style={{ color: 'green', fontSize: '0.9rem' }}>
                {isArabic ? '✓ تم التحقق' : '✓ Verified'}
              </span>
            )}
          </div>
        ) : (
          <p>{isArabic ? 'لا توجد بيانات' : 'No data available'}</p>
        )}
      </section>

      {/* ملفات الشركة */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>
          {isArabic ? 'ملفات الشركة' : 'Company Profiles'}
        </h2>
        {profilesLoading ? (
          <p>{isArabic ? 'جاري التحميل...' : 'Loading...'}</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {companyProfiles.map((profile) => (
              <div
                key={profile.id}
                style={{
                  padding: '1.5rem',
                  background: '#fff',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                {profile.iconKey && (
                  <img
                    src={getStoragePublicUrl(COMPANY_CONTENT_IMAGES_BUCKET, profile.iconKey) ?? undefined}
                    alt={isArabic ? profile.titleAr : profile.titleEn}
                    style={{ width: '64px', height: '64px', marginBottom: '1rem', objectFit: 'contain' }}
                  />
                )}
                <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: 'bold' }}>
                  {isArabic ? profile.titleAr : profile.titleEn}
                </h3>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>
                  {isArabic ? profile.contentAr : profile.contentEn}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* الأخبار */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>
          {isArabic ? 'الأخبار' : 'News'}
        </h2>
        {newsLoading ? (
          <p>{isArabic ? 'جاري التحميل...' : 'Loading...'}</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {news.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '1.5rem',
                  background: '#fff',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: 'bold' }}>
                  {item.title}
                </h3>
                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  {item.body_md.substring(0, 150)}...
                </p>
                <p style={{ color: '#999', fontSize: '0.8rem' }}>
                  {isArabic ? 'تاريخ النشر:' : 'Published:'}{' '}
                  {item.published_at
                    ? new Date(item.published_at).toLocaleDateString()
                    : isArabic
                    ? 'غير محدد'
                    : 'Not specified'}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* المشاريع */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>
          {isArabic ? 'المشاريع' : 'Projects'}
        </h2>
        {projectsLoading ? (
          <p>{isArabic ? 'جاري التحميل...' : 'Loading...'}</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {projects.map((project) => (
              <div
                key={project.id}
                style={{
                  padding: '1.5rem',
                  background: '#fff',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                {project.cover_key && (
                  <img
                    src={getStoragePublicUrl(COMPANY_CONTENT_IMAGES_BUCKET, project.cover_key) ?? undefined}
                    alt={isArabic ? project.name_ar || project.name : project.name}
                    style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px', marginBottom: '1rem' }}
                  />
                )}
                <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: 'bold' }}>
                  {isArabic ? project.name_ar || project.name : project.name}
                </h3>
                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  {isArabic ? project.description_ar || project.description : project.description}
                </p>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: '#666' }}>
                  <span>
                    {isArabic ? 'سعر السهم:' : 'Share Price:'} {project.share_price.toLocaleString()} {isArabic ? 'ريال' : 'SAR'}
                  </span>
                  <span>
                    {isArabic ? 'إجمالي الأسهم:' : 'Total Shares:'} {project.total_shares.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* معلومات الاستخدام */}
      <section style={{ marginTop: '3rem', padding: '1.5rem', background: '#e3f2fd', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>
          {isArabic ? 'كيفية الاستخدام' : 'How to Use'}
        </h3>
        <pre style={{ background: '#fff', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
          <code>{`// مثال على استخدام الـ hooks
import { useNews, useProjects, useCompanyProfiles } from '@/hooks/useSupabaseTables';

function MyComponent() {
  const { data: news, isLoading } = useNews({ limit: 10 });
  const { data: projects } = useProjects();
  const { data: profiles } = useCompanyProfiles();

  // استخدام البيانات...
}`}</code>
        </pre>
      </section>
    </div>
  );
}

