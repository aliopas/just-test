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
  .default(() => ({} as Record<string, unknown>));

export const notificationPreferenceSchema = z.object({
  channel: notificationChannelEnum,
  type: notificationTypeEnum,
  enabled: z.boolean(),
});

export const notificationPreferenceUpdateSchema =
  notificationPreferenceSchema.partial({
    enabled: true,
  });

export type NotificationChannel = z.infer<typeof notificationChannelEnum>;
export type NotificationType = z.infer<typeof notificationTypeEnum>;
export type NotificationPreferenceInput = z.infer<
  typeof notificationPreferenceSchema
>;
export type NotificationPreferenceUpdateInput = z.infer<
  typeof notificationPreferenceUpdateSchema
>;
