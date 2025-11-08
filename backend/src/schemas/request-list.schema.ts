import { z } from 'zod';
import {
  REQUEST_STATUSES,
  type RequestStatus,
} from '../services/request-state.service';

const statusEnum = z.enum([...REQUEST_STATUSES] as [
  RequestStatus,
  ...RequestStatus[],
]);

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
});

export type RequestListQuery = z.infer<typeof requestListQuerySchema>;
