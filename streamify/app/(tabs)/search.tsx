import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, SafeAreaView, ActivityIndicator } from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { discoverSongs } from "../../services/api";
import { usePlayer } from "../../context/PlayerContext";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 50) / 2;

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { playSong } = usePlayer();

  const categories = [
    { title: "Tamil Hits", query: "latest tamil", color: ["#E91E63", "#FF5722"], image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop" },
    { title: "Melodies", query: "tamil melody", color: ["#673AB7", "#3F51B5"], image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop" },
    { title: "Kuthu", query: "tamil kuthu", color: ["#4CAF50", "#2E7D32"], image: "https://images.unsplash.com/photo-1514525253361-bee8a197c0c5?w=200&h=200&fit=crop" },
    { title: "AR Rahman", query: "ar rahman tamil", color: ["#3E2723", "#5D4037"], image: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=200&h=200&fit=crop" },
  ];

  const handleSearch = async (searchTerm: string) => {
    if (!searchTerm) return;
    setLoading(true);
    setQuery(searchTerm);
    const data = await discoverSongs(searchTerm);
    setResults(data);
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.scrollContent}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Search</Text>
          <TouchableOpacity>
            <Ionicons name="camera-outline" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* SEARCH BAR */}
        <View style={styles.searchBarWrapper}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            placeholder="Search for Tamil songs, artists..."
            placeholderTextColor="#666"
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => handleSearch(query)}
            returnKeyType="search"
          />
          {query !== "" && (
              <TouchableOpacity onPress={() => { setQuery(""); setResults([]); }}>
                  <Ionicons name="close-circle" size={20} color="#aaa" />
              </TouchableOpacity>
          )}
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {loading ? (
             <ActivityIndicator size="large" color="#6c63ff" style={{ marginTop: 50 }} />
          ) : results.length > 0 ? (
            <View style={styles.resultsContainer}>
               <Text style={styles.sectionTitle}>Search Results</Text>
               {results.map((item, index) => (
                 <TouchableOpacity key={index} style={styles.songItem} onPress={() => playSong(item, results)}>
                    <Image source={{ uri: item.image }} style={styles.songImage} />
                    <View style={styles.songInfo}>
                        <Text style={styles.songTitle} numberOfLines={1}>{item.title}</Text>
                        <Text style={styles.songArtist} numberOfLines={1}>{item.artist}</Text>
                    </View>
                    <Ionicons name="play-circle" size={30} color="#6c63ff" />
                 </TouchableOpacity>
               ))}
            </View>
          ) : (
            <>
              {/* CATEGORIES */}
              <Text style={styles.sectionTitle}>Start browsing</Text>
              <View style={styles.grid}>
                {categories.map((item, index) => (
                  <TouchableOpacity key={index} style={styles.cardWrapper} onPress={() => handleSearch(item.query)}>
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
                   <TouchableOpacity style={styles.discoverCard} onPress={() => handleSearch("tamil hip hop")}>
                        <Image source={{ uri: 'https://images.unsplash.com/photo-1459749411177-042180ce673c?w=300' }} style={styles.discoverImage} />
                        <Text style={styles.discoverText}>Tamil hip hop</Text>
                   </TouchableOpacity>
                   <TouchableOpacity style={styles.discoverCard} onPress={() => handleSearch("tamil melody")}>
                        <Image source={{ uri: 'https://images.unsplash.com/photo-1514525253361-bee8a197c0c5?w=300' }} style={styles.discoverImage} />
                        <Text style={styles.discoverText}>Party Vibes</Text>
                   </TouchableOpacity>
              </ScrollView>
            </>
          )}
          <View style={{ height: 150 }} />
        </ScrollView>
      </View>
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
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 25,
    marginTop: 10,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
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
  resultsContainer: {
    marginTop: 10,
  },
  songItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
  },
  songImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  songInfo: {
    flex: 1,
    marginLeft: 15,
  },
  songTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  songArtist: {
    color: "#aaa",
    fontSize: 12,
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
  },
  miniPlayer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#1c1c2e',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)'
  },
  miniPlayerImage: {
    width: 40,
    height: 40,
    borderRadius: 5
  },
  miniPlayerTitle: {
    color: '#fff',
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '700'
  }
});

