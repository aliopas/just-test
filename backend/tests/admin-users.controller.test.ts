import { adminUserController } from '../src/controllers/admin-user.controller';
import { adminUserService } from '../src/services/admin-user.service';
import type { AuthenticatedRequest } from '../src/middleware/auth.middleware';

jest.mock('../src/services/admin-user.service', () => ({
  adminUserService: {
    listUsers: jest.fn(),
    updateUserStatus: jest.fn(),
    resetPassword: jest.fn(),
    createUser: jest.fn(),
  },
}));

type MockResponse = {
  status: jest.Mock;
  json: jest.Mock;
  statusCode?: number;
  body?: unknown;
};

const createMockResponse = (): MockResponse => {
  const res: Partial<MockResponse> = {};
  res.status = jest.fn().mockImplementation(code => {
    res.statusCode = code;
    return res;
  });
  res.json = jest.fn().mockImplementation(payload => {
    res.body = payload;
    return res;
  });
  return res as MockResponse;
};

const mockedService = adminUserService as jest.Mocked<typeof adminUserService>;

describe('adminUserController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listUsers', () => {
    it('returns paginated users', async () => {
      mockedService.listUsers.mockResolvedValueOnce({
        users: [],
        meta: { page: 1, limit: 25, total: 0, pageCount: 0, hasNext: false },
      });

      const req = {
        query: { page: '1', limit: '25' },
      } as unknown as AuthenticatedRequest;
      const res = createMockResponse();

      await adminUserController.listUsers(req, res as never);

      expect(mockedService.listUsers).toHaveBeenCalledWith({
        page: 1,
        limit: 25,
        sortBy: undefined,
        order: undefined,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.body).toHaveProperty('users');
      expect(res.body).toHaveProperty('meta');
    });

    it('returns 400 when query is invalid', async () => {
      const req = {
        query: { page: '0' },
      } as unknown as AuthenticatedRequest;
      const res = createMockResponse();

      await adminUserController.listUsers(req, res as never);

      expect(mockedService.listUsers).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      const body = res.body as any;
      expect(body?.error?.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('updateStatus', () => {
    it('updates user status', async () => {
      mockedService.updateUserStatus.mockResolvedValueOnce({
        id: 'user-1',
        email: 'user@example.com',
        status: 'suspended',
      } as any);

      const req = {
        params: { id: 'user-1' },
        body: { status: 'suspended' },
        user: { id: 'admin-1', email: 'admin@example.com' },
        ip: '127.0.0.1',
        headers: { 'user-agent': 'jest' },
      } as unknown as AuthenticatedRequest;
      const res = createMockResponse();

      await adminUserController.updateStatus(req, res as never);

      expect(mockedService.updateUserStatus).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          status: 'suspended',
          actorId: 'admin-1',
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      const body = res.body as any;
      expect(body?.message).toBe('User status updated successfully');
    });

    it('returns 401 when actor missing', async () => {
      const req = {
        params: { id: 'user-1' },
        body: { status: 'active' },
      } as unknown as AuthenticatedRequest;
      const res = createMockResponse();

      await adminUserController.updateStatus(req, res as never);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('resetPassword', () => {
    it('triggers password reset email', async () => {
      mockedService.resetPassword.mockResolvedValueOnce({
        email: 'user@example.com',
        resetLink: 'https://example.com/reset',
      });

      const req = {
        params: { id: 'user-1' },
        user: { id: 'admin-1', email: 'admin@example.com' },
        ip: '127.0.0.1',
        headers: { 'user-agent': 'jest' },
      } as unknown as AuthenticatedRequest;
      const res = createMockResponse();

      await adminUserController.resetPassword(req, res as never);

      expect(mockedService.resetPassword).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          actorId: 'admin-1',
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      const body = res.body as any;
      expect(body?.message).toBe('Password reset link generated');
    });
  });

  describe('createUser', () => {
    it('creates user and returns payload', async () => {
      mockedService.createUser.mockResolvedValueOnce({
        id: 'user-1',
        email: 'new@example.com',
      } as any);

      const req = {
        body: {
          email: 'new@example.com',
          role: 'investor',
          status: 'pending',
          sendInvite: true,
        },
        user: { id: 'admin-1', email: 'admin@example.com' },
        ip: '127.0.0.1',
        headers: { 'user-agent': 'jest' },
      } as unknown as AuthenticatedRequest;
      const res = createMockResponse();

      await adminUserController.createUser(req, res as never);

      expect(mockedService.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'new@example.com',
          role: 'investor',
          actorId: 'admin-1',
        })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      const body = res.body as any;
      expect(body?.user).toHaveProperty('email', 'new@example.com');
    });

    it('returns 400 when validation fails', async () => {
      const req = {
        body: {
          email: 'new@example.com',
          sendInvite: false,
        },
        user: { id: 'admin-1', email: 'admin@example.com' },
      } as unknown as AuthenticatedRequest;
      const res = createMockResponse();

      await adminUserController.createUser(req, res as never);

      expect(mockedService.createUser).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});

