import { useEffect, useState } from "react";
import { View, Text, Image, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  mealImage: {
    width: "100%",
    height: 250,
    borderRadius: 10,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  ingredientText: {
    fontSize: 16,
    marginBottom: 3,
  },
  instructionsText: {
    fontSize: 16,
    lineHeight: 22,
  },
  button: {
    marginTop: 20,
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#007bff",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default function RecipeScreen() {
  const router = useRouter();
  const { mealId } = useLocalSearchParams();
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        console.log(`📌 Fetching recipe for Meal ID: ${mealId}...`);

        if (!mealId) {
          throw new Error("Invalid meal ID received.");
        }

        const response = await fetch(`https://api.spoonacular.com/recipes/${mealId}/information?apiKey=7363ee96fb6445b8b7c6d135b861ff0a`);

        if (!response.ok) {
          throw new Error("Recipe details not found for this meal.");
        }

        const data = await response.json();
        console.log("✅ Recipe Details Fetched from API:", JSON.stringify(data, null, 2));

        setRecipe(data);
      } catch (error) {
        console.error("❌ Error fetching recipe details:", error);
        setError(error instanceof Error ? error.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (mealId) {
      fetchRecipe();
    }
  }, [mealId]);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : error ? (
        <Text style={{ color: "red", fontSize: 16, textAlign: "center" }}>❌ {error}</Text>
      ) : recipe ? (
        <FlatList
          ListHeaderComponent={
            <>
              <Text style={styles.title}>{recipe.title}</Text>
              <Image source={{ uri: recipe.image }} style={styles.mealImage} />
              <Text style={styles.sectionTitle}>🛒 Ingredients:</Text>
            </>
          }
          data={recipe.extendedIngredients}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => <Text style={styles.ingredientText}>- {item.original}</Text>}
          ListFooterComponent={
            <>
              <Text style={styles.sectionTitle}>📖 Instructions:</Text>
              <Text style={styles.instructionsText}>
                {recipe.analyzedInstructions?.length > 0
                  ? recipe.analyzedInstructions[0].steps.map((step: { step: string }, index: number) => `${index + 1}. ${step.step}`).join("\n")
                  : recipe.instructions || "No instructions available."}
              </Text>

              <TouchableOpacity style={styles.button} onPress={() => router.back()}>
                <Text style={styles.buttonText}>🔙 Go Back</Text>
              </TouchableOpacity>
            </>
          }
        />
      ) : (
        <Text style={{ fontSize: 18, textAlign: "center" }}>No recipe found.</Text>
      )}
    </View>
  );
}