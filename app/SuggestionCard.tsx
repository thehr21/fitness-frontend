import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface SuggestionCardProps {
  suggestion: string;
  tone?: string;
}

const getIcon = (text: string) => {
  const lower = text.toLowerCase();
  if (lower.includes('calorie') || lower.includes('protein')) return '🍽️';
  if (lower.includes('hydration') || lower.includes('sleep')) return '🛌';
  if (lower.includes('goal') || lower.includes('try to')) return '🎯';
  if (lower.includes('restart') || lower.includes('log')) return '🧠';
  if (lower.includes('increase') || lower.includes('deficit')) return '⚠️';
  if (lower.includes('consistent') || lower.includes('discipline')) return '💡';
  return '💬';
};

const getCategory = (text: string): string => {
  const t = text.toLowerCase();
  if (t.includes('calorie') || t.includes('protein') || t.includes('meals')) return 'Nutrition';
  if (t.includes('hydration') || t.includes('sleep')) return 'Recovery';
  if (t.includes('training') || t.includes('workout') || t.includes('mobility')) return 'Training';
  if (t.includes('restart') || t.includes('consistency') || t.includes('strategic')) return 'Mindset';
  return 'General';
};

export default function SuggestionCard({ suggestion, tone = 'coach' }: SuggestionCardProps) {
  const icon = getIcon(suggestion);
  const category = getCategory(suggestion);

  return (
    <Animated.View style={styles.card}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.tone}>{tone.toUpperCase()}</Text>
      <Text style={styles.category}>{category}</Text>
      <Text style={styles.text}>{suggestion}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    fontSize: 20,
    marginBottom: 4,
  },
  tone: {
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
    fontSize: 13,
  },
  category: {
    color: '#888',
    fontSize: 12,
    marginBottom: 6,
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
});
