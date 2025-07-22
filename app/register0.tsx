import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function Register0() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [activityLevel, setActivityLevel] = useState("");

  const handleNext = () => {
    if (!activityLevel) {
      alert("Please select your activity level.");
      return;
    }

    // Navigate to next registration step while preserving previous data
    router.push({
      pathname: "/register1",
      params: { ...params, activity_level: activityLevel },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activity Level</Text>

      <TouchableOpacity
        style={[styles.optionButton, activityLevel === "sedentary" && styles.selectedOption]}
        onPress={() => setActivityLevel("sedentary")}
      >
        <Text style={styles.optionText}>Sedentary (Little to no exercise)</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.optionButton, activityLevel === "light" && styles.selectedOption]}
        onPress={() => setActivityLevel("light")}
      >
        <Text style={styles.optionText}>Lightly Active (1-3 days a week)</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.optionButton, activityLevel === "moderate" && styles.selectedOption]}
        onPress={() => setActivityLevel("moderate")}
      >
        <Text style={styles.optionText}>Moderately Active (3-5 days a week)</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.optionButton, activityLevel === "active" && styles.selectedOption]}
        onPress={() => setActivityLevel("active")}
      >
        <Text style={styles.optionText}>Very Active (6-7 days a week)</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.optionButton, activityLevel === "super" && styles.selectedOption]}
        onPress={() => setActivityLevel("super")}
      >
        <Text style={styles.optionText}>Super Active (Athlete level)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: "#f5f5f5" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20, color: "#333" },
  optionButton: {
    width: "100%",
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    marginBottom: 10,
    alignItems: "center",
  },
  selectedOption: {
    backgroundColor: "#007BFF", // Changed to blue
  },
  optionText: { fontSize: 16, color: "#333" },
  button: {
    width: "100%",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#007BFF", // Changed to blue
    marginTop: 10,
  },
  buttonText: { fontSize: 18, fontWeight: "bold", color: "#fff" },
});

