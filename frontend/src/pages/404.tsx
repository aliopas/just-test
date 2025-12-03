// Custom 404 error page
// Note: Next.js does not allow getServerSideProps or getInitialProps in 404.tsx
// This page will be statically generated at build time
import React from 'react';

export default function Custom404() {
  return React.createElement(
    'div',
    {
      style: {
        padding: '2rem',
        textAlign: 'center',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
    },
    React.createElement(
      'div',
      null,
      React.createElement(
        'h1',
        { style: { fontSize: '2rem', marginBottom: '1rem' } },
        '404 - الصفحة غير موجودة'
      ),
      React.createElement('p', null, 'الصفحة التي تبحث عنها غير موجودة.')
    )
  );
}

