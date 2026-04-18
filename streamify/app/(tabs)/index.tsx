import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ScrollView, Dimensions, SafeAreaView, Modal, Alert, TextInput } from "react-native";

import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { getSongs, discoverSongs } from "../../services/api";

import { Ionicons } from "@expo/vector-icons";
import { usePlayer } from "../../context/PlayerContext";
import { useLibrary } from "../../context/LibraryContext";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 50) / 2;
const HOR_CARD_WIDTH = 160;

export default function HomeScreen() {
  const [songs, setSongs] = useState<any[]>([]);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedSong, setSelectedSong] = useState<any>(null);
  const [isPlaylistModalVisible, setIsPlaylistModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const { playSong, addToQueue, playNextInQueue } = usePlayer();


  const { toggleFavorite, isFavorite, playlists, addToPlaylist, createPlaylist } = useLibrary();
  const router = useRouter();

  const handleFinalizeCreate = async () => {
    if (newPlaylistName.trim() && selectedSong) {
      await createPlaylist(newPlaylistName.trim());
      // The state update might take a bit, so we reload library or just find the new one
      Alert.alert("Success", "Playlist created! You can now add songs to it.");
      setIsCreateModalVisible(false);
      setNewPlaylistName("");
    }
  };


  useEffect(() => {
    const loadHomeData = async () => {
        try {
            const localSongs = await getSongs();
            if (localSongs && localSongs.length > 0) {
                setSongs(localSongs);
            } else {
                const trending = await discoverSongs("Tamil 2024 Hits");
                setSongs(trending);
            }
        } catch (err) {
            console.error("Home Songs Load Error:", err);
            const fallback = await discoverSongs("Trending");
            setSongs(fallback);
        }
    };
    loadHomeData();
  }, []);

  const handleLongPress = (song: any) => {
    setSelectedSong(song);
    setShowMenu(true);
  };

  const onAddToQueue = () => {
    if (selectedSong) {
      addToQueue(selectedSong);
      Alert.alert("Success", "Added to queue");
      setShowMenu(false);
    }
  };

  const onPlayNext = () => {
    if (selectedSong) {
      playNextInQueue(selectedSong);
      Alert.alert("Success", "Will play next");
      setShowMenu(false);
    }
  };

  const onAddToList = () => {
    setShowMenu(false);
    setIsPlaylistModalVisible(true);
  };


  const renderGridItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      onPress={() => playSong(item, songs)} 
      onLongPress={() => handleLongPress(item)}
      style={styles.gridCard}
    >
      <View style={styles.imageWrapper}>
        <Image source={{ uri: item.image }} style={styles.gridImage} />
        <TouchableOpacity 
          style={styles.heartBtn}
          onPress={() => toggleFavorite(item)}
        >
          <Ionicons 
            name={isFavorite(item._id || item.id) ? "heart" : "heart-outline"} 
            size={18} 
            color={isFavorite(item._id || item.id) ? "#6c63ff" : "#fff"} 
          />
        </TouchableOpacity>
      </View>
      <Text style={styles.gridTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.gridArtist} numberOfLines={1}>{item.artist}</Text>
    </TouchableOpacity>
  );

  const renderHorizontalItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      onPress={() => playSong(item, songs)} 
      onLongPress={() => handleLongPress(item)}
      style={styles.horizontalCard}
    >
      <View style={styles.horImageWrapper}>
        <Image source={{ uri: item.image }} style={styles.horizontalImage} />
        <TouchableOpacity 
          style={styles.horHeartBtn}
          onPress={() => toggleFavorite(item)}
        >
          <Ionicons 
            name={isFavorite(item._id || item.id) ? "heart" : "heart-outline"} 
            size={16} 
            color={isFavorite(item._id || item.id) ? "#6c63ff" : "#fff"} 
          />
        </TouchableOpacity>
      </View>
      <Text style={styles.horTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.horArtist} numberOfLines={1}>{item.artist}</Text>
    </TouchableOpacity>
  );


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.searchBar} 
            onPress={() => router.push("/search")}
          >
            <Ionicons name="search" size={20} color="#666" />
            <Text style={styles.searchText}>Search in your library...</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.profileBtn}
            onPress={() => setShowDrawer(true)}
          >
            <Text style={styles.avatarText}>K</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.genreScroll}>
          {['All', 'Tamil Hits', 'Trending', 'Lo-Fi', 'Classical'].map((g, i) => (
            <TouchableOpacity key={i} style={[styles.genreChip, i === 0 && styles.activeGenre]}>
              <Text style={[styles.genreText, i === 0 && styles.activeGenreText]}>{g}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.content}>
          <Text style={styles.heroTitle}>Start Your Journey</Text>
          
          <Text style={styles.sectionTitle}>Jump Back In</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={songs.slice(0, 6)}
            renderItem={renderHorizontalItem}
            keyExtractor={(item, index) => 'h-' + (item?._id || index)}
            style={styles.horizontalList}
            contentContainerStyle={{ paddingRight: 20 }}
          />

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Charts & Trending</Text>
            <TouchableOpacity><Text style={styles.showAll}>Show all</Text></TouchableOpacity>
          </View>
          <FlatList
            data={songs}
            renderItem={renderGridItem}
            keyExtractor={(item, index) => 'g-' + (item?._id || index)}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.columnWrapper}
          />
        </View>

        {/* PROFILE DRAWER */}
        <Modal
          visible={showDrawer}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowDrawer(false)}
        >
          <TouchableOpacity 
            style={styles.drawerOverlay} 
            activeOpacity={1} 
            onPress={() => setShowDrawer(false)}
          >
            <View style={styles.drawerContent}>
              <View style={styles.drawerHeader}>
                <TouchableOpacity style={styles.drawerAvatar} onPress={() => { setShowDrawer(false); router.push("/profile"); }}>
                  <Text style={[styles.avatarText, { fontSize: 24 }]}>K</Text>
                </TouchableOpacity>
                <View style={{ marginLeft: 15 }}>
                  <Text style={styles.drawerName}>karthikeyan...</Text>
                  <TouchableOpacity onPress={() => { setShowDrawer(false); router.push("/profile"); }}>
                    <Text style={styles.viewProfile}>View profile</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.drawerMenu}>
                <TouchableOpacity style={styles.drawerItem} onPress={() => { setShowDrawer(false); router.push("/login"); }}>
                  <Ionicons name="person-add-outline" size={22} color="#fff" />
                  <Text style={styles.drawerItemText}>Add account</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.drawerItem}>
                  <Ionicons name="time-outline" size={22} color="#fff" />
                  <Text style={styles.drawerItemText}>Recents</Text>
                </TouchableOpacity>
                <View style={styles.drawerDivider} />
                <TouchableOpacity style={styles.drawerItem}>
                  <Ionicons name="settings-outline" size={22} color="#fff" />
                  <Text style={styles.drawerItemText}>Settings</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.drawerItem}
                  onPress={() => {
                    setShowDrawer(false);
                    router.replace("/login");
                  }}
                >
                  <Ionicons name="log-out-outline" size={22} color="#ef4444" />
                  <Text style={[styles.drawerItemText, { color: '#ef4444' }]}>Log out</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* CONTEXT MENU */}
        <Modal
          visible={showMenu}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowMenu(false)}
        >
          <TouchableOpacity 
            style={styles.menuOverlay} 
            activeOpacity={1} 
            onPress={() => setShowMenu(false)}
          >
            <View style={styles.menuContent}>
              <View style={styles.menuHandle} />
              {selectedSong && (
                <>
                  <View style={styles.menuHeader}>
                    <Image source={{ uri: selectedSong.image }} style={styles.menuSongImg} />
                    <View style={{ marginLeft: 15, flex: 1 }}>
                      <Text style={styles.menuSongTitle} numberOfLines={1}>{selectedSong.title}</Text>
                      <Text style={styles.menuSongArtist} numberOfLines={1}>{selectedSong.artist}</Text>
                    </View>
                  </View>
                  <View style={styles.menuList}>
                    <TouchableOpacity style={styles.menuItem} onPress={() => { playSong(selectedSong, songs); setShowMenu(false); }}>
                      <Ionicons name="play" size={22} color="#fff" />
                      <Text style={styles.menuText}>Play Now</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem} onPress={onAddToQueue}>
                      <Ionicons name="add" size={22} color="#fff" />
                      <Text style={styles.menuText}>Add to Queue</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem} onPress={onPlayNext}>
                      <Ionicons name="list" size={22} color="#fff" />
                      <Text style={styles.menuText}>Play Next</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem} onPress={onAddToList}>
                      <Ionicons name="folder-outline" size={22} color="#fff" />
                      <Text style={styles.menuText}>Add to Playlist</Text>
                    </TouchableOpacity>

                    <View style={styles.drawerDivider} />
                    <TouchableOpacity style={styles.menuItem} onPress={() => setShowMenu(false)}>
                      <Ionicons name="close" size={22} color="#fff" />
                      <Text style={styles.menuText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* ADD TO PLAYLIST MODAL (SPOTIFY STYLE) */}
        <Modal visible={isPlaylistModalVisible} transparent animationType="slide">
            <View style={styles.menuOverlay}>
                <View style={[styles.menuContent, { height: '60%' }]}>
                    <View style={styles.menuHandle} />
                    <Text style={styles.playlistModalTitle}>Add to playlist</Text>
                    
                    <ScrollView style={styles.playlistList}>
                        <TouchableOpacity 
                            style={styles.playlistItem}
                            onPress={() => {
                                setIsPlaylistModalVisible(false);
                                setIsCreateModalVisible(true);
                            }}
                        >
                            <View style={[styles.playlistIcon, { backgroundColor: '#333' }]}>
                                <Ionicons name="add" size={24} color="#fff" />
                            </View>
                            <Text style={styles.playlistName}>New Playlist</Text>
                        </TouchableOpacity>


                        {playlists.map((p, i) => (
                            <TouchableOpacity 
                                key={i} 
                                style={styles.playlistItem}
                                onPress={() => {
                                    addToPlaylist(p.id, selectedSong);
                                    setIsPlaylistModalVisible(false);
                                    Alert.alert("Success", `Added to ${p.name}`);
                                }}
                            >
                                <View style={styles.playlistIcon}>
                                    <Ionicons name="musical-note" size={24} color="#fff" />
                                </View>
                                <View>
                                    <Text style={styles.playlistName}>{p.name}</Text>
                                    <Text style={styles.playlistCount}>{p.songs?.length || 0} songs</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <TouchableOpacity 
                      style={styles.playlistCloseBtn} 
                      onPress={() => setIsPlaylistModalVisible(false)}
                    >
                        <Text style={styles.playlistCloseText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>

        {/* INLINE CREATE PLAYLIST MODAL */}
        <Modal visible={isCreateModalVisible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
                <View style={styles.modalCard}>
                    <Text style={styles.modalTitle}>New Playlist</Text>
                    <TextInput 
                        style={styles.modalInput}
                        placeholder="Playlist name"
                        placeholderTextColor="#666"
                        value={newPlaylistName}
                        onChangeText={setNewPlaylistName}
                        autoFocus
                    />
                    <View style={styles.modalBtns}>
                        <TouchableOpacity style={styles.modalBtn} onPress={() => setIsCreateModalVisible(false)}>
                            <Text style={styles.modalBtnTextDim}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalBtnPrimary} onPress={handleFinalizeCreate}>
                            <Text style={styles.modalBtnText}>Create</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>

        <View style={{ height: 150 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b0b1a" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20 },
  searchBar: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.05)", paddingHorizontal: 15, height: 45, borderRadius: 25, marginRight: 15, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  searchText: { color: "#666", marginLeft: 10, fontSize: 14 },
  profileBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#6c63ff", justifyContent: "center", alignItems: "center" },
  avatarText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  genreScroll: { paddingLeft: 20, marginBottom: 25 },
  genreChip: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.05)", marginRight: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  activeGenre: { backgroundColor: "#6c63ff", borderColor: "#6c63ff" },
  genreText: { color: "#fff", fontWeight: "600" },
  activeGenreText: { color: "#fff" },
  content: { paddingHorizontal: 20 },
  heroTitle: { color: "#fff", fontSize: 28, fontWeight: "900", marginBottom: 25 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 10 },
  sectionTitle: { color: "#fff", fontSize: 20, fontWeight: "800", marginBottom: 15 },
  showAll: { color: '#6c63ff', fontWeight: '700' },
  horizontalList: { marginBottom: 30 },
  horizontalCard: { marginRight: 15, width: HOR_CARD_WIDTH },
  horizontalImage: { width: HOR_CARD_WIDTH, height: HOR_CARD_WIDTH, borderRadius: 12, marginBottom: 10 },
  horTitle: { color: '#fff', fontSize: 14, fontWeight: '700' },
  horArtist: { color: '#aaa', fontSize: 12 },
  columnWrapper: { justifyContent: "space-between", marginBottom: 20 },
  gridCard: { width: CARD_WIDTH },
  imageWrapper: { width: CARD_WIDTH, height: CARD_WIDTH, borderRadius: 12, overflow: "hidden", position: "relative" },
  gridImage: { width: "100%", height: "100%" },
  heartBtn: { position: 'absolute', top: 10, right: 10, width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  horImageWrapper: { position: 'relative', width: HOR_CARD_WIDTH, height: HOR_CARD_WIDTH, borderRadius: 12, overflow: 'hidden', marginBottom: 10 },
  horHeartBtn: { position: 'absolute', top: 8, right: 8, width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  gridTitle: { color: "#fff", fontSize: 14, fontWeight: "700", marginTop: 8 },

  gridArtist: { color: "#aaa", fontSize: 12 },
  drawerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'flex-end' },
  drawerContent: { width: '75%', height: '100%', backgroundColor: '#0b0b1a', padding: 25, paddingTop: 60 },
  drawerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 35 },
  drawerAvatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#6c63ff', justifyContent: 'center', alignItems: 'center' },
  drawerName: { color: '#fff', fontSize: 17, fontWeight: '800' },
  viewProfile: { color: '#aaa', fontSize: 13 },
  drawerMenu: { flex: 1 },
  drawerItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  drawerItemText: { color: '#fff', fontSize: 15, fontWeight: '600', marginLeft: 15 },
  drawerDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginVertical: 10 },
  menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  menuContent: { backgroundColor: '#1c1c2e', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25, paddingTop: 10 },
  menuHandle: { width: 40, height: 5, backgroundColor: '#333', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  menuHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 25, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', paddingBottom: 20 },
  menuSongImg: { width: 50, height: 50, borderRadius: 8 },
  menuSongTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  menuSongArtist: { color: '#aaa', fontSize: 14 },
  menuList: { paddingBottom: 20 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  menuText: { color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 15 },
  playlistModalTitle: { color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 25, textAlign: 'center' },
  playlistList: { flex: 1 },
  playlistItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  playlistIcon: { width: 50, height: 50, borderRadius: 8, backgroundColor: '#282828', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  playlistName: { color: '#fff', fontSize: 16, fontWeight: '700' },
  playlistCount: { color: '#aaa', fontSize: 13, marginTop: 2 },
  playlistCloseBtn: { paddingVertical: 15, alignItems: 'center', marginTop: 10 },
  playlistCloseText: { color: '#aaa', fontSize: 16, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 30 },
  modalCard: { width: '100%', backgroundColor: '#1c1c2e', borderRadius: 20, padding: 25, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 20 },
  modalInput: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, height: 56, paddingHorizontal: 15, color: '#fff', fontSize: 16, marginBottom: 25, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  modalBtns: { flexDirection: 'row', justifyContent: 'flex-end' },
  modalBtn: { paddingHorizontal: 20, paddingVertical: 10, marginLeft: 10 },
  modalBtnPrimary: { backgroundColor: '#6c63ff', paddingHorizontal: 25, paddingVertical: 10, borderRadius: 10, marginLeft: 10 },
  modalBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  modalBtnTextDim: { color: '#aaa', fontWeight: '600', fontSize: 14 }
});