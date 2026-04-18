import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserLibrary, syncFavorites, syncPlaylists } from '../services/api';

interface LibraryContextType {
  favorites: any[];
  playlists: any[];
  toggleFavorite: (song: any) => Promise<void>;
  createPlaylist: (name: string) => Promise<void>;
  deletePlaylist: (playlistId: string) => Promise<void>;
  addToPlaylist: (playlistId: string, song: any) => Promise<void>;

  isFavorite: (songId: string) => boolean;
  refreshLibrary: () => Promise<void>;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const id = await AsyncStorage.getItem('userId');
    if (id) {
      setUserId(id);
      fetchData(id);
    }
  };

  const fetchData = async (id: string) => {
    const data = await getUserLibrary(id);
    setFavorites(data.favorites);
    setPlaylists(data.playlists);
  };

  const refreshLibrary = async () => {
    if (userId) await fetchData(userId);
  };

  const isFavorite = (songId: string) => {
    return favorites.some(song => song._id === songId || song.id === songId);
  };

  const toggleFavorite = async (song: any) => {
    if (!userId) return;
    
    let newFavorites;
    const exists = isFavorite(song._id || song.id);
    
    if (exists) {
      newFavorites = favorites.filter(f => (f._id || f.id) !== (song._id || song.id));
    } else {
      newFavorites = [...favorites, song];
    }
    
    setFavorites(newFavorites);
    await syncFavorites(userId, newFavorites);
  };

  const createPlaylist = async (name: string) => {
    if (!userId) return;
    const newPlaylist = {
      id: Date.now().toString(),
      name,
      songs: []
    };
    const newPlaylists = [...playlists, newPlaylist];
    setPlaylists(newPlaylists);
    await syncPlaylists(userId, newPlaylists);
  };

  const addToPlaylist = async (playlistId: string, song: any) => {
    if (!userId) return;
    const newPlaylists = playlists.map(p => {
      if (p.id === playlistId) {
        return { ...p, songs: [...p.songs, song] };
      }
      return p;
    });
    setPlaylists(newPlaylists);
    await syncPlaylists(userId, newPlaylists);
  };

  const deletePlaylist = async (playlistId: string) => {
    if (!userId) return;
    const newPlaylists = playlists.filter(p => p.id !== playlistId && p._id !== playlistId);
    setPlaylists(newPlaylists);
    await syncPlaylists(userId, newPlaylists);
  };

  return (
    <LibraryContext.Provider value={{ 
      favorites, 
      playlists, 
      toggleFavorite, 
      createPlaylist, 
      deletePlaylist,
      addToPlaylist, 
      isFavorite,
      refreshLibrary 
    }}>

      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) throw new Error('useLibrary must be used within a LibraryProvider');
  return context;
};
