import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Brand } from '@/constants/brand';

type ClassStartedModalProps = {
  visible: boolean;
  meetLink: string | null;
  onClose: () => void;
};

export function ClassStartedModal({ visible, meetLink, onClose }: ClassStartedModalProps) {
  const [copied, setCopied] = useState(false);

  const openLink = async () => {
    if (!meetLink) return;
    try {
      await Linking.openURL(meetLink);
    } catch {
      // Keep modal open so coach can copy manually.
    }
  };

  const copyLink = async () => {
    if (!meetLink) return;
    try {
      await Clipboard.setStringAsync(meetLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <SymbolView
                  name={{ ios: 'video.fill', android: 'videocam', web: 'videocam' }}
                  size={18}
                  tintColor="#15803D"
                />
              </View>
              <Text style={styles.title}>Class started!</Text>
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Close">
              <SymbolView
                name={{ ios: 'xmark', android: 'close', web: 'close' }}
                size={18}
                tintColor={Brand.muted}
              />
            </Pressable>
          </View>

          <View style={styles.body}>
            {meetLink ? (
              <View style={styles.linkRow}>
                <Pressable
                  onPress={() => void openLink()}
                  style={styles.linkBox}
                  accessibilityRole="link"
                  accessibilityLabel="Open meeting link">
                  <Text style={styles.linkText} numberOfLines={3}>
                    {meetLink}
                  </Text>
                  <SymbolView
                    name={{ ios: 'arrow.up.right.square', android: 'open_in_new', web: 'open_in_new' }}
                    size={14}
                    tintColor="#2563EB"
                    style={styles.externalIcon}
                  />
                </Pressable>

                <Pressable
                  onPress={() => void copyLink()}
                  style={styles.copyBtn}
                  accessibilityRole="button"
                  accessibilityLabel={copied ? 'Copied' : 'Copy link'}>
                  <SymbolView
                    name={{
                      ios: copied ? 'checkmark' : 'doc.on.doc',
                      android: copied ? 'check' : 'content_copy',
                      web: copied ? 'check' : 'content_copy',
                    }}
                    size={14}
                    tintColor={Brand.gold}
                  />
                  <Text style={styles.copyText}>{copied ? 'Copied' : 'Copy'}</Text>
                </Pressable>
              </View>
            ) : (
              <Text style={styles.helper}>
                Meeting link is not available yet. Ask admin to configure Google Meet.
              </Text>
            )}

            <Text style={styles.helper}>
              {"If clicking the link doesn't work, copy and paste it into a new browser tab."}
            </Text>

            <Pressable
              onPress={() => void openLink()}
              disabled={!meetLink}
              style={({ pressed }) => [
                styles.retryBtn,
                !meetLink ? styles.retryDisabled : null,
                pressed && meetLink ? styles.retryPressed : null,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Try opening again">
              <Text style={styles.retryText}>Try opening again</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 18,
    backgroundColor: 'rgba(7, 30, 49, 0.45)',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    backgroundColor: Brand.white,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Brand.border,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Brand.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: Brand.navy,
    fontSize: 17,
    fontWeight: '800',
  },
  body: {
    margin: 14,
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 14,
    backgroundColor: Brand.inputBackground,
    padding: 12,
    gap: 12,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 8,
  },
  linkBox: {
    flex: 1,
    backgroundColor: Brand.white,
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 6,
  },
  linkText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
    lineHeight: 17,
  },
  externalIcon: {
    alignSelf: 'flex-start',
  },
  copyBtn: {
    minWidth: 72,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Brand.gold,
    backgroundColor: Brand.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    gap: 4,
  },
  copyText: {
    color: Brand.gold,
    fontSize: 12,
    fontWeight: '800',
  },
  helper: {
    color: Brand.subtitle,
    fontSize: 11,
    lineHeight: 16,
  },
  retryBtn: {
    minHeight: 42,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: Brand.gold,
    backgroundColor: Brand.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryPressed: {
    opacity: 0.88,
  },
  retryDisabled: {
    opacity: 0.45,
  },
  retryText: {
    color: Brand.gold,
    fontSize: 14,
    fontWeight: '800',
  },
});
