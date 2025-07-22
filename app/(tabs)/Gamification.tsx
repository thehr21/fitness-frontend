import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from "react-native";
import { ProgressBar } from "react-native-paper";
import { FontAwesome5 } from "@expo/vector-icons";
import ConfettiCannon from "react-native-confetti-cannon";
import { useFocusEffect } from "@react-navigation/native";

export default function GamificationScreen() {
  const [userId, setUserId] = useState<number | null>(null);
  const [streaks, setStreaks] = useState({ workout: 0, meal: 0 });
  const [bestStreaks, setBestStreaks] = useState({ workout: 0, meal: 0 });
  const [totalLogs, setTotalLogs] = useState({ workout: 0, meal: 0 });
  const [badges, setBadges] = useState<{ id: number; name: string; fa_icon_class: string | null; earned: boolean }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedId = await AsyncStorage.getItem("user_id");
        if (storedId) setUserId(parseInt(storedId, 10));
      } catch (error) {
        console.error("Error fetching user ID:", error);
      }
    };
    fetchUserId();
  }, []);

  const fetchGamificationData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://192.168.0.229:8000/gamification/user-progress?user_id=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch user progress");
      const data = await response.json();

      const previousBestStreaks = JSON.parse(await AsyncStorage.getItem("best_streaks") || "{}");

      if (data.best_streaks.workout > (previousBestStreaks.workout || 0)) {
        Alert.alert("🏆 New Best Streak!", `🔥 You just hit a new workout streak of ${data.best_streaks.workout} days!`);
      }
      if (data.best_streaks.meal > (previousBestStreaks.meal || 0)) {
        Alert.alert("🏆 New Best Streak!", `🍽️ You just hit a new meal streak of ${data.best_streaks.meal} days!`);
      }

      await AsyncStorage.setItem("best_streaks", JSON.stringify(data.best_streaks));

      setStreaks(data.current_streaks);
      setBestStreaks(data.best_streaks);
      setTotalLogs(data.total_logs);
    } catch (error) {
      console.error("Error fetching progress:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBadges = async () => {
    try {
      const response = await fetch(`http://192.168.0.229:8000/gamification/badges?user_id=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch badges");
      const earnedBadges = await response.json();

      const allAchievementsResponse = await fetch(`http://192.168.0.229:8000/gamification/all-achievements`);
      if (!allAchievementsResponse.ok) throw new Error("Failed to fetch achievements");
      const allAchievements = await allAchievementsResponse.json();

      const mergedBadges = allAchievements.map((achievement: { id: number; name: string; fa_icon_class: string }) => ({
        id: achievement.id,
        name: achievement.name,
        fa_icon_class: achievement.fa_icon_class.startsWith("fa-") ? achievement.fa_icon_class : null,
        earned: earnedBadges.some((badge: { id: number }) => badge.id === achievement.id),
      }));

      const previousBadges = JSON.parse(await AsyncStorage.getItem("earned_badges") || "[]");

      const newlyEarned = mergedBadges.filter((badge: { id: number; earned: boolean }) => 
        badge.earned && !previousBadges.includes(badge.id)
      );

      if (newlyEarned.length > 0) {
        Alert.alert("🎖️ New Badge Earned!", `You earned: ${newlyEarned.map((b: { name: string }) => b.name).join(", ")}`);
        setShowConfetti(true);
      }

      await AsyncStorage.setItem("earned_badges", JSON.stringify(earnedBadges.map((b: { id: number }) => b.id)));

      setBadges(mergedBadges);
    } catch (error) {
      console.error("Error fetching badges:", error);
    }
  };

  useEffect(() => {
    if (userId !== null) {
      fetchGamificationData();
      fetchBadges();
    }
  }, [userId]);

  useFocusEffect(
    React.useCallback(() => {
      if (userId !== null) {
        console.log("🔄 Updating gamification data...");
        fetchGamificationData();
        fetchBadges();
      }
    }, [userId])
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : (
        <>
          <Text style={styles.header}>🏆 Gamification Progress</Text>

          <View style={styles.streakContainer}>
            <Text style={styles.streakText}>🔥 Workout Streak: {streaks.workout} Days (Best: {bestStreaks.workout})</Text>
            <Text style={styles.streakText}>🍽️ Meal Streak: {streaks.meal} Days (Best: {bestStreaks.meal})</Text>
          </View>

          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>Workouts Logged: {totalLogs.workout} / 100</Text>
            <ProgressBar progress={totalLogs.workout / 100} color="#4CAF50" style={styles.progressBar} />

            <Text style={styles.progressText}>Meals Logged: {totalLogs.meal} / 100</Text>
            <ProgressBar progress={totalLogs.meal / 100} color="#FFA500" style={styles.progressBar} />
          </View>

          <Text style={styles.header}>🎖️ Achievements</Text>

          <FlatList
            data={badges}
            key={2}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={styles.badgeRow}
            contentContainerStyle={{ paddingBottom: 150 }}
            ListFooterComponent={<View style={{ height: 50 }} />}
            renderItem={({ item }) => (
              <View style={[styles.badgeItem, !item.earned && styles.lockedBadge]}>
                {item.fa_icon_class ? (
                  <FontAwesome5
                    name={item.fa_icon_class.replace("fa-", "") as any}
                    size={40}
                    color={item.earned ? "#FFD700" : "#AAA"}
                    solid
                  />
                ) : (
                  <FontAwesome5 name="question-circle" size={40} color="#AAA" solid />
                )}
                <Text style={[styles.badgeText, !item.earned && styles.lockedText]}>{item.name}</Text>
              </View>
            )}
          />

          {showConfetti && <ConfettiCannon count={50} origin={{ x: 200, y: 0 }} fadeOut />}
        </>
      )}
    </View>
  );
}

/**  Styles fixed! */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF", padding: 20 },
  header: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 20, marginTop: 40, color: "#333" },
  streakContainer: { marginVertical: 10 },
  streakText: { fontSize: 16, fontWeight: "bold", marginBottom: 5, color: "#333" },
  progressContainer: { marginVertical: 10 },
  progressText: { fontSize: 14, color: "#333", marginBottom: 5 },
  progressBar: { height: 10, borderRadius: 5, marginVertical: 5 },
  badgeRow: { justifyContent: "space-between", marginBottom: 15 },
  badgeItem: { flex: 1, alignItems: "center", marginHorizontal: 10, marginBottom: 10 },
  lockedBadge: { opacity: 0.4 },
  badgeText: { fontSize: 14, marginTop: 5, textAlign: "center", color: "#333" },
  lockedText: { color: "#777" },
});
