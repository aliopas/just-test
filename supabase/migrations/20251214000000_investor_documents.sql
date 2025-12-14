-- Investor documents table for investor portal
-- Includes three categories:
-- - company_static      : ملفات الشركة الثابتة
-- - financial_report    : التقارير المالية
-- - external_resource   : تقارير موارد مالية خارجية

create table if not exists public.investor_documents (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('company_static', 'financial_report', 'external_resource')),
  title_ar text not null,
  title_en text not null,
  description_ar text,
  description_en text,
  storage_url text not null,
  icon_emoji text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_investor_documents_category_order
  on public.investor_documents (category, display_order);

alter table public.investor_documents enable row level security;

-- قراءة عامة للملفات المفعّلة فقط (للمستثمرين)
drop policy if exists "Public can read active investor documents" on public.investor_documents;
create policy "Public can read active investor documents"
  on public.investor_documents for select
  using (is_active = true);

-- صلاحيات الإدارة للأدمن فقط
drop policy if exists "Admins can manage investor documents" on public.investor_documents;
create policy "Admins can manage investor documents"
  on public.investor_documents for all
  using (is_admin_user(auth.uid()))
  with check (is_admin_user(auth.uid()));

