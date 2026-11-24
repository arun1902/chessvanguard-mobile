import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/student/student-page';
import { Brand } from '@/constants/brand';

const CRITERIA = ['Teaching Style', 'Patience', 'Communication', 'Punctuality'] as const;
const RECOMMEND = ['Yes', 'Maybe', 'No'] as const;

type RateSessionModalProps = {
  visible: boolean;
  coachName?: string;
  onClose: () => void;
  onSubmit?: () => void;
};

export function RateSessionModal({
  visible,
  coachName = 'Coach',
  onClose,
  onSubmit,
}: RateSessionModalProps) {
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [recommend, setRecommend] = useState<(typeof RECOMMEND)[number] | null>(null);
  const [comments, setComments] = useState('');

  const reset = () => {
    setRatings({});
    setRecommend(null);
    setComments('');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.safe} edges={['bottom']}>
          <View style={styles.card}>
            <Text style={styles.title}>Rate Your Demo Session</Text>
            <Text style={styles.subtitle}>
              How was your session with <Text style={styles.bold}>{coachName}</Text>?
            </Text>

            <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
              {CRITERIA.map((criterion) => (
                <View key={criterion} style={styles.criterion}>
                  <Text style={styles.criterionLabel}>{criterion}</Text>
                  <View style={styles.stars}>
                    {[1, 2, 3, 4, 5].map((star) => {
                      const active = (ratings[criterion] ?? 0) >= star;
                      return (
                        <Pressable
                          key={star}
                          onPress={() => setRatings((current) => ({ ...current, [criterion]: star }))}
                          hitSlop={6}
                          accessibilityRole="button"
                          accessibilityLabel={`${criterion} ${star} stars`}>
                          <Text style={[styles.star, active ? styles.starActive : null]}>★</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ))}

              <Text style={styles.recommendTitle}>
                Would you recommend {coachName} to other students?
              </Text>
              <View style={styles.recommendRow}>
                {RECOMMEND.map((option) => {
                  const active = recommend === option;
                  return (
                    <Pressable
                      key={option}
                      onPress={() => setRecommend(option)}
                      style={[styles.recommendChip, active ? styles.recommendActive : null]}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}>
                      <Text
                        style={[styles.recommendText, active ? styles.recommendTextActive : null]}>
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.commentsLabel}>Any comments? (optional)</Text>
              <TextInput
                value={comments}
                onChangeText={setComments}
                placeholder="Tell us more about your experience..."
                placeholderTextColor={Brand.muted}
                multiline
                style={styles.comments}
              />
            </ScrollView>

            <View style={styles.footer}>
              <PrimaryButton
                label="Submit"
                tone="navy"
                onPress={() => {
                  onSubmit?.();
                  reset();
                  onClose();
                }}
              />
              <Pressable onPress={() => { reset(); onClose(); }} accessibilityRole="button">
                <Text style={styles.cancel}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  safe: {
    maxHeight: '94%',
  },
  card: {
    backgroundColor: Brand.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 18,
    paddingHorizontal: 16,
    maxHeight: '100%',
  },
  title: {
    color: Brand.navy,
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    color: Brand.subtitle,
    fontSize: 14,
    marginTop: 4,
    marginBottom: 12,
  },
  bold: {
    color: Brand.navy,
    fontWeight: '700',
  },
  body: {
    gap: 14,
    paddingBottom: 12,
  },
  criterion: {
    gap: 6,
  },
  criterionLabel: {
    color: Brand.navy,
    fontSize: 14,
    fontWeight: '700',
  },
  stars: {
    flexDirection: 'row',
    gap: 8,
  },
  star: {
    fontSize: 28,
    color: Brand.border,
  },
  starActive: {
    color: Brand.gold,
  },
  recommendTitle: {
    color: Brand.navy,
    fontSize: 14,
    fontWeight: '700',
  },
  recommendRow: {
    flexDirection: 'row',
    gap: 8,
  },
  recommendChip: {
    flex: 1,
    minHeight: 40,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Brand.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recommendActive: {
    borderColor: Brand.gold,
    backgroundColor: '#FFF8E7',
  },
  recommendText: {
    color: Brand.subtitle,
    fontWeight: '600',
  },
  recommendTextActive: {
    color: Brand.navy,
    fontWeight: '800',
  },
  commentsLabel: {
    color: Brand.navy,
    fontSize: 13,
    fontWeight: '700',
  },
  comments: {
    minHeight: 96,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Brand.border,
    backgroundColor: Brand.inputBackground,
    padding: 12,
    textAlignVertical: 'top',
    color: Brand.navy,
    fontSize: 14,
  },
  footer: {
    gap: 10,
    paddingVertical: 12,
  },
  cancel: {
    textAlign: 'center',
    color: Brand.subtitle,
    fontSize: 14,
    fontWeight: '600',
    paddingVertical: 8,
  },
});
