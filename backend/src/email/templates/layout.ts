import type { EmailLanguage } from './types';

export interface LayoutContent {
  subject: string;
  heading: string;
  intro: string;
  highlightItems?: Array<{ label: string; value: string }>;
  paragraphs?: string[];
  bulletPoints?: string[];
  cta?: { label: string; url: string };
  footerLines?: string[];
}

export function renderEmailLayout(
  language: EmailLanguage,
  content: LayoutContent
) {
  const direction = language === 'ar' ? 'rtl' : 'ltr';
  const textAlign = language === 'ar' ? 'right' : 'left';
  const fontFamily = `'Inter', 'Helvetica Neue', Arial, sans-serif`;
  const signature =
    language === 'ar' ? 'فريق باكورة للاستثمار' : 'The Bakurah Investors Team';

  const paragraphs = content.paragraphs ?? [];
  const highlightRows =
    content.highlightItems?.map(
      item => `
        <tr>
          <td style="padding: 6px 0; font-weight: 600; color: #1f2937;">
            ${item.label}
          </td>
          <td style="padding: 6px 0; color: #111827;">
            ${item.value}
          </td>
        </tr>
      `
    ) ?? [];

  const bulletList =
    content.bulletPoints && content.bulletPoints.length > 0
      ? `
        <ul style="padding-${language === 'ar' ? 'right' : 'left'}: 20px; margin: 16px 0; color: #374151; line-height: 1.6;">
          ${content.bulletPoints
            .map(point => `<li style="margin: 8px 0;">${point}</li>`)
            .join('')}
        </ul>
      `
      : '';

  const ctaButton = content.cta
    ? `
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 24px auto 0;">
        <tr>
          <td style="border-radius: 8px; background: #2563eb;">
            <a href="${content.cta.url}" style="display: inline-block; padding: 12px 24px; color: #ffffff; font-weight: 600; text-decoration: none;">
              ${content.cta.label}
            </a>
          </td>
        </tr>
      </table>
    `
    : '';

  const footer = content.footerLines ?? [];

  const html = `<!DOCTYPE html>
  <html lang="${language}" dir="${direction}">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${content.subject}</title>
      <style>
        html, body {
          margin: 0;
          padding: 0;
          background-color: #f9fafb;
          font-family: ${fontFamily};
          direction: ${direction};
        }
        .wrapper {
          width: 100%;
          background-color: #f9fafb;
          padding: 24px 12px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
        }
        .header {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          padding: 32px 24px;
          color: #ffffff;
          text-align: ${textAlign};
        }
        .content {
          padding: 32px 28px;
          text-align: ${textAlign};
        }
        .footer {
          padding: 24px 28px 32px;
          background-color: #f3f4f6;
          color: #6b7280;
          font-size: 13px;
          text-align: ${textAlign};
        }
        @media (max-width: 600px) {
          .container {
            border-radius: 0;
          }
          .content, .footer {
            padding: 24px 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 22px; line-height: 1.4;">
              ${content.heading}
            </h1>
          </div>
          <div class="content">
            <p style="margin: 0 0 16px; font-size: 16px; color: #111827; line-height: 1.6;">
              ${content.intro}
            </p>
            ${
              highlightRows.length > 0
                ? `
            <table role="presentation" cellspacing="0" cellpadding="0"
              style="width: 100%; margin: 16px 0; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb;">
              ${highlightRows.join('')}
            </table>
            `
                : ''
            }
            ${paragraphs
              .map(
                paragraph => `
              <p style="margin: 16px 0; font-size: 15px; color: #374151; line-height: 1.8;">
                ${paragraph}
              </p>
            `
              )
              .join('')}
            ${bulletList}
            <p style="margin: 24px 0 0; font-size: 15px; color: #111827; line-height: 1.6;">
              ${signature}
            </p>
            ${ctaButton}
          </div>
          <div class="footer">
            ${footer.map(line => `<p style="margin: 4px 0;">${line}</p>`).join('')}
          </div>
        </div>
      </div>
    </body>
  </html>`;

  const textLines: string[] = [
    content.heading,
    '',
    content.intro,
    '',
    ...(content.highlightItems?.map(item => `${item.label}: ${item.value}`) ??
      []),
    '',
    ...paragraphs,
    ...(content.bulletPoints?.map(point => `• ${point}`) ?? []),
    '',
    signature,
    '',
    ...(content.cta ? [`${content.cta.label}: ${content.cta.url}`] : []),
    '',
    ...footer,
  ].filter((line, index, arr) => !(line === '' && arr[index - 1] === ''));

  const text = textLines.join('\n');

  return {
    html,
    text,
  };
}
