import { useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';

import { CoachCard, CoachPage, PrimaryButton } from '@/components/coach/coach-page';
import { Brand } from '@/constants/brand';

const MAX = 300;

export default function CoachSupportScreen() {
  const [message, setMessage] = useState('');

  return (
    <CoachPage
      title="Support"
      subtitle={"Send us a message and we'll get back to you on WhatsApp."}>
      <CoachCard style={styles.card}>
        <TextInput
          value={message}
          onChangeText={(value) => setMessage(value.slice(0, MAX))}
          placeholder="Type your question or issue here..."
          placeholderTextColor={Brand.muted}
          multiline
          style={styles.input}
        />
        <Text style={styles.counter}>
          {message.length}/{MAX}
        </Text>
        <PrimaryButton
          label="Send via WhatsApp"
          disabled={message.trim().length === 0}
          onPress={() => undefined}
        />
      </CoachCard>
    </CoachPage>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 10,
  },
  input: {
    minHeight: 140,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Brand.border,
    backgroundColor: Brand.inputBackground,
    padding: 12,
    textAlignVertical: 'top',
    color: Brand.navy,
    fontSize: 14,
  },
  counter: {
    alignSelf: 'flex-end',
    color: Brand.muted,
    fontSize: 12,
  },
});
