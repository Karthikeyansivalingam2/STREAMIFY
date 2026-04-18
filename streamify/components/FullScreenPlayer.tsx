import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { usePlayer } from '../context/PlayerContext';
import Slider from '@react-native-community/slider';

const { width, height } = Dimensions.get('window');

interface FullScreenPlayerProps {
  visible: boolean;
  onClose: () => void;
}

export default function FullScreenPlayer({ visible, onClose }: FullScreenPlayerProps) {
  const { 
    currentSong, isPlaying, pauseResume, playNext, playPrevious, 
    position, duration, seek, isShuffle, isRepeat, toggleShuffle, toggleRepeat,
    addToQueue 
  } = usePlayer();

  const [showOptions, setShowOptions] = useState(false);

  if (!currentSong) return null;

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleSeek = (value: number) => {
    seek(value);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <LinearGradient colors={['#1c1c2e', '#0b0b1a']} style={styles.container}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="chevron-down" size={32} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.playingFrom}>PLAYING FROM YOUR LIBRARY</Text>
            <Text style={styles.titleSmall}>Streamify Premium</Text>
          </View>

          <TouchableOpacity onPress={() => setShowOptions(true)}>
            <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* ALBUM ART */}
        <View style={styles.artContainer}>
          <Image source={{ uri: currentSong.image }} style={styles.albumArt} />
        </View>

        {/* INFO */}
        <View style={styles.infoContainer}>
          <View style={styles.titleBox}>
            <Text style={styles.songTitle} numberOfLines={1}>{currentSong.title}</Text>
            <Text style={styles.artistName} numberOfLines={1}>{currentSong.artist}</Text>
          </View>
          <TouchableOpacity onPress={() => Alert.alert("Liked", "Added to your Liked Songs")}>
             <Ionicons name="heart-outline" size={32} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* PROGRESS BAR (SLIDER) */}
        <View style={styles.progressContainer}>
          <Slider
            style={{ width: '100%', height: 40 }}
            minimumValue={0}
            maximumValue={duration || 100}
            value={position || 0}
            minimumTrackTintColor="#fff"
            maximumTrackTintColor="rgba(255,255,255,0.2)"
            thumbTintColor="#fff"
            onSlidingComplete={handleSeek}
          />
          <View style={styles.timeBox}>
            <Text style={styles.time}>{formatTime(position)}</Text>
            <Text style={styles.time}>{formatTime(duration)}</Text>
          </View>
        </View>

        {/* CONTROLS */}
        <View style={styles.controls}>
          <TouchableOpacity onPress={toggleShuffle}>
            <Ionicons name="shuffle" size={28} color={isShuffle ? "#6c63ff" : "#aaa"} />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={playPrevious}>
            <Ionicons name="play-skip-back" size={45} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={pauseResume} style={styles.playBtnLarge}>
            <Ionicons name={isPlaying ? "pause-circle" : "play-circle"} size={90} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={playNext}>
            <Ionicons name="play-skip-forward" size={45} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleRepeat}>
            <Ionicons name="repeat" size={28} color={isRepeat ? "#6c63ff" : "#aaa"} />
          </TouchableOpacity>
        </View>

        {/* FOOTER ICONS */}
        <View style={styles.footer}>
             <TouchableOpacity><Ionicons name="headset-outline" size={24} color="#aaa" /></TouchableOpacity>
             <TouchableOpacity><Ionicons name="share-outline" size={24} color="#aaa" /></TouchableOpacity>
        </View>

        {/* OPTIONS MENU MODAL */}
        <Modal visible={showOptions} transparent={true} animationType="slide">
            <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setShowOptions(false)}>
                <View style={styles.menuContent}>
                    <View style={styles.menuHandle} />
                    <View style={styles.menuHeader}>
                        <Image source={{ uri: currentSong.image }} style={styles.menuSongImg} />
                        <View style={{ marginLeft: 15, flex: 1 }}>
                            <Text style={styles.menuSongTitle} numberOfLines={1}>{currentSong.title}</Text>
                            <Text style={styles.menuSongArtist} numberOfLines={1}>{currentSong.artist}</Text>
                        </View>
                    </View>
                    <View style={styles.menuList}>
                        <TouchableOpacity style={styles.menuItem} onPress={() => { addToQueue(currentSong); setShowOptions(false); }}>
                            <Ionicons name="add" size={24} color="#fff" />
                            <Text style={styles.menuText}>Add to Queue</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuItem} onPress={() => setShowOptions(false)}>
                            <Ionicons name="close" size={24} color="#fff" />
                            <Text style={styles.menuText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>

      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 25, paddingTop: 50 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 },
  headerText: { alignItems: 'center' },
  playingFrom: { color: '#aaa', fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  titleSmall: { color: '#fff', fontSize: 14, fontWeight: '800', marginTop: 2 },
  artContainer: { width: width - 50, height: width - 50, borderRadius: 15, overflow: 'hidden', elevation: 20, shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 20, marginBottom: 50 },
  albumArt: { width: '100%', height: '100%' },
  infoContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30 },
  titleBox: { flex: 1, marginRight: 20 },
  songTitle: { color: '#fff', fontSize: 24, fontWeight: '800' },
  artistName: { color: '#6c63ff', fontSize: 18, fontWeight: '600', marginTop: 5 },
  progressContainer: { marginBottom: 40 },
  timeBox: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -5 },
  time: { color: '#aaa', fontSize: 12 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 },
  playBtnLarge: { justifyContent: 'center', alignItems: 'center' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 'auto', marginBottom: 30 },
  menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  menuContent: { backgroundColor: '#1c1c2e', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25 },
  menuHandle: { width: 40, height: 5, backgroundColor: '#333', borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
  menuHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  menuSongImg: { width: 60, height: 60, borderRadius: 8 },
  menuSongTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  menuSongArtist: { color: '#aaa', fontSize: 14 },
  menuList: { marginTop: 10 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15 },
  menuText: { color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 15 }
});
