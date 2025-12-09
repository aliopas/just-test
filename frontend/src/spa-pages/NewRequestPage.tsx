import React, { useState, FormEvent } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { palette, radius, shadow, typography } from '../styles/theme';
import { useCreateRequestDirect } from '../hooks/useCreateRequestDirect';
import { tRequest } from '../locales/newRequest';
import { tRequestList } from '../locales/requestList';
import type { RequestType, RequestCurrency, CreateRequestPayload } from '../types/request';
import { useNextNavigate } from '../utils/next-router';
import { ApiError } from '../utils/api-client';
import { useInvestorProjectsDirect } from '../hooks/useInvestorProjectsDirect';

export function NewRequestPage() {
  const { language, direction } = useLanguage();
  const navigate = useNextNavigate();
  const createRequestMutation = useCreateRequestDirect();

  const [type, setType] = useState<RequestType>('buy');
  const [numberOfShares, setNumberOfShares] = useState<string>('');
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [expiryAt, setExpiryAt] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [projectId, setProjectId] = useState<string>('');
  const [documents, setDocuments] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch projects for partnership requests
  const { data: projects, isLoading: isLoadingProjects } = useInvestorProjectsDirect();

  // Calculate total amount based on number of shares (50000 SAR per share)
  const SHARE_PRICE = 50000;
  const calculatedAmount = numberOfShares ? Number(numberOfShares) * SHARE_PRICE : 0;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!type) {
      setError(language === 'ar' ? 'يرجى اختيار نوع الطلب' : 'Please select request type');
      return;
    }

    if ((type === 'buy' || type === 'sell') && !numberOfShares) {
      setError(
        language === 'ar'
          ? 'يرجى إدخال عدد الأسهم للطلبات من نوع شراء أو بيع'
          : 'Please enter number of shares for buy or sell requests'
      );
      return;
    }

    if ((type === 'buy' || type === 'sell') && (Number(numberOfShares) <= 0 || !Number.isInteger(Number(numberOfShares)))) {
      setError(
        language === 'ar'
          ? 'عدد الأسهم يجب أن يكون رقماً صحيحاً أكبر من صفر'
          : 'Number of shares must be a positive integer'
      );
      return;
    }

    try {
      const payload: CreateRequestPayload = {
        type,
        amount: (type === 'buy' || type === 'sell') ? calculatedAmount : null,
        currency: (type === 'buy' || type === 'sell') ? 'SAR' : null,
        targetPrice: targetPrice ? parseFloat(targetPrice) : null,
        expiryAt: expiryAt || null,
        notes: notes || null,
        projectId: (type === 'partnership' && projectId) ? projectId : null,
        documents: documents.length > 0 ? documents : undefined,
      };

      const result = await createRequestMutation.mutateAsync(payload);
      setSuccess(
        language === 'ar'
          ? `تم إنشاء الطلب بنجاح برقم ${result.requestNumber}`
          : `Request created successfully with number ${result.requestNumber}`
      );

      // Redirect to request detail page after 2 seconds
      setTimeout(() => {
        navigate(`/requests/${result.requestId}`);
      }, 2000);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          language === 'ar'
            ? err.message || 'تعذّر إنشاء الطلب. حاول مرة أخرى.'
            : err.message || 'Failed to create request. Please try again.'
        );
      } else if (err instanceof Error) {
        setError(
          language === 'ar'
            ? err.message || 'حدث خطأ غير متوقع. حاول مرة أخرى.'
            : err.message || 'An unexpected error occurred. Please try again.'
        );
      } else {
        setError(
          language === 'ar'
            ? 'تعذّر إنشاء الطلب. حاول مرة أخرى.'
            : 'Failed to create request. Please try again.'
        );
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setDocuments(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

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
          maxWidth: '900px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        {/* Header */}
        <header>
          <h1
            style={{
              margin: 0,
              fontSize: typography.sizes.heading,
              fontWeight: typography.weights.bold,
              color: palette.textPrimary,
            }}
          >
            {tRequest('pageTitle', language)}
          </h1>
          <p
            style={{
              margin: '0.5rem 0 0 0',
              fontSize: typography.sizes.body,
              color: palette.textSecondary,
            }}
          >
            {tRequest('pageSubtitle', language)}
          </p>
        </header>

        {/* Success message */}
        {success && (
          <div
            style={{
              padding: '1rem',
              borderRadius: radius.md,
              background: 'rgba(16, 185, 129, 0.15)', // success color with 15% opacity
              color: palette.success,
              border: `1px solid ${palette.success}`,
            }}
          >
            {success}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div
            style={{
              padding: '1rem',
              borderRadius: radius.md,
              background: `${palette.error}15`,
              color: palette.error,
              border: `1px solid ${palette.error}`,
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}
        >
          <div
            style={{
              padding: '1.5rem',
              borderRadius: radius.lg,
              background: palette.backgroundBase,
              boxShadow: shadow.subtle,
              border: `1px solid ${palette.neutralBorderMuted}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            {/* Request Type */}
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: typography.sizes.caption,
                  fontWeight: 600,
                  color: palette.textPrimary,
                }}
              >
                {tRequest('form.type', language)} *
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value as RequestType)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: radius.md,
                  border: `1px solid ${palette.neutralBorderSoft}`,
                  background: palette.backgroundBase,
                  color: palette.textPrimary,
                  fontSize: typography.sizes.body,
                  cursor: 'pointer',
                }}
              >
                <option value="buy">{tRequestList('filters.typeBuy', language)}</option>
                <option value="sell">{tRequestList('filters.typeSell', language)}</option>
                <option value="partnership">
                  {tRequestList('filters.typePartnership', language)}
                </option>
                <option value="board_nomination">
                  {tRequestList('filters.typeBoardNomination', language)}
                </option>
                <option value="feedback">
                  {tRequestList('filters.typeFeedback', language)}
                </option>
              </select>
            </div>

            {/* Number of Shares (for buy/sell) */}
            {(type === 'buy' || type === 'sell') && (
              <div>
                {/* Info box showing share price */}
                <div
                  style={{
                    padding: '0.85rem 1rem',
                    marginBottom: '1rem',
                    borderRadius: radius.md,
                    border: `1px solid ${palette.neutralBorderSoft}`,
                    background: palette.backgroundSurface,
                  }}
                >
                  <div
                    style={{
                      fontSize: typography.sizes.caption,
                      color: palette.textSecondary,
                    }}
                  >
                    {language === 'ar' 
                      ? `قيمة السهم الواحد: ${SHARE_PRICE.toLocaleString('ar-SA')} ريال سعودي`
                      : `Share price: ${SHARE_PRICE.toLocaleString('en-US')} SAR per share`}
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontSize: typography.sizes.caption,
                      fontWeight: 600,
                      color: palette.textPrimary,
                    }}
                  >
                    {tRequest('form.numberOfShares', language)} *
                  </label>
                  <input
                    type="number"
                    value={numberOfShares}
                    onChange={e => setNumberOfShares(e.target.value)}
                    required={type === 'buy' || type === 'sell'}
                    min="1"
                    step="1"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: radius.md,
                      border: `1px solid ${palette.neutralBorderSoft}`,
                      background: palette.backgroundBase,
                      color: palette.textPrimary,
                      fontSize: typography.sizes.body,
                    }}
                    placeholder={language === 'ar' ? 'أدخل عدد الأسهم' : 'Enter number of shares'}
                  />
                </div>

                {/* Display calculated total amount */}
                {numberOfShares && Number(numberOfShares) > 0 && (
                  <div
                    style={{
                      marginTop: '1rem',
                      padding: '0.85rem 1rem',
                      borderRadius: radius.md,
                      border: `1px solid ${palette.brandPrimary}`,
                      background: `${palette.brandPrimary}15`,
                      display: 'flex',
                      flexDirection: direction === 'rtl' ? 'row-reverse' : 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 600,
                        color: palette.textPrimary,
                        fontSize: typography.sizes.body,
                      }}
                    >
                      {language === 'ar' ? 'المبلغ الإجمالي:' : 'Total Amount:'}
                    </span>
                    <span
                      style={{
                        fontWeight: 700,
                        color: palette.brandPrimary,
                        fontSize: typography.sizes.heading,
                      }}
                    >
                      {calculatedAmount.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')} {language === 'ar' ? 'ريال' : 'SAR'}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Target Price (optional, for buy/sell) */}
            {(type === 'buy' || type === 'sell') && (
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: typography.sizes.caption,
                    fontWeight: 600,
                    color: palette.textPrimary,
                  }}
                >
                  {tRequest('form.targetPrice', language)}
                </label>
                <input
                  type="number"
                  value={targetPrice}
                  onChange={e => setTargetPrice(e.target.value)}
                  min="0"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: radius.md,
                    border: `1px solid ${palette.neutralBorderSoft}`,
                    background: palette.backgroundBase,
                    color: palette.textPrimary,
                    fontSize: typography.sizes.body,
                  }}
                />
              </div>
            )}

            {/* Project Selection (for partnership requests) */}
            {type === 'partnership' && (
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: typography.sizes.caption,
                    fontWeight: 600,
                    color: palette.textPrimary,
                  }}
                >
                  {language === 'ar' ? 'المشروع' : 'Project'} {language === 'ar' ? '(اختياري)' : '(Optional)'}
                </label>
                <select
                  value={projectId}
                  onChange={e => setProjectId(e.target.value)}
                  disabled={isLoadingProjects}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: radius.md,
                    border: `1px solid ${palette.neutralBorderSoft}`,
                    background: palette.backgroundBase,
                    color: palette.textPrimary,
                    fontSize: typography.sizes.body,
                    cursor: isLoadingProjects ? 'not-allowed' : 'pointer',
                    opacity: isLoadingProjects ? 0.6 : 1,
                  }}
                >
                  <option value="">
                    {isLoadingProjects
                      ? language === 'ar'
                        ? 'جاري التحميل...'
                        : 'Loading...'
                      : language === 'ar'
                      ? 'اختر المشروع (اختياري)'
                      : 'Select Project (Optional)'}
                  </option>
                  {projects?.map((project) => (
                    <option key={project.id} value={project.id}>
                      {language === 'ar' && project.nameAr ? project.nameAr : project.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Expiry Date */}
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: typography.sizes.caption,
                  fontWeight: 600,
                  color: palette.textPrimary,
                }}
              >
                {tRequest('form.expiry', language)}
              </label>
              <input
                type="date"
                value={expiryAt}
                onChange={e => setExpiryAt(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: radius.md,
                  border: `1px solid ${palette.neutralBorderSoft}`,
                  background: palette.backgroundBase,
                  color: palette.textPrimary,
                  fontSize: typography.sizes.body,
                }}
              />
            </div>

            {/* Notes */}
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: typography.sizes.caption,
                  fontWeight: 600,
                  color: palette.textPrimary,
                }}
              >
                {tRequest('form.notes', language)}
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: radius.md,
                  border: `1px solid ${palette.neutralBorderSoft}`,
                  background: palette.backgroundBase,
                  color: palette.textPrimary,
                  fontSize: typography.sizes.body,
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Documents */}
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: typography.sizes.caption,
                  fontWeight: 600,
                  color: palette.textPrimary,
                }}
              >
                {tRequest('form.documents', language)}
              </label>
              <div
                style={{
                  border: `2px dashed ${palette.neutralBorderSoft}`,
                  borderRadius: radius.md,
                  padding: '1.5rem',
                  textAlign: 'center',
                  background: palette.backgroundSurface,
                }}
              >
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <label
                  htmlFor="file-upload"
                  style={{
                    display: 'block',
                    cursor: 'pointer',
                    color: palette.brandPrimary,
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                  }}
                >
                  {language === 'ar' ? 'اختر الملفات' : 'Choose files'}
                </label>
                <p
                  style={{
                    margin: 0,
                    fontSize: typography.sizes.caption,
                    color: palette.textSecondary,
                  }}
                >
                  {tRequest('form.uploadHint', language)}
                </p>
              </div>

              {/* File list */}
              {documents.length > 0 && (
                <div
                  style={{
                    marginTop: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  {documents.map((file, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem 1rem',
                        borderRadius: radius.md,
                        background: palette.backgroundSurface,
                        border: `1px solid ${palette.neutralBorderMuted}`,
                      }}
                    >
                      <span
                        style={{
                          fontSize: typography.sizes.caption,
                          color: palette.textPrimary,
                        }}
                      >
                        {file.name} ({formatFileSize(file.size)})
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        style={{
                          padding: '0.35rem 0.75rem',
                          borderRadius: radius.sm,
                          background: palette.error,
                          color: palette.textOnBrand,
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: typography.sizes.caption,
                          fontWeight: 600,
                        }}
                      >
                        {language === 'ar' ? 'حذف' : 'Remove'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end',
            }}
          >
            <button
              type="button"
              onClick={() => navigate('/requests')}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: radius.md,
                background: 'transparent',
                color: palette.textPrimary,
                border: `1px solid ${palette.neutralBorderSoft}`,
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={createRequestMutation.isPending}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: radius.md,
                background: createRequestMutation.isPending
                  ? palette.neutralBorderMuted
                  : palette.brandPrimary,
                color: createRequestMutation.isPending
                  ? palette.textSecondary
                  : palette.textOnBrand,
                border: 'none',
                cursor: createRequestMutation.isPending ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                opacity: createRequestMutation.isPending ? 0.6 : 1,
              }}
            >
              {createRequestMutation.isPending
                ? tRequest('status.submitting', language)
                : tRequest('form.submit', language)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
