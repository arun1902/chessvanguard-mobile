import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ZohoCheckoutModal } from '@/components/payments/zoho-checkout-modal';
import { PrimaryButton, StudentCard, StudentPage } from '@/components/student/student-page';
import { useToast } from '@/components/ui/app-toast';
import { Brand } from '@/constants/brand';
import { useAuth } from '@/features/auth/session';
import { api, ApiError, type PricingPlan } from '@/services/api';
import { initialsFromName } from '@/utils/format';
import {
  formatAmountForZoho,
  isZohoConfigured,
  type ZohoCheckoutOptions,
} from '@/utils/zoho-payments';

export default function RefillScreen() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const displayName = user?.name?.trim() || 'Student';
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [lastSessionId, setLastSessionId] = useState<string | null>(null);
  const [checkoutOptions, setCheckoutOptions] = useState<ZohoCheckoutOptions | null>(null);

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedPlanId) ?? null,
    [plans, selectedPlanId],
  );

  const amountDue = selectedPlan
    ? selectedPlan.effective_discounted_price ?? selectedPlan.original_price
    : 0;

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await api.payments.reconcilePending().catch(() => undefined);
        const result = await api.pricingPlans.list();
        if (!active) return;
        const next = result.plans ?? [];
        setPlans(next);
        if (next.length > 0) setSelectedPlanId(next[0].id);
      } catch {
        if (active) setPlans([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const confirmRefillSession = useCallback(
    async (paymentsSessionId: string) => {
      setConfirming(true);
      try {
        const result = await api.payments.confirmRefill(paymentsSessionId);
        setLastSessionId(null);
        setCheckoutOptions(null);
        const credits = result.credits != null ? ` ${result.credits} sessions added.` : '';
        showSuccess(`Payment confirmed.${credits}`);
      } catch (error) {
        showError(
          error instanceof ApiError
            ? error.message
            : 'Payment received but confirmation failed. Use Retry Confirm.',
        );
      } finally {
        setConfirming(false);
        setPaying(false);
      }
    },
    [showError, showSuccess],
  );

  const handlePay = useCallback(async () => {
    if (!selectedPlan || paying || confirming) return;
    if (!isZohoConfigured()) {
      showError('Zoho Payments is not configured. Set EXPO_PUBLIC_ZOHO_ACCOUNT_ID in .env.');
      return;
    }

    setPaying(true);
    setLastSessionId(null);
    try {
      const session = await api.payments.createRefillSession({
        planId: selectedPlan.id,
        cvCoinsToRedeem: 0,
      });

      if (!session?.payments_session_id) {
        throw new Error('Payment session unavailable. Please try again.');
      }

      setLastSessionId(session.payments_session_id);

      if (session.amount > 0) {
        setCheckoutOptions({
          payments_session_id: session.payments_session_id,
          amount: formatAmountForZoho(session.amount),
          currency_code: 'INR',
          currency_symbol: '₹',
          description: `Session Refill - ${displayName}`.slice(0, 120),
          business: 'ChessVanguard',
          invoice_number: `REFILL${Date.now()}`.slice(0, 50),
          address: {
            name: displayName,
            email: user?.email || undefined,
          },
        });
        return;
      }

      await confirmRefillSession(session.payments_session_id);
    } catch (error) {
      setPaying(false);
      showError(error instanceof ApiError ? error.message : 'Unable to start payment.');
    }
  }, [
    confirming,
    confirmRefillSession,
    displayName,
    paying,
    selectedPlan,
    showError,
    user?.email,
  ]);

  return (
    <StudentPage
      title="Refill Sessions"
      subtitle="Top up session credits to keep learning without interruption."
      overlay={
        <>
          <ZohoCheckoutModal
            visible={Boolean(checkoutOptions)}
            title="Pay for sessions"
            options={checkoutOptions}
            onSuccess={() => {
              const sessionId = lastSessionId || checkoutOptions?.payments_session_id;
              setCheckoutOptions(null);
              if (!sessionId) {
                setPaying(false);
                showError('Missing payment session. Please try again.');
                return;
              }
              void confirmRefillSession(sessionId);
            }}
            onCancel={() => {
              setCheckoutOptions(null);
              setPaying(false);
              showError('Payment cancelled.');
            }}
            onError={(message) => {
              setCheckoutOptions(null);
              setPaying(false);
              showError(message);
            }}
          />
          {confirming ? (
            <View style={styles.confirmingOverlay} pointerEvents="auto">
              <ActivityIndicator color={Brand.gold} size="large" />
              <Text style={styles.confirmingText}>Confirming payment…</Text>
            </View>
          ) : null}
        </>
      }>
      <StudentCard style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Text style={styles.balanceHeaderText}>CURRENT BALANCE</Text>
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>ACTIVE</Text>
          </View>
        </View>
        <Text style={styles.sessions}>Sessions</Text>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initialsFromName(displayName, 'S')}</Text>
          </View>
          <View>
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profileEmail}>{user?.email || '—'}</Text>
          </View>
        </View>
      </StudentCard>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Brand.gold} />
        </View>
      ) : plans.length === 0 ? (
        <View style={styles.plansBox}>
          <Text style={styles.plansText}>
            No pricing plans are available right now. Please contact support.
          </Text>
        </View>
      ) : (
        <View style={styles.plansList}>
          {plans.map((plan) => {
            const price = plan.effective_discounted_price ?? plan.original_price;
            const selected = plan.id === selectedPlanId;
            return (
              <Pressable key={plan.id} onPress={() => setSelectedPlanId(plan.id)}>
                <StudentCard style={[styles.planCard, selected ? styles.planCardSelected : null]}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <Text style={styles.planMeta}>
                    {plan.sessions_included} sessions · ₹{price}
                  </Text>
                </StudentCard>
              </Pressable>
            );
          })}
        </View>
      )}

      <StudentCard style={styles.checkoutCard}>
        <Text style={styles.checkoutTitle}>CHECKOUT SUMMARY</Text>
        <View style={styles.checkoutRow}>
          <Text style={styles.checkoutLabel}>Package</Text>
          <Text style={styles.checkoutValue}>{selectedPlan?.name || '—'}</Text>
        </View>
        <View style={styles.checkoutRow}>
          <Text style={styles.checkoutLabel}>Total Classes</Text>
          <Text style={styles.checkoutAccent}>
            {selectedPlan ? `${selectedPlan.sessions_included} sessions` : 'Select a plan'}
          </Text>
        </View>
        <Text style={styles.amountDueLabel}>Amount Due</Text>
        <Text style={styles.amountDue}>₹{amountDue}</Text>
        <PrimaryButton
          label={paying || confirming ? 'Processing…' : 'Pay with Zoho'}
          disabled={!selectedPlan || paying || confirming || loading}
          onPress={() => void handlePay()}
        />
        {lastSessionId && !checkoutOptions && !confirming ? (
          <PrimaryButton
            label="Retry Confirm"
            tone="navy"
            onPress={() => void confirmRefillSession(lastSessionId)}
          />
        ) : null}
        <Text style={styles.secure}>SECURE PAYMENT VIA ZOHO GATEWAY</Text>
      </StudentCard>

      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>Important Notice</Text>
        <Text style={styles.noticeText}>
          • Session credits will be updated instantly in your dashboard upon confirmation
        </Text>
        <Text style={styles.noticeText}>
          • Do not close the payment window until the transaction is fully authorized
        </Text>
      </View>
    </StudentPage>
  );
}

const styles = StyleSheet.create({
  balanceCard: {
    padding: 0,
    overflow: 'hidden',
  },
  balanceHeader: {
    backgroundColor: Brand.gold,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceHeaderText: {
    color: Brand.white,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  activeBadge: {
    backgroundColor: Brand.white,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  activeBadgeText: {
    color: Brand.navy,
    fontSize: 10,
    fontWeight: '800',
  },
  sessions: {
    color: Brand.navy,
    fontSize: 28,
    fontWeight: '800',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Brand.navySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Brand.white,
    fontWeight: '700',
  },
  profileName: {
    color: Brand.navy,
    fontSize: 14,
    fontWeight: '700',
  },
  profileEmail: {
    color: Brand.subtitle,
    fontSize: 12,
  },
  center: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  plansBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Brand.border,
    borderRadius: 14,
    backgroundColor: Brand.white,
    padding: 16,
  },
  plansList: {
    gap: 10,
  },
  planCard: {
    gap: 4,
  },
  planCardSelected: {
    borderColor: Brand.gold,
    borderWidth: 2,
  },
  planName: {
    color: Brand.navy,
    fontSize: 15,
    fontWeight: '800',
  },
  planMeta: {
    color: Brand.subtitle,
    fontSize: 13,
  },
  plansText: {
    color: Brand.subtitle,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  checkoutCard: {
    gap: 10,
  },
  checkoutTitle: {
    color: Brand.navy,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  checkoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  checkoutLabel: {
    color: Brand.subtitle,
    fontSize: 13,
  },
  checkoutValue: {
    color: Brand.navy,
    fontSize: 13,
    fontWeight: '600',
  },
  checkoutAccent: {
    color: Brand.gold,
    fontSize: 13,
    fontWeight: '700',
  },
  amountDueLabel: {
    color: Brand.subtitle,
    fontSize: 12,
    marginTop: 4,
  },
  amountDue: {
    color: Brand.navy,
    fontSize: 32,
    fontWeight: '800',
  },
  secure: {
    color: Brand.muted,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  notice: {
    backgroundColor: Brand.navy,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  noticeTitle: {
    color: Brand.white,
    fontSize: 15,
    fontWeight: '800',
  },
  noticeText: {
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 19,
  },
  confirmingOverlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 50,
    backgroundColor: 'rgba(11, 31, 58, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  confirmingText: {
    color: Brand.white,
    fontSize: 15,
    fontWeight: '600',
  },
});
