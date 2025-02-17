import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your registered email.");
      return;
    }

    console.log("📌 Sending password reset request for:", email);

    try {
      const response = await fetch("http://192.168.0.229:8000/auth/forgot-password", { // ✅ Ensure correct IP
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.log("❌ Forgot Password Error:", data);
        throw new Error(data.detail || "Something went wrong.");
      }

      console.log("✅ Reset Code Sent:", data);
      Alert.alert("Check Your Email", "A password reset code has been sent.");
      
      // ✅ Correct way to redirect using query parameters
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      
    } catch (error) {
      console.log("🔴 Forgot Password Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Something went wrong.";
      Alert.alert("Error", errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password?</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Registered Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleForgotPassword}>
        <Text style={styles.buttonText}>Send Reset Code</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/login")}>
        <Text style={styles.linkText}>Back to Login</Text>
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
  button: { width: "100%", padding: 15, borderRadius: 8, alignItems: "center", backgroundColor: "#4CAF50", marginTop: 10 },
  buttonText: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  linkText: { marginTop: 15, color: "#4CAF50", textDecorationLine: "underline" },
});
