import { z } from 'zod';
import {
  REQUEST_STATUSES,
  type RequestStatus,
} from '../services/request-state.service';

const statusEnum = z.enum([...REQUEST_STATUSES] as [
  RequestStatus,
  ...RequestStatus[],
]);

const requestTypes = ['buy', 'sell', 'partnership', 'board_nomination', 'feedback'] as const;

export const requestListQuerySchema = z.object({
  page: z.preprocess(
    value => (value === undefined ? undefined : Number(value)),
    z.number().int().min(1).max(999).optional()
  ),
  limit: z.preprocess(
    value => (value === undefined ? undefined : Number(value)),
    z.number().int().min(1).max(100).optional()
  ),
  status: statusEnum.optional(),
  type: z.preprocess(
    value => {
      if (value === undefined || value === null || value === '') {
        return undefined;
      }
      // Support both single type and comma-separated types for multi-filter
      if (typeof value === 'string') {
        const types = value.split(',').map(t => t.trim()).filter(t => t.length > 0);
        return types.length > 0 ? types : undefined;
      }
      if (Array.isArray(value)) {
        return value.map(v => String(v).trim()).filter(v => v.length > 0);
      }
      return [String(value).trim()];
    },
    z
      .union([
        z.enum(requestTypes),
        z.array(z.enum(requestTypes)).min(1).max(5),
      ])
      .optional()
  ),
});

export type RequestListQuery = z.infer<typeof requestListQuerySchema>;
