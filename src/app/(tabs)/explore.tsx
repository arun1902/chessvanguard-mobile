import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand } from '@/constants/brand';
import { DEMO_STUDENT } from '@/constants/dashboard';
import { STUDENT_NAV_ITEMS } from '@/constants/student-nav';
import { BottomTabInset } from '@/constants/theme';

const SECTIONS = [
  { key: 'journey', title: 'My Chess Journey' },
  { key: 'treasury', title: 'My Treasury' },
  { key: 'account', title: 'Account' },
] as const;

export default function MoreScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View>
          <Text style={styles.title}>More</Text>
          <Text style={styles.subtitle}>
            Signed in as {DEMO_STUDENT.name}. Jump to any ChessVanguard student destination.
          </Text>
        </View>

        {SECTIONS.map((section) => {
          const items = STUDENT_NAV_ITEMS.filter((item) => item.section === section.key);
          return (
            <View key={section.key} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.list}>
                {items.map((item) => (
                  <Pressable
                    key={item.href}
                    onPress={() => router.push(item.href)}
                    style={({ pressed }) => [styles.row, pressed ? styles.rowPressed : null]}
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
                        tintColor={Brand.navySoft}
                      />
                    </View>
                    <View style={styles.rowCopy}>
                      <Text style={styles.rowTitle}>{item.title}</Text>
                      <Text style={styles.rowDescription}>{item.description}</Text>
                    </View>
                    <SymbolView
                      name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
                      size={14}
                      tintColor={Brand.muted}
                    />
                  </Pressable>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Brand.page,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: (BottomTabInset ?? 0) + 28,
    gap: 18,
  },
  title: {
    color: Brand.navy,
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: Brand.subtitle,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    color: Brand.muted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  list: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Brand.border,
    backgroundColor: Brand.white,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Brand.border,
  },
  rowPressed: {
    backgroundColor: Brand.inputBackground,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Brand.inputBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowCopy: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    color: Brand.navy,
    fontSize: 15,
    fontWeight: '700',
  },
  rowDescription: {
    color: Brand.subtitle,
    fontSize: 12,
  },
});
