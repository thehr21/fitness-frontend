import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  TouchableOpacity
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import SuggestionCard from '../SuggestionCard';
import { Ionicons } from '@expo/vector-icons';
import { AnimatePresence, MotiView } from 'moti';

export default function HomeDashboard() {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchSuggestion = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const userId = await AsyncStorage.getItem('user_id');
      if (!userId) throw new Error('User ID not found');

      const res = await fetch(`http://192.168.0.229:8000/ai/ai/suggestions/${userId}`);
      const data = await res.json();

      const rawSentences = data.suggestion
        .split(/(?<=[.?!])\s+/)
        .map((s: string) => s.trim());

      const stitched: string[] = [];
      for (const sentence of rawSentences) {
        if (
          sentence.length < 20 &&
          stitched.length > 0 &&
          !/[.?!]$/.test(stitched[stitched.length - 1])
        ) {
          stitched[stitched.length - 1] += ' ' + sentence;
        } else {
          stitched.push(sentence);
        }
      }

      const cleanSuggestions = stitched.filter((s) => s.length > 20 && s.includes(' '));
      setSuggestions(cleanSuggestions);
    } catch (err) {
      console.error(' Fetch error:', err);
      setError('Failed to load suggestions.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSuggestion();
  }, [fetchSuggestion]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSuggestion();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Fetching your AI guidance...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: '#f6f6f6' }}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.heading}>Smart Tips</Text>
        <TouchableOpacity onPress={() => router.push('/profile')}>
          <Ionicons name="person-circle-outline" size={28} color="black" />
        </TouchableOpacity>
      </View>

      <AnimatePresence>
        {suggestions.map((text, idx) => (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: idx * 100, type: 'timing', duration: 300 }}
            key={idx}
          >
            <SuggestionCard suggestion={text} tone="coach" />
          </MotiView>
        ))}
      </AnimatePresence>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 90,
    backgroundColor: '#f6f6f6'
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 14,
    paddingHorizontal: 4
  },
  heading: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333'
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f6f6f6'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#777'
  },
  errorText: {
    color: 'red',
    fontSize: 16
  }
});
