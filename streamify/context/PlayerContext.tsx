import React, { createContext, useContext, useState, useEffect } from 'react';
import { Audio } from 'expo-av';

interface PlayerContextType {
  currentSong: any;
  isPlaying: boolean;
  isShuffle: boolean;
  isRepeat: boolean;
  playSong: (song: any, queue?: any[]) => Promise<void>;
  pauseResume: () => Promise<void>;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
  addToQueue: (song: any) => void;
  playNextInQueue: (song: any) => void;
  seek: (ms: number) => Promise<void>;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  queue: any[];
  position: number;
  duration: number;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [currentSong, setCurrentSong] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [queue, setQueue] = useState<any[]>([]);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    return sound ? () => { sound.unloadAsync(); } : undefined;
  }, [sound]);

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 0);
      setIsPlaying(status.isPlaying);
      if (status.didJustFinish) {
        if (isRepeat) {
            sound?.replayAsync();
        } else {
            playNext();
        }
      }
    }
  };

  const playSong = async (song: any, newQueue?: any[]) => {
    try {
      if (currentSong?._id === song._id && sound) {
        await pauseResume();
        return;
      }

      if (sound) {
        await sound.unloadAsync();
      }

      if (newQueue) setQueue(newQueue);

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: song.url },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      setSound(newSound);
      setCurrentSong(song);
      setIsPlaying(true);
    } catch (error) {
      console.error("Error playing song:", error);
    }
  };

  const pauseResume = async () => {
    if (!sound) return;
    if (isPlaying) {
      await sound.pauseAsync();
      setIsPlaying(false);
    } else {
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  const playNext = async () => {
    if (queue.length === 0) return;
    const currentIndex = queue.findIndex(s => s._id === currentSong?._id);
    let nextIndex;
    if (isShuffle) {
        nextIndex = Math.floor(Math.random() * queue.length);
    } else {
        nextIndex = (currentIndex + 1) % queue.length;
    }
    await playSong(queue[nextIndex]);
  };

  const playPrevious = async () => {
    if (queue.length === 0) return;
    const currentIndex = queue.findIndex(s => s._id === currentSong?._id);
    const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
    await playSong(queue[prevIndex]);
  };

  const addToQueue = (song: any) => {
    setQueue(prev => {
        const exists = prev.find(s => s._id === (song._id || song.id));
        if (exists) return prev;
        return [...prev, song];
    });
  };

  const playNextInQueue = (song: any) => {
    setQueue(prev => {
        const filtered = prev.filter(s => s._id !== (song._id || song.id));
        const currentIndex = filtered.findIndex(s => s._id === currentSong?._id);
        const newQueue = [...filtered];
        newQueue.splice(currentIndex + 1, 0, song);
        return newQueue;
    });
  };

  const seek = async (ms: number) => {
    if (sound) {
        await sound.setPositionAsync(ms);
    }
  };

  const toggleShuffle = () => setIsShuffle(!isShuffle);
  const toggleRepeat = () => setIsRepeat(!isRepeat);

  return (
    <PlayerContext.Provider value={{ 
      currentSong, isPlaying, isShuffle, isRepeat, playSong, pauseResume, playNext, playPrevious, 
      addToQueue, playNextInQueue, seek, toggleShuffle, toggleRepeat,
      queue, position, duration 
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error("usePlayer must be used within PlayerProvider");
  return context;
};
