import { View, Text, StyleSheet } from "react-native";

export default function WorkoutPlanScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🏋️ Workout Plan</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#E3F2FD" },
  text: { fontSize: 20, fontWeight: "bold", color: "#333" },
});
