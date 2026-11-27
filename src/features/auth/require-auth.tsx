import { Redirect } from 'expo-router';
import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAuth, getHomeHrefForRole } from '@/features/auth/session';
import type { UserRole } from '@/features/auth/types';
import { Brand } from '@/constants/brand';

type RequireAuthProps = {
  children: ReactNode;
  allowedRoles: UserRole[];
};

export function RequireAuth({ children, allowedRoles }: RequireAuthProps) {
  const { isLoading, isAuthenticated, user } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Brand.gold} />
      </View>
    );
  }

  if (!isAuthenticated || !user) {
    return <Redirect href="/" />;
  }

  if (!allowedRoles.includes(user.role)) {
    const home = getHomeHrefForRole(user.role);
    if (home) return <Redirect href={home} />;
    return <Redirect href="/" />;
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.page,
  },
});
