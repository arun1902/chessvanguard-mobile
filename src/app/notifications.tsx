import { NotificationsList } from '@/components/notifications/notifications-list';
import { StudentPage } from '@/components/student/student-page';
import { DEMO_STUDENT_NOTIFICATIONS } from '@/constants/dashboard';

export default function StudentNotificationsScreen() {
  return (
    <StudentPage
      title="Notifications"
      subtitle="All updates about demos, classes, and your ChessVanguard journey.">
      <NotificationsList items={DEMO_STUDENT_NOTIFICATIONS} />
    </StudentPage>
  );
}
