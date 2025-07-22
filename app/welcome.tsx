import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function Welcome() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wellness</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          console.log(" Sign Up Button Clicked! Navigating to /register...");
          router.push("/register");
        }}
      >
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={() => {
          console.log(" Login Button Clicked! Navigating to /login...");
          router.push("/login");
        }}
      >
        <Text style={styles.buttonText}>Login</Text>
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
    fontSize: 32, // Increased font size for better visibility
    fontWeight: "bold",
    marginBottom: 60, // Moved the heading higher
    color: "#333",
  },
  button: {
    width: "80%", // Made the buttons wider
    paddingVertical: 15, // Increased vertical padding for better touch area
    borderRadius: 10, // Slightly rounded corners for a modern look
    alignItems: "center",
    backgroundColor: "#007BFF", // Blue color for the primary button
    marginBottom: 20, // Added more spacing between buttons
  },
  secondaryButton: {
    backgroundColor: "#0056b3", // Slightly darker blue for the secondary button
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
});