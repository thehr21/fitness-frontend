import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
  SafeAreaView,
  Linking,
  Alert,
  Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';

export default function WorkoutPlanScreen() {
  const [workoutType, setWorkoutType] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectionModal, setSelectionModal] = useState<string | null>(null);
  const [loggedWorkouts, setLoggedWorkouts] = useState<Exercise[]>([]);

  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;

  interface Exercise {
    id: string;
    name: string;
    equipment: string;
    gifUrl: string;
    video_url?: string;
    target_muscle: string;
    difficulty: string;
    instructions?: string[];
  }

  const workoutOptions = ["Home", "Gym"];

  const muscleOptions = [
    "Chest",
    "Back",
    "Cardio",
    "Lower Arms",
    "Lower Legs",
    "Neck",
    "Shoulders",
    "Upper Arms",
    "Upper Legs",
    "Waist",
  ];

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("user_id");
        if (storedUserId) {
          setUserId(parseInt(storedUserId, 10));
          console.log("✅ Loaded User ID:", storedUserId);
        } else {
          console.log("❌ No user ID found in storage. Please re-login.");
        }
      } catch (error) {
        console.error("❌ Error loading user ID:", error);
      }
    };
    loadUserData();
  }, []);

  const fetchExercises = async () => {
    if (!workoutType || !muscleGroup) {
      alert("Please select workout type and muscle group!");
      return;
    }
    if (!userId) {
      alert("Your user ID is missing! Please re-login.");
      return;
    }

    try {
      const response = await fetch(
        `http://192.168.0.229:8000/workouts?workout_type=${workoutType.toLowerCase()}&muscle_group=${muscleGroup.toLowerCase()}&user_id=${userId}`
      );
      const data = await response.json();

      if (data.workouts && Array.isArray(data.workouts)) {
        setExercises(data.workouts);
        console.log("✅ Workouts Fetched:", data.workouts.length);
      } else {
        alert("No exercises found for this selection.");
        setExercises([]);
      }
    } catch (error) {
      console.error("❌ Error fetching exercises:", error);
      alert("Failed to fetch exercises. Check your connection.");
    }
  };

  const logWorkout = async (exercise: Exercise) => {
    try {
      const loggedWorkouts = await AsyncStorage.getItem("logged_workouts");
      const workouts = loggedWorkouts ? JSON.parse(loggedWorkouts) : [];
      workouts.push({ ...exercise, logged_at: new Date().toISOString() });
      await AsyncStorage.setItem("logged_workouts", JSON.stringify(workouts));
      Alert.alert("Success", "Workout logged successfully!");
    } catch (error) {
      console.error("❌ Error logging workout:", error);
      Alert.alert("Error", "Failed to log workout.");
    }
  };

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [120, 0],
    extrapolate: "clamp",
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.header, { height: headerHeight, opacity: headerOpacity }]}>
        <View style={styles.headerTopRow}>
          <View style={styles.selectionContainer}>
            <TouchableOpacity
              style={styles.selectionButton}
              onPress={() => setSelectionModal("workout")}
            >
              <Text style={styles.selectionText}>
                {workoutType ? `🏠 ${workoutType}` : "Select Workout Type"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.selectionButton}
              onPress={() => setSelectionModal("muscle")}
            >
              <Text style={styles.selectionText}>
                {muscleGroup ? `💪 ${muscleGroup}` : "Select Muscle Group"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push("/LoggedExercisesScreen")}>
            <Text style={styles.buttonText}>Logged Exercises</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={fetchExercises}>
            <Text style={styles.buttonText}>Search Exercises</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.FlatList
        data={exercises}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.exerciseCard}
            onPress={() => {
              setSelectedExercise(item);
              setModalVisible(true);
            }}
          >
            <Image source={{ uri: item.gifUrl }} style={styles.exerciseImage} />
            <Text style={styles.exerciseName}>{item.name}</Text>
          </TouchableOpacity>
        )}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      />

      <Modal visible={!!selectionModal} animationType="slide" transparent>
        <View style={styles.selectionModal}>
          <View style={styles.selectionBox}>
            <View style={styles.optionRow}>
              {selectionModal === "workout"
                ? workoutOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={styles.option}
                      onPress={() => {
                        setWorkoutType(option);
                        setSelectionModal(null);
                      }}
                    >
                      <Text style={styles.optionText}>{option}</Text>
                    </TouchableOpacity>
                  ))
                : muscleOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={styles.option}
                      onPress={() => {
                        setMuscleGroup(option);
                        setSelectionModal(null);
                      }}
                    >
                      <Text style={styles.optionText}>{option}</Text>
                    </TouchableOpacity>
                  ))}
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedExercise && (
              <>
                <Text style={styles.modalTitle}>{selectedExercise.name}</Text>
                <Image source={{ uri: selectedExercise.gifUrl }} style={styles.modalImage} />
                <Text style={styles.modalText}>Target Muscle: {selectedExercise.target_muscle}</Text>
                {selectedExercise.instructions && (
                  <ScrollView style={styles.instructionsContainer}>
                    {selectedExercise.instructions.map((instruction, index) => (
                      <Text key={index} style={styles.instructionText}>
                        {instruction}
                      </Text>
                    ))}
                  </ScrollView>
                )}
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => Linking.openURL(selectedExercise.video_url || "")}
                >
                  <Text style={styles.buttonText}>Watch Demo Video</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => {
                    logWorkout(selectedExercise);
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.buttonText}>Log Workout</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    zIndex: 1, // Ensure the header is above other elements
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  selectionContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  selectionButton: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 8,
  },
  selectionText: {
    fontSize: 14,
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  actionButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
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
  exerciseName: {
    fontSize: 18,
  },
  loggedExercisesButton: {
    backgroundColor: "#28a745",
    padding: 10,
    borderRadius: 8,
  },
  selectionModal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  selectionBox: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  option: {
    backgroundColor: "#f0f0f0",
    padding: 16,
    borderRadius: 8,
    margin: 8,
    minWidth: "40%",
    alignItems: "center",
  },
  optionText: {
    fontSize: 18,
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    width: "80%",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  modalImage: {
    width: "100%",
    height: 200,
    marginBottom: 16,
  },
  modalText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 16,
  },
  instructionsContainer: {
    maxHeight: 200,
    marginBottom: 16,
  },
  instructionText: {
    fontSize: 16,
    marginBottom: 8,
  },
  modalButton: {
    backgroundColor: "#007bff",
    padding: 14,
    borderRadius: 8,
    marginVertical: 10,
  },
});