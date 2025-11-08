import {
  transitionRequestStatus,
  canTransition,
  getAllowedTransitions,
} from '../src/services/request-state.service';
import { requireSupabaseAdmin } from '../src/lib/supabase';

jest.mock('../src/lib/supabase', () => ({
  requireSupabaseAdmin: jest.fn(),
}));

describe('request-state.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('transition helpers', () => {
    it('returns allowed transitions', () => {
      const transitions = getAllowedTransitions('submitted');
      expect(transitions).toContain('screening');
      expect(transitions).not.toContain('draft');
    });

    it('validates allowed transitions', () => {
      expect(canTransition('draft', 'submitted')).toBe(true);
      expect(canTransition('draft', 'approved')).toBe(false);
    });
  });

  describe('transitionRequestStatus', () => {
    it('transitions status and logs event', async () => {
      let updatePayload: unknown;
      let insertPayload: any;

      (requireSupabaseAdmin as jest.Mock).mockReturnValue({
        from: (table: string) => {
          if (table === 'requests') {
            return {
              select: () => ({
                eq: () => ({
                  single: () =>
                    Promise.resolve({
                      data: {
                        id: 'req-1',
                        status: 'draft',
                        user_id: 'user-1',
                      },
                      error: null,
                    }),
                }),
              }),
              update: (payload: any) => {
                updatePayload = payload;
                return {
                  eq: () => Promise.resolve({ data: null, error: null }),
                };
              },
            };
          }

          if (table === 'request_events') {
            return {
              insert: (payload: any) => {
                insertPayload = payload;
                return {
                  select: () => ({
                    single: () =>
                      Promise.resolve({
                        data: { id: 'event-1', ...payload },
                        error: null,
                      }),
                  }),
                };
              },
            };
          }

          return {};
        },
      });

      const result = await transitionRequestStatus({
        requestId: 'req-1',
        actorId: 'admin-1',
        toStatus: 'submitted',
      });

      expect(result.request.status).toBe('submitted');
      expect(result.event.to_status).toBe('submitted');
      expect(updatePayload).toMatchObject({ status: 'submitted' });
      expect(insertPayload).toMatchObject({
        request_id: 'req-1',
        from_status: 'draft',
        to_status: 'submitted',
        actor_id: 'admin-1',
      });
    });

    it('throws on invalid transition', async () => {
      (requireSupabaseAdmin as jest.Mock).mockReturnValue({
        from: (table: string) => {
          if (table === 'requests') {
            return {
              select: () => ({
                eq: () => ({
                  single: () =>
                    Promise.resolve({
                      data: {
                        id: 'req-1',
                        status: 'draft',
                        user_id: 'user-1',
                      },
                      error: null,
                    }),
                }),
              }),
            };
          }
          return {};
        },
      });

      await expect(
        transitionRequestStatus({
          requestId: 'req-1',
          actorId: 'admin-1',
          toStatus: 'approved',
        })
      ).rejects.toThrow(
        'Transition from "draft" to "approved" is not permitted'
      );
    });
  });
});

