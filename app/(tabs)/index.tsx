import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* ✅ Settings Button (Top Left) */}
      <TouchableOpacity onPress={() => router.push("/settings")} style={styles.settingsButton}>
        <Ionicons name="settings-outline" size={28} color="black" />
      </TouchableOpacity>

      {/* ✅ Profile Button (Top Right) */}
      <TouchableOpacity onPress={() => router.push("/profile")} style={styles.profileButton}>
        <Ionicons name="person-circle-outline" size={30} color="black" />
      </TouchableOpacity>

      {/* ✅ Centered Welcome Message */}
      <Ionicons name="fitness-outline" size={60} color="#4CAF50" style={styles.icon} />
      <Text style={styles.welcomeText}>Welcome to Fitness App!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F5F5F5" },
  settingsButton: { position: "absolute", top: 40, left: 20 },
  profileButton: { position: "absolute", top: 40, right: 20 }, // ✅ Added Profile button
  icon: { marginBottom: 20 },
  welcomeText: { fontSize: 24, fontWeight: "bold", color: "#333" },
});

