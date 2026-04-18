import { Tabs } from 'expo-router';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { usePlayer } from '../../context/PlayerContext';
import FullScreenPlayer from '../../components/FullScreenPlayer';

export default function TabLayout() {
  const { currentSong, isPlaying, pauseResume } = usePlayer();
  const [playerVisible, setPlayerVisible] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: '#0b0b1a' }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#6c63ff',
          tabBarInactiveTintColor: '#aaa',
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#0b0b1a',
            borderTopWidth: 1,
            borderTopColor: 'rgba(255,255,255,0.1)',
            height: 70,
            paddingBottom: 10,
            paddingTop: 10,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'musical-note' : 'musical-note-outline'} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Search',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'search' : 'search-outline'} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            title: 'Create',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'add-circle' : 'add-circle-outline'} size={32} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="library"

          options={{
            title: 'Library',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'heart' : 'heart-outline'} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="install"
          options={{
            href: null,
          }}
        />


      </Tabs>

      {/* GLOBAL MINI PLAYER */}
      {currentSong && (
        <TouchableOpacity 
           activeOpacity={0.9} 
           onPress={() => setPlayerVisible(true)}
           style={styles.miniPlayer}
        >
          <Image source={{ uri: currentSong.image }} style={styles.miniImage} />
          <View style={styles.miniInfo}>
            <Text style={styles.miniTitle} numberOfLines={1}>{currentSong.title}</Text>
            <Text style={styles.miniArtist} numberOfLines={1}>{currentSong.artist}</Text>
          </View>
          <TouchableOpacity onPress={pauseResume} style={styles.miniPlayBtn}>
            <Ionicons name={isPlaying ? "pause" : "play"} size={28} color="#fff" />
          </TouchableOpacity>
        </TouchableOpacity>
      )}

      {/* FULL SCREEN PLAYER MODAL */}
      <FullScreenPlayer 
        visible={playerVisible} 
        onClose={() => setPlayerVisible(false)} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  miniPlayer: {
    position: 'absolute',
    bottom: 70, // Just above tab bar
    left: 10,
    right: 10,
    backgroundColor: '#1c1c2e',
    height: 60,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  miniImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
  },
  miniInfo: {
    flex: 1,
    marginLeft: 10,
  },
  miniTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  miniArtist: {
    color: '#aaa',
    fontSize: 12,
  },
  miniPlayBtn: {
    padding: 5,
  }
});


