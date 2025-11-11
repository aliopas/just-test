import request from 'supertest';
import app from '../src/app';
import { requireSupabaseAdmin } from '../src/lib/supabase';

const adminClient = requireSupabaseAdmin();

async function fetchSignupRequests(email: string) {
  const { data } = await adminClient
    .from('investor_signup_requests')
    .select('*')
    .eq('email', email.toLowerCase())
    .order('created_at', { ascending: false });

  return data ?? [];
}

describe('POST /api/v1/auth/register (signup requests)', () => {
  it('should enqueue a new signup request', async () => {
    const email = `investor-request-${Date.now()}@example.com`;

    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Test Investor',
        email,
        phone: '+966512345678',
        company: 'Test Ventures',
        message: 'I would like to access the investor dashboard.',
        language: 'en',
      })
      .expect(202);

    expect(response.body).toHaveProperty('request');
    expect(response.body.request).toHaveProperty('id');
    expect(response.body.request).toHaveProperty('status', 'pending');

    const requests = await fetchSignupRequests(email);
    expect(requests.length).toBeGreaterThan(0);
    expect(requests[0]?.status).toBe('pending');
  });

  it('should reject invalid payloads', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'invalid-email',
        fullName: '',
      })
      .expect(400);

    expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
  });

  it('should return 409 when a request already exists for the same email', async () => {
    const email = `duplicate-request-${Date.now()}@example.com`;
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'First Submission',
        email,
      })
      .expect(202);

    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Second Submission',
        email,
      })
      .expect(409);

    expect(response.body.error).toHaveProperty('code', 'REQUEST_ALREADY_PENDING');
  });
});

