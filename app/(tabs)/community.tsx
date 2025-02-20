import { View, Text, StyleSheet } from "react-native";

export default function CommunityScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>👥 Community</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#E8F5E9" },
  text: { fontSize: 20, fontWeight: "bold", color: "#333" },
});
