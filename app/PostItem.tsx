import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import CommentSection from "./CommentSection";

const API_URL = "http://192.168.0.229:8000/community";

interface Post {
  id: number;
  user_id: number;
  content: string;
  media_url?: string;
  likes: number;
}

export default function PostItem({ post }: { post: Post }) {
  const [likes, setLikes] = useState(post.likes);
  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const handleLike = async () => {
    try {
      const response = await fetch(`${API_URL}/like/${post.id}`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to toggle like");

      setLikes((prevLikes) => (liked ? prevLikes - 1 : prevLikes + 1));
      setLiked(!liked);
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  return (
    <View style={[styles.postContainer, !post.media_url && styles.smallPost]}>
      <Text style={styles.userText}>User {post.user_id}</Text>
      <Text style={styles.content}>{post.content}</Text>

      {post.media_url && (
        <Image source={{ uri: post.media_url }} style={styles.media} resizeMode="cover" />
      )}

      <View style={styles.actions}>
        <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
          <FontAwesome name="heart" size={20} color={liked ? "red" : "gray"} />
          <Text style={styles.actionText}>{likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowComments(!showComments)}
        >
          <FontAwesome name="comment" size={20} color="#555" />
          <Text style={styles.actionText}>Comment</Text>
        </TouchableOpacity>
      </View>

      {showComments && <CommentSection postId={post.id} />}
    </View>
  );
}

const styles = StyleSheet.create({
  postContainer: {
    backgroundColor: "#FFF",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  smallPost: { paddingVertical: 8 },
  userText: { fontSize: 14, fontWeight: "bold", color: "#666", marginBottom: 5 },
  content: { fontSize: 16, color: "#333", marginBottom: 10 },
  media: { width: "100%", height: 200, borderRadius: 8, marginBottom: 10 },
  actions: { flexDirection: "row", justifyContent: "space-between" },
  actionButton: { flexDirection: "row", alignItems: "center", padding: 5 },
  actionText: { marginLeft: 5, fontSize: 14, color: "#333" },
});
