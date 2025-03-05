import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import CommentSection from "./CommentSection";

const API_URL = "http://192.168.0.229:8000/community";

interface Post {
  id: number;
  user: {
    id: number;
    full_name: string;
    username: string;
    profile_picture?: string;
  };
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
    <View style={styles.postContainer}>
      {/* ✅ Display Profile Picture & Name */}
      <View style={styles.userInfo}>
        <Image
          source={{ uri: post.user.profile_picture || "https://via.placeholder.com/50" }}
          style={styles.profilePic}
        />
        <Text style={styles.userText}>{post.user.full_name} (@{post.user.username})</Text>
      </View>

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
  postContainer: { padding: 15, backgroundColor: "#FFF", borderRadius: 10, marginBottom: 10 },
  userInfo: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  profilePic: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  userText: { fontSize: 14, fontWeight: "bold", color: "#333" },
  content: { fontSize: 16, color: "#333", marginBottom: 10 },
  media: { width: "100%", height: 200, borderRadius: 8 },
  actions: { flexDirection: "row", justifyContent: "space-between" },
  actionButton: { flexDirection: "row", alignItems: "center", padding: 5 },
  actionText: { marginLeft: 5, fontSize: 14, color: "#333" },
});

