import {
  listUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadNotificationCount,
  getNotificationPreferences,
  updateNotificationPreferences,
} from '../src/services/notification.service';
import { requireSupabaseAdmin } from '../src/lib/supabase';

jest.mock('../src/lib/supabase', () => ({
  requireSupabaseAdmin: jest.fn(),
}));

const mockRequireSupabaseAdmin = requireSupabaseAdmin as jest.Mock;

describe('notification.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function createQueryBuilder() {
    const builder: Record<string, jest.Mock> = {
      select: jest.fn(),
      eq: jest.fn(),
      is: jest.fn(),
      not: jest.fn(),
      order: jest.fn(),
      range: jest.fn(),
    };

    builder.select.mockReturnValue(builder);
    builder.eq.mockReturnValue(builder);
    builder.is.mockReturnValue(builder);
    builder.not.mockReturnValue(builder);
    builder.order.mockReturnValue(builder);

    return builder;
  }

  it('lists notifications with pagination metadata', async () => {
    const builder = createQueryBuilder();
    builder.range.mockResolvedValue({
      data: [
        {
          id: 'notif-1',
          user_id: 'user-1',
          type: 'request_submitted',
          channel: 'email',
          payload: { requestId: 'req-1' },
          read_at: null,
          created_at: '2025-11-09T10:00:00Z',
        },
      ],
      error: null,
      count: 1,
    });

    const fromMock = jest.fn().mockReturnValue(builder);
    mockRequireSupabaseAdmin.mockReturnValue({
      from: fromMock,
    });

    const result = await listUserNotifications({
      userId: 'user-1',
      page: 1,
      limit: 20,
      status: 'all',
    });

    expect(fromMock).toHaveBeenCalledWith('notifications');
    expect(builder.eq).toHaveBeenCalledWith('user_id', 'user-1');
    expect(builder.order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(builder.range).toHaveBeenCalledWith(0, 19);

    expect(result.notifications).toHaveLength(1);
    expect(result.notifications[0]).toEqual(
      expect.objectContaining({
        id: 'notif-1',
        type: 'request_submitted',
        channel: 'email',
        readAt: null,
        stateRead: false,
      })
    );
    expect(result.meta.total).toBe(1);
    expect(result.meta.hasNext).toBe(false);
  });

  it('applies unread filter when requested', async () => {
    const builder = createQueryBuilder();
    builder.range.mockResolvedValue({
      data: [],
      error: null,
      count: 0,
    });

    mockRequireSupabaseAdmin.mockReturnValue({
      from: jest.fn().mockReturnValue(builder),
    });

    await listUserNotifications({
      userId: 'user-1',
      page: 2,
      limit: 10,
      status: 'unread',
    });

    expect(builder.is).toHaveBeenCalledWith('read_at', null);
    expect(builder.range).toHaveBeenCalledWith(10, 19);
  });

  it('throws when fetching notifications fails', async () => {
    const builder = createQueryBuilder();
    builder.range.mockResolvedValue({
      data: null,
      count: null,
      error: { message: 'db down' },
    });
    mockRequireSupabaseAdmin.mockReturnValue({
      from: jest.fn().mockReturnValue(builder),
    });

    await expect(
      listUserNotifications({
        userId: 'user-1',
        page: 1,
        limit: 10,
        status: 'all',
      })
    ).rejects.toThrow('Failed to fetch notifications');
  });

  it('marks a notification as read', async () => {
    const updateMock = jest.fn().mockReturnThis();
    const eqMock = jest.fn().mockReturnThis();
    const selectMock = jest.fn().mockReturnThis();
    const maybeSingleMock = jest.fn().mockResolvedValue({
      data: {
        id: 'notif-1',
        read_at: '2025-11-09T12:30:00Z',
      },
      error: null,
    });

    const notificationsTable = {
      update: updateMock,
      eq: eqMock,
      select: selectMock,
      maybeSingle: maybeSingleMock,
    };

    updateMock.mockReturnValue(notificationsTable);
    eqMock.mockReturnValue(notificationsTable);
    selectMock.mockReturnValue(notificationsTable);

    mockRequireSupabaseAdmin.mockReturnValue({
      from: jest.fn().mockImplementation(table => {
        if (table === 'notifications') {
          return notificationsTable;
        }
        throw new Error(`Unexpected table ${table}`);
      }),
    });

    const result = await markNotificationRead({
      userId: 'user-1',
      notificationId: 'notif-1',
    });

    expect(updateMock).toHaveBeenCalled();
    expect(eqMock).toHaveBeenNthCalledWith(1, 'id', 'notif-1');
    expect(eqMock).toHaveBeenNthCalledWith(2, 'user_id', 'user-1');
    expect(result.updated).toBe(true);
    expect(result.readAt).toBe('2025-11-09T12:30:00Z');
  });

  it('marks all notifications as read', async () => {
    const updateMock = jest.fn().mockReturnThis();
    const eqMock = jest.fn().mockReturnThis();
    const isMock = jest.fn().mockReturnThis();
    const selectMock = jest.fn().mockResolvedValue({
      data: [{ id: 'notif-1' }, { id: 'notif-2' }],
      error: null,
    });

    const notificationsTable = {
      update: updateMock,
      eq: eqMock,
      is: isMock,
      select: selectMock,
    };

    updateMock.mockReturnValue(notificationsTable);
    eqMock.mockReturnValue(notificationsTable);
    isMock.mockReturnValue(notificationsTable);

    mockRequireSupabaseAdmin.mockReturnValue({
      from: jest.fn().mockImplementation(table => {
        if (table === 'notifications') {
          return notificationsTable;
        }
        throw new Error(`Unexpected table ${table}`);
      }),
    });

    const result = await markAllNotificationsRead('user-1');
    expect(updateMock).toHaveBeenCalled();
    expect(eqMock).toHaveBeenCalledWith('user_id', 'user-1');
    expect(isMock).toHaveBeenCalledWith('read_at', null);
    expect(result.updated).toBe(2);
  });

  it('counts unread notifications', async () => {
    const isMock = jest.fn().mockResolvedValue({
      count: 3,
      error: null,
    });

    const eqMock = jest.fn().mockReturnValue({
      is: isMock,
    });

    const selectMock = jest.fn().mockReturnValue({
      eq: eqMock,
    });

    mockRequireSupabaseAdmin.mockReturnValue({
      from: jest.fn().mockReturnValue({
        select: selectMock,
      }),
    });

    const unread = await getUnreadNotificationCount('user-1');
    expect(unread).toBe(3);
    expect(isMock).toHaveBeenCalledWith('read_at', null);
  });

  it('returns default notification preferences when none stored', async () => {
    const eqMock = jest.fn().mockResolvedValue({
      data: [],
      error: null,
    });

    const selectMock = jest.fn().mockReturnValue({
      eq: eqMock,
    });

    mockRequireSupabaseAdmin.mockReturnValue({
      from: jest.fn().mockImplementation(table => {
        if (table === 'notification_preferences') {
          return {
            select: selectMock,
          };
        }
        throw new Error(`Unexpected table ${table}`);
      }),
    });

    const preferences = await getNotificationPreferences('user-1');
    expect(selectMock).toHaveBeenCalled();
    expect(preferences.length).toBeGreaterThan(0);
    expect(preferences.every(pref => pref.enabled === true)).toBe(true);
  });

  it('merges stored preferences with defaults', async () => {
    const eqMock = jest.fn().mockResolvedValue({
      data: [
        {
          type: 'request_submitted',
          channel: 'email',
          enabled: false,
        },
      ],
      error: null,
    });

    const selectMock = jest.fn().mockReturnValue({
      eq: eqMock,
    });

    mockRequireSupabaseAdmin.mockReturnValue({
      from: jest.fn().mockImplementation(table => {
        if (table === 'notification_preferences') {
          return {
            select: selectMock,
          };
        }
        throw new Error(`Unexpected table ${table}`);
      }),
    });

    const preferences = await getNotificationPreferences('user-1');
    expect(preferences).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'request_submitted',
          channel: 'email',
          enabled: false,
        }),
        expect.objectContaining({
          type: 'request_submitted',
          channel: 'in_app',
        }),
      ])
    );
  });

  it('updates notification preferences and returns latest state', async () => {
    const deleteEqMock = jest.fn().mockResolvedValue({ error: null });
    const deleteMock = jest.fn().mockReturnValue({
      eq: deleteEqMock,
    });

    const insertMock = jest.fn().mockResolvedValue({ error: null });

    const selectEqMock = jest.fn().mockResolvedValue({
      data: [
        {
          type: 'request_submitted',
          channel: 'email',
          enabled: false,
        },
        {
          type: 'request_submitted',
          channel: 'in_app',
          enabled: true,
        },
      ],
      error: null,
    });

    const selectMock = jest.fn().mockReturnValue({
      eq: selectEqMock,
    });

    const fromMock = jest.fn().mockImplementation(table => {
      if (table === 'notification_preferences') {
        return {
          delete: deleteMock,
          insert: insertMock,
          select: selectMock,
        };
      }
      throw new Error(`Unexpected table ${table}`);
    });

    mockRequireSupabaseAdmin.mockReturnValue({
      from: fromMock,
    });

    const result = await updateNotificationPreferences({
      userId: 'user-1',
      preferences: [
        { type: 'request_submitted', channel: 'email', enabled: false },
        { type: 'request_submitted', channel: 'in_app', enabled: true },
      ],
    });

    expect(deleteMock).toHaveBeenCalled();
    expect(insertMock).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          user_id: 'user-1',
          type: 'request_submitted',
          channel: 'email',
          enabled: false,
        }),
      ])
    );
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'request_submitted',
          channel: 'email',
          enabled: false,
        }),
        expect.objectContaining({
          type: 'request_submitted',
          channel: 'in_app',
          enabled: true,
        }),
      ])
    );
  });
});

