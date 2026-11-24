import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton, StudentCard, StudentPage } from '@/components/student/student-page';
import { Brand } from '@/constants/brand';
import { DEMO_STUDENT } from '@/constants/dashboard';

export default function RefillScreen() {
  return (
    <StudentPage title="Refill Sessions" subtitle="Top up session credits to keep learning without interruption.">
      <StudentCard style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Text style={styles.balanceHeaderText}>CURRENT BALANCE</Text>
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>ACTIVE</Text>
          </View>
        </View>
        <Text style={styles.sessions}>0 Sessions</Text>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AK</Text>
          </View>
          <View>
            <Text style={styles.profileName}>{DEMO_STUDENT.name}</Text>
            <Text style={styles.profileEmail}>arunkumarvlogs2002@gmail.com</Text>
          </View>
        </View>
      </StudentCard>

      <View style={styles.plansBox}>
        <Text style={styles.plansText}>
          No pricing plans are available right now. Please contact support.
        </Text>
      </View>

      <StudentCard style={styles.checkoutCard}>
        <Text style={styles.checkoutTitle}>CHECKOUT SUMMARY</Text>
        <View style={styles.checkoutRow}>
          <Text style={styles.checkoutLabel}>Package</Text>
          <Text style={styles.checkoutValue}>—</Text>
        </View>
        <View style={styles.checkoutRow}>
          <Text style={styles.checkoutLabel}>Total Classes</Text>
          <Text style={styles.checkoutAccent}>0 Sessions</Text>
        </View>
        <Text style={styles.amountDueLabel}>Amount Due</Text>
        <Text style={styles.amountDue}>₹0</Text>
        <PrimaryButton label="Confirm with CV Coins" disabled />
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
  plansBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Brand.border,
    borderRadius: 14,
    backgroundColor: Brand.white,
    padding: 16,
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
});
