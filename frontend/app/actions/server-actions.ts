'use server';

import { revalidatePath } from 'next/cache';

/**
 * Server Actions for common operations
 * These run on the server and can be called from client components
 */

export async function revalidateNews() {
  revalidatePath('/news', 'page');
  // revalidateTag is not needed when using revalidatePath with 'page' type
  return { success: true };
}

export async function revalidateProjects() {
  revalidatePath('/projects', 'page');
  return { success: true };
}

export async function revalidateDashboard() {
  revalidatePath('/dashboard', 'page');
  return { success: true };
}

export async function revalidateProfile() {
  revalidatePath('/profile', 'page');
  return { success: true };
}

export async function revalidateRequests() {
  revalidatePath('/requests', 'page');
  return { success: true };
}

/**
 * Generic revalidation function
 */
export async function revalidate(path: string, tag?: string) {
  revalidatePath(path, 'page');
  // Note: revalidateTag API changed in Next.js 16, using revalidatePath instead
  return { success: true };
}

