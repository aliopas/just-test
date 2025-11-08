import { Request, Response } from 'express';
import type { Session } from '@supabase/supabase-js';
import type { CookieOptions } from 'express-serve-static-core';

export const ACCESS_TOKEN_COOKIE = 'sb-access-token';
export const REFRESH_TOKEN_COOKIE = 'sb-refresh-token';

const isProduction = process.env.NODE_ENV === 'production';

const baseCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: (isProduction ? 'none' : 'lax') as CookieOptions['sameSite'],
  path: '/',
};

export function setAuthCookies(res: Response, session: Session): void {
  const expiresIn = session.expires_in ?? 3600;

  res.cookie(ACCESS_TOKEN_COOKIE, session.access_token, {
    ...baseCookieOptions,
    maxAge: expiresIn * 1000,
  });

  if (session.refresh_token) {
    const refreshMaxAgeSeconds = 60 * 60 * 24 * 30; // 30 days
    res.cookie(REFRESH_TOKEN_COOKIE, session.refresh_token, {
      ...baseCookieOptions,
      maxAge: refreshMaxAgeSeconds * 1000,
    });
  }
}

export function clearAuthCookies(res: Response): void {
  const clearOptions = {
    ...baseCookieOptions,
    maxAge: 0,
  };

  res.clearCookie(ACCESS_TOKEN_COOKIE, clearOptions);
  res.clearCookie(REFRESH_TOKEN_COOKIE, clearOptions);
}

export function getAccessToken(req: Request): string | undefined {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  const cookieToken = req.cookies?.[ACCESS_TOKEN_COOKIE];
  if (cookieToken) {
    return cookieToken;
  }

  return undefined;
}

export function getRefreshToken(req: Request): string | undefined {
  const bodyRefresh = (req.body as { refresh_token?: string })?.refresh_token;
  if (bodyRefresh) {
    return bodyRefresh;
  }

  const cookieRefresh = req.cookies?.[REFRESH_TOKEN_COOKIE];
  if (cookieRefresh) {
    return cookieRefresh;
  }

  return undefined;
}

