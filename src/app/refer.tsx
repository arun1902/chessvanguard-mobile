import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { EmptyState, PrimaryButton, StudentCard, StudentPage } from '@/components/student/student-page';
import { Brand } from '@/constants/brand';

export default function ReferScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  return (
    <StudentPage
      title="Refer a Friend"
      subtitle="Invite friends to ChessVanguard. You earn CV Coins after their first pack payment, and can redeem them when you refill sessions.">
      <StudentCard style={styles.inviteCard}>
        <Text style={styles.sectionTitle}>Send an invite</Text>
        <Text style={styles.sectionBody}>
          We&apos;ll email them a registration link. You earn 400 CV Coins after their first pack payment.
        </Text>

        <Field label="Friend's name" value={name} onChangeText={setName} placeholder="Full name" />
        <Field
          label="Friend's email"
          value={email}
          onChangeText={setEmail}
          placeholder="name@example.com"
          keyboardType="email-address"
        />
        <Field
          label="WhatsApp number"
          value={whatsapp}
          onChangeText={setWhatsapp}
          placeholder="10-digit mobile number"
          keyboardType="phone-pad"
        />

        <PrimaryButton label="Send Invite" onPress={() => undefined} />
      </StudentCard>

      <StudentCard style={styles.historyCard}>
        <Text style={styles.sectionTitle}>Coin history</Text>
        <Text style={styles.sectionBody}>Credits, redemptions, and expiry.</Text>
        <EmptyState iconLabel="🪙" message="No coin activity yet." />
      </StudentCard>
    </StudentPage>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Brand.muted}
        keyboardType={keyboardType}
        autoCapitalize="none"
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inviteCard: {
    gap: 12,
  },
  historyCard: {
    gap: 10,
  },
  sectionTitle: {
    color: Brand.navy,
    fontSize: 17,
    fontWeight: '800',
  },
  sectionBody: {
    color: Brand.subtitle,
    fontSize: 13,
    lineHeight: 19,
  },
  field: {
    gap: 6,
  },
  label: {
    color: Brand.label,
    fontSize: 12,
    fontWeight: '700',
  },
  input: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Brand.border,
    backgroundColor: Brand.inputBackground,
    paddingHorizontal: 12,
    color: Brand.navy,
    fontSize: 14,
  },
});
