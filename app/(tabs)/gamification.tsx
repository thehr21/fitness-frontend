import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image } from "react-native";
import { ProgressBar } from "react-native-paper";
import { FontAwesome5 } from "@expo/vector-icons";
import ConfettiCannon from "react-native-confetti-cannon";

export default function GamificationScreen() {
  const [userId, setUserId] = useState<number | null>(null);
  const [streaks, setStreaks] = useState({ workout: 0, meal: 0 });
  const [bestStreaks, setBestStreaks] = useState({ workout: 0, meal: 0 });
  const [totalLogs, setTotalLogs] = useState({ workout: 0, meal: 0 });
  const [badges, setBadges] = useState<{ id: number; name: string; fa_icon_class: string | null; image_url: string | null; earned: boolean }[]>([]);
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
        image_url: !achievement.fa_icon_class.startsWith("fa-")
          ? `https://example.com/icons/${achievement.name.replace(/ /g, "_").toLowerCase()}.png`
          : null,
        earned: earnedBadges.some((badge: { id: number }) => badge.id === achievement.id),
      }));

      setBadges((prevBadges) => {
        if (JSON.stringify(prevBadges) !== JSON.stringify(mergedBadges)) {
          return mergedBadges;
        }
        return prevBadges;
      });

      if (earnedBadges.length > 0) setShowConfetti(true);
    } catch (error) {
      console.error("Error fetching badges:", error);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!userId) return;
      await fetchGamificationData();
      await fetchBadges();
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const logActivity = async (activityType: string) => {
    try {
      const response = await fetch("http://192.168.0.229:8000/gamification/log-activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, activity_type: activityType }),
      });

      if (!response.ok) {
        throw new Error("Failed to log activity");
      }

      console.log(`✅ ${activityType} logged successfully!`);

      await fetchGamificationData();
      await fetchBadges();
    } catch (error) {
      console.error(`❌ Failed to log ${activityType}:`, error);
    }
  };

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
            <Text>Workouts Logged: {totalLogs.workout} / 100</Text>
            <ProgressBar progress={totalLogs.workout / 100} color="#4CAF50" style={styles.progressBar} />

            <Text>Meals Logged: {totalLogs.meal} / 100</Text>
            <ProgressBar progress={totalLogs.meal / 100} color="#FFA500" style={styles.progressBar} />
          </View>

          <Text style={styles.subHeader}>🎖️ Achievements</Text>
          <FlatList
            data={badges}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            renderItem={({ item }) => (
              <View style={[styles.badgeItem, !item.earned && styles.lockedBadge]}>
                {item.fa_icon_class ? (
                  <FontAwesome5 name={item.fa_icon_class as any} size={32} color={item.earned ? "#FFD700" : "#AAA"} />
                ) : (
                  <Image source={{ uri: item.image_url || 'https://via.placeholder.com/150' }} style={[styles.badgeIcon, !item.earned && styles.lockedBadge]} />
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFDE7", padding: 20 },
  header: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  streakContainer: { marginVertical: 10 },
  streakText: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
  progressContainer: { marginVertical: 10 },
  progressBar: { height: 10, borderRadius: 5, marginVertical: 5 },
  subHeader: { fontSize: 18, fontWeight: "bold", marginVertical: 10 },
  badgeItem: { alignItems: "center", marginRight: 20 },
  lockedBadge: { opacity: 0.4 },
  badgeText: { fontSize: 14, marginTop: 5, textAlign: "center" },
  lockedText: { color: "#777" },
  badgeIcon: { width: 40, height: 40, resizeMode: "contain", marginBottom: 5 },
});