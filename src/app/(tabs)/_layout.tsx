import AppTabs from '@/components/app-tabs';
import { RequireAuth } from '@/features/auth/require-auth';

export default function TabsLayout() {
  return (
    <RequireAuth allowedRoles={['Student']}>
      <AppTabs />
    </RequireAuth>
  );
}
