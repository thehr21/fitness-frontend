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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoggedExercisesScreen() {
  const [loggedExercises, setLoggedExercises] = useState<Exercise[]>([]);

  interface Exercise {
    id: string;
    name: string;
    equipment: string;
    gifUrl: string;
    video_url?: string;
    target_muscle: string;
    difficulty: string;
    instructions?: string[];
    logged_at: string;
  }

  useEffect(() => {
    const loadLoggedExercises = async () => {
      try {
        const storedLoggedExercises = await AsyncStorage.getItem("logged_workouts");
        if (storedLoggedExercises) {
          setLoggedExercises(JSON.parse(storedLoggedExercises));
        } else {
          console.log("❌ No logged exercises found.");
        }
      } catch (error) {
        console.error("❌ Error loading logged exercises:", error);
      }
    };
    loadLoggedExercises();
  }, []);

  const clearLoggedExercises = async () => {
    try {
      await AsyncStorage.removeItem("logged_workouts");
      setLoggedExercises([]);
      Alert.alert("Success", "Logged exercises cleared successfully!");
    } catch (error) {
      console.error("❌ Error clearing logged exercises:", error);
      Alert.alert("Error", "Failed to clear logged exercises.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>📋 Logged Exercises</Text>

      <FlatList
        data={loggedExercises}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item }) => (
          <View style={styles.exerciseCard}>
            <Image source={{ uri: item.gifUrl }} style={styles.exerciseImage} />
            <View style={styles.exerciseDetails}>
              <Text style={styles.exerciseName}>{item.name}</Text>
              <Text style={styles.exerciseText}>Equipment: {item.equipment}</Text>
              <Text style={styles.exerciseText}>Target Muscle: {item.target_muscle}</Text>
              <Text style={styles.exerciseText}>Logged At: {new Date(item.logged_at).toLocaleString()}</Text>
            </View>
          </View>
        )}
      />

      <TouchableOpacity style={styles.clearButton} onPress={clearLoggedExercises}>
        <Text style={styles.buttonText}>Clear Logged Exercises</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

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