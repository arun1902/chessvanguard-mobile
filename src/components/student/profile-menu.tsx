import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand } from '@/constants/brand';
import { useAuth } from '@/features/auth/session';
import { initialsFromName } from '@/utils/format';

type StudentProfileMenuProps = {
  visible: boolean;
  onClose: () => void;
};

export function StudentProfileMenu({ visible, onClose }: StudentProfileMenuProps) {
  const { user, logout } = useAuth();
  const displayName = user?.name?.trim() || 'Student';
  const initials = initialsFromName(displayName, 'S');

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" />
        <SafeAreaView style={styles.sheet} edges={['bottom']}>
          <View style={styles.handle} />

          <View style={styles.identity}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.identityCopy}>
              <Text style={styles.name}>{displayName}</Text>
              <Text style={styles.role}>Student</Text>
            </View>
          </View>

          <Pressable
            onPress={() => {
              onClose();
              router.push('/profile');
            }}
            style={styles.row}
            accessibilityRole="button"
            accessibilityLabel="My Profile">
            <View style={styles.rowIcon}>
              <SymbolView
                name={{ ios: 'person', android: 'person', web: 'person' }}
                size={18}
                tintColor={Brand.navy}
              />
            </View>
            <Text style={styles.rowText}>My Profile</Text>
            <SymbolView
              name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
              size={16}
              tintColor={Brand.muted}
            />
          </Pressable>

          <Pressable
            onPress={async () => {
              onClose();
              await logout();
              router.replace('/');
            }}
            style={[styles.row, styles.logoutRow]}
            accessibilityRole="button"
            accessibilityLabel="Log out">
            <View style={[styles.rowIcon, styles.logoutIcon]}>
              <SymbolView
                name={{
                  ios: 'rectangle.portrait.and.arrow.right',
                  android: 'logout',
                  web: 'logout',
                }}
                size={18}
                tintColor={Brand.error}
              />
            </View>
            <Text style={styles.logoutText}>Log out</Text>
          </Pressable>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  sheet: {
    backgroundColor: Brand.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 4,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: Brand.border,
    marginTop: 10,
    marginBottom: 12,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 14,
    marginBottom: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Brand.border,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Brand.navySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Brand.white,
    fontSize: 16,
    fontWeight: '800',
  },
  identityCopy: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: Brand.navy,
    fontSize: 17,
    fontWeight: '800',
  },
  role: {
    color: Brand.subtitle,
    fontSize: 13,
  },
  row: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Brand.inputBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutIcon: {
    backgroundColor: '#FEF2F2',
  },
  rowText: {
    flex: 1,
    color: Brand.navy,
    fontSize: 15,
    fontWeight: '600',
  },
  logoutRow: {
    marginBottom: 4,
  },
  logoutText: {
    flex: 1,
    color: Brand.error,
    fontSize: 15,
    fontWeight: '700',
  },
});
