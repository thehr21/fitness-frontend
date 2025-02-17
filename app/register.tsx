import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";

export default function Register() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ fullName: "", username: "", email: "", password: "" });

  // ✅ Password validation function
  const validatePassword = (password: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  // ✅ Check if email is already registered
  const checkEmailExists = async (email: string) => {
    try {
      const response = await fetch("http://192.168.0.229:8000/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail);
      }

      return true; // Email is available
    } catch (error) {
      if (error instanceof Error) {
        return error.message; // Email is already registered
      }
      return "An unknown error occurred"; // Fallback for unknown error type
    }
  };

  // ✅ Handle Next Button Click
  const handleNext = async () => {
    let newErrors = { fullName: "", username: "", email: "", password: "" };

    if (!fullName.trim()) newErrors.fullName = "Full Name is required!";
    if (!username.trim()) newErrors.username = "Username is required!";
    if (!email.trim()) newErrors.email = "Email is required!";
    if (!password.trim()) newErrors.password = "Password is required!";
    else if (!validatePassword(password)) newErrors.password = "Password must be 8+ characters with 1 uppercase, 1 lowercase, and 1 special character.";

    setErrors(newErrors);

    // ✅ Stop if there are validation errors
    if (Object.values(newErrors).some((err) => err !== "")) return;

    // ✅ Check if email is already registered
    const emailError = await checkEmailExists(email);
    if (emailError !== true) {
      setErrors((prevErrors) => ({ ...prevErrors, email: emailError }));
      return;
    }

    // ✅ If all validations pass, proceed
    router.push({
      pathname: "/register1",
      params: { fullName, username, email, password },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput style={styles.input} placeholder="Enter your full name" value={fullName} onChangeText={setFullName} />
        {errors.fullName ? <Text style={styles.error}>{errors.fullName}</Text> : null}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Username</Text>
        <TextInput style={styles.input} placeholder="Choose a username" autoCapitalize="none" value={username} onChangeText={setUsername} />
        {errors.username ? <Text style={styles.error}>{errors.username}</Text> : null}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} placeholder="Enter your email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
        {errors.email ? <Text style={styles.error}>{errors.email}</Text> : null}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <TextInput style={styles.input} placeholder="Create a password" secureTextEntry value={password} onChangeText={setPassword} />
        {errors.password ? <Text style={styles.error}>{errors.password}</Text> : null}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/login")}>
        <Text style={styles.loginText}>Already have an account? Login</Text>
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
  button: { width: "100%", padding: 15, borderRadius: 8, alignItems: "center", backgroundColor: "#4CAF50", marginTop: 10 },
  buttonText: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  loginText: { marginTop: 15, color: "#4CAF50", textDecorationLine: "underline" },
});

