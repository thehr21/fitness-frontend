import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  Animated,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
  Modal,
  Pressable
} from "react-native";
import { useRouter } from "expo-router";
import { jwtDecode } from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

const getUserIdFromToken = async () => {
  try {
    const token = await AsyncStorage.getItem("access_token");
    if (!token) {
      console.error("No token found");
      return null;
    }
    const decodedToken: any = jwtDecode(token);
    return decodedToken.sub;
  } catch (error) {
    console.error("Error decoding token:", error);
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
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

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
        if (!response.ok) throw new Error("Failed to fetch user goal");
        const data = await response.json();
        setUserGoal(data.goal);
      } catch (error) {
        console.error("Failed to load user goal:", error);
        setError("Failed to load user goal");
      }
    };
    fetchUserGoal();
  }, [userId]);

  useEffect(() => {
    if (!userGoal) return;
    fetchMeals();
  }, [userGoal, filter]);

  const fetchMeals = async () => {
    try {
      setLoading(true);
      let url = `http://192.168.0.229:8000/meals/${userGoal}?refresh=true`;
      if (filter) url += `&filter=${filter}`;
      const response = await fetch(url);
      const data = await response.json();
      if (response.status === 402) {
        Alert.alert("API Limit Reached", "You’ve reached your daily meal request limit. Try again tomorrow.");
        return;
      }
      if (!response.ok) throw new Error(data.detail || "Failed to fetch meals");
      setMeals(data);
    } catch (error) {
      console.error("Failed to load meals:", error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchMeals();
    } catch (error) {
      Alert.alert("Error", "Could not refresh meals.");
    } finally {
      setRefreshing(false);
    }
  };

  const headerHeight = scrollY.interpolate({ inputRange: [0, 100], outputRange: [60, 0], extrapolate: "clamp" });
  const headerOpacity = scrollY.interpolate({ inputRange: [0, 100], outputRange: [1, 0], extrapolate: "clamp" });

  const filters = ["vegan", "low-carb", "diabetic", "gluten-free", "keto"];

  const logMeal = async (meal: Meal) => {
    try {
      console.log("Logging meal:", meal);
  
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
  
      Alert.alert(" Meal Logged!", `${meal.food_item} has been logged successfully.`);
  
      //meal streak tracker call 
      const streakResponse = await fetch("http://192.168.0.229:8000/gamification/log-activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, activity_type: "meal" }),
      });
  
      if (!streakResponse.ok) {
        console.error(" Failed to update meal streak.");
      } else {
        console.log(" Meal streak updated successfully!");
      }
  
    } catch (error) {
      console.error(" Meal logging error:", error);
      Alert.alert(" Error", "Could not log the meal. Please try again.");
    }
  };
  
  

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.header, { height: headerHeight, opacity: headerOpacity }]}>        
        <Text style={styles.subtitle}>GOAL: {userGoal ? userGoal.replace("_", " ").toUpperCase() : "Loading..."}</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons name="ellipsis-vertical" size={24} color="black" />
        </TouchableOpacity>
      </Animated.View>

      <Modal transparent visible={modalVisible} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ fontWeight: "bold", marginBottom: 10 }}>Choose Dietary Preference:</Text>
            {filters.map((item) => (
              <Pressable key={item} style={styles.modalButton} onPress={() => { setFilter(item); setModalVisible(false); }}>
                <Text style={styles.buttonText}>{item.toUpperCase()}</Text>
              </Pressable>
            ))}
            <Pressable style={styles.modalButton} onPress={() => { setFilter(null); setModalVisible(false); }}>
              <Text style={styles.buttonText}>DEFAULT</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : error ? (
        <Text style={styles.errorText}>❌ {error}</Text>
      ) : (
        <Animated.FlatList
          data={meals}
          keyExtractor={(item) => item.id.toString()}
          onScroll={Animated.event([
            { nativeEvent: { contentOffset: { y: scrollY } } }
          ], { useNativeDriver: false })}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={{ uri: item.image }} style={styles.mealImage} resizeMode="cover" />
              <Text style={styles.mealName}>{item.food_item}</Text>
              <Text>Calories: {item.calories} kcal</Text>
              <Text>Protein: {item.protein}g</Text>
              <Text>Carbs: {item.carbs}g</Text>
              <Text>Fats: {item.fats}g</Text>
              <TouchableOpacity style={styles.button} onPress={() => logMeal(item)}>
                <Text style={styles.buttonText}>Log Meal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={() => router.push({ pathname: "/recipe", params: { mealId: String(item.spoonacular_id) } })}>
                <Text style={styles.buttonText}>View Recipe</Text>
              </TouchableOpacity>
            </View>
          )}
          ListFooterComponent={<TouchableOpacity style={[styles.button, { marginTop: 20, marginBottom: 20 }]} onPress={() => router.push("/logged-meals")}><Text style={styles.buttonText}>View Logged Meals</Text></TouchableOpacity>}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff", paddingBottom: 100 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#ddd" },
  subtitle: { fontSize: 18, textAlign: "center", flex: 1 },
  card: { backgroundColor: "#f0f0f0", padding: 15, borderRadius: 10, marginBottom: 10, elevation: 2, alignItems: "center" },
  mealImage: { width: "100%", height: 150, borderRadius: 10, marginBottom: 10, backgroundColor: "#e0e0e0" },
  mealName: { fontSize: 18, fontWeight: "bold" },
  errorText: { fontSize: 16, color: "red", textAlign: "center", marginTop: 10 },
  button: { marginTop: 10, padding: 10, borderRadius: 8, backgroundColor: "#007bff", alignItems: "center", marginHorizontal: 5 },
  buttonText: { color: "#fff", fontSize: 14, textAlign: "center" },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.3)" },
  modalContent: { backgroundColor: "#fff", padding: 20, borderTopLeftRadius: 10, borderTopRightRadius: 10 },
  modalButton: { backgroundColor: "#007bff", padding: 12, marginBottom: 10, borderRadius: 8, alignItems: "center" }
});
