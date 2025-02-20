import { View, Text, StyleSheet } from "react-native";

export default function MealPlanningScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🍽️ Meal Planning</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFF3E0" },
  text: { fontSize: 20, fontWeight: "bold", color: "#333" },
});
