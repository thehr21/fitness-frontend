import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, FlatList } from "react-native";

const API_URL = "http://192.168.0.229:8000/community";

export default function CommentSection({ postId }: { postId: number }) {
  const [comments, setComments] = useState<{ id: number; content: string }[]>([]);
  const [newComment, setNewComment] = useState("");

  const fetchComments = async () => {
    try {
      const response = await fetch(`${API_URL}/comments/${postId}`);
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
  
    try {
      const response = await fetch(`${API_URL}/add-comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_id: postId,
          user_id: 1, // Replace with dynamic user_id
          content: newComment,
        }),
      });
  
      if (!response.ok) throw new Error("Failed to add comment");
  
      setNewComment("");
      fetchComments(); // Refresh comments
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };
  

  return (
    <View style={styles.container}>
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <Text style={styles.comment}>{item.content}</Text>}
      />

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

const styles = StyleSheet.create({
  container: { marginTop: 10, padding: 10, backgroundColor: "#F0F0F0", borderRadius: 8 },
  comment: { fontSize: 14, paddingVertical: 4 },
  input: { height: 40, borderColor: "#CCC", borderWidth: 1, marginBottom: 5, paddingHorizontal: 8 },
});
