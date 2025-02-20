import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import axios from "axios";

export default function RegisterStep3() {
  const router = useRouter();
  const params = useLocalSearchParams(); // ✅ Get all previous form data

  const [goal, setGoal] = useState("");

  const handleRegister = async () => {
    console.log("📌 Sending registration data...", {
      full_name: params.fullName,
      username: params.username,
      email: params.email,
      password: params.password,
      activity_level: params.activity_level,
      gender: params.gender,
      current_weight: parseFloat(Array.isArray(params.currentWeight) ? params.currentWeight[0] : params.currentWeight), // ✅ Convert to float
      target_weight: parseFloat(Array.isArray(params.targetWeight) ? params.targetWeight[0] : String(params.targetWeight)), // ✅ Convert to float
      goal,
    });
  
    try {
      const response = await fetch("http://192.168.0.229:8000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: params.fullName,
          username: params.username,
          email: params.email,
          password: params.password,
          activity_level: params.activity_level,
          gender: params.gender,
          current_weight: parseFloat(Array.isArray(params.currentWeight) ? params.currentWeight[0] : params.currentWeight), // ✅ Convert weight to float
          target_weight: parseFloat(Array.isArray(params.targetWeight) ? params.targetWeight[0] : params.targetWeight), // ✅ Convert weight to float
          goal,
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.detail || "Registration failed.");
      }
  
      console.log("✅ Registration Success:", data);
      Alert.alert("Success!", "You can now log in.");
      router.push("/login");
    } catch (error) {
      console.log("❌ Registration Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Something went wrong.";
      Alert.alert("Registration Failed", errorMessage);
    }
  };
  
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Goal</Text>

      <TouchableOpacity
        style={[styles.goalButton, goal === "Lose Weight" && styles.selectedGoal]}
        onPress={() => setGoal("Lose Weight")}
      >
        <Text style={styles.goalText}>Lose Weight</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.goalButton, goal === "Maintain Weight" && styles.selectedGoal]}
        onPress={() => setGoal("Maintain Weight")}
      >
        <Text style={styles.goalText}>Maintain Weight</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.goalButton, goal === "Gain Muscle" && styles.selectedGoal]}
        onPress={() => setGoal("Gain Muscle")}
      >
        <Text style={styles.goalText}>Gain Muscle</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
        disabled={!goal} // Disable button if no goal is selected
      >
        <Text style={styles.buttonText}>Complete Registration</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push({ pathname: "/register1", params })}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  goalButton: {
    width: "100%",
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  selectedGoal: {
    backgroundColor: "#4CAF50",
  },
  goalText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  button: {
    width: "100%",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#4CAF50",
    marginTop: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  backText: {
    marginTop: 15,
    color: "#4CAF50",
    textDecorationLine: "underline",
  },
});
