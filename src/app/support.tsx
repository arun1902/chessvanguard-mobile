import { useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';

import { PrimaryButton, StudentCard, StudentPage } from '@/components/student/student-page';
import { Brand } from '@/constants/brand';

const MAX_LENGTH = 300;

export default function SupportScreen() {
  const [message, setMessage] = useState('');

  return (
    <StudentPage
      title="Support"
      subtitle="Send us a message and we'll get back to you on WhatsApp.">
      <StudentCard style={styles.card}>
        <TextInput
          value={message}
          onChangeText={(value) => setMessage(value.slice(0, MAX_LENGTH))}
          placeholder="Type your question or issue here..."
          placeholderTextColor={Brand.muted}
          multiline
          textAlignVertical="top"
          style={styles.textarea}
          accessibilityLabel="Support message"
        />
        <Text style={styles.counter}>
          {message.length}/{MAX_LENGTH}
        </Text>
        <PrimaryButton
          label="Send via WhatsApp"
          disabled={message.trim().length === 0}
          onPress={() => undefined}
        />
      </StudentCard>
    </StudentPage>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 10,
  },
  textarea: {
    minHeight: 160,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Brand.border,
    backgroundColor: Brand.inputBackground,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: Brand.navy,
    fontSize: 15,
    lineHeight: 22,
  },
  counter: {
    color: Brand.muted,
    fontSize: 12,
    textAlign: 'right',
  },
});
