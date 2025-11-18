import { requireSupabaseAdmin } from '../lib/supabase';
import type {
  CreateProjectInput,
  UpdateProjectInput,
  ProjectListQuery,
  ProjectImagePresignInput,
} from '../schemas/projects.schema';

export type Project = {
  id: string;
  name: string;
  nameAr: string | null;
  description: string | null;
  descriptionAr: string | null;
  coverKey: string | null;
  operatingCosts: number;
  annualBenefits: number;
  totalShares: number;
  sharePrice: number;
  status: 'active' | 'inactive' | 'archived';
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  // Calculated fields
  operatingCostPerShare: number;
  annualBenefitPerShare: number;
};

type ProjectRow = {
  id: string;
  name: string;
  name_ar: string | null;
  description: string | null;
  description_ar: string | null;
  cover_key: string | null;
  operating_costs: number;
  annual_benefits: number;
  total_shares: number;
  share_price: number;
  status: 'active' | 'inactive' | 'archived';
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

const PROJECT_IMAGES_BUCKET =
  process.env.PROJECT_IMAGES_BUCKET?.trim() || 'project-images';

function mapProject(row: ProjectRow): Project {
  const operatingCostPerShare = row.total_shares > 0 
    ? Number((row.operating_costs / row.total_shares).toFixed(2))
    : 0;
  const annualBenefitPerShare = row.total_shares > 0
    ? Number((row.annual_benefits / row.total_shares).toFixed(2))
    : 0;

  return {
    id: row.id,
    name: row.name,
    nameAr: row.name_ar,
    description: row.description,
    descriptionAr: row.description_ar,
    coverKey: row.cover_key,
    operatingCosts: Number(row.operating_costs),
    annualBenefits: Number(row.annual_benefits),
    totalShares: row.total_shares,
    sharePrice: Number(row.share_price),
    status: row.status,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    operatingCostPerShare,
    annualBenefitPerShare,
  };
}

export async function listProjects(query: ProjectListQuery): Promise<{
  projects: Project[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}> {
  const adminClient = requireSupabaseAdmin();
  const {
    page = 1,
    limit = 25,
    status,
    search,
    sortBy = 'created_at',
    order = 'desc',
  } = query;

  let queryBuilder = adminClient
    .from('projects')
    .select('*', { count: 'exact' });

  if (status && status !== 'all') {
    queryBuilder = queryBuilder.eq('status', status);
  }

  if (search) {
    queryBuilder = queryBuilder.or(`name.ilike.%${search}%,name_ar.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const { data, error, count } = await queryBuilder
    .order(sortBy, { ascending: order === 'asc' })
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    throw new Error(`Failed to list projects: ${error.message}`);
  }

  const projects = (data || []).map(mapProject);
  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  return {
    projects,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

export async function getProjectById(id: string): Promise<Project | null> {
  const adminClient = requireSupabaseAdmin();
  const { data, error } = await adminClient
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to get project: ${error.message}`);
  }

  return data ? mapProject(data) : null;
}

export async function createProject(
  input: CreateProjectInput,
  createdBy: string
): Promise<Project> {
  const adminClient = requireSupabaseAdmin();
  const { data, error } = await adminClient
    .from('projects')
    .insert({
      name: input.name,
      name_ar: input.nameAr || null,
      description: input.description || null,
      description_ar: input.descriptionAr || null,
      cover_key: input.coverKey || null,
      operating_costs: input.operatingCosts,
      annual_benefits: input.annualBenefits,
      total_shares: input.totalShares,
      share_price: input.sharePrice || 50000,
      status: input.status || 'active',
      created_by: createdBy,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create project: ${error.message}`);
  }

  return mapProject(data);
}

export async function updateProject(
  id: string,
  input: UpdateProjectInput
): Promise<Project> {
  const adminClient = requireSupabaseAdmin();
  const updateData: Record<string, unknown> = {};

  if (input.name !== undefined) updateData.name = input.name;
  if (input.nameAr !== undefined) updateData.name_ar = input.nameAr;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.descriptionAr !== undefined) updateData.description_ar = input.descriptionAr;
  if (input.coverKey !== undefined) updateData.cover_key = input.coverKey;
  if (input.operatingCosts !== undefined) updateData.operating_costs = input.operatingCosts;
  if (input.annualBenefits !== undefined) updateData.annual_benefits = input.annualBenefits;
  if (input.totalShares !== undefined) updateData.total_shares = input.totalShares;
  if (input.sharePrice !== undefined) updateData.share_price = input.sharePrice;
  if (input.status !== undefined) updateData.status = input.status;

  const { data, error } = await adminClient
    .from('projects')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update project: ${error.message}`);
  }

  return mapProject(data);
}

export async function deleteProject(id: string): Promise<void> {
  const adminClient = requireSupabaseAdmin();
  const { error } = await adminClient
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete project: ${error.message}`);
  }
}

export async function createProjectImageUploadUrl(
  input: ProjectImagePresignInput
): Promise<{
  bucket: string;
  storageKey: string;
  uploadUrl: string;
  token: string | null;
  headers: Record<string, string>;
  path: string;
}> {
  const adminClient = requireSupabaseAdmin();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const sanitizedName = input.fileName
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const objectPath = `covers/${timestamp}-${sanitizedName}`;

  const { data, error } = await adminClient.storage
    .from(PROJECT_IMAGES_BUCKET)
    .createSignedUploadUrl(objectPath);

  if (error || !data) {
    throw new Error(
      `Failed to create signed upload url: ${error?.message ?? 'unknown error'}`
    );
  }

  return {
    bucket: PROJECT_IMAGES_BUCKET,
    storageKey: objectPath,
    uploadUrl: data.signedUrl,
    token: data.token ?? null,
    path: data.path ?? objectPath,
    headers: {
      'Content-Type': input.fileType,
      'x-upsert': 'false',
    },
  };
}

