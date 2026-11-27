import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { SymbolView } from 'expo-symbols';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Brand } from '@/constants/brand';
import { api, type ClassItem } from '@/services/api';
import { parseTimeTo24h } from '@/utils/time';

const FIVE_MINUTES_MS = 5 * 60 * 1000;
const POLL_INTERVAL_MS = 4000;

type Phase = 'waiting-window' | 'waiting-coach' | 'ready';

type JoinClassModalProps = {
  visible: boolean;
  item: ClassItem | null;
  onClose: () => void;
};

function resolveTime24h(time: string): string {
  const from12 = parseTimeTo24h(time);
  if (from12) return from12;
  const match = time.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return '00:00';
  return `${String(Number(match[1])).padStart(2, '0')}:${match[2]}`;
}

function classStartMs(scheduledDate: string, time: string): number {
  return new Date(`${scheduledDate}T${resolveTime24h(time)}:00`).getTime();
}

export function JoinClassModal({ visible, item, onClose }: JoinClassModalProps) {
  const [phase, setPhase] = useState<Phase>('waiting-window');
  const [meetingLink, setMeetingLink] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(Date.now());

  const startAt = useMemo(
    () => (item ? classStartMs(item.scheduledDate, item.time) : 0),
    [item],
  );
  const joinOpensAt = startAt - FIVE_MINUTES_MS;

  useEffect(() => {
    if (!visible || !item) {
      setPhase('waiting-window');
      setMeetingLink(null);
      setJoining(false);
      setCopied(false);
      return;
    }

    let cancelled = false;
    let pollTimer: ReturnType<typeof setInterval> | null = null;

    const stopPoll = () => {
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
    };

    const poll = async () => {
      try {
        const bookingId = item.enrollmentId || item.id;
        const status = await api.meetings.getStatus(bookingId, item.scheduledDate);
        if (cancelled) return;
        const link = status.joinUrl || status.googleMeetLink || null;
        if (status.isStarted && link) {
          setMeetingLink(link);
          setPhase('ready');
          stopPoll();
        } else {
          setPhase('waiting-coach');
        }
      } catch {
        if (!cancelled) setPhase('waiting-coach');
      }
    };

    const startCoachWait = () => {
      setPhase('waiting-coach');
      void poll();
      pollTimer = setInterval(() => void poll(), POLL_INTERVAL_MS);
    };

    const tick = () => {
      const current = Date.now();
      setNow(current);
      if (startAt - current <= FIVE_MINUTES_MS) {
        clearInterval(clock);
        if (!pollTimer && !cancelled) startCoachWait();
      } else {
        setPhase('waiting-window');
      }
    };

    const clock = setInterval(tick, 1000);
    tick();
    if (startAt - Date.now() <= FIVE_MINUTES_MS) {
      clearInterval(clock);
      startCoachWait();
    }

    return () => {
      cancelled = true;
      clearInterval(clock);
      stopPoll();
    };
  }, [visible, item, startAt]);

  const openLink = async (link: string) => {
    try {
      await Linking.openURL(link);
    } catch {
      // Keep modal open for copy fallback.
    }
  };

  const handleJoin = async () => {
    if (!item || !meetingLink || joining) return;
    setJoining(true);
    try {
      const bookingId = item.enrollmentId || item.id;
      await api.meetings.markJoined(bookingId, item.scheduledDate).catch(() => undefined);
      await openLink(meetingLink);
    } finally {
      setJoining(false);
    }
  };

  const handleCopy = async () => {
    if (!meetingLink) return;
    try {
      await Clipboard.setStringAsync(meetingLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const msUntilOpen = Math.max(0, joinOpensAt - now);
  const minutesLeft = Math.ceil(msUntilOpen / 60_000);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Join Class</Text>
            <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close">
              <SymbolView
                name={{ ios: 'xmark', android: 'close', web: 'close' }}
                size={18}
                tintColor={Brand.muted}
              />
            </Pressable>
          </View>

          <View style={styles.body}>
            {phase === 'waiting-window' ? (
              <View style={styles.centerBlock}>
                <View style={[styles.statusCircle, styles.statusMuted]}>
                  <SymbolView
                    name={{ ios: 'clock.fill', android: 'schedule', web: 'schedule' }}
                    size={22}
                    tintColor={Brand.subtitle}
                  />
                </View>
                <Text style={styles.statusText}>
                  You can join starting 5 minutes before class.
                </Text>
                {minutesLeft > 0 ? (
                  <Text style={styles.hint}>Opens in about {minutesLeft} min</Text>
                ) : null}
              </View>
            ) : null}

            {phase === 'waiting-coach' ? (
              <View style={styles.centerBlock}>
                <View style={[styles.statusCircle, styles.statusMuted]}>
                  <ActivityIndicator color={Brand.gold} />
                </View>
                <Text style={styles.statusText}>Waiting for your coach to start the class.</Text>
                <Text style={styles.hint}>{"You'll be let in automatically when it begins."}</Text>
              </View>
            ) : null}

            {phase === 'ready' ? (
              <View style={styles.centerBlock}>
                <View style={[styles.statusCircle, styles.statusReady]}>
                  <SymbolView
                    name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }}
                    size={28}
                    tintColor="#16A34A"
                  />
                </View>
                <Text style={styles.statusText}>Your coach has started the class.</Text>

                <Pressable
                  onPress={() => void handleJoin()}
                  disabled={!meetingLink || joining}
                  style={({ pressed }) => [
                    styles.joinBtn,
                    (!meetingLink || joining) && styles.joinDisabled,
                    pressed && meetingLink ? styles.pressed : null,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Join Class">
                  {joining ? (
                    <ActivityIndicator color={Brand.navy} />
                  ) : (
                    <>
                      <Text style={styles.joinText}>Join Class</Text>
                      <Text style={styles.joinArrow}>→</Text>
                    </>
                  )}
                </Pressable>

                {meetingLink ? (
                  <View style={styles.fallbackBox}>
                    <Text style={styles.fallbackHint}>
                      {"If the button doesn't work, please copy and paste this link into your browser, or click it directly."}
                    </Text>

                    <View style={styles.linkRow}>
                      <Pressable
                        onPress={() => void openLink(meetingLink)}
                        style={styles.linkBox}
                        accessibilityRole="link">
                        <Text style={styles.linkText} numberOfLines={3}>
                          {meetingLink}
                        </Text>
                        <SymbolView
                          name={{
                            ios: 'arrow.up.right.square',
                            android: 'open_in_new',
                            web: 'open_in_new',
                          }}
                          size={14}
                          tintColor="#2563EB"
                        />
                      </Pressable>

                      <Pressable
                        onPress={() => void handleCopy()}
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

                    <Text style={styles.fallbackFooter}>
                      {"If clicking the link doesn't work, copy and paste it into the same window."}
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : null}
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
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Brand.border,
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
  title: {
    color: Brand.navy,
    fontSize: 16,
    fontWeight: '800',
  },
  body: {
    paddingHorizontal: 18,
    paddingVertical: 20,
  },
  centerBlock: {
    alignItems: 'center',
    gap: 12,
  },
  statusCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusMuted: {
    backgroundColor: Brand.inputBackground,
  },
  statusReady: {
    backgroundColor: '#F0FDF4',
  },
  statusText: {
    color: Brand.subtitle,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  hint: {
    color: Brand.muted,
    fontSize: 12,
    textAlign: 'center',
  },
  joinBtn: {
    marginTop: 4,
    minHeight: 46,
    minWidth: 160,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: Brand.white,
    borderWidth: 1.5,
    borderColor: Brand.navy,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  joinDisabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.88,
  },
  joinText: {
    color: Brand.navy,
    fontSize: 15,
    fontWeight: '800',
  },
  joinArrow: {
    color: Brand.navy,
    fontSize: 16,
    fontWeight: '700',
  },
  fallbackBox: {
    width: '100%',
    marginTop: 4,
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 14,
    backgroundColor: Brand.inputBackground,
    padding: 12,
    gap: 10,
  },
  fallbackHint: {
    color: Brand.subtitle,
    fontSize: 12,
    lineHeight: 17,
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
  fallbackFooter: {
    color: Brand.muted,
    fontSize: 11,
    lineHeight: 15,
  },
});
