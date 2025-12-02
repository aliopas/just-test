'use server';

import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * Server Actions for common operations
 * These run on the server and can be called from client components
 */

export async function revalidateNews() {
  revalidatePath('/news');
  revalidateTag('news');
  return { success: true };
}

export async function revalidateProjects() {
  revalidatePath('/projects');
  revalidateTag('projects');
  return { success: true };
}

export async function revalidateDashboard() {
  revalidatePath('/dashboard');
  revalidateTag('dashboard');
  return { success: true };
}

export async function revalidateProfile() {
  revalidatePath('/profile');
  revalidateTag('profile');
  return { success: true };
}

export async function revalidateRequests() {
  revalidatePath('/requests');
  revalidateTag('requests');
  return { success: true };
}

/**
 * Generic revalidation function
 */
export async function revalidate(path: string, tag?: string) {
  revalidatePath(path);
  if (tag) {
    revalidateTag(tag);
  }
  return { success: true };
}

