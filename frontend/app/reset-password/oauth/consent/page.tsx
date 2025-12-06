'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/utils/supabase-client';
import { ClientOnly } from '../../../components/ClientOnly';

export const dynamic = 'force-dynamic';

/**
 * OAuth Consent Callback Page
 * 
 * This page handles OAuth consent callbacks during password reset flow.
 * Supabase may redirect here after OAuth provider consent.
 */
function OAuthConsentHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState<string>('');

  // Add CSS animation for spinner
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  useEffect(() => {
    let redirectTimeout: NodeJS.Timeout | null = null;
    let isMounted = true;

    async function handleOAuthCallback() {
      try {
        const supabase = getSupabaseBrowserClient();
        
        if (!supabase) {
          throw new Error('Supabase client not available');
        }

        // Get URL hash and search params
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const error = hashParams.get('error') || searchParams.get('error');
        const errorDescription = hashParams.get('error_description') || searchParams.get('error_description');

        // Check for errors first
        if (error) {
          console.error('[OAuth Consent] Error:', error, errorDescription);
          if (isMounted) {
            setStatus('error');
            setMessage(
              errorDescription || 
              'حدث خطأ أثناء معالجة طلب OAuth. يرجى المحاولة مرة أخرى.'
            );
            
            // Redirect to reset-password page after 3 seconds
            redirectTimeout = setTimeout(() => {
              if (isMounted) {
                router.push('/reset-password');
              }
            }, 3000);
          }
          return;
        }

        // If we have tokens, set the session
        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error('[OAuth Consent] Session error:', sessionError);
            throw sessionError;
          }

          // Session set successfully, redirect to reset-password
          if (isMounted) {
            setStatus('success');
            setMessage('تم تأكيد OAuth بنجاح. جاري التوجيه...');
            
            // Redirect to reset-password page
            redirectTimeout = setTimeout(() => {
              if (isMounted) {
                router.push('/reset-password');
              }
            }, 1000);
          }
          return;
        }

        // Check if we already have a valid session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (session && !sessionError) {
          // Already have a session, redirect to reset-password
          if (isMounted) {
            setStatus('success');
            setMessage('جاري التوجيه...');
            
            redirectTimeout = setTimeout(() => {
              if (isMounted) {
                router.push('/reset-password');
              }
            }, 500);
          }
          return;
        }

        // No tokens and no session - redirect to reset-password
        // This handles cases where the callback doesn't contain tokens
        if (isMounted) {
          router.push('/reset-password');
        }
      } catch (err: any) {
        console.error('[OAuth Consent] Unexpected error:', err);
        if (isMounted) {
          setStatus('error');
          setMessage(err?.message || 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
          
          // Redirect to reset-password page after 3 seconds
          redirectTimeout = setTimeout(() => {
            if (isMounted) {
              router.push('/reset-password');
            }
          }, 3000);
        }
      }
    }

    handleOAuthCallback();

    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false;
      if (redirectTimeout) {
        clearTimeout(redirectTimeout);
      }
    };
  }, [router, searchParams]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #2d6fa3 0%, #4a90c2 50%, #6ba3d1 100%)',
        padding: '2rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          padding: '3rem',
          textAlign: 'center',
        }}
      >
        {status === 'processing' && (
          <>
            <div
              role="status"
              aria-label="Processing OAuth request"
              style={{
                width: '48px',
                height: '48px',
                margin: '0 auto 1rem',
                border: '4px solid rgba(45, 111, 163, 0.3)',
                borderTopColor: '#2d6fa3',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
            <p style={{ margin: 0, color: '#1a1a1a', fontSize: '1rem' }}>
              جاري معالجة طلب OAuth...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div
              role="status"
              aria-label="Success"
              style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 1rem',
                borderRadius: '50%',
                background: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M20 6L9 17L4 12"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p style={{ margin: 0, color: '#1a1a1a', fontSize: '1rem' }}>
              {message || 'تم التأكيد بنجاح. جاري التوجيه...'}
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div
              role="alert"
              aria-label="Error"
              style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 1rem',
                borderRadius: '50%',
                background: '#FEF2F2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" stroke="#EF4444" strokeWidth="2" />
                <path d="M12 8V12M12 16H12.01" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <p style={{ margin: 0, marginBottom: '1rem', color: '#1a1a1a', fontSize: '1rem' }}>
              {message || 'حدث خطأ. يرجى المحاولة مرة أخرى.'}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function OAuthConsentPage() {
  return (
    <ClientOnly>
      <OAuthConsentHandler />
    </ClientOnly>
  );
}

