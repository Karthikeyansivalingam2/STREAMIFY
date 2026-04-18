import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function Profile() {
  const router = useRouter();

  const menuItems = [
    { icon: "person-outline", title: "Edit Profile" },
    { icon: "notifications-outline", title: "Notifications" },
    { icon: "heart-outline", title: "Liked Songs" },
    { icon: "time-outline", title: "Recently Played" },
    { icon: "settings-outline", title: "Settings" },
    { icon: "help-circle-outline", title: "Help & Support" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <LinearGradient
            colors={["#6c63ff", "#4a45b8"]}
            style={styles.avatarGradient}
          >
            <Text style={styles.avatarText}>K</Text>
          </LinearGradient>
          <Text style={styles.username}>Karthikeyan</Text>
          <Text style={styles.email}>karthi@streamify.com</Text>
          
          <TouchableOpacity style={styles.editBtn}>
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem}>
              <View style={styles.menuLeft}>
                <Ionicons name={item.icon as any} size={22} color="#aaa" />
                <Text style={styles.menuTitle}>{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            onPress={() => router.replace("/login")}
            style={[styles.menuItem, { marginTop: 20 }]}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="log-out-outline" size={22} color="#ff4d4d" />
              <Text style={[styles.menuTitle, { color: "#ff4d4d" }]}>Logout</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.version}>Streamify v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0b1a",
  },
  header: {
    alignItems: "center",
    paddingVertical: 40,
  },
  avatarGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    elevation: 10,
    shadowColor: "#6c63ff",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  avatarText: {
    color: "#fff",
    fontSize: 40,
    fontWeight: "800",
  },
  username: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  email: {
    color: "#aaa",
    fontSize: 14,
    marginTop: 5,
  },
  editBtn: {
    marginTop: 20,
    backgroundColor: "rgba(108, 99, 255, 0.1)",
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(108, 99, 255, 0.3)",
  },
  editBtnText: {
    color: "#6c63ff",
    fontWeight: "700",
  },
  menuContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 18,
    borderRadius: 15,
    marginBottom: 12,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuTitle: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 15,
    fontWeight: "500",
  },
  footer: {
    alignItems: "center",
    paddingBottom: 40,
  },
  version: {
    color: "#444",
    fontSize: 12,
  },
});