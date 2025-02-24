import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    console.log("✅ Login Button Clicked");

    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    try {
      const response = await fetch("http://192.168.0.229:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.log("🔴 Login Error:", data);
        throw new Error(data.detail || "Invalid credentials.");
      }

      console.log("✅ Login Successful:", data);

      // ✅ Store token in AsyncStorage
      await AsyncStorage.setItem("access_token", data.access_token);
      console.log("🔑 Token Stored Successfully");

      // ✅ Debug: Retrieve and log the stored token
      const storedToken = await AsyncStorage.getItem("access_token");
      console.log("🛠️ Token Retrieved After Storing:", storedToken);

      Alert.alert("Welcome!", "Login successful.");
      router.push("/"); // 🚀 Navigate to home screen
    } catch (error) {
      if (error instanceof Error) {
        console.log("❌ Login Failed:", error.message);
      } else {
        console.log("❌ Login Failed:", error);
      }
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
      Alert.alert("Login Failed", errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/forget-password")}>
        <Text style={styles.linkText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/register")}>
        <Text style={styles.linkText}>Don't have an account? Sign up</Text>
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
  inputContainer: { width: "100%", marginBottom: 10 },
  label: { fontSize: 16, fontWeight: "bold", color: "#555", marginBottom: 5 },
  input: {
    width: "100%",
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  button: {
    width: "100%",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#4CAF50",
    marginTop: 10,
  },
  buttonText: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  linkText: { marginTop: 15, color: "#4CAF50", textDecorationLine: "underline" },
});


