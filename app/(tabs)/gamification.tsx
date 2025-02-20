import { View, Text, StyleSheet } from "react-native";

export default function GamificationScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🏆 Gamification</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFFDE7" },
  text: { fontSize: 20, fontWeight: "bold", color: "#333" },
});
