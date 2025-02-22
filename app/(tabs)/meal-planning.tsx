import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";  

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#FFF3E0" },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  subtitle: { fontSize: 18, textAlign: "center", marginBottom: 20 },
  card: { backgroundColor: "#fff", padding: 15, borderRadius: 10, marginBottom: 10, elevation: 2 },
  mealName: { fontSize: 18, fontWeight: "bold" },
  errorText: { fontSize: 16, color: "red", textAlign: "center", marginTop: 10 },
  button: { marginTop: 10, padding: 10, borderRadius: 5, backgroundColor: "#4CAF50", alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

export default function MealPlanningScreen() {
  const router = useRouter();  

  interface Meal {
    id: number;
    food_item: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  }

  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userGoal = "weight_loss";  
  const userId = 1;  

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
        setError(error instanceof Error ? error.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, []);

  const logMeal = async (meal: Meal) => {
    try {
        console.log("Sending request with payload:", {
            user_id: userId,
            food_item: meal.food_item,
            calories: meal.calories,
            protein: meal.protein,
            carbs: meal.carbs,
            fats: meal.fats,
        });

        const response = await fetch("http://192.168.0.229:8000/log-meals/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: userId,
                food_item: meal.food_item,
                calories: meal.calories,
                protein: meal.protein,
                carbs: meal.carbs,
                fats: meal.fats,
            }),
        });

        if (!response.ok) {
            const errorResponse = await response.json();
            console.error("Failed to log meal. Response:", errorResponse);
            throw new Error("Failed to log meal");
        }

        const data = await response.json();
        console.log("Meal logged successfully. Response:", data);

        Alert.alert("✅ Meal Logged!", `${meal.food_item} has been logged successfully.`);
    } catch (error) {
        console.error("Error logging meal:", error);
        Alert.alert("❌ Error", "Could not log the meal. Please try again.");
    }
  };

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

              <TouchableOpacity style={styles.button} onPress={() => logMeal(item)}>
                <Text style={styles.buttonText}>Log Meal</Text>
              </TouchableOpacity>
            </View>
          )}
          ListFooterComponent={(
            <TouchableOpacity style={[styles.button, { marginBottom: 20 }]} onPress={() => router.push("/logged-meals")}>
              <Text style={styles.buttonText}>📋 View Logged Meals</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 20 }} // ✅ Ensures scrolling works smoothly
        />
      )}
    </View>
  );
}