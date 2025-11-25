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

const REQUEST_TYPE_LABELS: Record<string, { en: string; ar: string }> = {
  buy: { en: 'Buy Order', ar: 'طلب شراء' },
  sell: { en: 'Sell Order', ar: 'طلب بيع' },
  subscription: { en: 'Subscription', ar: 'اكتتاب' },
};

const STATUS_LABELS: Record<string, { en: string; ar: string }> = {
  draft: { en: 'Draft', ar: 'مسودة' },
  submitted: { en: 'Submitted', ar: 'تم الإرسال' },
  screening: { en: 'Screening', ar: 'مراجعة أولية' },
  pending_info: { en: 'Pending Info', ar: 'بانتظار معلومات' },
  compliance_review: { en: 'Compliance Review', ar: 'مراجعة امتثال' },
  approved: { en: 'Approved', ar: 'مقبول' },
  rejected: { en: 'Rejected', ar: 'مرفوض' },
  settling: { en: 'Settling', ar: 'قيد التسوية' },
  completed: { en: 'Completed', ar: 'مكتمل' },
};

function formatRequestTypeLabel(type: string, language: EmailLanguage) {
  const normalized = (type ?? '').toLowerCase();
  const mapping = REQUEST_TYPE_LABELS[normalized];
  if (mapping) {
    return mapping[language];
  }
  const fallback = normalized.replace(/[_-]+/g, ' ');
  if (!fallback) {
    return language === 'ar' ? 'غير متوفر' : 'Not available';
  }
  if (language === 'ar') {
    return fallback;
  }
  return fallback.replace(/\b\w/g, char => char.toUpperCase());
}

function formatStatusLabel(status: string, language: EmailLanguage) {
  const normalized = (status ?? '').toLowerCase();
  const mapping = STATUS_LABELS[normalized];
  if (mapping) {
    return mapping[language];
  }
  if (!normalized) {
    return language === 'ar' ? 'غير معروف' : 'Unknown';
  }
  return normalized;
}

function formatAmountLabel(
  amount: number | undefined,
  currency: string | undefined,
  language: EmailLanguage
) {
  if (typeof amount === 'number' && currency) {
    return formatCurrency(amount, currency, language);
  }
  return language === 'ar' ? 'غير متوفر' : 'Not available';
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
    const amount =
      typeof context.approvedAmount === 'number' && context.currency
        ? formatCurrency(context.approvedAmount, context.currency, language)
        : null;

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
        amount
          ? {
              label:
                language === 'ar' ? 'المبلغ الموافق عليه' : 'Approved amount',
              value: amount,
            }
          : null,
      ].filter(
        (item): item is { label: string; value: string } => item !== null
      ),
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
  admin_request_submitted(language, context) {
    const supportEmail = context.supportEmail ?? DEFAULT_SUPPORT_EMAIL;
    const submittedDate = formatDate(context.submittedAt, language);
    const requestType = formatRequestTypeLabel(context.requestType, language);
    const amountLabel = formatAmountLabel(
      context.amount,
      context.currency,
      language
    );

    return {
      subject:
        language === 'ar'
          ? `طلب جديد ${context.requestNumber}`
          : `New request ${context.requestNumber} submitted`,
      heading:
        language === 'ar'
          ? 'تنبيه: وصول طلب استثماري جديد'
          : 'New investment request received',
      intro:
        language === 'ar'
          ? `مرحبًا ${context.recipientName}،`
          : `Hello ${context.recipientName},`,
      highlightItems: [
        {
          label: language === 'ar' ? 'رقم الطلب' : 'Request number',
          value: context.requestNumber,
        },
        {
          label: language === 'ar' ? 'المستثمر' : 'Investor',
          value: context.investorName,
        },
        {
          label: language === 'ar' ? 'نوع الطلب' : 'Request type',
          value: requestType,
        },
        {
          label: language === 'ar' ? 'القيمة' : 'Amount',
          value: amountLabel,
        },
      ],
      paragraphs: [
        language === 'ar'
          ? `تم تقديم الطلب في ${submittedDate}. يرجى مراجعة التفاصيل واتخاذ الإجراءات اللازمة.`
          : `The request was submitted on ${submittedDate}. Please review the details and take the next steps.`,
      ],
      cta: {
        label: language === 'ar' ? 'فتح لوحة التحكم' : 'Open dashboard',
        url: context.requestLink,
      },
      footerLines: [
        language === 'ar'
          ? `لأي استفسار، يمكنك التواصل مع فريق الدعم: ${supportEmail}`
          : `Questions? Reach the operations team at ${supportEmail}`,
      ],
    };
  },
  admin_request_pending_info(language, context) {
    const supportEmail = context.supportEmail ?? DEFAULT_SUPPORT_EMAIL;
    const requestType = formatRequestTypeLabel(context.requestType, language);
    const statusLabel = formatStatusLabel(context.previousStatus, language);

    return {
      subject:
        language === 'ar'
          ? `تم تعليق الطلب ${context.requestNumber} لمعلومات إضافية`
          : `Request ${context.requestNumber} requires additional info`,
      heading:
        language === 'ar'
          ? 'تنبيه: الطلب بانتظار معلومات'
          : 'Action required: request on hold',
      intro:
        language === 'ar'
          ? `مرحبًا ${context.recipientName}،`
          : `Hello ${context.recipientName},`,
      highlightItems: [
        {
          label: language === 'ar' ? 'رقم الطلب' : 'Request number',
          value: context.requestNumber,
        },
        {
          label: language === 'ar' ? 'المستثمر' : 'Investor',
          value: context.investorName,
        },
        {
          label: language === 'ar' ? 'نوع الطلب' : 'Request type',
          value: requestType,
        },
        {
          label: language === 'ar' ? 'الحالة السابقة' : 'Previous status',
          value: statusLabel,
        },
      ],
      paragraphs: [
        language === 'ar'
          ? 'تم إرسال طلب للمستثمر لتوفير معلومات إضافية. نص الرسالة المرسلة:'
          : 'An additional information request has been sent to the investor. Message sent:',
        context.infoMessage,
      ],
      cta: {
        label: language === 'ar' ? 'متابعة الطلب' : 'Review request',
        url: context.requestLink,
      },
      footerLines: [
        language === 'ar'
          ? `في حال عدم استلام رد، يرجى المتابعة مع المستثمر أو التواصل عبر ${supportEmail}`
          : `If no response is received, follow up with the investor or contact ${supportEmail}`,
      ],
    };
  },
  admin_request_decision(language, context) {
    const supportEmail = context.supportEmail ?? DEFAULT_SUPPORT_EMAIL;
    const requestType = formatRequestTypeLabel(context.requestType, language);
    const amountLabel = formatAmountLabel(
      context.amount,
      context.currency,
      language
    );
    const decisionLabel =
      context.decision === 'approved'
        ? language === 'ar'
          ? 'تمت الموافقة'
          : 'Approved'
        : language === 'ar'
          ? 'تم الرفض'
          : 'Rejected';

    return {
      subject:
        language === 'ar'
          ? `${decisionLabel} على الطلب ${context.requestNumber}`
          : `Request ${context.requestNumber} ${context.decision}`,
      heading:
        language === 'ar'
          ? `تنبيه قرار: ${decisionLabel}`
          : `Decision update: ${decisionLabel}`,
      intro:
        language === 'ar'
          ? `مرحبًا ${context.recipientName}،`
          : `Hello ${context.recipientName},`,
      highlightItems: [
        {
          label: language === 'ar' ? 'رقم الطلب' : 'Request number',
          value: context.requestNumber,
        },
        {
          label: language === 'ar' ? 'المستثمر' : 'Investor',
          value: context.investorName,
        },
        {
          label: language === 'ar' ? 'نوع الطلب' : 'Request type',
          value: requestType,
        },
        {
          label: language === 'ar' ? 'القيمة' : 'Amount',
          value: amountLabel,
        },
      ],
      paragraphs: [
        context.actorName
          ? language === 'ar'
            ? `اتخذ ${context.actorName} قرار "${decisionLabel}".`
            : `${context.actorName} marked the request as "${decisionLabel}".`
          : language === 'ar'
            ? `تم تعيين حالة الطلب إلى "${decisionLabel}".`
            : `The request status is now "${decisionLabel}".`,
        context.note
          ? language === 'ar'
            ? `ملاحظة القرار: ${context.note}`
            : `Decision note: ${context.note}`
          : '',
      ].filter(Boolean) as string[],
      cta: {
        label:
          language === 'ar' ? 'عرض تفاصيل القرار' : 'View decision details',
        url: context.requestLink,
      },
      footerLines: [
        language === 'ar'
          ? `للتنسيق أو الاستفسار، راسل فريق العمليات على ${supportEmail}`
          : `For coordination, contact the operations team at ${supportEmail}`,
      ],
    };
  },
  admin_request_settling(language, context) {
    const supportEmail = context.supportEmail ?? DEFAULT_SUPPORT_EMAIL;
    const requestType = formatRequestTypeLabel(context.requestType, language);
    const amountLabel = formatAmountLabel(
      context.amount,
      context.currency,
      language
    );
    const startedDate = formatDate(context.startedAt, language);

    return {
      subject:
        language === 'ar'
          ? `بدأت تسوية الطلب ${context.requestNumber}`
          : `Settlement started for request ${context.requestNumber}`,
      heading:
        language === 'ar'
          ? 'تنبيه: بدء إجراءات التسوية'
          : 'Settlement process has begun',
      intro:
        language === 'ar'
          ? `مرحبًا ${context.recipientName}،`
          : `Hello ${context.recipientName},`,
      highlightItems: [
        {
          label: language === 'ar' ? 'رقم الطلب' : 'Request number',
          value: context.requestNumber,
        },
        {
          label: language === 'ar' ? 'المستثمر' : 'Investor',
          value: context.investorName,
        },
        {
          label: language === 'ar' ? 'نوع الطلب' : 'Request type',
          value: requestType,
        },
        {
          label: language === 'ar' ? 'القيمة' : 'Amount',
          value: amountLabel,
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
          ? `تم بدء عملية التسوية في ${startedDate}. راجع لوحة التحكم للملفات والملاحظات المرتبطة.`
          : `Settlement procedures began on ${startedDate}. Review the dashboard for supporting files and notes.`,
      ],
      cta: {
        label: language === 'ar' ? 'متابعة التسوية' : 'Track settlement',
        url: context.requestLink,
      },
      footerLines: [
        language === 'ar'
          ? `تواصل مع فريق الخزانة عند الحاجة: ${supportEmail}`
          : `Reach out to the treasury team if needed: ${supportEmail}`,
      ],
    };
  },
  admin_request_completed(language, context) {
    const supportEmail = context.supportEmail ?? DEFAULT_SUPPORT_EMAIL;
    const requestType = formatRequestTypeLabel(context.requestType, language);
    const amountLabel = formatAmountLabel(
      context.amount,
      context.currency,
      language
    );
    const completedDate = formatDate(context.completedAt, language);

    return {
      subject:
        language === 'ar'
          ? `اكتملت تسوية الطلب ${context.requestNumber}`
          : `Settlement completed for request ${context.requestNumber}`,
      heading:
        language === 'ar' ? 'تنبيه: إتمام التسوية' : 'Settlement complete',
      intro:
        language === 'ar'
          ? `مرحبًا ${context.recipientName}،`
          : `Hello ${context.recipientName},`,
      highlightItems: [
        {
          label: language === 'ar' ? 'رقم الطلب' : 'Request number',
          value: context.requestNumber,
        },
        {
          label: language === 'ar' ? 'المستثمر' : 'Investor',
          value: context.investorName,
        },
        {
          label: language === 'ar' ? 'نوع الطلب' : 'Request type',
          value: requestType,
        },
        {
          label: language === 'ar' ? 'القيمة' : 'Amount',
          value: amountLabel,
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
          ? `تم إتمام التسوية في ${completedDate}. يرجى تحديث التحصيلات وإغلاق الطلب إن لزم.`
          : `Settlement finished on ${completedDate}. Please reconcile the disbursements and close the request if appropriate.`,
      ],
      cta: {
        label: language === 'ar' ? 'عرض الطلب' : 'View request',
        url: context.requestLink,
      },
      footerLines: [
        language === 'ar'
          ? `لأي تبعات مالية أو محاسبية، راسل ${supportEmail}`
          : `For follow-up or accounting actions, contact ${supportEmail}`,
      ],
    };
  },
  otp_verification(language, context) {
    const supportEmail = context.supportEmail ?? DEFAULT_SUPPORT_EMAIL;
    const subject =
      language === 'ar'
        ? 'رمز التحقق الخاص بك - باكورة'
        : 'Your verification code - Bakurah';

    return {
      subject,
      heading:
        language === 'ar' ? 'رمز التحقق الخاص بك' : 'Your verification code',
      intro:
        language === 'ar'
          ? `مرحبًا ${context.userName}،`
          : `Hello ${context.userName},`,
      highlightItems: [
        {
          label: language === 'ar' ? 'رمز التحقق' : 'Verification code',
          value: context.otpCode,
        },
        {
          label: language === 'ar' ? 'صالح لمدة' : 'Valid for',
          value:
            language === 'ar'
              ? `${context.expiresInMinutes} دقائق`
              : `${context.expiresInMinutes} minutes`,
        },
      ],
      paragraphs: [
        language === 'ar'
          ? 'استخدم هذا الرمز للتحقق من حسابك في منصة باكورة للمستثمرين.'
          : 'Use this code to verify your account on Bakurah Investors Portal.',
        language === 'ar'
          ? 'هذا الرمز سينتهي خلال فترة قصيرة من الزمن. لا تشارك هذا الرمز مع أي شخص.'
          : 'This code will expire shortly. Do not share this code with anyone.',
      ],
      footerLines: [
        language === 'ar'
          ? `إذا لم تطلب هذا الرمز، يرجى تجاهل هذا البريد أو الاتصال بنا عبر ${supportEmail}`
          : `If you did not request this code, please ignore this email or contact us at ${supportEmail}`,
      ],
    };
  },
  welcome(language, context) {
    const supportEmail = context.supportEmail ?? DEFAULT_SUPPORT_EMAIL;
    const subject =
      language === 'ar'
        ? 'مرحباً بك في منصة باكورة للمستثمرين'
        : 'Welcome to Bakurah Investors Portal';

    return {
      subject,
      heading: language === 'ar' ? 'مرحباً بك في باكورة' : 'Welcome to Bakurah',
      intro:
        language === 'ar'
          ? `مرحبًا ${context.userName}،`
          : `Hello ${context.userName},`,
      highlightItems: [],
      paragraphs: [
        language === 'ar'
          ? 'نشكرك على التسجيل في منصة باكورة للمستثمرين. تم تفعيل حسابك بنجاح!'
          : 'Thank you for registering with Bakurah Investors Portal. Your account has been successfully activated!',
        language === 'ar'
          ? 'يمكنك الآن تسجيل الدخول والبدء في استخدام جميع الميزات المتاحة في المنصة.'
          : 'You can now log in and start using all the features available on the platform.',
        language === 'ar'
          ? 'نتمنى أن تجد منصة باكورة مفيدة لاستثماراتك، ويسعدنا مساعدتك في أي وقت.'
          : 'We hope you find Bakurah useful for your investments, and we are happy to assist you anytime.',
      ],
      cta: {
        label: language === 'ar' ? 'تسجيل الدخول' : 'Log in',
        url: context.loginLink,
      },
      footerLines: [
        language === 'ar'
          ? `للاستفسارات أو المساعدة، تواصل معنا عبر ${supportEmail}`
          : `For questions or assistance, please contact us at ${supportEmail}`,
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
