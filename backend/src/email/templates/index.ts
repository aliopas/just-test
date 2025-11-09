import {
  type EmailLanguage,
  type NotificationEmailTemplateId,
  type RenderedEmail,
  type TemplateContext,
} from './types';
import { renderEmailLayout, type LayoutContent } from './layout';
export type { NotificationEmailTemplateId } from './types';

const DEFAULT_SUPPORT_EMAIL = 'support@bakurah.com';

function formatDate(value: string, language: EmailLanguage) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatCurrency(
  amount: number,
  currency: string,
  language: EmailLanguage
) {
  try {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

type TemplateRenderer<TTemplate extends NotificationEmailTemplateId> = (
  language: EmailLanguage,
  context: TemplateContext<TTemplate>
) => LayoutContent;

const templateRenderers: {
  [T in NotificationEmailTemplateId]: TemplateRenderer<T>;
} = {
  request_submitted(language, context) {
    const supportEmail = context.supportEmail ?? DEFAULT_SUPPORT_EMAIL;
    const subject =
      language === 'ar'
        ? `تم استلام طلبك رقم ${context.requestNumber}`
        : `We received your request ${context.requestNumber}`;
    const submittedDate = formatDate(context.submittedAt, language);

    return {
      subject,
      heading:
        language === 'ar'
          ? 'تم استلام طلب الاستثمار الخاص بك'
          : 'Your investment request has been received',
      intro:
        language === 'ar'
          ? `مرحبًا ${context.userName}،`
          : `Hello ${context.userName},`,
      highlightItems: [
        {
          label: language === 'ar' ? 'رقم الطلب' : 'Request number',
          value: context.requestNumber,
        },
        {
          label: language === 'ar' ? 'تاريخ التقديم' : 'Submitted on',
          value: submittedDate,
        },
      ],
      paragraphs: [
        language === 'ar'
          ? 'لقد استلمنا طلبك بنجاح وسيقوم فريقنا بمراجعته خلال يوم عمل واحد.'
          : 'We have received your investment request and our team will review it within one business day.',
        language === 'ar'
          ? 'يمكنك متابعة حالة الطلب من خلال منصة المستثمرين في أي وقت.'
          : 'You can track the status of your request anytime from the investor portal.',
      ],
      cta: {
        label: language === 'ar' ? 'عرض الطلب' : 'View request',
        url: context.requestLink,
      },
      footerLines: [
        language === 'ar'
          ? `لأي استفسارات، تواصل معنا عبر البريد: ${supportEmail}`
          : `Need help? Contact us at ${supportEmail}`,
      ],
    };
  },
  request_pending_info(language, context) {
    const supportEmail = context.supportEmail ?? DEFAULT_SUPPORT_EMAIL;
    const subject =
      language === 'ar'
        ? `نحتاج المزيد من المعلومات لطلب ${context.requestNumber}`
        : `Additional info required for request ${context.requestNumber}`;

    return {
      subject,
      heading:
        language === 'ar'
          ? 'مطلوب معلومات إضافية'
          : 'Action needed for your request',
      intro:
        language === 'ar'
          ? `مرحبًا ${context.userName}،`
          : `Hello ${context.userName},`,
      highlightItems: [
        {
          label: language === 'ar' ? 'رقم الطلب' : 'Request number',
          value: context.requestNumber,
        },
      ],
      paragraphs: [
        language === 'ar'
          ? 'راجع التفاصيل التالية وأرسل المعلومات المطلوبة لإكمال مراجعة طلبك:'
          : 'Please review the message below and provide the requested information so we can continue processing your request:',
        context.infoMessage,
        language === 'ar'
          ? 'بعد تحديث المعلومات، سيستأنف فريقنا مراجعة الطلب مباشرة.'
          : 'Once you update the information, our team will resume reviewing your request immediately.',
      ],
      cta: {
        label: language === 'ar' ? 'تحديث الطلب' : 'Update request',
        url: context.requestLink,
      },
      footerLines: [
        language === 'ar'
          ? `إذا احتجت مساعدة إضافية، تواصل معنا عبر ${supportEmail}`
          : `If you need any assistance, you can reach us at ${supportEmail}`,
      ],
    };
  },
  request_approved(language, context) {
    const supportEmail = context.supportEmail ?? DEFAULT_SUPPORT_EMAIL;
    const amount = formatCurrency(
      context.approvedAmount,
      context.currency,
      language
    );

    return {
      subject:
        language === 'ar'
          ? `تمت الموافقة على طلبك ${context.requestNumber}`
          : `Request ${context.requestNumber} has been approved`,
      heading:
        language === 'ar'
          ? 'تهانينا! تمت الموافقة على طلبك'
          : 'Congratulations! Your request is approved',
      intro:
        language === 'ar'
          ? `مرحبًا ${context.userName}،`
          : `Hello ${context.userName},`,
      highlightItems: [
        {
          label: language === 'ar' ? 'رقم الطلب' : 'Request number',
          value: context.requestNumber,
        },
        {
          label: language === 'ar' ? 'المبلغ الموافق عليه' : 'Approved amount',
          value: amount,
        },
      ],
      paragraphs: [
        language === 'ar'
          ? 'تمت الموافقة على طلب الاستثمار الخاص بك بناءً على المعايير المحددة.'
          : 'Your investment request has been approved based on our review of your submission.',
        context.settlementEta
          ? language === 'ar'
            ? `من المتوقع بدء إجراءات التسوية في ${formatDate(context.settlementEta, language)}.`
            : `Settlement is expected to begin by ${formatDate(context.settlementEta, language)}.`
          : language === 'ar'
            ? 'سنبدأ إجراءات التسوية على الفور وسنرسل لك التحديثات أولًا بأول.'
            : 'We will start the settlement process right away and keep you updated along the way.',
      ],
      cta: {
        label: language === 'ar' ? 'متابعة حالة الطلب' : 'Track request status',
        url: context.requestLink,
      },
      footerLines: [
        language === 'ar'
          ? `للاستفسارات، راسلنا على ${supportEmail}`
          : `Have questions? Reach us at ${supportEmail}`,
      ],
    };
  },
  request_rejected(language, context) {
    const supportEmail = context.supportEmail ?? DEFAULT_SUPPORT_EMAIL;

    return {
      subject:
        language === 'ar'
          ? `تحديث حول طلبك ${context.requestNumber}`
          : `Update on request ${context.requestNumber}`,
      heading:
        language === 'ar'
          ? 'نأسف لعدم تمكننا من الموافقة'
          : 'We were unable to approve your request',
      intro:
        language === 'ar'
          ? `مرحبًا ${context.userName}،`
          : `Hello ${context.userName},`,
      highlightItems: [
        {
          label: language === 'ar' ? 'رقم الطلب' : 'Request number',
          value: context.requestNumber,
        },
      ],
      paragraphs: [
        language === 'ar'
          ? 'بعد مراجعة شاملة للطلب، تعذر علينا الموافقة في الوقت الحالي.'
          : 'After carefully reviewing your submission, we are unable to approve the request at this time.',
        context.rejectionReason
          ? context.rejectionReason
          : language === 'ar'
            ? 'لمزيد من التفاصيل أو الاستفسارات، لا تتردد في التواصل معنا.'
            : 'If you would like more detail or to discuss alternatives, please contact us.',
      ],
      cta: {
        label: language === 'ar' ? 'عرض تفاصيل الطلب' : 'Review details',
        url: context.requestLink,
      },
      footerLines: [
        language === 'ar'
          ? `يسعدنا مساعدتك عبر ${supportEmail}`
          : `We are here to help: ${supportEmail}`,
      ],
    };
  },
  request_settling(language, context) {
    const supportEmail = context.supportEmail ?? DEFAULT_SUPPORT_EMAIL;
    const contentParagraph =
      language === 'ar'
        ? 'بدأنا معالجة التسوية لطلبك، وسيتم تحديث الحالة تلقائيًا عند اكتمالها.'
        : 'We have started processing the settlement for your request. The status will update automatically once completed.';

    return {
      subject:
        language === 'ar'
          ? `بدأت عملية تسوية طلب ${context.requestNumber}`
          : `Settlement started for request ${context.requestNumber}`,
      heading:
        language === 'ar' ? 'تم بدء التسوية' : 'Your settlement is in progress',
      intro:
        language === 'ar'
          ? `مرحبًا ${context.userName}،`
          : `Hello ${context.userName},`,
      highlightItems: [
        {
          label: language === 'ar' ? 'رقم الطلب' : 'Request number',
          value: context.requestNumber,
        },
        context.settlementReference
          ? {
              label:
                language === 'ar' ? 'مرجع التسوية' : 'Settlement reference',
              value: context.settlementReference,
            }
          : null,
        context.expectedCompletion
          ? {
              label:
                language === 'ar'
                  ? 'تاريخ الاكتمال المتوقع'
                  : 'Estimated completion',
              value: formatDate(context.expectedCompletion, language),
            }
          : null,
      ].filter(Boolean) as Array<{ label: string; value: string }>,
      paragraphs: [
        contentParagraph,
        language === 'ar'
          ? 'سنرسل لك بريدًا آخر فور اكتمال التسوية.'
          : 'We will send another update as soon as the settlement is complete.',
      ],
      cta: {
        label: language === 'ar' ? 'متابعة حالة الطلب' : 'Track status',
        url: context.requestLink,
      },
      footerLines: [
        language === 'ar'
          ? `لأي استفسار أثناء عملية التسوية، تواصل معنا عبر ${supportEmail}`
          : `Questions during settlement? Contact us at ${supportEmail}`,
      ],
    };
  },
  request_completed(language, context) {
    const supportEmail = context.supportEmail ?? DEFAULT_SUPPORT_EMAIL;
    const completionDate = formatDate(context.completedAt, language);

    return {
      subject:
        language === 'ar'
          ? `اكتملت تسوية طلب ${context.requestNumber}`
          : `Request ${context.requestNumber} is complete`,
      heading:
        language === 'ar'
          ? 'اكتملت عملية التسوية بنجاح'
          : 'Your settlement is complete',
      intro:
        language === 'ar'
          ? `مرحبًا ${context.userName}،`
          : `Hello ${context.userName},`,
      highlightItems: [
        {
          label: language === 'ar' ? 'رقم الطلب' : 'Request number',
          value: context.requestNumber,
        },
        {
          label: language === 'ar' ? 'تاريخ الاكتمال' : 'Completed on',
          value: completionDate,
        },
        context.settlementReference
          ? {
              label:
                language === 'ar' ? 'مرجع التسوية' : 'Settlement reference',
              value: context.settlementReference,
            }
          : null,
      ].filter(Boolean) as Array<{ label: string; value: string }>,
      paragraphs: [
        language === 'ar'
          ? 'تم إيداع العوائد وفق تفاصيل الطلب. يمكنك مراجعة صفحة الطلب للاطلاع على السجل الكامل.'
          : 'Funds have been settled according to your request details. You can review the full activity log on your request page.',
        language === 'ar'
          ? 'نشكرك على ثقتك في منصة باكورة، ونتطلع لدعم استثماراتك القادمة.'
          : 'Thank you for choosing Bakurah. We look forward to supporting your next investment.',
      ],
      cta: {
        label: language === 'ar' ? 'عرض سجل الطلب' : 'View request history',
        url: context.requestLink,
      },
      footerLines: [
        language === 'ar'
          ? `لأي استفسارات مستقبلية، تواصل معنا عبر ${supportEmail}`
          : `Need anything else? We are here at ${supportEmail}`,
      ],
    };
  },
};

export function renderNotificationEmailTemplate<
  TTemplate extends NotificationEmailTemplateId,
>(
  templateId: TTemplate,
  language: EmailLanguage,
  context: TemplateContext<TTemplate>
): RenderedEmail {
  const layout = templateRenderers[templateId](language, context);
  const email = renderEmailLayout(language, layout);

  return {
    subject: layout.subject,
    html: email.html,
    text: email.text,
  };
}
