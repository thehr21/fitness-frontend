import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";

export default function MealPlanningScreen() {
  interface Meal {
    id: number;
    food_item: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  }

  const [meals, setMeals] = useState<Meal[]>([]); // Stores fetched meals
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userGoal = "weight_loss"; // ⚡ Replace this with the actual user goal dynamically

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://192.168.0.229:8000/meals/${userGoal}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch meals");
        }

        const data = await response.json();
        setMeals(data);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🍽️ Meal Planning</Text>
      <Text style={styles.subtitle}>🎯 Goal: {userGoal.replace("_", " ").toUpperCase()}</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : error ? (
        <Text style={styles.errorText}>❌ {error}</Text>
      ) : (
        <FlatList
          data={meals}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.mealName}>{item.food_item}</Text>
              <Text>Calories: {item.calories} kcal</Text>
              <Text>Protein: {item.protein}g</Text>
              <Text>Carbs: {item.carbs}g</Text>
              <Text>Fats: {item.fats}g</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#FFF3E0" },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  subtitle: { fontSize: 18, textAlign: "center", marginBottom: 20 },
  card: { backgroundColor: "#fff", padding: 15, borderRadius: 10, marginBottom: 10, elevation: 2 },
  mealName: { fontSize: 18, fontWeight: "bold" },
  errorText: { fontSize: 16, color: "red", textAlign: "center", marginTop: 10 },
});
