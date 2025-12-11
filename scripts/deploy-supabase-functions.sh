#!/bin/bash

# سكريبت لنشر جميع Supabase Edge Functions
# Usage: ./scripts/deploy-supabase-functions.sh [function-name]

set -e

# الألوان للرسائل
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# قائمة جميع الدوال
FUNCTIONS=(
  "admin-create-user"
  "admin-update-user"
  "admin-delete-user"
  "approve-signup-request"
  "notification-dispatch"
)

# التحقق من تثبيت Supabase CLI
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI غير مثبت${NC}"
    echo "قم بتثبيته عبر: npm install -g supabase"
    exit 1
fi

# التحقق من تسجيل الدخول
if ! supabase projects list &> /dev/null; then
    echo -e "${YELLOW}⚠️  يبدو أنك غير مسجل الدخول إلى Supabase${NC}"
    echo "قم بتسجيل الدخول عبر: supabase login"
    exit 1
fi

# إذا تم تمرير اسم دالة كمعامل، نشرها فقط
if [ -n "$1" ]; then
    FUNCTION_NAME="$1"
    
    # التحقق من وجود الدالة
    if [[ ! " ${FUNCTIONS[@]} " =~ " ${FUNCTION_NAME} " ]]; then
        echo -e "${RED}❌ الدالة '$FUNCTION_NAME' غير موجودة${NC}"
        echo "الدوال المتاحة:"
        for func in "${FUNCTIONS[@]}"; do
            echo "  - $func"
        done
        exit 1
    fi
    
    echo -e "${YELLOW}📦 نشر الدالة: $FUNCTION_NAME${NC}"
    supabase functions deploy "$FUNCTION_NAME"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ تم نشر $FUNCTION_NAME بنجاح${NC}"
    else
        echo -e "${RED}❌ فشل نشر $FUNCTION_NAME${NC}"
        exit 1
    fi
else
    # نشر جميع الدوال
    echo -e "${YELLOW}🚀 بدء نشر جميع Edge Functions...${NC}"
    echo ""
    
    SUCCESS_COUNT=0
    FAIL_COUNT=0
    
    for func in "${FUNCTIONS[@]}"; do
        echo -e "${YELLOW}📦 نشر $func...${NC}"
        
        if supabase functions deploy "$func"; then
            echo -e "${GREEN}✅ تم نشر $func بنجاح${NC}"
            ((SUCCESS_COUNT++))
        else
            echo -e "${RED}❌ فشل نشر $func${NC}"
            ((FAIL_COUNT++))
        fi
        echo ""
    done
    
    # ملخص النتائج
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${GREEN}✅ نجح: $SUCCESS_COUNT${NC}"
    if [ $FAIL_COUNT -gt 0 ]; then
        echo -e "${RED}❌ فشل: $FAIL_COUNT${NC}"
    fi
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if [ $FAIL_COUNT -eq 0 ]; then
        echo -e "${GREEN}🎉 تم نشر جميع الدوال بنجاح!${NC}"
        exit 0
    else
        echo -e "${RED}⚠️  بعض الدوال فشل نشرها${NC}"
        exit 1
    fi
fi

