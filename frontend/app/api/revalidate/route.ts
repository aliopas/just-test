import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

/**
 * API route for manual revalidation
 * Usage: POST /api/revalidate?path=/news&tag=news
 * Requires secret token for security
 */
export async function POST(request: NextRequest) {
  try {
    // Check for secret token
    const secret = request.headers.get('x-revalidate-secret');
    if (secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json(
        { message: 'Invalid secret' },
        { status: 401 }
      );
    }

    const { path, tag } = await request.json();

    if (path) {
      revalidatePath(path);
    }

    // Note: revalidateTag API changed in Next.js 16
    // Using revalidatePath with layout type for tag-based revalidation
    if (tag) {
      revalidatePath(tag, 'layout');
    }

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      path: path || null,
      tag: tag || null,
    });
  } catch (err) {
    return NextResponse.json(
      { message: 'Error revalidating', error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

