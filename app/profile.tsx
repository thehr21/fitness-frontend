import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

const API_URL = "http://192.168.0.229:8000"; // ✅ Ensure this matches your backend

export default function ProfileScreen() {
  const [userId, setUserId] = useState<number | null>(null);
  const [fullName, setFullName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false); // ✅ Controls edit mode

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedId = await AsyncStorage.getItem("user_id");
        if (storedId) {
          setUserId(parseInt(storedId, 10));
        }
      } catch (error) {
        console.error("Error fetching user ID:", error);
      }
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    if (userId !== null) {
      fetchProfile(userId);
    }
  }, [userId]);

  const fetchProfile = async (id: number) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/profile/${id}`);
      if (!response.ok) throw new Error("Failed to fetch profile");

      const data = await response.json();
      setFullName(data.full_name);
      setUsername(data.username);
      setEmail(data.email);
      setProfilePicture(data.profile_picture);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      uploadProfilePicture(result.assets[0].uri);
    }
  };

  const uploadProfilePicture = async (imageUri: string) => {
    let formData = new FormData();
    const file = {
      uri: imageUri,
      name: "profile.jpg",
      type: "image/jpg",
    } as any;
    formData.append("file", file);

    try {
      const response = await fetch(`${API_URL}/profile/${userId}/upload-picture`, {
        method: "POST",
        body: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!response.ok) throw new Error("Upload failed");

      Alert.alert("✅ Profile Picture Updated!");
      fetchProfile(userId as number);
    } catch (error) {
      console.error("Error uploading profile picture:", error);
    }
  };

  const updateProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/profile/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName, username }),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      Alert.alert("✅ Profile Updated!");
      setEditing(false); // ✅ Disable edit mode after saving
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : (
        <>
          {/* ✅ Profile Picture */}
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: profilePicture || "https://via.placeholder.com/150" }}
              style={styles.profileImage}
            />
            <TouchableOpacity onPress={pickImage} style={styles.editIcon}>
              <Ionicons name="camera-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* ✅ User Info */}
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            editable={editing}
          />

          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            editable={editing}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} value={email} editable={false} />

          {/* ✅ Buttons */}
          {editing ? (
            <TouchableOpacity onPress={updateProfile} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setEditing(true)} style={styles.editButton}>
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
}

// ✅ Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    padding: 20,
    alignItems: "center",
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#4CAF50",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    alignSelf: "flex-start",
    marginBottom: 5,
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "#CCC",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: "#F9F9F9",
  },
  editButton: {
    backgroundColor: "#2196F3",
    padding: 12,
    borderRadius: 5,
    marginTop: 10,
  },
  editButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 5,
    marginTop: 10,
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

