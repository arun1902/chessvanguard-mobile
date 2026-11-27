import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { CancelClassModal } from '@/components/classes/cancel-class-modal';
import { StartClassButton } from '@/components/classes/start-class-button';
import { useToast } from '@/components/ui/app-toast';
import { Brand } from '@/constants/brand';
import {
  COACH_CANCEL_CUTOFF_HOURS,
  coachCancelSuccessMessage,
} from '@/constants/coach-cancellation';
import { useAuth } from '@/features/auth/session';
import { api, ApiError, type ClassItem } from '@/services/api';
import type { InternalCancelCode } from '@/services/api/types/coaches';

type CoachUpcomingActionsProps = {
  item: ClassItem;
  onChanged?: () => void | Promise<void>;
};

type CancelPreview = {
  classSessionId?: string;
  title: string;
  message: string;
  isLateCancel: boolean;
};

export function CoachUpcomingActions({ item, onChanged }: CoachUpcomingActionsProps) {
  const { user } = useAuth();
  const { showError, showSuccess } = useToast();
  const [previewLoading, setPreviewLoading] = useState(false);
  const [preview, setPreview] = useState<CancelPreview | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openCancelPreview = async () => {
    if (!user?.id || previewLoading) return;
    setPreviewLoading(true);
    setError(null);
    try {
      const response = await api.coaches.cancelClass(user.id, {
        ...(item.classSessionId ? { classSessionId: item.classSessionId } : {}),
        timingId: item.timingId,
        scheduledDate: item.scheduledDate,
        cutoffHours: COACH_CANCEL_CUTOFF_HOURS,
        confirm: false,
      });

      const result = response as {
        confirmRequired?: boolean;
        classSessionId?: string;
        isLateCancel?: boolean;
        title?: string;
        message?: string;
      };

      if (!result.confirmRequired) {
        showError('Unable to start cancellation. Please try again.');
        return;
      }

      setPreview({
        classSessionId: result.classSessionId || item.classSessionId,
        title: result.title || 'Cancel This Class?',
        message: result.message || 'Do you want to cancel this class?',
        isLateCancel: Boolean(result.isLateCancel),
      });
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Failed to validate cancellation.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const confirmCancel = async (reasonCode: InternalCancelCode) => {
    if (!user?.id || !preview || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await api.coaches.cancelClass(user.id, {
        ...(preview.classSessionId ? { classSessionId: preview.classSessionId } : {}),
        timingId: item.timingId,
        scheduledDate: item.scheduledDate,
        cutoffHours: COACH_CANCEL_CUTOFF_HOURS,
        confirm: true,
        internalCancelCode: reasonCode,
        reasonCode,
      });

      const result = response as { confirmRequired?: boolean; isLateCancel?: boolean };
      if (result.confirmRequired) {
        setError('Cancellation confirmation is still pending.');
        return;
      }

      showSuccess(coachCancelSuccessMessage(Boolean(result.isLateCancel ?? preview.isLateCancel)));
      setPreview(null);
      await onChanged?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to cancel class.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <View style={styles.actions}>
        <StartClassButton item={item} compact />
        <Pressable
          onPress={() => void openCancelPreview()}
          disabled={previewLoading}
          style={({ pressed }) => [
            styles.cancelAction,
            pressed ? styles.pressed : null,
            previewLoading ? styles.disabled : null,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Cancel class">
          {previewLoading ? (
            <ActivityIndicator color={Brand.navy} />
          ) : (
            <Text style={styles.cancelActionText}>Cancel</Text>
          )}
        </Pressable>
      </View>

      <CancelClassModal
        visible={Boolean(preview)}
        title={preview?.title || 'Cancel This Class?'}
        message={preview?.message || 'Do you want to cancel this class?'}
        submitting={submitting}
        error={error}
        onClose={() => {
          if (submitting) return;
          setPreview(null);
          setError(null);
        }}
        onConfirm={(reasonCode) => void confirmCancel(reasonCode)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelAction: {
    flex: 1,
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Brand.gold,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.white,
    paddingHorizontal: 12,
  },
  cancelActionText: {
    color: Brand.navy,
    fontSize: 14,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.55,
  },
});
