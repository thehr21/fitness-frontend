import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router"; // ✅ Import router for navigation

export default function LoggedMealsScreen() {
  const router = useRouter(); // ✅ Router for back navigation

  interface LoggedMeal {
    id: number;
    food_item: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    timestamp: string;
  }

  const [loggedMeals, setLoggedMeals] = useState<LoggedMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = 1; // ⚡ Replace dynamically with logged-in user ID

  useEffect(() => {
    const fetchLoggedMeals = async () => {
      try {
        setLoading(true);
        console.log(`📌 Fetching logged meals for user ${userId}...`);
    
        const response = await fetch(`http://192.168.0.229:8000/log-meals/${userId}`); // ✅ Fixed API call
    
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
  }, []);
  
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

      {/* ✅ Button to Go Back */}
      <TouchableOpacity style={styles.button} onPress={() => router.back()}>
        <Text style={styles.buttonText}>🔙 Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#FFF3E0" },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  card: { backgroundColor: "#fff", padding: 15, borderRadius: 10, marginBottom: 10, elevation: 2 },
  mealName: { fontSize: 18, fontWeight: "bold" },
  errorText: { fontSize: 16, color: "red", textAlign: "center", marginTop: 10 },
  button: { marginTop: 20, padding: 15, borderRadius: 8, backgroundColor: "#4CAF50", alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
