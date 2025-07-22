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
import { useRouter } from "expo-router";

const API_URL = "http://192.168.0.229:8000";

export default function ProfileScreen() {
  const [userId, setUserId] = useState<number | null>(null);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [currentWeight, setCurrentWeight] = useState("");
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchUserId = async () => {
      const storedId = await AsyncStorage.getItem("user_id");
      if (storedId) setUserId(parseInt(storedId, 10));
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    if (userId !== null) fetchProfile(userId);
  }, [userId]);

  const fetchProfile = async (id: number) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/profile/${id}`);
      const data = await res.json();

      setFullName(data.full_name);
      setUsername(data.username);
      setEmail(data.email);
      setProfilePicture(data.profile_picture);
      setCurrentWeight(data.current_weight?.toString() || "");
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      aspect: [1, 1],
    });

    if (!result.canceled) uploadProfilePicture(result.assets[0].uri);
  };

  const uploadProfilePicture = async (imageUri: string) => {
    const formData = new FormData();
    formData.append("file", {
      uri: imageUri,
      name: "profile.jpg",
      type: "image/jpg",
    } as any);

    try {
      await fetch(`${API_URL}/profile/${userId}/upload-picture`, {
        method: "POST",
        headers: { "Content-Type": "multipart/form-data" },
        body: formData,
      });
      Alert.alert("✅ Profile picture updated!");
      fetchProfile(userId as number);
    } catch (err) {
      console.error("Error uploading:", err);
    }
  };

  const updateProfile = async () => {
    try {
      await fetch(`${API_URL}/profile/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName, username, current_weight: currentWeight }),
      });
      Alert.alert("✅ Profile updated!");
      setEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace("/login");
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : (
        <>
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: profilePicture || "https://via.placeholder.com/150" }}
              style={styles.profileImage}
            />
            <TouchableOpacity onPress={pickImage} style={styles.editIcon}>
              <Ionicons name="camera-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.input} value={fullName} onChangeText={setFullName} editable={editing} />

          <Text style={styles.label}>Username</Text>
          <TextInput style={styles.input} value={username} onChangeText={setUsername} editable={editing} />

          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} value={email} editable={false} />

          <Text style={styles.label}>Current Weight (kg)</Text>
          <TextInput
            style={styles.input}
            value={currentWeight}
            onChangeText={setCurrentWeight}
            editable={editing}
            keyboardType="numeric"
          />

          {editing ? (
            <TouchableOpacity style={styles.saveButton} onPress={updateProfile}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.editButton} onPress={() => setEditing(true)}>
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          )}

          {/* 🔐 Log Out */}
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

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
    width: "100%",
    alignItems: "center",
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
    width: "100%",
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutButton: {
    marginTop: 25,
    padding: 12,
    borderRadius: 5,
    backgroundColor: "#f44336",
    width: "100%",
    alignItems: "center",
  },
  logoutText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

