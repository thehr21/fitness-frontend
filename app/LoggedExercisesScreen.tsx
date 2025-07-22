import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoggedExercisesScreen() {
  const [loggedExercises, setLoggedExercises] = useState<Exercise[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  interface Exercise {
    id: string;
    name: string;
    equipment: string;
    gifUrl: string;
    video_url?: string;
    muscle_group: string; //  FIXED: Use `muscle_group` instead of `target_muscle`
    difficulty: string;
    instructions?: string[];
    timestamp: string; //  FIXED: Use `timestamp` instead of `logged_at`
  }

  //  Fetch user ID from AsyncStorage
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("user_id");
        if (storedUserId) {
          setUserId(parseInt(storedUserId, 10));
          console.log(" Loaded User ID:", storedUserId);
        } else {
          console.log(" No user ID found in storage.");
        }
      } catch (error) {
        console.error(" Error loading user ID:", error);
      }
    };

    fetchUserId();
  }, []);

  //  Fetch logged workouts from backend when `userId` is available
  useEffect(() => {
    if (!userId) return;

    const fetchLoggedWorkouts = async () => {
      try {
        setLoading(true);
        console.log(" Fetching logged workouts...");
        const response = await fetch(`http://192.168.0.229:8000/logged-workouts/${userId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch logged workouts");
        }

        const data = await response.json();
        console.log(" Logged Workouts Fetched:", data);
        setLoggedExercises(data);
      } catch (error) {
        console.error(" Error fetching logged workouts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLoggedWorkouts();
  }, [userId]);

  //  Clear logged workouts locally (does not clear backend)
  const clearLoggedExercises = async () => {
    try {
      await AsyncStorage.removeItem("logged_workouts");
      setLoggedExercises([]);
      Alert.alert("Success", "Logged exercises cleared successfully!");
    } catch (error) {
      console.error(" Error clearing logged exercises:", error);
      Alert.alert("Error", "Failed to clear logged exercises.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>📋 Logged Exercises</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : loggedExercises.length === 0 ? (
        <Text style={styles.noDataText}>No logged exercises found.</Text>
      ) : (
        <FlatList
          data={loggedExercises}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={({ item }) => (
            <View style={styles.exerciseCard}>
              <Image source={{ uri: item.gifUrl }} style={styles.exerciseImage} />
              <View style={styles.exerciseDetails}>
                <Text style={styles.exerciseName}>{item.name}</Text>
                <Text style={styles.exerciseText}>Equipment: {item.equipment}</Text>
                <Text style={styles.exerciseText}>Muscle Group: {item.muscle_group}</Text>
                <Text style={styles.exerciseText}>
                  Logged At: {item.timestamp ? new Date(item.timestamp).toLocaleString() : "N/A"}
                </Text>
              </View>
            </View>
          )}
        />
      )}

      <TouchableOpacity style={styles.clearButton} onPress={clearLoggedExercises}>
        <Text style={styles.buttonText}>Clear Logged Exercises</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

//  Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 16,
  },
  noDataText: {
    fontSize: 18,
    textAlign: "center",
    color: "gray",
    marginTop: 20,
  },
  exerciseCard: {
    backgroundColor: "#f0f0f0",
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  exerciseImage: {
    width: 50,
    height: 50,
    marginRight: 16,
  },
  exerciseDetails: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  exerciseText: {
    fontSize: 16,
  },
  clearButton: {
    backgroundColor: "#ff0000",
    padding: 14,
    borderRadius: 8,
    marginVertical: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
  },
});