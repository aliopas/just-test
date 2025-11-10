import { z } from 'zod';

export const NOTIFICATION_CHANNELS = ['email', 'sms', 'in_app'] as const;
export const NOTIFICATION_TYPES = [
  'request_submitted',
  'request_pending_info',
  'request_approved',
  'request_rejected',
  'request_settling',
  'request_completed',
] as const;

export const notificationChannelEnum = z.enum(NOTIFICATION_CHANNELS);
export const notificationTypeEnum = z.enum(NOTIFICATION_TYPES);

export const notificationPayloadSchema = z
  .record(z.string(), z.unknown())
  .default(() => ({}) as Record<string, unknown>);

export const notificationPreferenceSchema = z.object({
  channel: notificationChannelEnum,
  type: notificationTypeEnum,
  enabled: z.boolean(),
});

export const notificationPreferenceUpdateSchema =
  notificationPreferenceSchema.partial({
    enabled: true,
  });

export const notificationStatusFilterEnum = z.enum(['all', 'unread', 'read']);

export const notificationListQuerySchema = z.object({
  page: z.coerce
    .number()
    .int('Page must be an integer')
    .min(1, 'Page must be at least 1')
    .default(1),
  limit: z.coerce
    .number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(50, 'Limit cannot exceed 50')
    .default(20),
  status: notificationStatusFilterEnum.default('all'),
});

export const notificationPreferenceListSchema = z
  .array(notificationPreferenceSchema)
  .min(1, 'At least one preference entry is required');

export type NotificationChannel = z.infer<typeof notificationChannelEnum>;
export type NotificationType = z.infer<typeof notificationTypeEnum>;
export type NotificationPreferenceInput = z.infer<
  typeof notificationPreferenceSchema
>;
export type NotificationPreferenceUpdateInput = z.infer<
  typeof notificationPreferenceUpdateSchema
>;
export type NotificationListQueryInput = z.infer<
  typeof notificationListQuerySchema
>;
export type NotificationStatusFilter = z.infer<
  typeof notificationStatusFilterEnum
>;
export type NotificationPreferenceListInput = z.infer<
  typeof notificationPreferenceListSchema
>;
