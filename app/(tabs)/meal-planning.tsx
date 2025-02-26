import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Image } from "react-native";
import { useRouter } from "expo-router";
import { jwtDecode } from "jwt-decode"; 
import AsyncStorage from "@react-native-async-storage/async-storage";


const getUserIdFromToken = async () => {
  try {
    const token = await AsyncStorage.getItem("access_token");
    if (!token) {
      console.error("⚠️ No token found");
      return null;
    }

    const decodedToken: any = jwtDecode(token);
    console.log("🔑 Decoded Token:", decodedToken);
    return decodedToken.sub;
  } catch (error) {
    console.error("⚠️ Error decoding token:", error);
    return null;
  }
};

export default function MealPlanningScreen() {
  const router = useRouter();

  interface Meal {
    id: number;
    spoonacular_id: number;
    food_item: string;
    image: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  }

  const [userId, setUserId] = useState<number | null>(null);
  const [userGoal, setUserGoal] = useState<string | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
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
    if (!userId) return;
  
    const fetchUserGoal = async () => {
      try {
        const response = await fetch(`http://192.168.0.229:8000/auth/user-goal?user_id=${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch user goal");
        }
        const data = await response.json();
        console.log("🔍 User Goal Fetched:", data);
        setUserGoal(data.goal);
      } catch (error) {
        console.error("⚠️ Failed to load user goal:", error);
        setError("Failed to load user goal");
      }
    };
  
    fetchUserGoal();
  }, [userId]);

  useEffect(() => {
    if (!userGoal) return;
  
    const fetchMeals = async () => {
      try {
        setLoading(true);
        console.log(`📌 Fetching meals for goal: ${userGoal}...`); 
    
        console.log("🛠️ Checking userGoal before API call:", userGoal); 
    
        const response = await fetch(`http://192.168.0.229:8000/meals/${userGoal}?refresh=true`);
        
        const data = await response.json(); // ✅ Parse response JSON first
    
        if (response.status === 402) {  // ✅ Handle Spoonacular API limit reached
          console.error("❌ Spoonacular API limit reached!");
          Alert.alert(
            "⚠️ API Limit Reached",
            "You’ve reached your daily meal request limit. Try again tomorrow."
          );
          return; // ✅ Stop execution here
        }
    
        if (!response.ok) {
          throw new Error(data.detail || "Failed to fetch meals"); // ✅ Show API error message
        }
    
        console.log("✅ Fetched Meals Data:", JSON.stringify(data, null, 2)); 
    
        setMeals(data);
      } catch (error) {
        console.error("⚠️ Failed to load meals:", error);
        setError(error instanceof Error ? error.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };
    
    
    fetchMeals();
  }, [userGoal]);
  

  const logMeal = async (meal: Meal) => {
    try {
      console.log("📝 Logging meal:", meal);
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
        throw new Error("Failed to log meal");
      }
      Alert.alert("✅ Meal Logged!", `${meal.food_item} has been logged successfully.`);
    } catch (error) {
      console.error("❌ Meal logging error:", error);
      Alert.alert("❌ Error", "Could not log the meal. Please try again.");
    }
  };

  const refreshMeals = async () => {
    try {
      setLoading(true);
      console.log("🔄 Refreshing meals...");
      const response = await fetch(`http://192.168.0.229:8000/meals/${userGoal}?refresh=true`);
      if (!response.ok) {
        throw new Error("Failed to fetch new meals");
      }
      const data = await response.json();
      console.log("🔄 New Meals Fetched:", data);
      setMeals(data);
    } catch (error) {
      console.error("❌ Failed to refresh meals:", error);
      Alert.alert("Error", "Could not refresh meals.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>🎯 Goal: {userGoal ? userGoal.replace("_", " ").toUpperCase() : "Loading..."}</Text>
        <TouchableOpacity style={styles.button} onPress={refreshMeals}>
          <Text>🔄</Text>
        </TouchableOpacity>
      </View>

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
              <Image source={{ uri: item.image || "https://via.placeholder.com/100" }} style={styles.mealImage} />
              <Text style={styles.mealName}>{item.food_item}</Text>
              <Text>Calories: {item.calories} kcal</Text>
              <Text>Protein: {item.protein}g</Text>
              <Text>Carbs: {item.carbs}g</Text>
              <Text>Fats: {item.fats}g</Text>

              <TouchableOpacity style={styles.button} onPress={() => logMeal(item)}>
                <Text style={styles.buttonText}>🍽️ Log Meal</Text>
              </TouchableOpacity>

              <TouchableOpacity 
               style={styles.button} 
                onPress={() => {
                console.log("📌 Navigating to Recipe Screen with Spoonacular Recipe ID:", item.spoonacular_id);
                 router.push({
                pathname: "/recipe",
               params: { mealId: String(item.spoonacular_id) } // ✅ Use Spoonacular ID, not custom ID
                    });
                   }}>
               <Text style={styles.buttonText}>📖 View Recipe</Text>
              </TouchableOpacity>

            </View>
          )}
          ListFooterComponent={
            <TouchableOpacity style={[styles.button, { marginTop: 20, marginBottom: 20 }]} onPress={() => router.push("/logged-meals")}>
              <Text style={styles.buttonText}>📋 View Logged Meals</Text>
            </TouchableOpacity>
          }
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    flex: 1,
  },
  card: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    alignItems: "center",
  },
  mealImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#e0e0e0",
  },
  mealName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginTop: 10,
  },
  button: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#007bff",
    alignItems: "center",
    marginHorizontal: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
});