import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Music, Film, Plus, Play, HardDrive, Heart, Camera, User, LogOut, Settings, History, X, Download, ListMusic, ChevronRight } from 'lucide-react';

import Sidebar from './components/Sidebar';
import MediaCard from './components/MediaCard';
import AudioPlayer from './components/AudioPlayer';
import VideoModal from './components/VideoModal';

const BASE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_URL = BASE_API_URL.endsWith('/api') ? BASE_API_URL : `${BASE_API_URL}/api`;


// Streamify Music App - V1.1 (Rebuild)
function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [showAddMusic, setShowAddMusic] = useState(false);
  const [showAddMovie, setShowAddMovie] = useState(false);
  const [songs, setSongs] = useState([]);
  const [movies, setMovies] = useState([]);
  const localDriveMedia = songs.filter(s => s.category === 'uploaded');
  const [isScanning, setIsScanning] = useState(false);
  const [playlists, setPlaylists] = useState(() => JSON.parse(localStorage.getItem('streamify-playlists') || '[]'));
  const [queue, setQueue] = useState([]);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null); 
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [recentlyPlayed, setRecentlyPlayed] = useState(() => JSON.parse(localStorage.getItem('streamify-recents') || '[]'));
  const [activeSubView, setActiveSubView] = useState(null); // 'settings', 'profile'
  const [searchTerm, setSearchTerm] = useState('');
  const [currentSong, setCurrentSong] = useState(null);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('streamify-favorites') || '[]'));
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [discoverResults, setDiscoverResults] = useState([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [trendingSongs, setTrendingSongs] = useState([]);
  const [initialSyncDone, setInitialSyncDone] = useState(false);


  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('streamify-auth') === 'true');
  const [isLoginView, setIsLoginView] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [user, setUser] = useState(() => {
    const savedLine = localStorage.getItem('streamify-user');
    return savedLine ? JSON.parse(savedLine) : null;
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [addAccountEmail, setAddAccountEmail] = useState('');
  const [addAccountPassword, setAddAccountPassword] = useState('');
  const [addAccountIsLogin, setAddAccountIsLogin] = useState(true);
  const [addAccountLoading, setAddAccountLoading] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState(() => JSON.parse(localStorage.getItem('streamify-accounts') || '[]'));

  const [likedSongsData, setLikedSongsData] = useState(() => JSON.parse(localStorage.getItem('streamify-liked-data') || '[]'));
  const [contextMenuSong, setContextMenuSong] = useState(null);
  const [contextMenuShowPlaylists, setContextMenuShowPlaylists] = useState(false);

  const toggleLike = (song) => {
      if (!song || !song._id) return;
      
      setFavorites(prev => {
          const isLiked = prev.some(s => s._id === song._id);
          let newFavs;
          if (isLiked) {
              newFavs = prev.filter(s => s._id !== song._id);
          } else {
              newFavs = [...prev, song];
          }
          localStorage.setItem('streamify-favorites', JSON.stringify(newFavs));
          return newFavs;
      });
  };

  useEffect(() => {
    localStorage.setItem('streamify-favorites', JSON.stringify(favorites));
    if (initialSyncDone && user && (user.id || user._id)) {
        axios.put(`${API_URL}/user/${user.id || user._id}/favorites`, { favorites }).catch(err => console.error("Error syncing favorites:", err));
    }
  }, [favorites, user, initialSyncDone]);

  useEffect(() => {
    localStorage.setItem('streamify-liked-data', JSON.stringify(likedSongsData));
  }, [likedSongsData]);

  useEffect(() => {
    localStorage.setItem('streamify-playlists', JSON.stringify(playlists));
    if (initialSyncDone && user && (user.id || user._id)) {
        axios.put(`${API_URL}/user/${user.id || user._id}/playlists`, { playlists }).catch(err => console.error("Error syncing playlists:", err));
    }
  }, [playlists, user, initialSyncDone]);

  useEffect(() => {
    localStorage.setItem('streamify-recents', JSON.stringify(recentlyPlayed));
  }, [recentlyPlayed]);

  // Cleanup effect to remove duplicates from memory
  useEffect(() => {
    if (likedSongsData.length > 0) {
        const unique = likedSongsData.filter((song, index, self) =>
            index === self.findIndex((t) => t._id === song._id)
        );
        if (unique.length !== likedSongsData.length) {
            setLikedSongsData(unique);
        }
    }
  }, [likedSongsData]);


  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (currentSong) {
        setRecentlyPlayed(prev => {
            const filtered = prev.filter(s => s._id !== currentSong._id);
            return [currentSong, ...filtered].slice(0, 10);
        });
    }
  }, [currentSong]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log('PWA was installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [songsRes, moviesRes, trendingRes] = await Promise.all([
        axios.get(`${API_URL}/songs`),
        axios.get(`${API_URL}/movies`),
        axios.get(`${API_URL}/discover?query=latest+tamil`)
      ]);
      
      const rawSongs = songsRes.data || [];
      // Don't strictly filter 'songs' state, but only 'filteredSongs' for UI
      setSongs(rawSongs);
      
      const tamilSongs = rawSongs.filter(s => {
          const content = (s.title + s.artist + s.category + (s.language || '')).toLowerCase();
          return content.includes('tamil') || s.category === 'uploaded';
      });
      setFilteredSongs(tamilSongs.length > 0 ? tamilSongs : rawSongs);
      setMovies(moviesRes.data || []);
      
      if (trendingRes.data?.data?.results) {
         const hits = trendingRes.data.data.results.map(item => ({
            _id: item.id,
            title: item.name,
            artist: item.primaryArtists || item.artists?.primary?.[0]?.name || "Online Hit",
            image: item.image?.[item.image.length-1]?.link || item.image?.[item.image.length-1]?.url || item.image?.[0]?.url,
            url: item.downloadUrl?.[item.downloadUrl.length-1]?.link || item.downloadUrl?.[item.downloadUrl.length-1]?.url || item.downloadUrl?.[0]?.url,
            category: 'Trending'
         }));
         setTrendingSongs(hits);
         
      // Clean up favorites and merge with online data
      const localFavs = JSON.parse(localStorage.getItem('streamify-favorites') || '[]');
      setFavorites(localFavs);
      
      // Final sync for user profile data (Liked Songs & Playlists)
      if (user && (user.id || user._id)) {
          try {
              const profileRes = await axios.get(`${API_URL}/user/${user.id || user._id}`);
              if (profileRes.data?.success) {
                  const dbUser = profileRes.data.user;
                  // If DB has data, prefer cloud data over local to ensure consistency across devices
                  if (dbUser.favorites && dbUser.favorites.length > 0) setFavorites(dbUser.favorites);
                  if (dbUser.playlists && dbUser.playlists.length > 0) setPlaylists(dbUser.playlists);
              }
          } catch (pErr) { console.warn("Failed to fetch online profile, using local stash."); }
          finally { setInitialSyncDone(true); }
      } else {
          setInitialSyncDone(true);
      }

    } catch (err) {
      console.error('Error fetching data:', err);
      setSongs([]);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  const uploadFile = async (file) => {
    if (!file) return null;
    const formData = new FormData();
    formData.append('file', file);
    
    try {

      const res = await axios.post(`${API_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data.url;
    } catch (err) {
      console.error("Upload error detail:", err.response || err);
      const errorMsg = err.response?.data?.message || err.message || "Unknown Error";
      throw new Error(`Upload failed: ${errorMsg}`);
    }
  };


  const extractMetadata = (file) => {
    return new Promise((resolve) => {
      if (!window.jsmediatags) {
          resolve({ title: file.name.replace(/\.[^/.]+$/, ""), artist: "Unknown Artist" });
          return;
      }
      window.jsmediatags.read(file, {
        onSuccess: function(tag) {
          const tags = tag.tags;
          let imageUrl = "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop";
          if (tags.picture) {
            const { data, format } = tags.picture;
            let base64String = "";
            for (let i = 0; i < data.length; i++) {
              base64String += String.fromCharCode(data[i]);
            }
            imageUrl = `data:${format};base64,${window.btoa(base64String)}`;
          }
          resolve({
            title: tags.title || file.name.replace(/\.[^/.]+$/, ""),
            artist: tags.artist || "Unknown Artist",
            image: imageUrl
          });
        },
        onError: function(error) {
          resolve({ title: file.name.replace(/\.[^/.]+$/, ""), artist: "Unknown Artist" });
        }
      });
    });
  };

  const handleFolderSelect = async () => {
    try {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = 'audio/*';
        
        input.onchange = async (e) => {
            const filesList = e.target.files;
            if (!filesList || filesList.length === 0) return;
            
            setIsScanning(true);
            try {
                for (let i = 0; i < filesList.length; i++) {
                    const file = filesList[i];
                    // Extracted file metadata
                    const metadata = await extractMetadata(file); // contains title, artist, image
                    
                    // Upload audio file to backend
                    const uploadedUrl = await uploadFile(file);
                    
                    if (uploadedUrl) {
                        // Keep the extracted image or default
                        const img = metadata.image || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop';
                        const newTitle = metadata.title || file.name;
                        const newArtist = metadata.artist || 'Local Upload';
                        
                        // Push to database
                        await axios.post(`${API_URL}/songs`, {
                            title: newTitle,
                            artist: newArtist,
                            url: uploadedUrl,
                            image: img,
                            category: 'uploaded'
                        });
                    }
                }
                alert("Files successfully uploaded to your library!");
                // Refresh main library list so new songs appear
                fetchData();
            } catch (uploadObjErr) {
                console.error("Upload failure:", uploadObjErr);
                alert("Some files failed to upload. " + uploadObjErr.message);
            }
            setIsScanning(false);
        };
        input.click();
    } catch (err) {
        console.error("Access denied or failed", err);
        setIsScanning(false);
    }
  };

  const handleGlobalSearch = async (query, stayOnHome = false) => {
    if (!query) return;
    console.log("Discovery search:", query);
    setIsDiscovering(true);
    setSearchTerm(query);
    setSelectedGenre('All'); // Reset genre filter when searching worldwide
    
    if (!stayOnHome && activeTab !== 'search') setActiveTab('search');
    
    try {
        const res = await axios.get(`${API_URL}/discover?query=${encodeURIComponent(query)}`);
        
        const rawData = res.data?.data?.results || res.data?.data?.songs || res.data?.data || res.data?.results || [];
        const items = Array.isArray(rawData) ? rawData : (rawData.results || rawData.songs || []);
        
        let results = [];
        if (Array.isArray(items)) {
            results = items.map(item => ({
                _id: item.id || item._id,
                title: item.name || item.title,
                artist: item.primaryArtists || item.artist || item.artists?.primary?.[0]?.name || "Tamil Hit",
                image: (item.image?.[item.image?.length - 1]?.url || item.image?.[item.image?.length - 1]?.link || item.image?.[0]?.url || item.image || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop"),
                url: (item.downloadUrl?.[item.downloadUrl?.length - 1]?.url || item.downloadUrl?.[item.downloadUrl?.length - 1]?.link || item.url || ""),
                category: 'Discover'
            }));
        }

        // If results from web are empty, use local library as fallback
        if (results.length === 0) {
            console.log("Web search empty, falling back to local...");
            const localMatches = songs.filter(s => 
                (s.title + s.artist + s.category).toLowerCase().includes(query.toLowerCase())
            );
            setDiscoverResults(localMatches.length > 0 ? localMatches : songs.slice(0, 20));
        } else {
            setDiscoverResults(results);
        }
    } catch (err) {
        console.error("Discovery error:", err);
        // ULTIMATE FALLBACK: Hardcoded Tamil Hits if all else fails
        const fallbackSongs = [
            { _id: 'fallback-1', title: 'Naa Ready', artist: 'Anirudh Ravichander', image: 'https://c.saavncdn.com/026/Naa-Ready-From-Leo-Tamil-2023-20230616113250-500x500.jpg', url: '', category: 'Trending' },
            { _id: 'fallback-2', title: 'Hukum', artist: 'Anirudh Ravichander', image: 'https://c.saavncdn.com/932/Jailer-Tamil-2023-20230814144445-500x500.jpg', url: '', category: 'Trending' },
            { _id: 'fallback-3', title: 'Arabic Kuthu', artist: 'Anirudh Ravichander', image: 'https://c.saavncdn.com/152/Beast-Tamil-2022-20220427131015-500x500.jpg', url: '', category: 'Trending' },
            { _id: 'fallback-4', title: 'Kaavaalaa', artist: 'Anirudh Ravichander', image: 'https://c.saavncdn.com/932/Jailer-Tamil-2023-20230814144445-500x500.jpg', url: '', category: 'Trending' }
        ];
        setDiscoverResults([...songs.slice(0, 10), ...fallbackSongs]);
    } finally {
        setIsDiscovering(false);
    }
  };




  const handleNext = () => {
    if (queue.length > 0) {
        const nextInQueue = queue[0];
        setQueue(prev => prev.slice(1));
        setCurrentSong(nextInQueue);
        return;
    }

    // Dynamic list detection based on where the current song belongs
    let list = songs;
    if (selectedPlaylistId === 'liked' || activeTab === 'liked') list = likedSongsData;
    else if (selectedPlaylistId === 'local') list = localDriveMedia;
    else if (selectedPlaylistId && selectedPlaylistId !== 'liked') {
        const pl = playlists.find(p => p.id === selectedPlaylistId);
        if (pl) list = pl.songs || [];
    }
    else if (currentSong?.category === 'Trending') list = trendingSongs;
    else if (currentSong?.category === 'Discover') list = discoverResults;
    else list = filteredSongsList;

    if (list.length === 0) return;

    if (isShuffle && list.length > 1) {
        let nextIdx;
        do { nextIdx = Math.floor(Math.random() * list.length); } 
        while (list.length > 1 && list[nextIdx]._id === currentSong?._id);
        setCurrentSong(list[nextIdx]);
        return;
    }

    const idx = list.findIndex(s => s._id === currentSong?._id);
    if (idx !== -1 && idx < list.length - 1) {
        setCurrentSong(list[idx + 1]);
    } else if (isRepeat) {
        setCurrentSong(list[0]);
    } else {
        setCurrentSong(null); 
    }
  };

  const addToQueue = (song) => {
      setQueue(prev => [...prev, song]);
      alert("Added to queue!");
  };

  const createPlaylist = () => {
      const name = prompt("Enter playlist name:");
      if (name) {
          setPlaylists(prev => [...prev, { id: Date.now(), name, songs: [] }]);
      }
  };

  const addToPlaylist = (playlistId, song) => {
      setPlaylists(prev => prev.map(p => 
          p.id === playlistId ? { ...p, songs: [...p.songs, song] } : p
      ));
      alert("Added to playlist!");
  };


  const handlePrev = () => {
    let list = songs;
    if (selectedPlaylistId === 'liked' || activeTab === 'liked') list = likedSongsData;
    else if (selectedPlaylistId === 'local') list = localDriveMedia;
    else if (selectedPlaylistId && selectedPlaylistId !== 'liked') {
        const pl = playlists.find(p => p.id === selectedPlaylistId);
        if (pl) list = pl.songs || [];
    }
    else if (currentSong?.category === 'Trending') list = trendingSongs;
    else if (currentSong?.category === 'Discover') list = discoverResults;
    else list = filteredSongsList;

    if (list.length === 0) return;

    const idx = list.findIndex(s => s._id === currentSong?._id);
    if (idx > 0) {
        setCurrentSong(list[idx - 1]);
    } else {
        // Go to end of list
        setCurrentSong(list[list.length - 1]);
    }
  };

  const filteredSongsList = (activeTab === 'liked' ? likedSongsData : songs)
    .filter(s => 
        (s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.artist.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (selectedGenre === 'All' || s.category === selectedGenre.toLowerCase())
    );

  const filteredMovies = movies.filter(m => 
    m.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const genres = ['All', 'Tamil Hits', 'Trending', 'Lo-Fi', 'Classical'];


  if (!isAuthenticated) {
      return (
          <div className="login-container">
              <div className="login-card">
                  <div className="login-logo">
                     <span style={{ color: 'var(--primary)' }}>Streamify</span> Premium
                  </div>
                  <div className="profile-icon" style={{ margin: '0 auto 1.5rem', width: '70px', height: '70px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: '1px solid var(--glass-border)' }}>
                      <User size={32} />
                  </div>
                  <h2 style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.8 }}>
                      {isLoginView ? 'Login to continue' : 'Sign up for Premium'}
                  </h2>
                  <form onSubmit={async (e) => {
                      e.preventDefault();
                      if (!loginEmail || !loginPassword) {
                          alert('Please enter email and password');
                          return;
                      }
                      
                      setAuthLoading(true);
                      try {
                          const endpoint = isLoginView ? '/auth/login' : '/auth/register';
                          const res = await axios.post(`${API_URL}${endpoint}`, {
                              email: loginEmail,
                              password: loginPassword
                          });
                          
                          if (res.data.success) {
                              setIsAuthenticated(true);
                              setUser(res.data.user);
                              if (res.data.user.favorites) setFavorites(res.data.user.favorites);
                              if (res.data.user.playlists) setPlaylists(res.data.user.playlists);
                              localStorage.setItem('streamify-auth', 'true');
                              localStorage.setItem('streamify-user', JSON.stringify(res.data.user));
                          }
                      } catch (err) {
                          const msg = err.response?.data?.message || err.message || 'Authentication failed';
                          alert(`Error: ${msg}\nAPI: ${API_URL}`);
                      } finally {
                          setAuthLoading(false);
                      }
                  }}>
                      <input 
                          type="email" 
                          placeholder="Email or username" 
                          className="login-input" 
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          required
                      />
                      <input 
                          type="password" 
                          placeholder="Password" 
                          className="login-input" 
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required
                      />
                      <button type="submit" className="login-btn" disabled={authLoading}>
                          {authLoading ? 'Please wait...' : (isLoginView ? 'Log In' : 'Sign Up')}
                      </button>
                  </form>
                  <p style={{ marginTop: '2rem', fontSize: '0.8rem', opacity: 0.6 }}>
                      {isLoginView ? "Don't have an account? " : "Already have an account? "}
                      <span 
                          style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }}
                          onClick={() => setIsLoginView(!isLoginView)}
                      >
                          {isLoginView ? 'Sign up' : 'Log in'}
                      </span>
                  </p>
              </div>
          </div>
      );
  }

  return (
    <div className="app-container">
      {/* Profile Drawer Overlay */}
      {showProfileDrawer && (
          <div className="profile-drawer-overlay" onClick={() => setShowProfileDrawer(false)}>
              <div className="profile-drawer" onClick={(e) => e.stopPropagation()}>
                  <div className="drawer-header">
                      <div className="profile-icon drawer-avatar">
                          {user?.email?.charAt(0).toUpperCase()}
                      </div>
                      <div className="drawer-meta">
                          <h2>{user?.email?.split('@')[0]}</h2>
                          <p>View profile</p>
                      </div>
                  </div>

                  <div className="drawer-menu">
                       {/* Saved Accounts (switch) */}
                       {savedAccounts.filter(a => a.email !== user?.email).map((acc, i) => (
                           <div key={i} className="drawer-item" onClick={() => {
                               setUser(acc);
                               localStorage.setItem('streamify-user', JSON.stringify(acc));
                               localStorage.setItem('streamify-auth', 'true');
                               setShowProfileDrawer(false);
                           }} style={{ gap: '0.8rem' }}>
                               <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#a78bfa', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>
                                   {acc.email?.charAt(0).toUpperCase()}
                               </div>
                               <div style={{ flex: 1 }}>
                                   <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{acc.email?.split('@')[0]}</div>
                                   <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Switch account</div>
                               </div>
                           </div>
                       ))}
                       <div className="drawer-divider"></div>

                       <div className="drawer-item" onClick={() => { setShowAddAccount(true); setShowProfileDrawer(false); }}>
                           <Plus size={20} /> Add account
                       </div>

                       <div className="drawer-item" onClick={() => { setActiveTab('library'); setShowProfileDrawer(false); }}>
                           <History size={20} /> Recents
                       </div>

                       <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0.5rem 0' }}></div>

                       <div className="drawer-item" onClick={() => { setActiveSubView('settings'); setShowProfileDrawer(false); }}>
                           <Settings size={20} /> Settings and privacy
                       </div>

                       <div className="drawer-item" onClick={() => {
                           localStorage.removeItem('streamify-auth');
                           localStorage.removeItem('streamify-user');
                           setIsAuthenticated(false);
                           setUser(null);
                           setShowProfileDrawer(false);
                       }} style={{ color: '#ef4444' }}>
                           <LogOut size={20} /> Log out
                       </div>
                   </div>
               </div>
           </div>
      )}


      {/* Add Account Modal */}
      {showAddAccount && (
          <div className="profile-drawer-overlay" onClick={() => setShowAddAccount(false)}>
              <div className="profile-drawer" onClick={e => e.stopPropagation()} style={{ maxWidth: '360px' }}>
                  <div className="drawer-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <button onClick={() => setShowAddAccount(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', alignSelf: 'flex-end' }}><X size={20} /></button>
                      <h2 style={{ margin: 0, fontSize: '1.3rem' }}>{addAccountIsLogin ? 'Log in to another account' : 'Create a new account'}</h2>
                  </div>

                  <div style={{ padding: '1rem 1.5rem 2rem' }}>
                      <form onSubmit={async (e) => {
                          e.preventDefault();
                          if (!addAccountEmail || !addAccountPassword) return;
                          setAddAccountLoading(true);
                          try {
                              const endpoint = addAccountIsLogin ? '/auth/login' : '/auth/register';
                              const res = await axios.post(`${API_URL}${endpoint}`, {
                                  email: addAccountEmail,
                                  password: addAccountPassword
                              });
                              if (res.data.success) {
                                  const newAcc = res.data.user;
                                  // Save both current + new account to the saved list
                                  setSavedAccounts(prev => {
                                      const base = user ? [...prev.filter(a => a.email !== user.email), user] : [...prev];
                                      const updated = [...base.filter(a => a.email !== newAcc.email), newAcc];
                                      localStorage.setItem('streamify-accounts', JSON.stringify(updated));
                                      return updated;
                                  });
                                  // Switch to new account
                                  setUser(newAcc);
                                  if (newAcc.favorites) setFavorites(newAcc.favorites);
                                  if (newAcc.playlists) setPlaylists(newAcc.playlists);
                                  localStorage.setItem('streamify-user', JSON.stringify(newAcc));
                                  localStorage.setItem('streamify-auth', 'true');
                                  setAddAccountEmail('');
                                  setAddAccountPassword('');
                                  setShowAddAccount(false);
                              }
                          } catch (err) {
                              const msg = err.response?.data?.message || err.message || 'Authentication failed';
                              alert(`Error: ${msg}\nAPI: ${API_URL}`);
                          } finally {
                              setAddAccountLoading(false);
                          }
                      }}>
                          <input
                              type="email"
                              placeholder="Email"
                              className="login-input"
                              value={addAccountEmail}
                              onChange={e => setAddAccountEmail(e.target.value)}
                              required
                              style={{ marginBottom: '0.8rem' }}
                          />
                          <input
                              type="password"
                              placeholder="Password"
                              className="login-input"
                              value={addAccountPassword}
                              onChange={e => setAddAccountPassword(e.target.value)}
                              required
                              style={{ marginBottom: '1.2rem' }}
                          />
                          <button type="submit" className="login-btn" disabled={addAccountLoading}>
                              {addAccountLoading ? 'Please wait...' : (addAccountIsLogin ? 'Log In' : 'Sign Up')}
                          </button>
                      </form>
                      <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', opacity: 0.6 }}>
                          {addAccountIsLogin ? "Don't have an account? " : 'Already have an account? '}
                          <span style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setAddAccountIsLogin(!addAccountIsLogin)}>
                              {addAccountIsLogin ? 'Sign up' : 'Log in'}
                          </span>
                      </p>
                  </div>
              </div>
          </div>
      )}

      {/* Settings Modal (Workable) */}
      {activeSubView === 'settings' && (
          <div className="video-overlay" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(30px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="glass" style={{ width: '500px', padding: '3rem', borderRadius: '24px', position: 'relative' }}>
                  <button className="close-video" onClick={() => setActiveSubView(null)}><X size={24} /></button>
                  <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Settings</h2>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Audio Quality</div>
                              <div style={{ color: 'var(--text-muted)' }}>Currently: High (320kbps)</div>
                          </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Content Language</div>
                              <div style={{ color: 'var(--text-muted)' }}>Tamil, English, Hindi</div>
                          </div>
                          <button style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Change</button>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Gapless Playback</div>
                              <div style={{ color: 'var(--text-muted)' }}>Seamless transitions between songs</div>
                          </div>
                          <div style={{ width: '40px', height: '20px', background: 'var(--primary)', borderRadius: '10px' }}></div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          playlists={playlists} 
          selectedPlaylistId={selectedPlaylistId}
          setSelectedPlaylistId={setSelectedPlaylistId}
      />
      
      <main className="main-content">
        <header className="search-container" style={{ display: (activeTab === 'search' || activeTab === 'discover') ? 'none' : 'flex' }}>
          <div className="search-wrapper">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search in your library..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') handleGlobalSearch(searchTerm);
                }}
              />
          </div>

          <div style={{ display: 'flex', gap: '0.8rem' }}>
              {isInstallable && (
                  <button 
                      onClick={handleInstallClick}
                      className="filter-chip"
                      style={{ background: 'white', color: 'black', fontWeight: 600 }}
                  >
                      Install
                  </button>
              )}
              <div 
                className="profile-icon" 
                style={{ 
                    cursor: 'pointer', 
                    width: '32px',
                    height: '32px',
                    background: '#a78bfa',
                    color: 'black',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    fontWeight: 700
                }}
                onClick={() => setShowProfileDrawer(true)}
              >
                {user?.email?.charAt(0).toUpperCase()}
              </div>
          </div>
        </header>

        {/* Genre Selector */}
        {(activeTab === 'home' || activeTab === 'music' || activeTab === 'liked') && (
            <div className="filter-container">
                {genres.map(genre => (
                    <button 
                        key={genre}
                        className={`filter-chip ${selectedGenre === genre ? 'active' : ''}`}
                        onClick={() => {
                            setSelectedGenre(genre);
                            if (genre === 'All') {
                                setFilteredSongs(songs);
                            } else {
                                // If on home, don't jump tabs - just update content
                                if (activeTab === 'home') {
                                    handleGlobalSearch(genre, true); // Added 'stay' parameter
                                } else {
                                    handleGlobalSearch(genre);
                                }
                            }
                        }}
                    >
                        {genre}
                    </button>
                ))}
            </div>
        )}

        {(activeTab === 'home' || activeTab === 'liked') && (
          <section>
            <h1>{activeTab === 'home' ? 'Start Your Journey' : 'Your Favorites'}</h1>
            
            {activeTab === 'home' && (
                <div style={{ marginBottom: '3rem' }}>
                   {/* Recently Played - Spotify Style Row */}
                   {recentlyPlayed.length > 0 && (
                      <div style={{ marginBottom: '3rem' }}>
                         <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>Jump Back In</h2>
                         <div className="media-grid">
                            {recentlyPlayed.slice(0, 6).map(song => (
                               <MediaCard 
                                   key={`recent-${song._id}`} 
                                   item={song} 
                                   type="music" 
                                   onClick={setCurrentSong} 
                                   onAddToPlaylist={addToPlaylist}
                                   onLongPress={setContextMenuSong}
                               />
                            ))}
                         </div>
                      </div>
                   )}

                   <div className="banner-hero" style={{ padding: '3rem', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(10,10,20,1) 100%)', border: '1px solid var(--glass-border)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'relative', zIndex: 2 }}>
                            <h2 className="banner-title" style={{ fontWeight: 900, fontSize: '3.5rem', marginBottom: '1rem', color: 'white', letterSpacing: '-0.04em' }}>New Music Friday</h2>
                            <p style={{ opacity: 0.8, fontSize: '1.1rem', maxWidth: '500px', marginBottom: '2rem' }}>Catch up on the latest releases and global trending tracks updated every week.</p>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <button onClick={() => setActiveTab('music')} style={{ padding: '1rem 2.5rem', borderRadius: '50px', background: 'var(--primary)', color: 'black', border: 'none', fontWeight: 800, cursor: 'pointer', transition: 'transform 0.2s', fontSize: '1rem' }}>Listen Now</button>
                            </div>
                        </div>
                        <div className="banner-circle" style={{ position: 'absolute', right: '5%', top: '-30%', width: '400px', height: '400px', background: 'var(--primary)', filter: 'blur(120px)', opacity: 0.2, borderRadius: '50%' }}></div>
                   </div>
                </div>
            )}

            <div style={{ marginBottom: '3rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em' }}>{activeTab === 'liked' ? `${filteredSongs.length} Liked Tracks` : 'Made For You'}</h2>
                {activeTab === 'home' && <button onClick={() => setActiveTab('music')} className="nav-link" style={{ background: 'none', color: 'var(--primary)', fontWeight: 700 }}>Show all</button>}
              </div>
              
              {selectedGenre !== 'All' ? (
                <div className="media-grid">
                  {discoverResults.map(song => (
                    <MediaCard 
                        key={`genre-${song._id}`} 
                        item={song} 
                        type="music" 
                        onClick={setCurrentSong} 
                        isLiked={favorites.includes(song._id)}
                        onLike={() => toggleLike(song)}
                        onLongPress={setContextMenuSong}
                    />
                  ))}
                </div>
              ) : filteredSongsList.length > 0 ? (
                <div className="media-grid">
                  {(activeTab === 'home' ? filteredSongsList.slice(0, 6) : filteredSongsList).map(song => (
                    <MediaCard 
                        key={song._id} 
                        item={song} 
                        type="music" 
                        onClick={setCurrentSong} 
                        isLiked={favorites.includes(song._id)}
                        onLike={() => toggleLike(song)}
                        playlists={playlists}
                        onAddToPlaylist={addToPlaylist}
                        onLongPress={setContextMenuSong}
                    />
                  ))}
                </div>
              ) : (
                  <div className="glass" style={{ padding: '3rem', textAlign: 'center', opacity: 0.6 }}>
                      <h3>Your library is empty</h3>
                      <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Search in 'Discover' to find songs or select 'All' filter.</p>
                  </div>
              )}
            </div>

            {activeTab === 'home' && trendingSongs.length > 0 && (
                <div style={{ marginBottom: '3rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Charts & Trending</h2>
                        <button onClick={() => { setSearchTerm('tamil trending'); handleGlobalSearch('tamil trending'); }} className="nav-link" style={{ background: 'none', color: 'var(--primary)', fontWeight: 700 }}>Show all</button>
                    </div>
                    <div className="media-grid">
                        {trendingSongs.map(song => (
                            <MediaCard 
                                key={song._id} 
                                item={song} 
                                type="music" 
                                onClick={setCurrentSong} 
                                isLiked={favorites.some(s => s._id === song._id)}
                                onLike={() => toggleLike(song)}
                                playlists={playlists}
                                onAddToPlaylist={addToPlaylist}
                                onLongPress={setContextMenuSong}
                            />
                        ))}
                    </div>
                </div>
            )}
            
            {activeTab === 'home' && (
                <section>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem' }}>Trending Movies</h2>
                    <button onClick={() => setActiveTab('movies')} className="nav-link" style={{ background: 'none', color: 'var(--primary)' }}>View All</button>
                  </div>
                  <div className="media-grid">
                    {filteredMovies.slice(0, 4).map(movie => (
                      <MediaCard key={movie._id} item={movie} type="movie" onClick={setPlayingVideo} onLongPress={null} />
                    ))}
                  </div>
                </section>
            )}
          </section>
        )}

        {(activeTab === 'library' || activeTab === 'liked') && (
          <section className="library-view">
            {!selectedPlaylistId && activeTab !== 'liked' ? (
                <>
                    <div className="library-header-row">
                        <div className="library-header-left">
                            <div className="profile-icon" style={{ width: '40px', height: '40px', background: 'var(--primary)', color: 'black' }}>{user?.email?.charAt(0).toUpperCase()}</div>
                            <h1 style={{ margin: 0 }}>Your Library</h1>
                        </div>
                        <div className="library-header-actions">
                            <button onClick={handleFolderSelect} className="filter-chip" style={{ display: 'flex', gap: '0.4rem', border: '1px solid var(--glass-border)' }}>
                                <HardDrive size={16} /> {isScanning ? "Scanning..." : "Local Files"}
                            </button>
                            <button onClick={createPlaylist} className="filter-chip" style={{ background: 'white', color: 'black' }}>
                                <Plus size={16} /> New Playlist
                            </button>
                        </div>
                    </div>

                    <div className="filter-container">
                        <button className="filter-chip active">Playlists</button>
                        <button className="filter-chip">Artists</button>
                        <button className="filter-chip">Albums</button>
                        <button className="filter-chip">Downloaded</button>
                    </div>

                    <div className="library-list">
                        <div className="song-row" onClick={() => setSelectedPlaylistId('liked')} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', cursor: 'pointer' }}>
                            <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, #4f46e5 0%, #c7d2fe 100%)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Heart fill="white" color="white" />
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '1rem' }}>Liked Songs</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Playlist • {favorites.length} songs</div>
                            </div>
                        </div>

                        {playlists.map(p => (
                            <div key={p.id} className="song-row" onClick={() => setSelectedPlaylistId(p.id)} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', cursor: 'pointer' }}>
                                <div style={{ width: '64px', height: '64px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Music color="var(--primary)" />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{p.name}</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Playlist • {p.songs?.length || 0} songs</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <>
                    <div style={{ marginBottom: '2rem' }}>
                        <button 
                            onClick={() => { setSelectedPlaylistId(null); }}
                            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}
                        >
                             ← Back to Library
                        </button>
                        
                        <div className="library-header" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-end', marginTop: '1rem', flexWrap: 'wrap' }}>
                            <div className="library-art-box" style={{ 
                                width: 'min(232px, 100%)', 
                                aspectPosition: '1/1',
                                background: selectedPlaylistId === 'liked' ? 'linear-gradient(135deg, #4f46e5 0%, #c7d2fe 100%)' : 'rgba(255,255,255,0.05)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                {selectedPlaylistId === 'liked' ? <Heart size={80} fill="white" color="white" /> : <Music size={80} color="var(--primary)" />}
                            </div>
                            <div style={{ flex: 1, minWidth: '300px' }}>
                                <p style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '0.1em' }}>PLAYLIST</p>
                                <h1 className="library-title" style={{ fontSize: 'clamp(2.5rem, 8vw, 6rem)', margin: '0 0 1rem', fontWeight: 900, lineHeight: 1.1 }}>
                                    {selectedPlaylistId === 'liked' ? 'Liked Songs' : (selectedPlaylistId === 'local' ? 'Local Files' : playlists.find(p => p.id === selectedPlaylistId)?.name)}
                                </h1>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: 600, flexWrap: 'wrap' }}>
                                    <span style={{ color: 'white', fontWeight: 700 }}>{user?.email?.split('@')[0] || 'User'}</span>
                                    <span style={{ opacity: 0.5 }}>•</span>
                                    <span style={{ color: 'var(--text-muted)' }}>{
                                        selectedPlaylistId === 'liked' ? `${favorites.length} songs` : (selectedPlaylistId === 'local' ? `${localDriveMedia.length} tracks` : `${playlists.find(p => p.id === selectedPlaylistId)?.songs?.length || 0} songs`)
                                    }</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '2rem' }}>
                         <button 
                            onClick={() => {
                                const list = selectedPlaylistId === 'liked' ? songs.filter(s => favorites.includes(s._id)) : (playlists.find(p => p.id === selectedPlaylistId)?.songs || []);
                                if (list.length > 0) setCurrentSong(list[0]);
                            }}
                            style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--primary)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}
                         >
                            <Play fill="black" size={28} />
                         </button>
                         <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Plus size={32} /></button>
                    </div>

                    <div className="song-table">
                        <div style={{ display: 'flex', padding: '0 1rem 0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            <div style={{ width: '40px' }}>#</div>
                            <div style={{ flex: 1 }}>Title</div>
                            <div style={{ width: '150px' }}>Album</div>
                            <div style={{ width: '80px', textAlign: 'right' }}><History size={16} /></div>
                        </div>
                        
                        {(selectedPlaylistId === 'liked' ? favorites : (selectedPlaylistId === 'local' ? localDriveMedia : (playlists.find(p => p.id === selectedPlaylistId)?.songs || []))).map((song, i) => (
                            <div key={`${song._id}-${i}`} className="song-row" onClick={() => setCurrentSong(song)} style={{ display: 'flex', padding: '0.6rem 1rem', alignItems: 'center', cursor: 'pointer', borderRadius: '4px' }}>
                                <div style={{ width: '40px', color: currentSong?._id === song._id ? 'var(--primary)' : 'var(--text-muted)' }}>{i + 1}</div>
                                <div style={{ flex: 1, display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <img src={song.image} style={{ width: '40px', height: '40px', borderRadius: '4px' }} />
                                    <div>
                                        <div style={{ fontWeight: 600, color: currentSong?._id === song._id ? 'var(--primary)' : 'white' }}>{song.title}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{song.artist}</div>
                                    </div>
                                </div>
                                <div style={{ width: '150px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{song.category}</div>
                                <div style={{ width: '80px', textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-muted)' }}>3:45</div>
                            </div>
                        ))}
                    </div>
                </>
            )}
          </section>
        )}

        {(activeTab === 'search') && (
          <section className="search-page-sp" style={{ paddingBottom: '160px', flex: 1, minHeight: '80vh' }}>
            <div className="top-nav-bar" style={{ padding: '1.5rem 1rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div 
                    className="profile-icon" 
                    style={{ 
                        background: 'linear-gradient(135deg, #a78bfa, #6366f1)',
                        color: 'white',
                        width: '35px',
                        height: '35px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        fontWeight: 700
                    }}
                    onClick={() => setShowProfileDrawer(true)}
                >
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <h1 className="page-title">Search</h1>
                <Camera size={26} color="white" />
            </div>

            <div className="sp-search-bar" onClick={() => document.getElementById('main-search-input').focus()}>
                <Search size={22} color="black" />
                <input 
                    id="main-search-input"
                    type="text" 
                    placeholder="What do you want to listen to?"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleGlobalSearch(searchTerm);
                    }}
                />
            </div>

            {/* If Not searching and no results, show Discovery categories */}
            {(!isDiscovering && discoverResults.length === 0) ? (
                <div style={{ padding: '0 1rem' }}>
                    <div className="section-heading">Start browsing</div>
                    <div className="category-grid">
                        <div className="category-card" style={{ backgroundColor: '#E13300' }} onClick={() => handleGlobalSearch('tamil top hits')}>
                            <span>Tamil Hits</span>
                            <img src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop" alt="Music" />
                        </div>
                        <div className="category-card" style={{ backgroundColor: '#1e1b4b' }} onClick={() => handleGlobalSearch('tamil melodies')}>
                            <span>Melodies</span>
                            <img src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop" alt="Podcasts" />
                        </div>
                        <div className="category-card" style={{ backgroundColor: '#1DB954' }} onClick={() => handleGlobalSearch('tamil kuthu songs')}>
                            <span>Kuthu</span>
                            <img src="https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=300&h=300&fit=crop" alt="Live" />
                        </div>
                        <div className="category-card" style={{ backgroundColor: '#503750' }} onClick={() => handleGlobalSearch('ar rahman tamil songs')}>
                            <span>AR Rahman</span>
                            <img src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop" alt="Charts" />
                        </div>
                    </div>

                    <div className="section-heading">Discover something new</div>
                    <div className="discover-scroll">
                        <div className="video-card-sp" onClick={() => handleGlobalSearch('tamil trending')}>
                            <img src="https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=600&fit=crop" alt="Music for you" />
                            <span>Music for you</span>
                        </div>
                        <div className="video-card-sp" onClick={() => handleGlobalSearch('tamil hip hop')}>
                            <img src="https://images.unsplash.com/photo-1621618806140-5e34addfa2ab?w=400&h=600&fit=crop" alt="Tamil hip hop" />
                            <span>#tamil hip hop</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div style={{ padding: '0 1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <div>
                            <h1>Search Results</h1>
                            <p style={{ color: 'var(--text-muted)' }}>Top results for "{searchTerm}"</p>
                        </div>
                        <button onClick={() => { setSearchTerm(''); setDiscoverResults([]); setSelectedGenre('All'); }} className="filter-chip" style={{ background: 'var(--surface-hover)' }}>Clear</button>
                    </div>

                    <div className="media-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
                        {discoverResults.length > 0 ? (
                            discoverResults.map(song => (
                                <MediaCard 
                                    key={song._id} 
                                    item={song} 
                                    type="music" 
                                    onClick={setCurrentSong} 
                                    isLiked={favorites.some(s => s._id === song._id)}
                                    onLike={() => toggleLike(song)}
                                    onLongPress={setContextMenuSong}
                                />
                            ))
                        ) : isDiscovering ? (
                            <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '5rem' }}>
                                <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid var(--glass-border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
                                <p>Searching the globe...</p>
                            </div>
                        ) : (
                            <div className="glass" style={{ padding: '5rem', textAlign: 'center', gridColumn: '1 / -1' }}>
                                <h3>No results for "{searchTerm}"</h3>
                                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Try searching for a movie name like "Leo" or an artist like "Anirudh".</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
          </section>
        )}



        {activeTab === 'music' && (
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>My Music Library</h1>
                <button onClick={() => setShowAddMusic(!showAddMusic)} style={{ padding: '0.75rem 1.5rem', borderRadius: '50px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={20} /> Add New Music
                </button>
            </div>

            {showAddMusic && (
                <div className="glass" style={{ padding: '2rem', marginBottom: '2.5rem', animation: 'slideDown 0.4s easeOut' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Upload New Track</h2>
                    <form id="add-music-form" onSubmit={async (e) => {
                        e.preventDefault();
                        const target = e.target;
                        setLoading(true);
                        try {
                            const audioUrl = await uploadFile(target.audioFile.files[0]);
                            const imageUrl = target.previewImage || await uploadFile(target.imageFile.files[0]);
                            await axios.post(`${API_URL}/songs`, {
                                title: target.title.value,
                                artist: target.artist.value,
                                url: audioUrl,
                                image: imageUrl,
                                category: selectedGenre !== 'All' ? selectedGenre.toLowerCase() : 'pop'
                            });
                            alert('Song uploaded to your library!');
                            setShowAddMusic(false);
                            fetchData();
                        } catch (err) { alert(err.message); }
                        finally { setLoading(false); }

                    }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <input name="title" id="song-title-input" placeholder="Song Title" className="search-input" style={{ maxWidth: 'none' }} required />
                        <input name="artist" id="song-artist-input" placeholder="Artist Name" className="search-input" style={{ maxWidth: 'none' }} required />
                        <div>
                            <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Audio Source (MP3)</div>
                            <input type="file" name="audioFile" className="search-input" style={{ maxWidth: 'none', padding: '0.4rem' }} required 
                                onChange={async (e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        const meta = await extractMetadata(file);
                                        document.getElementById('song-title-input').value = meta.title;
                                        document.getElementById('song-artist-input').value = meta.artist;
                                        if (meta.image) {
                                            const form = document.getElementById('add-music-form');
                                            form.previewImage = meta.image;
                                            document.getElementById('art-preview').src = meta.image;
                                        }
                                    }
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Cover Art</div>
                                <input type="file" name="imageFile" className="search-input" style={{ maxWidth: 'none', padding: '0.4rem' }} />
                            </div>
                            <img id="art-preview" src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop" style={{ width: '45px', height: '45px', borderRadius: '6px', marginTop: '1.8rem', objectFit: 'cover' }} />
                        </div>
                        <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem' }}>
                            <button type="submit" style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius)', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Upload Track</button>
                            <button type="button" onClick={() => setShowAddMusic(false)} style={{ padding: '0.75rem 2rem', borderRadius: 'var(--radius)', background: 'var(--surface-hover)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="glass" style={{ padding: '1rem', border: 'none' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 1fr 100px', padding: '1rem', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
                    <div>#</div>
                    <div>TITLE</div>
                    <div>ARTIST</div>
                    <div style={{ textAlign: 'right' }}>ACTION</div>
                </div>
                {filteredSongs.map((song, i) => (
                    <div key={song._id} 
                         className={`song-row ${currentSong?._id === song._id ? 'active' : ''}`}
                         style={{ 
                             display: 'grid', 
                             gridTemplateColumns: '50px 1fr 1fr 100px', 
                             padding: '1rem', 
                             alignItems: 'center', 
                             borderRadius: '12px',
                             transition: 'var(--transition)',
                             cursor: 'pointer',
                             background: currentSong?._id === song._id ? 'var(--surface-hover)' : 'transparent',
                             marginTop: '0.5rem'
                         }}
                         onClick={() => setCurrentSong(song)}
                    >
                        <div style={{ color: currentSong?._id === song._id ? 'var(--primary)' : 'var(--text-muted)' }}>
                            {currentSong?._id === song._id ? '▶' : i + 1}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <img src={song.image} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                            <div style={{ fontWeight: 600, color: currentSong?._id === song._id ? 'var(--primary)' : 'white' }}>{song.title}</div>
                        </div>
                        <div style={{ color: 'var(--text-muted)' }}>{song.artist}</div>
                        <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '0.8rem', justifyContent: 'flex-end' }}>
                            <button 
                                onClick={(e) => { e.stopPropagation(); addToQueue(song); }}
                                title="Play Next"
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                            >
                                <Plus size={18} />
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); const pId = prompt("Enter Playlist ID (debug) or name?"); if(playlists.length > 0) addToPlaylist(playlists[0].id, song); }}
                                title="Add to Playlist"
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                            >
                                <Music size={18} />
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); toggleLike(song); }}
                                style={{ background: 'none', border: 'none', color: favorites.some(s => s._id === song._id) ? 'var(--secondary)' : 'var(--text-muted)', cursor: 'pointer' }}
                            >
                                <Heart size={18} fill={favorites.some(s => s._id === song._id) ? 'currentColor' : 'none'} />
                            </button>
                            <div className="control-btn play" style={{ width: '32px', height: '32px', display: 'inline-flex', background: currentSong?._id === song._id ? 'white' : 'var(--surface-hover)' }}>
                                <Play size={16} fill="currentColor" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
          </section>
        )}

        {/* ... Rest of tabs existing ... */}
        {activeTab === 'movies' && (
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>My Movie Collection</h1>
                <button onClick={() => setShowAddMovie(!showAddMovie)} style={{ padding: '0.75rem 1.5rem', borderRadius: '50px', background: 'var(--secondary)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={20} /> Add To Collection
                </button>
            </div>

            {showAddMovie && (
                <div className="glass" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
                    <form onSubmit={async (e) => {
                        e.preventDefault();
                        const target = e.target;
                        setLoading(true);
                        try {
                            const videoUrl = await uploadFile(target.videoFile.files[0]);
                            const thumbUrl = await uploadFile(target.thumbnailFile.files[0]);
                            await axios.post(`${API_URL}/movies`, {
                                title: target.title.value,
                                category: target.category.value,
                                videoUrl: videoUrl,
                                thumbnail: thumbUrl
                            });
                            alert('Movie added to your library!');
                            setShowAddMovie(false);
                            fetchData();
                        } catch (err) { alert('Failed to add movie'); }
                        finally { setLoading(false); }
                    }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <input name="title" placeholder="Movie Title" className="search-input" style={{ maxWidth: 'none' }} required />
                        <input name="category" placeholder="Genre / Category" className="search-input" style={{ maxWidth: 'none' }} required />
                        <div>
                            <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Video Source (MP4)</div>
                            <input type="file" name="videoFile" className="search-input" style={{ maxWidth: 'none', padding: '0.4rem' }} required />
                        </div>
                        <div>
                            <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Movie Poster / Thumbnail</div>
                            <input type="file" name="thumbnailFile" className="search-input" style={{ maxWidth: 'none', padding: '0.4rem' }} required />
                        </div>
                        <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem' }}>
                            <button type="submit" style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius)', background: 'var(--secondary)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Create Entry</button>
                            <button type="button" onClick={() => setShowAddMovie(false)} style={{ padding: '0.75rem 2rem', borderRadius: 'var(--radius)', background: 'var(--surface-hover)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="media-grid">
              {filteredMovies.map(movie => (
                <MediaCard key={movie._id} item={movie} type="movie" onClick={setPlayingVideo} onLongPress={null} />
              ))}
            </div>
          </section>
        )}

        {/* Library Hub (Primarily for Mobile) */}
        {/* Mobile Library Hub Integrated into main Library view above */}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem', position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10000 }}>
             <div style={{ textAlign: 'center' }}>
                <div className="spinner" style={{ width: '50px', height: '50px', border: '5px solid var(--glass-border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
                <div style={{ color: 'white', fontWeight: 600 }}>Syncing Your Library...</div>
             </div>
          </div>
        )}
        
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes slideDown { 
              from { opacity: 0; transform: translateY(-30px); }
              to { opacity: 1; transform: translateY(0); }
          }
          .song-row:hover { background: var(--surface-hover) !important; transform: scale(1.01); }
          .song-row.active { box-shadow: 0 0 20px rgba(139, 92, 246, 0.2); }
        `}</style>
      </main>

      <AudioPlayer 
        currentSong={currentSong} 
        songs={songs} 
        queue={queue}
        playlists={playlists}
        addToPlaylist={addToPlaylist}
        addToQueue={addToQueue}
        onSearch={handleGlobalSearch}
        onNext={handleNext} 
        onPrev={handlePrev} 
        isShuffle={isShuffle}
        setIsShuffle={setIsShuffle}
        isRepeat={isRepeat}
        setIsRepeat={setIsRepeat}
        toggleLike={toggleLike}
        favorites={favorites}
      />

      {/* Global Track Options Menu (Spotify Style) */}
      {contextMenuSong && (
        <div className="fs-menu-overlay" onClick={() => { setContextMenuSong(null); setContextMenuShowPlaylists(false); }} style={{ zIndex: 20000 }}>
           <div className="fs-menu-sheet" onClick={e => e.stopPropagation()}>
               <div className="sheet-handle"></div>
               <div className="sheet-header">
                   <img src={contextMenuSong.image} alt="Art" />
                   <div className="sheet-meta">
                       <h3>{contextMenuSong.title}</h3>
                       <p>{contextMenuSong.artist}</p>
                   </div>
               </div>

               <div className="sheet-actions">
                   <button className="sheet-item" onClick={() => { setCurrentSong(contextMenuSong); setContextMenuSong(null); setContextMenuShowPlaylists(false); }}>
                       <Play size={22} /> <span>Play Now</span>
                   </button>

                   <button className="sheet-item" onClick={() => { addToQueue(contextMenuSong); setContextMenuSong(null); setContextMenuShowPlaylists(false); }}>
                       <Plus size={22} /> <span>Add to Queue</span>
                   </button>

                   <button className="sheet-item" onClick={() => { toggleLike(contextMenuSong); setContextMenuSong(null); setContextMenuShowPlaylists(false); }}>
                       <Heart size={22} fill={favorites.some(s => s._id === contextMenuSong._id) ? "#818cf8" : "none"} color={favorites.some(s => s._id === contextMenuSong._id) ? "#818cf8" : "white"} />
                       <span>{favorites.some(s => s._id === contextMenuSong._id) ? 'Liked ✓' : 'Like'}</span>
                   </button>

                   {/* Add to Playlist */}
                   <button className="sheet-item" onClick={() => setContextMenuShowPlaylists(!contextMenuShowPlaylists)}>
                       <ListMusic size={22} />
                       <span>Add to Playlist</span>
                       <ChevronRight size={18} style={{ marginLeft: 'auto', opacity: 0.5, transform: contextMenuShowPlaylists ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                   </button>

                   {/* Inline Playlist Picker */}
                   {contextMenuShowPlaylists && (
                       <div className="sheet-playlist-picker">
                           {playlists.length === 0 ? (
                               <div className="sheet-empty-hint">
                                   No playlists yet.<br/>Create one in the Library tab.
                               </div>
                           ) : (
                               playlists.map(p => (
                                   <button key={p.id} className="sheet-playlist-item"
                                       onClick={() => {
                                           addToPlaylist(p.id, contextMenuSong);
                                           setContextMenuSong(null);
                                           setContextMenuShowPlaylists(false);
                                       }}
                                   >
                                       <div className="sheet-playlist-icon">
                                           <Music size={16} color="var(--primary)" />
                                       </div>
                                       <div>
                                           <div className="sheet-playlist-name">{p.name}</div>
                                           <div className="sheet-playlist-count">{p.songs?.length || 0} songs</div>
                                       </div>
                                   </button>
                               ))
                           )}
                           {/* Add New Playlist Option */}
                           <button className="sheet-playlist-item"
                               onClick={() => {
                                   createPlaylist();
                               }}
                               style={{ justifyContent: 'center', color: 'var(--primary)', fontWeight: 600, padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}
                           >
                               <Plus size={16} /> <span style={{ marginLeft: '10px' }}>Create New Playlist</span>
                           </button>
                       </div>
                   )}

                   {/* Download */}
                   <button className="sheet-item" onClick={() => {
                       const a = document.createElement('a');
                       a.href = contextMenuSong.url;
                       a.download = `${contextMenuSong.title} - ${contextMenuSong.artist}.mp3`;
                       a.target = '_blank';
                       document.body.appendChild(a);
                       a.click();
                       document.body.removeChild(a);
                       
                       setActiveTab('library');
                       setSelectedPlaylistId('local');

                       setContextMenuSong(null);
                       setContextMenuShowPlaylists(false);
                   }}>
                       <Download size={22} /> <span>Download Song</span>
                   </button>

                   <div className="sheet-divider"></div>

                   <button className="sheet-item" onClick={() => { setContextMenuSong(null); setContextMenuShowPlaylists(false); }} style={{ color: 'var(--text-muted)' }}>
                       <X size={22} /> <span>Close</span>
                   </button>
               </div>
           </div>
        </div>
      )}

      <VideoModal 
        video={playingVideo} 
        onClose={() => setPlayingVideo(null)} 
      />

      {/* Mobile Bottom Navigation Bar */}
      <div className="mobile-bottom-nav">
          <div className={`mobile-nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => { setActiveTab('home'); setActiveSubView(null); }}>
              <Music size={24} />
              <span>Home</span>
          </div>
          <div className={`mobile-nav-item ${activeTab === 'search' ? 'active' : ''}`} onClick={() => { setActiveTab('search'); setActiveSubView(null); }}>
              <Search size={24} />
              <span>Search</span>
          </div>
          <div className={`mobile-nav-item ${activeTab === 'library' || activeTab === 'liked' ? 'active' : ''}`} onClick={() => { setActiveTab('library'); setActiveSubView(null); }}>
              <Heart size={24} />
              <span>Library</span>
          </div>
      </div>
    </div>
  );

}

export default App;

