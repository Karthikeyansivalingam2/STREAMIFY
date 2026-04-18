import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function LibraryScreen() {
  const playlists = [
    { title: "Liked Songs", subtitle: "Playlist • 4 songs", icon: "heart", color: ["#6c63ff", "#4a45b8"] },
    { title: "my playlist", subtitle: "Playlist • 2 songs", icon: "musical-notes", color: ["#333", "#1c1c2e"] },
  ];

  const filters = ["Playlists", "Artists", "Albums", "Downloaded"];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>K</Text>
          </View>
          <Text style={styles.title}>Your Library</Text>
          <TouchableOpacity>
            <Ionicons name="search" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* ACTION BUTTONS */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn}>
             <Ionicons name="folder-open-outline" size={20} color="#fff" />
             <Text style={styles.actionText}>Local Files</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.primaryBtn]}>
             <Ionicons name="add" size={24} color="#000" />
             <Text style={[styles.actionText, { color: '#000' }]}>New Playlist</Text>
          </TouchableOpacity>
        </View>

        {/* FILTERS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {filters.map((filter, index) => (
            <TouchableOpacity key={index} style={[styles.filterChip, index === 0 && styles.activeChip]}>
              <Text style={[styles.filterText, index === 0 && styles.activeText]}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* PLAYLIST LIST */}
        <View style={styles.listContainer}>
          {playlists.map((item, index) => (
            <TouchableOpacity key={index} style={styles.playlistItem}>
              <LinearGradient
                colors={item.color as any}
                style={styles.playlistIcon}
              >
                <Ionicons name={item.icon as any} size={24} color="#fff" />
              </LinearGradient>
              <View style={styles.playlistInfo}>
                <Text style={styles.playlistTitle}>{item.title}</Text>
                <Text style={styles.playlistSubtitle}>{item.subtitle}</Text>
              </View>
            </TouchableOpacity>
          ))}
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
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
    marginTop: 10,
  },
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: "#6c63ff",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontWeight: "bold",
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    flex: 1,
    marginLeft: 15,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    width: "48%",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  primaryBtn: {
    backgroundColor: "#fff",
  },
  actionText: {
    color: "#fff",
    fontWeight: "700",
    marginLeft: 8,
    fontSize: 14,
  },
  filterScroll: {
    marginBottom: 30,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  activeChip: {
    backgroundColor: "#6c63ff",
    borderColor: "#6c63ff",
  },
  filterText: {
    color: "#fff",
    fontWeight: "600",
  },
  activeText: {
    color: "#fff",
  },
  listContainer: {
    marginTop: 10,
  },
  playlistItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  playlistIcon: {
    width: 60,
    height: 60,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  playlistInfo: {
    marginLeft: 15,
  },
  playlistTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  playlistSubtitle: {
    color: "#aaa",
    fontSize: 14,
    marginTop: 2,
  },
});