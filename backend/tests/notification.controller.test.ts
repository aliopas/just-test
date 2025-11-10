import type { Response } from 'express';
import { notificationController } from '../src/controllers/notification.controller';
import type { AuthenticatedRequest } from '../src/middleware/auth.middleware';
import {
  getUnreadNotificationCount,
  listUserNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  getNotificationPreferences,
  updateNotificationPreferences,
} from '../src/services/notification.service';

jest.mock('../src/services/notification.service', () => ({
  listUserNotifications: jest.fn(),
  getUnreadNotificationCount: jest.fn(),
  markNotificationRead: jest.fn(),
  markAllNotificationsRead: jest.fn(),
  getNotificationPreferences: jest.fn(),
  updateNotificationPreferences: jest.fn(),
}));

const listMock = listUserNotifications as jest.Mock;
const unreadCountMock = getUnreadNotificationCount as jest.Mock;
const markReadMock = markNotificationRead as jest.Mock;
const markAllMock = markAllNotificationsRead as jest.Mock;
const preferencesMock = getNotificationPreferences as jest.Mock;
const updatePreferencesMock = updateNotificationPreferences as jest.Mock;

const createMockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response & {
    status: jest.Mock;
    json: jest.Mock;
  };
};

describe('notificationController.list', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    const req = {
      query: {},
      user: undefined,
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await notificationController.list(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'UNAUTHORIZED' }),
      })
    );
  });

  it('returns 400 when query parameters invalid', async () => {
    const req = {
      query: { page: 0 },
      user: { id: 'user-1', email: 'user@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await notificationController.list(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(listMock).not.toHaveBeenCalled();
  });

  it('returns notifications and meta on success', async () => {
    listMock.mockResolvedValueOnce({
      notifications: [
        {
          id: 'notif-1',
          type: 'request_submitted',
          channel: 'email',
          payload: { requestId: 'req-1' },
          readAt: null,
          createdAt: '2025-11-09T10:00:00Z',
        },
      ],
      meta: {
        page: 1,
        limit: 20,
        total: 1,
        pageCount: 1,
        hasNext: false,
        hasPrevious: false,
      },
    });
    unreadCountMock.mockResolvedValueOnce(2);

    const req = {
      query: { page: '1', limit: '20' },
      user: { id: 'user-1', email: 'user@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await notificationController.list(req, res);

    expect(listMock).toHaveBeenCalledWith({
      userId: 'user-1',
      page: 1,
      limit: 20,
      status: 'all',
    });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      notifications: expect.arrayContaining([
        expect.objectContaining({ id: 'notif-1' }),
      ]),
      meta: expect.objectContaining({
        unreadCount: 2,
        total: 1,
      }),
    });
  });
});

describe('notificationController.markRead', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    const req = {
      params: { id: 'notif-1' },
      user: undefined,
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await notificationController.markRead(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 400 when notification id missing', async () => {
    const req = {
      params: {},
      user: { id: 'user-1', email: 'user@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await notificationController.markRead(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 404 when notification not found', async () => {
    markReadMock.mockResolvedValueOnce({ updated: false });

    const req = {
      params: { id: 'notif-x' },
      user: { id: 'user-1', email: 'user@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await notificationController.markRead(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns success payload when notification marked read', async () => {
    markReadMock.mockResolvedValueOnce({
      updated: true,
      readAt: '2025-11-09T13:00:00Z',
    });
    unreadCountMock.mockResolvedValueOnce(1);

    const req = {
      params: { id: 'notif-1' },
      user: { id: 'user-1', email: 'user@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await notificationController.markRead(req, res);

    expect(markReadMock).toHaveBeenCalledWith({
      userId: 'user-1',
      notificationId: 'notif-1',
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        notificationId: 'notif-1',
        readAt: '2025-11-09T13:00:00Z',
        meta: expect.objectContaining({ unreadCount: 1 }),
      })
    );
  });
});

describe('notificationController.preferences', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when user not authenticated', async () => {
    const req = {
      user: undefined,
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await notificationController.preferences(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns preferences list on success', async () => {
    preferencesMock.mockResolvedValueOnce([
      { type: 'request_submitted', channel: 'email', enabled: true },
    ]);

    const req = {
      user: { id: 'user-1', email: 'user@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await notificationController.preferences(req, res);

    expect(preferencesMock).toHaveBeenCalledWith('user-1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      preferences: [{ type: 'request_submitted', channel: 'email', enabled: true }],
    });
  });

  it('returns 401 when updating preferences without auth', async () => {
    const req = {
      user: undefined,
      body: [],
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await notificationController.updatePreferences(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 400 when preferences payload invalid', async () => {
    const req = {
      user: { id: 'user-1', email: 'user@example.com' },
      body: {},
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await notificationController.updatePreferences(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(updatePreferencesMock).not.toHaveBeenCalled();
  });

  it('updates preferences and returns latest state', async () => {
    updatePreferencesMock.mockResolvedValueOnce([
      { type: 'request_submitted', channel: 'email', enabled: false },
    ]);

    const req = {
      user: { id: 'user-1', email: 'user@example.com' },
      body: [{ type: 'request_submitted', channel: 'email', enabled: false }],
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await notificationController.updatePreferences(req, res);

    expect(updatePreferencesMock).toHaveBeenCalledWith({
      userId: 'user-1',
      preferences: [{ type: 'request_submitted', channel: 'email', enabled: false }],
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      preferences: [{ type: 'request_submitted', channel: 'email', enabled: false }],
    });
  });
});

describe('notificationController.markAllRead', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when user not authenticated', async () => {
    const req = {
      user: undefined,
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await notificationController.markAllRead(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns updated count on success', async () => {
    markAllMock.mockResolvedValueOnce({ updated: 5 });
    unreadCountMock.mockResolvedValueOnce(0);

    const req = {
      user: { id: 'user-1', email: 'user@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await notificationController.markAllRead(req, res);

    expect(markAllMock).toHaveBeenCalledWith('user-1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        updated: 5,
        meta: expect.objectContaining({ unreadCount: 0 }),
      })
    );
  });
});

