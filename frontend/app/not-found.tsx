import Link from 'next/link';
import { palette } from '@/styles/theme';

export default function NotFound() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100%',
        padding: '2rem',
        background: palette.backgroundBase,
      }}
    >
      <div
        style={{
          maxWidth: '600px',
          width: '100%',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: '4rem',
            fontWeight: 700,
            color: palette.brandPrimaryStrong,
            marginBottom: '1rem',
          }}
        >
          404
        </h1>
        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: 600,
            color: palette.textPrimary,
            marginBottom: '1rem',
          }}
        >
          الصفحة غير موجودة
        </h2>
        <p
          style={{
            fontSize: '1rem',
            color: palette.textSecondary,
            marginBottom: '2rem',
            lineHeight: 1.6,
          }}
        >
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
        </p>
        <Link
          href="/"
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            fontWeight: 600,
            color: palette.backgroundBase,
            background: palette.brandPrimaryStrong,
            textDecoration: 'none',
            borderRadius: '8px',
            transition: 'opacity 0.2s',
          }}
        >
          العودة إلى الصفحة الرئيسية
        </Link>
      </div>
    </div>
  );
}

