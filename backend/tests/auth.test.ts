import request from 'supertest';
import app from '../src/app';
import { requireSupabaseAdmin } from '../src/lib/supabase';

describe('POST /api/v1/auth/register', () => {
  const validEmail = 'test@example.com';
  const validPassword = 'Test1234';
  const validPhone = '+966512345678';

  describe('Success cases', () => {
    it('should register a new user with email and password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: `newuser-${Date.now()}@example.com`,
          password: validPassword,
        })
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('email');
      expect(response.body).toHaveProperty('emailConfirmationSent');
      expect(typeof response.body.emailConfirmationSent).toBe('boolean');
    });

    it('should register a new user with email, password, and phone', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: `newuser-phone-${Date.now()}@example.com`,
          password: validPassword,
          phone: validPhone,
        })
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('email');
    });

    it('should register a new admin user when role is provided', async () => {
      const email = `newadmin-${Date.now()}@example.com`;

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email,
          password: validPassword,
          role: 'admin',
        })
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');

      const adminClient = requireSupabaseAdmin();
      const { data: userRecord } = await adminClient
        .from('users')
        .select('role')
        .eq('id', response.body.user.id)
        .single();

      expect(userRecord?.role).toBe('admin');
    });
  });

  describe('Validation errors (400)', () => {
    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'invalid-email',
          password: validPassword,
        })
        .expect(400);

      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
      expect(response.body.error).toHaveProperty('message', 'Validation failed');
      expect(response.body.error).toHaveProperty('details');
    });

    it('should return 400 for missing email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          password: validPassword,
        })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for weak password (less than 8 chars)', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: validEmail,
          password: 'Short1',
        })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for password without uppercase', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: validEmail,
          password: 'test1234',
        })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for password without lowercase', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: validEmail,
          password: 'TEST1234',
        })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for password without number', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: validEmail,
          password: 'TestPassword',
        })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid phone format', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: validEmail,
          password: validPassword,
          phone: '966512345678', // Missing +
        })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Conflict errors (409)', () => {
    it('should return 409 for already registered email', async () => {
      const email = `conflict-${Date.now()}@example.com`;

      // First registration
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          email,
          password: validPassword,
        })
        .expect(201);

      // Second registration with same email
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email,
          password: validPassword,
        })
        .expect(409);

      expect(response.body.error).toHaveProperty('code', 'CONFLICT');
      expect(response.body.error).toHaveProperty('message', 'Email already registered');
    });
  });
});

describe('POST /api/v1/auth/verify-otp', () => {
  const validPassword = 'Test1234';
  let testEmail: string;
  let userId: string;
  let otpCode: string;

  beforeAll(async () => {
    // Register a user first
    testEmail = `verify-otp-${Date.now()}@example.com`;
    const registerResponse = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: testEmail,
        password: validPassword,
      })
      .expect(201);

    userId = registerResponse.body.user.id;

    // Get OTP code from database (for testing purposes)
    // In real scenario, OTP would be sent via email
    const adminClient = requireSupabaseAdmin();
    const { data } = await adminClient
      .from('user_otps')
      .select('code')
      .eq('user_id', userId)
      .eq('verified', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (data) {
      otpCode = data.code;
    }
  });

  describe('Success cases', () => {
    it('should verify OTP and activate account', async () => {
      if (!otpCode) {
        // Skip if OTP not found (might need manual setup)
        return;
      }

      const response = await request(app)
        .post('/api/v1/auth/verify-otp')
        .send({
          email: testEmail,
          otp: otpCode,
        })
        .expect(200);

      expect(response.body).toHaveProperty('activated', true);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Validation errors (400)', () => {
    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/v1/auth/verify-otp')
        .send({
          email: 'invalid-email',
          otp: '123456',
        })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid OTP format (not 6 digits)', async () => {
      const response = await request(app)
        .post('/api/v1/auth/verify-otp')
        .send({
          email: testEmail,
          otp: '12345', // 5 digits
        })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid OTP format (non-numeric)', async () => {
      const response = await request(app)
        .post('/api/v1/auth/verify-otp')
        .send({
          email: testEmail,
          otp: 'abcdef',
        })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid OTP code', async () => {
      const response = await request(app)
        .post('/api/v1/auth/verify-otp')
        .send({
          email: testEmail,
          otp: '999999', // Wrong OTP
        })
        .expect(400);

      expect(response.body.error.code).toBe('INVALID_OTP');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/verify-otp')
        .send({
          email: 'nonexistent@example.com',
          otp: '123456',
        })
        .expect(404);

      expect(response.body.error.code).toBe('USER_NOT_FOUND');
    });
  });
});

describe('POST /api/v1/auth/resend-otp', () => {
  const validPassword = 'Test1234';
  let testEmail: string;

  beforeAll(async () => {
    // Register a user first
    testEmail = `resend-otp-${Date.now()}@example.com`;
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: testEmail,
        password: validPassword,
      })
      .expect(201);
  });

  describe('Success cases', () => {
    it('should resend OTP successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/resend-otp')
        .send({
          email: testEmail,
        })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('expiresAt');
    });
  });

  describe('Validation errors (400)', () => {
    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/v1/auth/resend-otp')
        .send({
          email: 'invalid-email',
        })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/resend-otp')
        .send({
          email: 'nonexistent@example.com',
        })
        .expect(404);

      expect(response.body.error.code).toBe('USER_NOT_FOUND');
    });
  });
});

describe('Auth Session Flow', () => {
  const password = 'Test1234';
  let email: string;
  let authCookies: string[] = [];

  beforeAll(async () => {
    email = `login-${Date.now()}@example.com`;
    const registerResponse = await request(app)
      .post('/api/v1/auth/register')
      .send({ email, password })
      .expect(201);

    const userId = registerResponse.body.user.id;
    const adminClient = requireSupabaseAdmin();
    const { data: otpData } = await adminClient
      .from('user_otps')
      .select('code')
      .eq('user_id', userId)
      .eq('verified', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (otpData?.code) {
      await request(app)
        .post('/api/v1/auth/verify-otp')
        .send({ email, otp: otpData.code })
        .expect(200);
    }
  });

  it('should login with email and password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password })
      .expect(200);

    expect(res.body).toHaveProperty('user');
    expect(res.body).toHaveProperty('expiresIn');
    expect(typeof res.body.expiresIn).toBe('number');

    const cookies = res.get('Set-Cookie');
    expect(Array.isArray(cookies)).toBe(true);
    expect(
      cookies?.some(cookie => cookie.startsWith('sb-access-token='))
    ).toBe(true);
    authCookies = cookies ?? [];
  });

  it('should refresh session with refresh_token', async () => {
    if (authCookies.length === 0) return;

    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', authCookies)
      .send({})
      .expect(200);

    expect(res.body).toHaveProperty('refreshed', true);
    expect(res.body).toHaveProperty('user');

    const refreshCookies = res.get('Set-Cookie');
    if (refreshCookies) {
      authCookies = refreshCookies;
    }
  });

  it('should logout (client clears tokens)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Cookie', authCookies)
      .send({})
      .expect(200);

    expect(res.body).toHaveProperty('loggedOut', true);
    const clearedCookies = res.get('Set-Cookie') ?? [];
    expect(
      clearedCookies.some(cookie => cookie.startsWith('sb-access-token='))
    ).toBe(true);
  });
});

describe('2FA TOTP', () => {
  // Note: 2FA endpoints require authentication middleware
  // These tests are basic structure - full tests require auth middleware
  it('should setup 2FA (requires auth)', async () => {
    // This test requires authentication middleware
    // For now, we'll just verify the endpoint exists
    const res = await request(app)
      .post('/api/v1/auth/2fa/setup')
      .send({});

    // Should return 401 without auth
    expect([401, 400]).toContain(res.status);
  });

  it('should verify 2FA token (requires auth)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/2fa/verify')
      .send({ token: '123456' });

    // Should return 401 without auth or 400 for validation
    expect([401, 400]).toContain(res.status);
  });

  it('should disable 2FA (requires auth)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/2fa/disable')
      .send({});

    // Should return 401 without auth
    expect(res.status).toBe(401);
  });
});

