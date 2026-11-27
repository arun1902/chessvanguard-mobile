import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CoachCard, CoachPage } from '@/components/coach/coach-page';
import { Brand } from '@/constants/brand';
import { COACH_NAV_ITEMS } from '@/constants/coach';
import { useAuth } from '@/features/auth/session';

export default function CoachMoreScreen() {
  const { user } = useAuth();
  const displayName = user?.name?.trim() || 'Coach';

  return (
    <CoachPage
      title="More"
      subtitle={`Signed in as ${displayName}. Jump to any coach destination.`}
      showBack={false}
      tabBar>
      <CoachCard style={styles.list}>
        {COACH_NAV_ITEMS.map((item, index) => (
          <Pressable
            key={item.href}
            onPress={() => router.push(item.href)}
            style={[styles.row, index < COACH_NAV_ITEMS.length - 1 ? styles.rowBorder : null]}
            accessibilityRole="button"
            accessibilityLabel={item.title}>
            <View style={styles.iconWrap}>
              <SymbolView
                name={
                  item.icon as {
                    ios: 'person.2.fill';
                    android: 'group';
                    web: 'group';
                  }
                }
                size={18}
                tintColor={Brand.navy}
              />
            </View>
            <View style={styles.copy}>
              <Text style={styles.rowTitle}>{item.title}</Text>
              <Text style={styles.rowDesc}>{item.description}</Text>
            </View>
            <SymbolView
              name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
              size={16}
              tintColor={Brand.muted}
            />
          </Pressable>
        ))}
      </CoachCard>
    </CoachPage>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingVertical: 4,
    paddingHorizontal: 0,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Brand.border,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Brand.inputBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    color: Brand.navy,
    fontSize: 15,
    fontWeight: '700',
  },
  rowDesc: {
    color: Brand.subtitle,
    fontSize: 12,
  },
});
