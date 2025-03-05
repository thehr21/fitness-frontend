import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  FlatList,
  Image,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://192.168.0.229:8000/community";

interface Comment {
  id: number;
  content: string;
  user: {
    id: number;
    full_name: string;
    username: string;
    profile_picture?: string;
  };
}

export default function CommentSection({ postId }: { postId: number }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [userId, setUserId] = useState<number | null>(null);

  // ✅ Fetch stored user ID
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedId = await AsyncStorage.getItem("user_id");
        if (storedId) {
          setUserId(parseInt(storedId, 10));
        }
      } catch (error) {
        console.error("❌ Error fetching user ID:", error);
      }
    };
    fetchUserId();
    fetchComments();
  }, []);

  // ✅ Fetch comments
  const fetchComments = async () => {
    try {
      const response = await fetch(`${API_URL}/comments/${postId}`);
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error("❌ Error fetching comments:", error);
    }
  };

  // ✅ Handle Adding a New Comment
  const handleAddComment = async () => {
    if (!newComment.trim()) {
      Alert.alert("⚠️ Error", "Comment cannot be empty!");
      return;
    }

    if (!userId) {
      Alert.alert("⚠️ Error", "User not found!");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/add-comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_id: postId,
          user_id: userId,
          content: newComment,
        }),
      });

      if (!response.ok) throw new Error("Failed to add comment");

      setNewComment("");
      fetchComments(); // Refresh comments after posting
    } catch (error) {
      console.error("❌ Error adding comment:", error);
      Alert.alert("❌ Error", "Could not post comment.");
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.commentItem}>
            <Image
              source={{ uri: item.user.profile_picture || "https://via.placeholder.com/50" }}
              style={styles.profilePic}
            />
            <View>
              <Text style={styles.userText}>{item.user.full_name} (@{item.user.username})</Text>
              <Text style={styles.comment}>{item.content}</Text>
            </View>
          </View>
        )}
      />

      {/* ✅ Comment Input Section */}
      <TextInput
        style={styles.input}
        placeholder="Write a comment..."
        value={newComment}
        onChangeText={setNewComment}
      />
      <Button title="Post" onPress={handleAddComment} />
    </View>
  );
}

// ✅ Styles
const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
  },
  commentItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#FFF",
    padding: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  comment: {
    fontSize: 14,
    paddingVertical: 4,
    color: "#555",
  },
  input: {
    height: 40,
    borderColor: "#CCC",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: "#FFF",
    marginBottom: 10,
  },
});

// export default CommentSection;
