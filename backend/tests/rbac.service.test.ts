import { rbacService } from '../src/services/rbac.service';
import { requireSupabaseAdmin } from '../src/lib/supabase';

jest.mock('../src/lib/supabase', () => ({
  requireSupabaseAdmin: jest.fn(),
}));

type SupabaseQueryResult = {
  data: unknown;
  error: { message: string } | null;
};

type QueryHandlers = {
  [table: string]: () => SupabaseQueryResult;
};

const handlers: QueryHandlers = {};

const mockClient = {
  from: jest.fn((table: string) => {
    const select = jest.fn(() => {
      const eq = jest.fn(async () => {
        const handler = handlers[table];
        if (!handler) {
          return {
            data: null,
            error: { message: `Unhandled table: ${table}` },
          };
        }
        return handler();
      });
      return { eq };
    });
    return { select };
  }),
};

const mockRequireSupabaseAdmin = requireSupabaseAdmin as jest.Mock;

describe('rbacService', () => {
  beforeAll(() => {
    mockRequireSupabaseAdmin.mockReturnValue(mockClient);
  });

  beforeEach(() => {
    handlers['user_roles'] = () => ({
      data: [],
      error: null,
    });
    handlers['v_user_permissions'] = () => ({
      data: [],
      error: null,
    });
    mockClient.from.mockClear();
    rbacService.clearCache();
  });

  describe('permissions', () => {
    it('returns true when user has required permission', async () => {
      handlers['user_roles'] = () => ({
        data: [{ roles: [{ slug: 'investor' }] }],
        error: null,
      });
      handlers['v_user_permissions'] = () => ({
        data: [
          {
            role_slug: 'investor',
            permission_slug: 'investor.profile.read',
            grant_type: 'allow',
          },
        ],
        error: null,
      });

      const result = await rbacService.hasPermission(
        'user-1',
        'investor.profile.read'
      );

      expect(result).toBe(true);
    });

    it('returns false when permission is explicitly denied', async () => {
      handlers['user_roles'] = () => ({
        data: [{ roles: [{ slug: 'investor' }] }],
        error: null,
      });
      handlers['v_user_permissions'] = () => ({
        data: [
          {
            role_slug: 'investor',
            permission_slug: 'investor.profile.read',
            grant_type: 'deny',
          },
          {
            role_slug: 'investor',
            permission_slug: 'investor.profile.read',
            grant_type: 'allow',
          },
        ],
        error: null,
      });

      const result = await rbacService.hasPermission(
        'user-2',
        'investor.profile.read'
      );

      expect(result).toBe(false);
    });

    it('uses in-memory cache for repeated checks', async () => {
      handlers['user_roles'] = () => ({
        data: [{ roles: [{ slug: 'admin' }] }],
        error: null,
      });
      handlers['v_user_permissions'] = () => ({
        data: [
          {
            role_slug: 'admin',
            permission_slug: 'admin.users.manage',
            grant_type: 'allow',
          },
        ],
        error: null,
      });

      const first = await rbacService.hasPermission(
        'user-3',
        'admin.users.manage'
      );
      expect(first).toBe(true);

      const fromCallsAfterFirst = mockClient.from.mock.calls.length;

      const second = await rbacService.hasPermission(
        'user-3',
        'admin.users.manage'
      );
      expect(second).toBe(true);

      expect(mockClient.from.mock.calls.length).toBe(fromCallsAfterFirst);
    });
  });

  describe('roles', () => {
    it('returns true when user has required role', async () => {
      handlers['user_roles'] = () => ({
        data: [
          { roles: [{ slug: 'investor' }] },
          { roles: [{ slug: 'admin' }] },
        ],
        error: null,
      });

      const result = await rbacService.hasRole('user-4', 'admin');

      expect(result).toBe(true);
    });

    it('returns false when user does not have role', async () => {
      handlers['user_roles'] = () => ({
        data: [{ roles: [{ slug: 'investor' }] }],
        error: null,
      });

      const result = await rbacService.hasRole('user-5', 'admin');

      expect(result).toBe(false);
    });
  });
});

