import { z } from 'zod';
import {
  REQUEST_STATUSES,
  type RequestStatus,
} from '../services/request-state.service';

const statusEnum = z.enum([...REQUEST_STATUSES] as [
  RequestStatus,
  ...RequestStatus[],
]);

const sortFields = ['created_at', 'amount', 'status'] as const;
const orderDirections = ['asc', 'desc'] as const;
const requestTypes = ['buy', 'sell', 'partnership', 'board_nomination', 'feedback'] as const;

const toNumber = (value: unknown) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const toString = (value: unknown) =>
  value === undefined || value === null ? undefined : String(value).trim();

const dateString = z
  .string()
  .min(1)
  .refine(value => !Number.isNaN(Date.parse(value)), {
    message: 'Invalid date or datetime string',
  });

export const adminRequestListQuerySchema = z.object({
  page: z
    .preprocess(
      value => (value === undefined ? undefined : Number(value)),
      z.number().int().min(1).max(999).optional()
    )
    .default(1),
  limit: z
    .preprocess(
      value => (value === undefined ? undefined : Number(value)),
      z.number().int().min(1).max(100).optional()
    )
    .default(25),
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
  minAmount: z
    .preprocess(toNumber, z.number().nonnegative().optional())
    .optional(),
  maxAmount: z
    .preprocess(toNumber, z.number().positive().optional())
    .optional(),
  createdFrom: z.preprocess(toString, dateString.optional()),
  createdTo: z.preprocess(toString, dateString.optional()),
  search: z.preprocess(toString, z.string().min(1).max(255).optional()),
  sortBy: z.enum(sortFields).optional().default('created_at'),
  order: z.enum(orderDirections).optional().default('desc'),
});

export type AdminRequestListQuery = z.infer<typeof adminRequestListQuerySchema>;
