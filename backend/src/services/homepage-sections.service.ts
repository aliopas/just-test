import { supabase } from '../lib/supabase';
import type {
  HomepageSectionCreateInput,
  HomepageSectionUpdateInput,
  HomepageSectionType,
} from '../schemas/homepage-sections.schema';

export type HomepageSection = {
  id: string;
  type: HomepageSectionType;
  titleAr: string;
  titleEn: string;
  contentAr: string;
  contentEn: string;
  iconSvg: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type HomepageSectionRow = {
  id: string;
  type: HomepageSectionType;
  title_ar: string;
  title_en: string;
  content_ar: string;
  content_en: string;
  icon_svg: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

function mapHomepageSectionRow(row: HomepageSectionRow): HomepageSection {
  return {
    id: row.id,
    type: row.type,
    titleAr: row.title_ar,
    titleEn: row.title_en,
    contentAr: row.content_ar,
    contentEn: row.content_en,
    iconSvg: row.icon_svg,
    displayOrder: row.display_order,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listHomepageSections(
  includeInactive = false
): Promise<HomepageSection[]> {
  let query = supabase
    .from('homepage_sections')
    .select('*')
    .order('display_order', { ascending: true });

  if (!includeInactive) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to list homepage sections: ${error.message}`);
  }

  return (data ?? []).map(mapHomepageSectionRow);
}

export async function getHomepageSectionById(
  id: string
): Promise<HomepageSection | null> {
  const { data, error } = await supabase
    .from('homepage_sections')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to get homepage section: ${error.message}`);
  }

  return data ? mapHomepageSectionRow(data) : null;
}

export async function getHomepageSectionByType(
  type: HomepageSectionType
): Promise<HomepageSection | null> {
  const { data, error } = await supabase
    .from('homepage_sections')
    .select('*')
    .eq('type', type)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to get homepage section: ${error.message}`);
  }

  return data ? mapHomepageSectionRow(data) : null;
}

export async function createHomepageSection(
  input: HomepageSectionCreateInput
): Promise<HomepageSection> {
  const { data, error } = await supabase
    .from('homepage_sections')
    .insert({
      type: input.type,
      title_ar: input.titleAr,
      title_en: input.titleEn,
      content_ar: input.contentAr,
      content_en: input.contentEn,
      icon_svg: input.iconSvg ?? null,
      display_order: input.displayOrder,
      is_active: input.isActive,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('HOMEPAGE_SECTION_TYPE_EXISTS');
    }
    throw new Error(`Failed to create homepage section: ${error.message}`);
  }

  if (!data) {
    throw new Error('Failed to create homepage section: no data returned');
  }

  return mapHomepageSectionRow(data);
}

export async function updateHomepageSection(
  id: string,
  input: HomepageSectionUpdateInput
): Promise<HomepageSection> {
  const updateData: Record<string, unknown> = {};

  if (input.type !== undefined) {
    updateData.type = input.type;
  }
  if (input.titleAr !== undefined) {
    updateData.title_ar = input.titleAr;
  }
  if (input.titleEn !== undefined) {
    updateData.title_en = input.titleEn;
  }
  if (input.contentAr !== undefined) {
    updateData.content_ar = input.contentAr;
  }
  if (input.contentEn !== undefined) {
    updateData.content_en = input.contentEn;
  }
  if (input.iconSvg !== undefined) {
    updateData.icon_svg = input.iconSvg;
  }
  if (input.displayOrder !== undefined) {
    updateData.display_order = input.displayOrder;
  }
  if (input.isActive !== undefined) {
    updateData.is_active = input.isActive;
  }

  const { data, error } = await supabase
    .from('homepage_sections')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('HOMEPAGE_SECTION_NOT_FOUND');
    }
    if (error.code === '23505') {
      throw new Error('HOMEPAGE_SECTION_TYPE_EXISTS');
    }
    throw new Error(`Failed to update homepage section: ${error.message}`);
  }

  if (!data) {
    throw new Error('Failed to update homepage section: no data returned');
  }

  return mapHomepageSectionRow(data);
}

export async function deleteHomepageSection(id: string): Promise<void> {
  const { error } = await supabase
    .from('homepage_sections')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete homepage section: ${error.message}`);
  }
}
