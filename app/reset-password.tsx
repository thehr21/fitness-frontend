import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function ResetPassword() {
  const router = useRouter();
  const { email } = useLocalSearchParams(); // ✅ Get email from params

  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ✅ Password validation function
  const validatePassword = (password: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const handleResetPassword = async () => {
    if (!resetCode.trim()) {
      Alert.alert("Error", "Please enter the reset code sent to your email.");
      return;
    }
    if (!newPassword || !confirmPassword) {
      Alert.alert("Error", "Please enter and confirm your new password.");
      return;
    }
    if (!validatePassword(newPassword)) {
      Alert.alert("Weak Password", "Password must be at least 8 characters long, contain 1 uppercase, 1 lowercase, 1 digit, and 1 special character.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    console.log("📌 Sending password reset request...");

    try {
      const response = await fetch("http://192.168.0.229:8000/auth/reset-password", { // ✅ Ensure correct IP
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, reset_code: resetCode, new_password: newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.log("❌ Reset Password Error:", data);
        throw new Error(data.detail || "Something went wrong.");
      }

      console.log("✅ Password Reset Successful:", data);
      Alert.alert("Success", "Your password has been reset!");
      router.push("/welcome"); // 🚀 Redirect to welcome screen after success
    } catch (error) {
      console.log("🔴 Reset Password Error:", error);
      Alert.alert("Error", (error as Error).message || "Something went wrong.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Reset Code</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter the reset code"
          keyboardType="numeric"
          value={resetCode}
          onChangeText={setResetCode}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>New Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter new password"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Confirm new password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
        <Text style={styles.buttonText}>Reset Password</Text>
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

