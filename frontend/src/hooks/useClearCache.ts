/**
 * Hook عام لمسح الكاش من جميع الصفحات
 */

import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

export function useClearCache() {
  const queryClient = useQueryClient();
  const { pushToast } = useToast();
  const { language } = useLanguage();

  const clearAllCache = async () => {
    try {
      // مسح جميع الاستعلامات المتعلقة بالطلبات
      queryClient.removeQueries({ queryKey: ['adminRequestsDirect'] });
      queryClient.removeQueries({ queryKey: ['adminRequestDetailDirect'] });
      queryClient.removeQueries({ queryKey: ['adminRequestReportDirect'] });
      queryClient.removeQueries({ queryKey: ['investorRequestsDirect'] });
      queryClient.removeQueries({ queryKey: ['investorRequestDetailDirect'] });
      queryClient.removeQueries({ queryKey: ['requestTimelineDirect'] });
      
      // مسح جميع الاستعلامات المتعلقة بالأخبار
      queryClient.removeQueries({ queryKey: ['adminNewsDirect'] });
      queryClient.removeQueries({ queryKey: ['adminNewsDetailDirect'] });
      queryClient.removeQueries({ queryKey: ['newsDirect'] });
      
      // مسح جميع الاستعلامات المتعلقة بالمستخدمين
      queryClient.removeQueries({ queryKey: ['adminUsersDirect'] });
      queryClient.removeQueries({ queryKey: ['adminInvestorsDirect'] });
      queryClient.removeQueries({ queryKey: ['investorProfileDirect'] });
      queryClient.removeQueries({ queryKey: ['investorProfile'] });
      
      // مسح جميع الاستعلامات المتعلقة بطلبات الحساب
      queryClient.removeQueries({ queryKey: ['adminAccountRequestsDirect'] });
      queryClient.removeQueries({ queryKey: ['adminAccountRequestsUnreadCountDirect'] });
      
      // مسح جميع الاستعلامات المتعلقة بالمشاريع
      queryClient.removeQueries({ queryKey: ['adminProjects'] });
      
      // مسح جميع الاستعلامات المتعلقة بالمحتوى
      queryClient.removeQueries({ queryKey: ['adminCompanyContent'] });
      queryClient.removeQueries({ queryKey: ['adminHomepageSections'] });
      
      // مسح جميع الاستعلامات المتعلقة بالإشعارات
      queryClient.removeQueries({ queryKey: ['notifications'] });
      queryClient.removeQueries({ queryKey: ['notificationPreferences'] });
      
      // مسح جميع الاستعلامات المتعلقة بالجداول
      queryClient.removeQueries({ queryKey: ['supabaseTables'] });
      
      // مسح جميع الاستعلامات المتعلقة بالتقارير
      queryClient.removeQueries({ queryKey: ['adminRequestReport'] });
      queryClient.removeQueries({ queryKey: ['adminRequestReportDirect'] });
      
      pushToast({
        message: language === 'ar' 
          ? 'تم مسح الكاش القديم من جميع الصفحات بنجاح' 
          : 'Cache cleared successfully from all pages',
        variant: 'success',
      });
    } catch (error) {
      pushToast({
        message: language === 'ar' 
          ? 'فشل مسح الكاش' 
          : 'Failed to clear cache',
        variant: 'error',
      });
    }
  };

  return { clearAllCache };
}
