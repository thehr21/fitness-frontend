import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  FlatList,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import PostItem from "../PostItem";

const API_URL = "http://192.168.0.229:8000/community"; // Backend URL

function CommunityScreen() {
  interface Post {
    id: number;
    content: string;
    media_url?: string;
    user_id: number;
    likes: number;
  }

  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostText, setNewPostText] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);

  // ✅ Fetch posts
  const fetchPosts = async () => {
    try {
      const response = await fetch(`${API_URL}/posts`);
      const data = await response.json();
      setPosts(data.reverse());
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // ✅ Handle Creating a New Post
  const createPost = async () => {
    if (!newPostText.trim() && !selectedMedia) return;

    try {
      const response = await fetch(`${API_URL}/create-post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: 1,
          content: newPostText,
          media_url: selectedMedia,
        }),
      });

      if (!response.ok) throw new Error("Failed to create post");

      setNewPostText("");
      setSelectedMedia(null);
      fetchPosts();
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  // ✅ Handle Media Upload
  const pickMedia = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedMedia(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>🌿 Wellness</Text>
      </View>

      <View style={styles.createPostContainer}>
        <TextInput
          style={styles.input}
          placeholder="What's on your mind?"
          placeholderTextColor="#999"
          value={newPostText}
          onChangeText={setNewPostText}
        />
        {selectedMedia && (
          <Image source={{ uri: selectedMedia }} style={styles.previewImage} />
        )}
        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={pickMedia}>
            <Text style={styles.photoText}>Add Photo/Video</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={createPost}>
            <Text style={styles.postText}>Post</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ✅ Render Posts using FlatList */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <PostItem post={item} />}
        contentContainerStyle={styles.postsContainer}
        ListFooterComponent={<View style={{ height: 80 }} />} // Space for bottom nav
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    borderBottomWidth: 1,
    borderBottomColor: "#DDD",
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  createPostContainer: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    margin: 15,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    color: "#333",
    backgroundColor: "#FAFAFA",
  },
  previewImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 5,
  },
  photoText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#666",
  },
  postText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007BFF", // ✅ Blue text for Post button
  },
  postsContainer: {
    paddingHorizontal: 15,
  },
});

export default CommunityScreen;
