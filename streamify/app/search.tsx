import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 50) / 2;

export default function SearchScreen() {
  const categories = [
    { title: "Tamil Hits", color: ["#E91E63", "#FF5722"], image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop" },
    { title: "Melodies", color: ["#673AB7", "#3F51B5"], image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop" },
    { title: "Kuthu", color: ["#4CAF50", "#2E7D32"], image: "https://images.unsplash.com/photo-1514525253361-bee8a197c0c5?w=200&h=200&fit=crop" },
    { title: "AR Rahman", color: ["#3E2723", "#5D4037"], image: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=200&h=200&fit=crop" },
    { title: "Trending", color: ["#FF9800", "#F44336"], image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=200&h=200&fit=crop" },
    { title: "Discover", color: ["#00BCD4", "#2196F3"], image: "https://images.unsplash.com/photo-1459749411177-042180ce673c?w=200&h=200&fit=crop" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>K</Text>
          </View>
          <Text style={styles.title}>Search</Text>
          <TouchableOpacity>
            <Ionicons name="camera-outline" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* SEARCH BAR */}
        <View style={styles.searchBarWrapper}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            placeholder="What do you want to listen to?"
            placeholderTextColor="#666"
            style={styles.searchInput}
          />
        </View>

        {/* CATEGORIES */}
        <Text style={styles.sectionTitle}>Start browsing</Text>
        <View style={styles.grid}>
          {categories.map((item, index) => (
            <TouchableOpacity key={index} style={styles.cardWrapper}>
              <LinearGradient
                colors={item.color as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
              >
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Image source={{ uri: item.image }} style={styles.cardImage} />
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Discover something new</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.discoverScroll}>
             <View style={styles.discoverCard}>
                  <Image source={{ uri: 'https://images.unsplash.com/photo-1459749411177-042180ce673c?w=300' }} style={styles.discoverImage} />
                  <Text style={styles.discoverText}>Tamil hip hop</Text>
             </View>
             <View style={styles.discoverCard}>
                  <Image source={{ uri: 'https://images.unsplash.com/photo-1514525253361-bee8a197c0c5?w=300' }} style={styles.discoverImage} />
                  <Text style={styles.discoverText}>Party Vibes</Text>
             </View>
        </ScrollView>

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
    marginBottom: 25,
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
    fontSize: 24,
    fontWeight: "800",
    flex: 1,
    marginLeft: 15,
  },
  searchBarWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 30,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 15,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  cardWrapper: {
    width: CARD_WIDTH,
    height: 100,
    marginBottom: 15,
    borderRadius: 8,
    overflow: "hidden",
  },
  card: {
    flex: 1,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    width: "60%",
  },
  cardImage: {
    width: 60,
    height: 60,
    borderRadius: 4,
    position: "absolute",
    bottom: -10,
    right: -10,
    transform: [{ rotate: "25deg" }],
  },
  discoverScroll: {
    marginTop: 10,
  },
  discoverCard: {
    marginRight: 15,
    width: 150,
  },
  discoverImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
    backgroundColor: '#1c1c2e'
  },
  discoverText: {
    color: '#fff',
    marginTop: 8,
    fontWeight: '600'
  }
});