import { useState, useEffect } from 'react';
import { palette } from '../../styles/theme';
import { useLanguage } from '../../context/LanguageContext';

export function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      aria-label={isArabic ? 'العودة إلى الأعلى' : 'Scroll to top'}
      style={{
        position: 'fixed',
        bottom: '2rem',
        [isArabic ? 'left' : 'right']: '2rem',
        zIndex: 1000,
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${palette.brandPrimaryStrong}, ${palette.brandPrimary})`,
        color: palette.textOnBrand,
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.2), 0 2px 8px rgba(15, 23, 42, 0.1)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'scale(1)' : 'scale(0.8)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1) translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(15, 23, 42, 0.3), 0 4px 12px rgba(15, 23, 42, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(15, 23, 42, 0.2), 0 2px 8px rgba(15, 23, 42, 0.1)';
      }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          transform: isArabic ? 'rotate(180deg)' : 'none',
        }}
      >
        <path d="M18 15l-6-6-6 6" />
      </svg>
    </button>
  );
}

