import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function CreatePost({ onPostCreated }: { onPostCreated: () => void }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePostSubmit = async () => {
    if (!content.trim()) {
      Alert.alert("⚠️ Error", "Post content cannot be empty!");
      return;
    }

    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem("user_id");
      if (!userId) {
        Alert.alert("⚠️ Error", "User not logged in!");
        return;
      }

      const response = await fetch("http://192.168.0.229:8000/community/create-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: parseInt(userId, 10),
          content,
        }),
      });

      if (!response.ok) throw new Error("Failed to create post");

      Alert.alert(" Success", "Your post has been created!");
      setContent(""); // Clear input
      onPostCreated(); // Refresh post list
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(" Error", error.message);
      } else {
        Alert.alert(" Error", "An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>📝 Create a New Post</Text>
      <TextInput
        style={styles.input}
        placeholder="What's on your mind?"
        multiline
        value={content}
        onChangeText={setContent}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : (
        <Button title="Post" onPress={handlePostSubmit} color="#4CAF50" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#FFF",
    borderRadius: 10,
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 8,
    padding: 10,
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 10,
  },
});
