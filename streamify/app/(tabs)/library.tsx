import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, ActivityIndicator, Alert, Modal, Dimensions, TextInput } from "react-native";

import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { usePlayer } from "../../context/PlayerContext";
import { useLibrary } from "../../context/LibraryContext";
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function LibraryScreen() {
  const [view, setView] = useState('home'); 
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSong, setSelectedSong] = useState<any>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const { playSong, addToQueue } = usePlayer();

  const { favorites, playlists, createPlaylist, toggleFavorite, deletePlaylist } = useLibrary();

  const handlePlaylistLongPress = (item: any) => {
    if (item.id === 'liked') return;
    Alert.alert(
      'Delete Playlist',
      `Delete "${item.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deletePlaylist(item.id);
            if (view === item.title) setView('home');
          }
        }
      ]
    );
  };

  const allPlaylists = [
    { id: 'liked', title: "Liked Songs", subtitle: `Playlist • ${favorites.length} songs`, icon: "heart", color: ["#450eff", "#8e86ff"], songs: favorites },
    ...playlists.map(p => ({
        id: p.id,
        title: p.name,
        subtitle: `Playlist • ${p.songs?.length || 0} songs`,
        icon: "musical-note",
        color: ["#282828", "#121212"],
        songs: p.songs || []
    }))
  ];

  const filters = ["Playlists", "Artists", "Albums", "Podcasts"];

  const handleCreatePlaylist = () => {
    setIsCreateModalVisible(true);
  };

  const finalizeCreate = async () => {
    if (newPlaylistName.trim()) {
      await createPlaylist(newPlaylistName.trim());
      setNewPlaylistName("");
      setIsCreateModalVisible(false);
      Alert.alert("Success", "Playlist created!");
    }
  };


  const handleLongPress = (song: any) => {
    setSelectedSong(song);
    setShowMenu(true);
  };

  const onRemoveLiked = async () => {
      if (selectedSong) {
        await toggleFavorite(selectedSong);
        setShowMenu(false);
        Alert.alert("Success", "Library updated");
      }
  };

  const fetchLocalFiles = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        multiple: true,
        copyToCacheDirectory: true
      });

      if (!res.canceled && res.assets) {
         setLoading(true);
         setView('Local Storage');
         const pickedSongs = res.assets.map(asset => ({
           _id: asset.uri,
           title: asset.name,
           artist: "Mobile Storage",
           url: asset.uri,
           image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200",
           category: 'Local'
         }));
         setSongs(pickedSongs);
         setLoading(false);
      }
    } catch (err) {
      console.error("Picker Error:", err);
      Alert.alert("Error", "Could not pick files.");
      setLoading(false);
    }
  };

  const openPlaylist = (item: any) => {
    setView(item.title);
    setSongs(item.songs || []);
  };


  if (view !== 'home') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.listHeader}>
            <TouchableOpacity onPress={() => setView('home')} style={styles.backBtn}>
                <Ionicons name="chevron-back" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.listHeaderTitle} numberOfLines={1}>{view}</Text>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent}>
            <LinearGradient 
                colors={view === 'Liked Songs' ? ['#450eff', '#0b0b1a'] : ['#282828', '#0b0b1a']} 
                style={styles.banner}
            >
                <View style={styles.bannerIconBox}>
                    <Ionicons name={view === 'Liked Songs' ? "heart" : "musical-note"} size={60} color="#fff" />
                </View>
                <View style={styles.bannerInfo}>
                    <Text style={styles.bannerTitle}>{view}</Text>
                    <Text style={styles.bannerSubtitle}>{songs.length} songs</Text>
                </View>
                <TouchableOpacity style={styles.playAllBtn} onPress={() => songs.length > 0 && playSong(songs[0], songs)}>
                    <Ionicons name="play" size={30} color="#000" />
                </TouchableOpacity>
            </LinearGradient>

            {loading ? (
                <ActivityIndicator size="large" color="#6c63ff" style={{ marginTop: 50 }} />
            ) : (
                <View style={styles.songList}>
                    {songs.map((song, index) => (
                        <TouchableOpacity 
                            key={index} 
                            style={styles.songRow} 
                            onPress={() => playSong(song, songs)}
                            onLongPress={() => handleLongPress(song)}
                        >
                            <Image source={{ uri: song.image }} style={styles.songImg} />
                            <View style={styles.songMeta}>
                                <Text style={styles.songTitle} numberOfLines={1}>{song.title}</Text>
                                <Text style={styles.songArtist} numberOfLines={1}>{song.artist}</Text>
                            </View>
                            <TouchableOpacity onPress={() => handleLongPress(song)}>
                                <Ionicons name="ellipsis-vertical" size={18} color="#aaa" />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ))}
                    {songs.length === 0 && (
                        <View style={styles.emptyState}>
                            <Ionicons name="musical-notes-outline" size={60} color="rgba(255,255,255,0.1)" />
                            <Text style={styles.emptyText}>This playlist is empty.</Text>
                        </View>
                    )}
                </View>
            )}
            <View style={{ height: 150 }} />
        </ScrollView>

        {/* SONG OPTIONS MENU */}
        <Modal visible={showMenu} transparent animationType="slide">
            <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setShowMenu(false)}>
                <View style={styles.menuContent}>
                    <View style={styles.menuHandle} />
                    {selectedSong && (
                        <>
                            <View style={styles.menuHeader}>
                                <Image source={{ uri: selectedSong.image }} style={styles.menuSongImg} />
                                <View style={{ marginLeft: 15, flex: 1 }}>
                                    <Text style={styles.menuSongTitle}>{selectedSong.title}</Text>
                                    <Text style={styles.menuSongArtist}>{selectedSong.artist}</Text>
                                </View>
                            </View>
                            <View style={styles.menuList}>
                                <TouchableOpacity style={styles.menuItem} onPress={() => { playSong(selectedSong, songs); setShowMenu(false); }}>
                                    <Ionicons name="play-outline" size={24} color="#fff" />
                                    <Text style={styles.menuText}>Play Now</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.menuItem} onPress={() => { addToQueue(selectedSong); setShowMenu(false); }}>
                                    <Ionicons name="add-circle-outline" size={24} color="#fff" />
                                    <Text style={styles.menuText}>Add to Queue</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.menuItem} onPress={onRemoveLiked}>
                                    <Ionicons name="heart-dislike" size={24} color="#ef4444" />
                                    <Text style={[styles.menuText, { color: '#ef4444' }]}>Remove from Liked</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.menuItem} onPress={() => setShowMenu(false)}>
                                    <Ionicons name="close-outline" size={24} color="#fff" />
                                    <Text style={styles.menuText}>Close</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>
            </TouchableOpacity>
        </Modal>
        
        {/* CREATE PLAYLIST MODAL */}
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
                        <TouchableOpacity style={styles.modalBtnPrimary} onPress={finalizeCreate}>
                            <Text style={styles.modalBtnText}>Create</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
      </SafeAreaView>

    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.avatar}>
            <Text style={styles.avatarText}>K</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Your Library</Text>
          <View style={styles.headerRight}>
              <TouchableOpacity style={styles.headerIcon}>
                <Ionicons name="search" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerIcon} onPress={handleCreatePlaylist}>
                <Ionicons name="add" size={30} color="#fff" />
              </TouchableOpacity>

          </View>
        </View>

        {/* FILTERS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {filters.map((filter, index) => (
            <TouchableOpacity key={index} style={[styles.filterChip, index === 0 && styles.activeChip]}>
              <Text style={[styles.filterText, index === 0 && styles.activeText]}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* LIST ACTIONS */}
        <View style={styles.listHeaderRow}>
            <View style={styles.sortRow}>
                <Ionicons name="swap-vertical" size={16} color="#6c63ff" />
                <Text style={styles.sortText}>Recents</Text>
            </View>
            <TouchableOpacity onPress={fetchLocalFiles}>
                <Ionicons name="grid-outline" size={18} color="#fff" />
            </TouchableOpacity>
        </View>

        {/* PLAYLIST LIST - SPOTIFY STYLE */}
        <View style={styles.spotifyList}>
          {allPlaylists.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.spotifyItem}
              onPress={() => openPlaylist(item)}
              onLongPress={() => handlePlaylistLongPress(item)}
            >
              <LinearGradient
                colors={item.color as any}
                style={styles.spotifyIcon}
              >
                <Ionicons name={item.icon as any} size={28} color="#fff" />
              </LinearGradient>
              <View style={styles.spotifyInfo}>
                <Text style={styles.spotifyTitle}>{item.title}</Text>
                <Text style={styles.spotifySubtitle}>{item.subtitle}</Text>
              </View>
              {item.id !== 'liked' && (
                <Ionicons name="ellipsis-vertical" size={18} color="#555" />
              )}
            </TouchableOpacity>
          ))}
          
          {/* ARTISTS SECTION (CIRCULAR) */}
          <Text style={styles.subSectionTitle}>Artists you follow</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.artistScroll}>
              {['Sean Roldan', 'A.R. Rahman', 'Anirudh', 'Yuvan'].map((name, i) => (
                  <TouchableOpacity key={i} style={styles.artistCard}>
                      <Image source={{ uri: `https://ui-avatars.com/api/?name=${name}&background=6c63ff&color=fff` }} style={styles.artistImg} />
                      <Text style={styles.artistName} numberOfLines={1}>{name}</Text>
                  </TouchableOpacity>
              ))}
          </ScrollView>
        </View>

        <View style={{ height: 150 }} />
      </ScrollView>

      {/* CREATE PLAYLIST MODAL */}
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
              <TouchableOpacity style={styles.modalBtn} onPress={() => { setIsCreateModalVisible(false); setNewPlaylistName(""); }}>
                <Text style={styles.modalBtnTextDim}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnPrimary} onPress={finalizeCreate}>
                <Text style={styles.modalBtnText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b0b1a" },
  scrollContent: { paddingHorizontal: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 40,
    marginBottom: 20,
  },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#6c63ff", justifyContent: "center", alignItems: "center" },
  avatarText: { color: "#fff", fontWeight: "bold", fontSize: 12 },
  title: { color: "#fff", fontSize: 24, fontWeight: "900", flex: 1, marginLeft: 15 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  headerIcon: { marginLeft: 20 },
  filterScroll: { marginBottom: 20 },
  filterChip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: "#1e1e2e", marginRight: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  activeChip: { backgroundColor: "#6c63ff", borderColor: "#6c63ff" },
  filterText: { color: "#fff", fontWeight: "600", fontSize: 12 },
  activeText: { color: "#fff" },
  listHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sortRow: { flexDirection: 'row', alignItems: 'center' },
  sortText: { color: '#fff', fontSize: 13, fontWeight: '700', marginLeft: 6 },
  // SPOTIFY LIST STYLE
  spotifyList: { marginTop: 10 },
  spotifyItem: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  spotifyIcon: { width: 64, height: 64, borderRadius: 4, justifyContent: "center", alignItems: "center" },
  spotifyInfo: { marginLeft: 16, flex: 1 },
  spotifyTitle: { color: "#fff", fontSize: 16, fontWeight: "700" },
  spotifySubtitle: { color: "#aaa", fontSize: 13, marginTop: 4 },
  subSectionTitle: { color: '#fff', fontSize: 18, fontWeight: '800', marginTop: 30, marginBottom: 15 },
  artistScroll: { marginBottom: 20 },
  artistCard: { alignItems: 'center', marginRight: 20, width: 80 },
  artistImg: { width: 80, height: 80, borderRadius: 40, marginBottom: 8 },
  artistName: { color: '#fff', fontSize: 12, fontWeight: '600', textAlign: 'center' },
  // REFINED LIST VIEW
  listHeader: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingBottom: 10, paddingHorizontal: 16 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  listHeaderTitle: { color: '#fff', fontSize: 18, fontWeight: '900', flex: 1 },
  banner: { height: 280, width: '100%', padding: 20, borderRadius: 12, marginBottom: 20, flexDirection: 'row', alignItems: 'flex-end', position: 'relative' },
  bannerIconBox: { width: 120, height: 120, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 8, justifyContent: 'center', alignItems: 'center', elevation: 20, shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 10 },
  bannerInfo: { marginLeft: 20, flex: 1, marginBottom: 10 },
  bannerTitle: { color: '#fff', fontSize: 28, fontWeight: '900' },
  bannerSubtitle: { color: '#ccc', fontSize: 14, marginTop: 4 },
  playAllBtn: { position: 'absolute', bottom: 20, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#6c63ff', justifyContent: 'center', alignItems: 'center', elevation: 8 },
  songList: { paddingHorizontal: 4 },
  songRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  songImg: { width: 48, height: 48, borderRadius: 4 },
  songMeta: { flex: 1, marginLeft: 12 },
  songTitle: { color: '#fff', fontSize: 15, fontWeight: '600' },
  songArtist: { color: '#aaa', fontSize: 12, marginTop: 2 },
  emptyState: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: 'rgba(255,255,255,0.3)', fontSize: 16, marginTop: 15 },
  // CONTEXT MENU
  menuText: { color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 16 },
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

