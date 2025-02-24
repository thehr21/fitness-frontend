import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { jwtDecode } from "jwt-decode";  // ✅ Correct import
import AsyncStorage from "@react-native-async-storage/async-storage";

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#FFF3E0" },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  card: { backgroundColor: "#fff", padding: 15, borderRadius: 10, marginBottom: 10, elevation: 2 },
  mealName: { fontSize: 18, fontWeight: "bold" },
  errorText: { fontSize: 16, color: "red", textAlign: "center", marginTop: 10 },
  button: { marginTop: 20, padding: 15, borderRadius: 8, backgroundColor: "#4CAF50", alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

const getUserIdFromToken = async () => {
  try {
    const token = await AsyncStorage.getItem("access_token");
    if (!token) {
      console.error("⚠️ No token found");
      return null;
    }

    const decodedToken: any = jwtDecode(token);
    console.log("🔑 Decoded Token:", decodedToken);
    return decodedToken.sub;  // ✅ Correctly extracts user ID from the token
  } catch (error) {
    console.error("⚠️ Error decoding token:", error);
    return null;
  }
};

export default function LoggedMealsScreen() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  interface Meal {
    id: number;
    food_item: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    timestamp: string;
  }

  const [loggedMeals, setLoggedMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await getUserIdFromToken();
      setUserId(id);
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    if (!userId) return; // ✅ Wait until userId is fetched before making API request

    const fetchLoggedMeals = async () => {
      try {
        setLoading(true);
        console.log(`📌 Fetching logged meals for user ${userId}...`);

        const response = await fetch(`http://192.168.0.229:8000/log-meals/${userId}`); // ✅ Uses correct user ID

        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(`Failed to fetch logged meals: ${errorMessage}`);
        }

        const data = await response.json();
        console.log("✅ Logged Meals Response:", data);
        setLoggedMeals(data);
      } catch (error) {
        console.error("❌ Error fetching logged meals:", error);
        setError(error instanceof Error ? error.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchLoggedMeals();
  }, [userId]); // ✅ Fetches meals only when userId is available

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📋 Logged Meals</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : error ? (
        <Text style={styles.errorText}>❌ {error}</Text>
      ) : (
        <FlatList
          data={loggedMeals}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.mealName}>{item.food_item}</Text>
              <Text>Calories: {item.calories} kcal</Text>
              <Text>Protein: {item.protein}g</Text>
              <Text>Carbs: {item.carbs}g</Text>
              <Text>Fats: {item.fats}g</Text>
              <Text>🕒 Logged on: {new Date(item.timestamp).toLocaleString()}</Text>
            </View>
          )}
        />
      )}

      <TouchableOpacity style={styles.button} onPress={() => router.back()}>
        <Text style={styles.buttonText}>🔙 Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}
