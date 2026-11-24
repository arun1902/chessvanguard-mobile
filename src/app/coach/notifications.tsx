import { CoachPage } from '@/components/coach/coach-page';
import { NotificationsList } from '@/components/notifications/notifications-list';
import { DEMO_COACH_NOTIFICATIONS } from '@/constants/coach';

export default function CoachNotificationsScreen() {
  return (
    <CoachPage
      title="Notifications"
      subtitle="All updates about demos, students, and your coaching sessions.">
      <NotificationsList items={DEMO_COACH_NOTIFICATIONS} />
    </CoachPage>
  );
}
