// Custom 500 error page - minimal implementation to avoid prerendering issues
import React from 'react';

export default function Custom500() {
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
        fontFamily: 'system-ui, sans-serif',
      },
    },
    React.createElement(
      'div',
      null,
      React.createElement('h1', { style: { fontSize: '2rem', marginBottom: '1rem' } }, 'خطأ في الخادم'),
      React.createElement('p', null, 'حدث خطأ داخلي في الخادم. يرجى المحاولة مرة أخرى لاحقاً.')
    )
  );
}

