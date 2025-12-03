import React from 'react';
import type { NextPageContext } from 'next';

interface ErrorProps {
  statusCode?: number;
  hasGetInitialPropsRun?: boolean;
  err?: Error;
}

function Error({ statusCode }: ErrorProps) {
  const title =
    statusCode === 404
      ? '404 - الصفحة غير موجودة'
      : statusCode === 500
      ? 'خطأ في الخادم'
      : `خطأ ${statusCode || 'غير معروف'}`;

  const message =
    statusCode === 404
      ? 'الصفحة التي تبحث عنها غير موجودة.'
      : statusCode === 500
      ? 'حدث خطأ داخلي في الخادم. يرجى المحاولة مرة أخرى لاحقاً.'
      : 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';

  return React.createElement(
    'div',
    { style: { padding: '2rem', textAlign: 'center', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
    React.createElement(
      'div',
      null,
      React.createElement('h1', { style: { fontSize: '2rem', marginBottom: '1rem' } }, title),
      React.createElement('p', null, message)
    )
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;

