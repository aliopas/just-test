import type { InvestorLanguage } from '../types/investor';

type MessageKey =
  | 'pageTitle'
  | 'pageSubtitle'
  | 'hero.latestPrice'
  | 'hero.dailyChange'
  | 'hero.updatedAt'
  | 'hero.previousClose'
  | 'summary.rangeTitle'
  | 'summary.volumeTitle'
  | 'summary.trendTitle'
  | 'summary.movingAverageTitle'
  | 'summary.movingAverageSubtitle'
  | 'trend.up'
  | 'trend.down'
  | 'trend.flat'
  | 'insights.title'
  | 'insights.volatility'
  | 'insights.bestDay'
  | 'insights.worstDay'
  | 'timeline.title'
  | 'timeline.empty'
  | 'timeline.open'
  | 'timeline.high'
  | 'timeline.low'
  | 'timeline.close'
  | 'timeline.volume'
  | 'toast.loadError';

type MessageDictionary = Record<MessageKey, string>;

const messages: Record<InvestorLanguage, MessageDictionary> = {
  en: {
    pageTitle: 'Bacura stock performance',
    pageSubtitle:
      'Track the daily movement of Bacura shares along with key averages, trading ranges, and market signals.',
    'hero.latestPrice': 'Latest price',
    'hero.dailyChange': 'Daily change',
    'hero.updatedAt': 'Updated',
    'hero.previousClose': 'Previous close',
    'summary.rangeTitle': '30-day range',
    'summary.volumeTitle': 'Avg volume (30d)',
    'summary.trendTitle': 'Trend signal',
    'summary.movingAverageTitle': 'Moving averages',
    'summary.movingAverageSubtitle': '7-day vs 30-day closing averages',
    'trend.up': 'Uptrend',
    'trend.down': 'Downtrend',
    'trend.flat': 'Stable',
    'insights.title': 'Key indicators',
    'insights.volatility': 'Volatility (σ, 30d)',
    'insights.bestDay': 'Best close',
    'insights.worstDay': 'Weakest close',
    'timeline.title': 'Recent sessions',
    'timeline.empty': 'No trading history captured yet.',
    'timeline.open': 'Open',
    'timeline.high': 'High',
    'timeline.low': 'Low',
    'timeline.close': 'Close',
    'timeline.volume': 'Volume',
    'toast.loadError': 'Failed to load stock performance. Please try again.',
  },
  ar: {
    pageTitle: 'أداء سهم باكورة',
    pageSubtitle:
      'تابع حركة سهم باكورة اليومية إلى جانب متوسطات الأسعار، نطاقات التداول، وإشارات الاتجاه الرئيسية.',
    'hero.latestPrice': 'آخر سعر',
    'hero.dailyChange': 'التغير اليومي',
    'hero.updatedAt': 'آخر تحديث',
    'hero.previousClose': 'إقفال اليوم السابق',
    'summary.rangeTitle': 'نطاق 30 يومًا',
    'summary.volumeTitle': 'متوسط الحجم (30 يومًا)',
    'summary.trendTitle': 'إشارة الاتجاه',
    'summary.movingAverageTitle': 'المتوسطات المتحركة',
    'summary.movingAverageSubtitle': 'متوسط الإقفال 7 أيام مقابل 30 يومًا',
    'trend.up': 'اتجاه صاعد',
    'trend.down': 'اتجاه هابط',
    'trend.flat': 'اتجاه مستقر',
    'insights.title': 'المؤشرات الرئيسية',
    'insights.volatility': 'التذبذب (σ، 30 يومًا)',
    'insights.bestDay': 'أفضل إقفال',
    'insights.worstDay': 'أضعف إقفال',
    'timeline.title': 'الجلسات الأخيرة',
    'timeline.empty': 'لم يتم تسجيل تاريخ تداول بعد.',
    'timeline.open': 'الافتتاح',
    'timeline.high': 'الأعلى',
    'timeline.low': 'الأدنى',
    'timeline.close': 'الإقفال',
    'timeline.volume': 'الحجم',
    'toast.loadError': 'تعذر تحميل بيانات السهم. حاول مرة أخرى لاحقًا.',
  },
};

export function tInvestorStocks(
  key: MessageKey,
  language: InvestorLanguage = 'ar'
): string {
  return messages[language][key] ?? messages.en[key] ?? key;
}

