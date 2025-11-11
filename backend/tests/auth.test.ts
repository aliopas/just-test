import request from 'supertest';
import app from '../src/app';
import { investorSignupRequestService } from '../src/services/investor-signup-request.service';

jest.mock('../src/services/investor-signup-request.service', () => ({
  investorSignupRequestService: {
    createRequest: jest.fn(),
  },
}));

describe('POST /api/v1/auth/register (signup requests)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should enqueue a new signup request', async () => {
    const email = `investor-request-${Date.now()}@example.com`;
    const mockCreate = investorSignupRequestService.createRequest as jest.Mock;
    mockCreate.mockResolvedValue({
      id: 'req-123',
      status: 'pending',
      created_at: new Date().toISOString(),
      payload: { language: 'en' },
    });

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

    expect(mockCreate).toHaveBeenCalledWith({
      fullName: 'Test Investor',
      email,
      phone: '+966512345678',
      company: 'Test Ventures',
      message: 'I would like to access the investor dashboard.',
      language: 'en',
    });
    expect(response.body).toHaveProperty('request');
    expect(response.body.request).toMatchObject({ id: 'req-123', status: 'pending' });
  });

  it('should reject invalid payloads', async () => {
    const mockCreate = investorSignupRequestService.createRequest as jest.Mock;

    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'invalid-email',
        fullName: '',
      })
      .expect(400);

    expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('should return 409 when a request already exists for the same email', async () => {
    const mockCreate = investorSignupRequestService.createRequest as jest.Mock;
    mockCreate.mockRejectedValue(
      Object.assign(new Error('REQUEST_ALREADY_PENDING'), { status: 409 })
    );

    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'First Submission',
        email: `duplicate-${Date.now()}@example.com`,
      })
      .expect(409);

    expect(response.body.error).toHaveProperty('code', 'REQUEST_ALREADY_PENDING');
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });
});

