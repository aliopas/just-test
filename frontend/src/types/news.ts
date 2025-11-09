export type NewsStatus =
  | 'draft'
  | 'pending_review'
  | 'scheduled'
  | 'published'
  | 'rejected'
  | 'archived';

export interface NewsCategory {
  id: string;
  name: string;
  slug: string;
}

export interface NewsAuthor {
  id: string | null;
  email: string | null;
}

export interface AdminNewsReview {
  id: string;
  action: 'approve' | 'reject';
  comment: string | null;
  createdAt: string;
  reviewer: {
    id: string | null;
    email: string | null;
  };
}

export interface AdminNewsItem {
  id: string;
  title: string;
  slug: string;
  bodyMd: string;
  coverKey: string | null;
  status: NewsStatus;
  scheduledAt: string | null;
  publishedAt: string | null;
  category: NewsCategory | null;
  author: NewsAuthor | null;
  createdAt: string;
  updatedAt: string;
  reviews: AdminNewsReview[];
}

export interface AdminNewsMeta {
  page: number;
  limit: number;
  total: number;
  pageCount: number;
  hasNext: boolean;
}

export interface AdminNewsListResponse {
  news: AdminNewsItem[];
  meta: AdminNewsMeta;
}

export interface AdminNewsListFilters {
  page?: number;
  status?: NewsStatus | 'all';
  search?: string;
}

export interface NewsImagePresignResponse {
  bucket: string;
  storageKey: string;
  uploadUrl: string;
  token: string | null;
  headers: Record<string, string>;
  path: string;
}

export interface InvestorNewsMeta {
  page: number;
  limit: number;
  total: number;
  pageCount: number;
  hasNext: boolean;
}

export interface InvestorNewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverKey: string | null;
  publishedAt: string;
}

export interface InvestorNewsListResponse {
  news: InvestorNewsItem[];
  meta: InvestorNewsMeta;
}

export interface InvestorNewsDetail {
  id: string;
  title: string;
  slug: string;
  bodyMd: string;
  coverKey: string | null;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}


