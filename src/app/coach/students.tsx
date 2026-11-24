import { useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';

import { CoachCard, CoachPage, EmptyState } from '@/components/coach/coach-page';
import { Brand } from '@/constants/brand';

export default function CoachStudentsScreen() {
  const [query, setQuery] = useState('');

  return (
    <CoachPage
      title="Students"
      subtitle="Track attendance and progress for your students.">
      <Text style={styles.heading}>My Assigned Students</Text>
      <CoachCard style={styles.searchCard}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search by student name, phone or parent email..."
          placeholderTextColor={Brand.muted}
          style={styles.search}
        />
      </CoachCard>
      <EmptyState iconLabel="👥" message="No students found." />
    </CoachPage>
  );
}

const styles = StyleSheet.create({
  heading: {
    color: Brand.navy,
    fontSize: 20,
    fontWeight: '800',
  },
  searchCard: {
    paddingVertical: 10,
  },
  search: {
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
