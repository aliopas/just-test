import { enqueueEmailNotification } from '../src/services/email-dispatch.service';
import { requireSupabaseAdmin } from '../src/lib/supabase';

jest.mock('../src/lib/supabase', () => ({
  requireSupabaseAdmin: jest.fn(),
}));

describe('enqueueEmailNotification', () => {
  const mockRequireSupabaseAdmin = requireSupabaseAdmin as jest.Mock;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('queues job and invokes edge function', async () => {
    const singleMock = jest.fn().mockResolvedValue({
      data: { id: 'job-1', attempts: 0 },
      error: null,
    });

    const selectMock = jest.fn().mockReturnValue({
      single: singleMock,
    });

    const insertMock = jest.fn().mockReturnValue({
      select: selectMock,
    });

    const eqMock = jest.fn();
    const updateMock = jest.fn().mockReturnValue({
      eq: eqMock,
    });

    const invokeMock = jest.fn().mockResolvedValue({
      data: null,
      error: null,
    });

    mockRequireSupabaseAdmin.mockReturnValue({
      from: jest.fn().mockReturnValue({
        insert: insertMock,
        update: updateMock,
      }),
      functions: {
        invoke: invokeMock,
      },
    });

    const result = await enqueueEmailNotification({
      userId: 'user-123',
      templateId: 'request_submitted',
      language: 'en',
      recipientEmail: 'user@example.com',
      context: {
        userName: 'User Example',
        requestNumber: 'INV-123',
        requestLink: 'https://app.example.com/requests/INV-123',
        supportEmail: 'support@example.com',
        submittedAt: '2025-11-09T00:00:00Z',
      },
    });

    expect(result.jobId).toBe('job-1');
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-123',
        template_id: 'request_submitted',
      })
    );
    expect(invokeMock).toHaveBeenCalledWith('notification-dispatch', {
      body: { jobId: 'job-1' },
    });
    expect(updateMock).not.toHaveBeenCalled();
  });

  it('throws when insert fails', async () => {
    const singleMock = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'insert failed' },
    });

    const selectMock = jest.fn().mockReturnValue({
      single: singleMock,
    });

    const insertMock = jest.fn().mockReturnValue({
      select: selectMock,
    });

    mockRequireSupabaseAdmin.mockReturnValue({
      from: jest.fn().mockReturnValue({
        insert: insertMock,
        update: jest.fn(),
      }),
      functions: {
        invoke: jest.fn(),
      },
    });

    await expect(
      enqueueEmailNotification({
        userId: 'user-123',
        templateId: 'request_submitted',
        language: 'en',
        recipientEmail: 'user@example.com',
        context: {
          userName: 'User Example',
          requestNumber: 'INV-123',
          requestLink: 'https://app.example.com/requests/INV-123',
          supportEmail: 'support@example.com',
          submittedAt: '2025-11-09T00:00:00Z',
        },
      })
    ).rejects.toThrow('Failed to queue email notification');
  });

  it('updates job with error when invocation fails', async () => {
    const singleMock = jest.fn().mockResolvedValue({
      data: { id: 'job-2', attempts: 0 },
      error: null,
    });

    const selectMock = jest.fn().mockReturnValue({
      single: singleMock,
    });

    const insertMock = jest.fn().mockReturnValue({
      select: selectMock,
    });

    const eqMock = jest.fn().mockResolvedValue({ error: null });
    const updateMock = jest.fn().mockReturnValue({
      eq: eqMock,
    });

    const invokeMock = jest.fn().mockRejectedValue(new Error('network error'));

    mockRequireSupabaseAdmin.mockReturnValue({
      from: jest.fn().mockReturnValue({
        insert: insertMock,
        update: updateMock,
      }),
      functions: {
        invoke: invokeMock,
      },
    });

    await expect(
      enqueueEmailNotification({
        userId: 'user-456',
        templateId: 'request_submitted',
        language: 'en',
        recipientEmail: 'user@example.com',
        context: {
          userName: 'User Example',
          requestNumber: 'INV-456',
          requestLink: 'https://app.example.com/requests/INV-456',
          supportEmail: 'support@example.com',
          submittedAt: '2025-11-09T00:00:00Z',
        },
      })
    ).rejects.toThrow('Failed to invoke notification dispatcher');

    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        last_error: 'network error',
      })
    );
    expect(eqMock).toHaveBeenCalledWith('id', 'job-2');
  });
});

