import * as Linking from 'expo-linking';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { ClassStartedModal } from '@/components/classes/class-started-modal';
import { useToast } from '@/components/ui/app-toast';
import { Brand } from '@/constants/brand';
import { api, ApiError, type ClassItem } from '@/services/api';
import { parseTimeTo24h } from '@/utils/time';

const FIVE_MINUTES_MS = 5 * 60 * 1000;

type StartClassButtonProps = {
  item: ClassItem;
  fallbackMeetLink?: string | null;
  compact?: boolean;
};

function resolveTime24h(time: string): string {
  const from12 = parseTimeTo24h(time);
  if (from12) return from12;
  const match = time.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return '00:00';
  return `${String(Number(match[1])).padStart(2, '0')}:${match[2]}`;
}

function classStartMs(scheduledDate: string, time: string): number {
  const hhmm = resolveTime24h(time);
  return new Date(`${scheduledDate}T${hhmm}:00`).getTime();
}

export function StartClassButton({ item, fallbackMeetLink, compact }: StartClassButtonProps) {
  const { showError } = useToast();
  const [started, setStarted] = useState(Boolean(item.isStarted));
  const [loading, setLoading] = useState(false);
  const [meetLink, setMeetLink] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [now, setNow] = useState(Date.now());

  // Meetings APIs expect StudentCoachTiming.id (= enrollmentId), not the slot timingId.
  const bookingId = item.enrollmentId || item.id;

  const startAt = useMemo(
    () => classStartMs(item.scheduledDate, item.time),
    [item.scheduledDate, item.time],
  );
  const withinWindow = now >= startAt - FIVE_MINUTES_MS;
  const displayLink = meetLink || fallbackMeetLink?.trim() || null;

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!bookingId || !withinWindow) return;
    let cancelled = false;
    (async () => {
      try {
        const status = await api.meetings.getStatus(bookingId, item.scheduledDate);
        if (cancelled) return;
        if (status.isStarted) {
          setStarted(true);
          if (status.joinUrl) setMeetLink(status.joinUrl);
          else if (status.googleMeetLink) setMeetLink(status.googleMeetLink);
        }
      } catch {
        // Coach can still tap Start.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bookingId, item.scheduledDate, withinWindow]);

  const openMeet = useCallback(async (link?: string | null) => {
    const url = link || displayLink;
    if (!url) {
      showError('Google Meet link is not configured yet. Contact admin.');
      return false;
    }
    try {
      await Linking.openURL(url);
      return true;
    } catch {
      return false;
    }
  }, [displayLink, showError]);

  const handleStart = useCallback(async () => {
    if (!withinWindow || loading || !bookingId) return;
    setLoading(true);
    try {
      const result = await api.meetings.start(bookingId, item.scheduledDate);
      setStarted(true);
      const link = result.joinUrl || null;
      if (link) setMeetLink(link);
      await openMeet(link || fallbackMeetLink);
      setModalOpen(true);
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Failed to start class.');
    } finally {
      setLoading(false);
    }
  }, [
    bookingId,
    fallbackMeetLink,
    item.scheduledDate,
    loading,
    openMeet,
    showError,
    withinWindow,
  ]);

  const onPress = () => {
    if (started) {
      void openMeet().then(() => setModalOpen(true));
      return;
    }
    void handleStart();
  };

  const label = loading ? 'Starting…' : started ? 'Class Started' : 'Start Class';
  const disabled = !withinWindow || loading;

  return (
    <>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.button,
          compact ? styles.buttonCompact : null,
          started ? styles.buttonOutline : styles.buttonSolid,
          disabled ? styles.buttonDisabled : null,
          pressed && !disabled ? styles.buttonPressed : null,
        ]}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        accessibilityLabel={label}>
        {loading ? (
          <ActivityIndicator color={started ? Brand.navy : Brand.white} />
        ) : (
          <Text style={[styles.label, started ? styles.labelOutline : styles.labelSolid]}>
            {label}
          </Text>
        )}
      </Pressable>

      <ClassStartedModal
        visible={modalOpen}
        meetLink={displayLink}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  buttonCompact: {
    flex: 1,
  },
  buttonSolid: {
    backgroundColor: Brand.gold,
  },
  buttonOutline: {
    backgroundColor: Brand.white,
    borderWidth: 1.5,
    borderColor: Brand.gold,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
  },
  labelSolid: {
    color: Brand.white,
  },
  labelOutline: {
    color: Brand.navy,
  },
});
