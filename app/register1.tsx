import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function RegisterStep2() {
  const router = useRouter();
  const params = useLocalSearchParams(); //  Get previous form data

  const [gender, setGender] = useState("");
  const [currentWeight, setCurrentWeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [errors, setErrors] = useState({ gender: "", currentWeight: "", targetWeight: "" });

  //  Handle Next Button Click
  const handleNext = () => {
    let newErrors = { gender: "", currentWeight: "", targetWeight: "" };

    if (!gender.trim()) newErrors.gender = "Gender is required!";
    if (!currentWeight.trim()) newErrors.currentWeight = "Current weight is required!";
    if (!targetWeight.trim()) newErrors.targetWeight = "Target weight is required!";

    setErrors(newErrors);

    //  Stop if errors exist
    if (Object.values(newErrors).some((err) => err !== "")) return;

    //  If all validations pass, proceed
    router.push({
      pathname: "/register2",
      params: {
        fullName: params.fullName,
        username: params.username,
        email: params.email,
        password: params.password,
        activity_level: params.activity_level,
        gender,
        currentWeight,
        targetWeight,
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fitness Details</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Gender</Text>
        <TextInput style={styles.input} placeholder="Enter your gender" value={gender} onChangeText={setGender} />
        {errors.gender ? <Text style={styles.error}>{errors.gender}</Text> : null}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Current Weight (kg)</Text>
        <TextInput style={styles.input} placeholder="Enter your current weight" keyboardType="numeric" value={currentWeight} onChangeText={setCurrentWeight} />
        {errors.currentWeight ? <Text style={styles.error}>{errors.currentWeight}</Text> : null}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Target Weight (kg)</Text>
        <TextInput style={styles.input} placeholder="Enter your target weight" keyboardType="numeric" value={targetWeight} onChangeText={setTargetWeight} />
        {errors.targetWeight ? <Text style={styles.error}>{errors.targetWeight}</Text> : null}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push({ pathname: "/register", params })}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: "#f5f5f5" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20, color: "#333" },
  inputContainer: { width: "100%", marginBottom: 10 },
  label: { fontSize: 16, fontWeight: "bold", color: "#555", marginBottom: 5 },
  input: { width: "100%", padding: 15, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, backgroundColor: "#fff" },
  error: { color: "red", fontSize: 14, marginTop: 5 },
  button: { 
    width: "100%", 
    padding: 15, 
    borderRadius: 8, 
    alignItems: "center", 
    backgroundColor: "#007BFF", // Changed to blue
    marginTop: 10 
  },
  buttonText: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  backText: { 
    marginTop: 15, 
    color: "#007BFF", // Changed to blue
    textDecorationLine: "underline" 
  },
});
