export type NotificationType =
  | 'otp'
  | 'welcome'
  | 'activation'
  | 'coach_invitation'
  | 'forgot_password'
  | 'payment_reminder'
  | 'demo_booking'
  | 'demo_reminder'
  | 'demo_slot_hold'
  | 'demo_booking_confirmed'
  | 'demo_rescheduled'
  | 'demo_pick_slot'
  | 'coach_demo_booked'
  | 'tournament_result'
  | 'tournament_missed'
  | 'demo_cancellation'
  | 'coach_cancellation'
  | 'session_balance_low'
  | 'general';

export type NotificationChannel = 'email' | 'whatsapp' | 'in_app' | 'web_push' | 'sms';

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  status: 'unread' | 'read';
  read_at: string | null;
  action_url: string | null;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export type NotificationsPage = {
  notifications: AppNotification[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

export type ListNotificationsQuery = {
  page?: number;
  /** Max 100. */
  limit?: number;
  unread_only?: boolean;
};

export type NotificationPreference = {
  id?: string;
  channel: NotificationChannel;
  notification_type: NotificationType;
  enabled: boolean;
};
