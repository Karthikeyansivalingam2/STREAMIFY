import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Music, Film, Plus, Play, HardDrive } from 'lucide-react';
import Sidebar from './components/Sidebar';
import MediaCard from './components/MediaCard';
import AudioPlayer from './components/AudioPlayer';
import VideoModal from './components/VideoModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [showAddMusic, setShowAddMusic] = useState(false);
  const [showAddMovie, setShowAddMovie] = useState(false);
  const [songs, setSongs] = useState([]);
  const [movies, setMovies] = useState([]);
  const [localDriveMedia, setLocalDriveMedia] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentSong, setCurrentSong] = useState(null);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    fetchData();

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
      const [songsRes, moviesRes] = await Promise.all([
        axios.get(`${API_URL}/songs`),
        axios.get(`${API_URL}/movies`)
      ]);
      setSongs(songsRes.data || []);
      setMovies(moviesRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      // Ensure arrays are empty but app still renders
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
    
    // Debug Alert: Let's see exactly what Vercel thinks the link is
    alert("Target URL: " + `${API_URL}/upload`);

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
        if ('showDirectoryPicker' in window) {
            const dirHandle = await window.showDirectoryPicker();
            setIsScanning(true);
            const files = [];
            for await (const entry of dirHandle.values()) {
                if (entry.kind === 'file') {
                    const file = await entry.getFile();
                    if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
                        const metadata = file.type.startsWith('audio/') ? await extractMetadata(file) : { title: file.name };
                        files.push({
                            _id: Math.random().toString(36).substr(2, 9),
                            title: metadata.title,
                            artist: metadata.artist || 'Local Video',
                            image: metadata.image || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=200&h=300&fit=crop',
                            url: URL.createObjectURL(file),
                            category: file.type.startsWith('audio/') ? 'music' : 'movie',
                            isLocal: true
                        });
                    }
                }
            }
            setLocalDriveMedia(files);
            setIsScanning(false);
        } else {
            // Mobile PWA fallback
            const input = document.createElement('input');
            input.type = 'file';
            input.multiple = true;
            input.accept = 'audio/*,video/*';
            input.onchange = async (e) => {
                setIsScanning(true);
                const filesList = e.target.files;
                const arr = [];
                for (let i = 0; i < filesList.length; i++) {
                    const file = filesList[i];
                    if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
                        const metadata = file.type.startsWith('audio/') ? await extractMetadata(file) : { title: file.name };
                        arr.push({
                            _id: Math.random().toString(36).substr(2, 9),
                            title: metadata.title,
                            artist: metadata.artist || 'Local Video',
                            image: metadata.image || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=200&h=300&fit=crop',
                            url: URL.createObjectURL(file),
                            category: file.type.startsWith('audio/') ? 'music' : 'movie',
                            isLocal: true
                        });
                    }
                }
                setLocalDriveMedia(arr);
                setIsScanning(false);
            };
            input.click();
        }
    } catch (err) {
        console.error("Folder access denied or failed", err);
        setIsScanning(false);
    }
  };

  const handleNext = () => {
    const list = currentSong?.isLocal ? localDriveMedia.filter(m => m.category === 'music') : songs;
    const idx = list.findIndex(s => s._id === currentSong?._id);
    if (idx < list.length - 1) setCurrentSong(list[idx + 1]);
    else setCurrentSong(list[0]);
  };

  const handlePrev = () => {
    const list = currentSong?.isLocal ? localDriveMedia.filter(m => m.category === 'music') : songs;
    const idx = list.findIndex(s => s._id === currentSong?._id);
    if (idx > 0) setCurrentSong(list[idx - 1]);
    else setCurrentSong(list[list.length - 1]);
  };

  const filteredSongs = songs.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMovies = movies.filter(m => 
    m.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="main-content">
        <div className="search-container" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={20} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search for music, movies, artists..." 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ maxWidth: 'none' }}
            />
          </div>
          {isInstallable && (
             <button 
                 onClick={handleInstallClick}
                 style={{ padding: '0.8rem 1.5rem', borderRadius: '50px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
             >
                 Install App
             </button>
          )}
        </div>

        {activeTab === 'home' && (
          <section>
            <h1>Start Your Journey</h1>
            
            <div style={{ marginBottom: '3rem' }}>
               <div className="glass banner-hero" style={{ padding: '2rem', borderRadius: '24px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', border: 'none', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'relative', zIndex: 2 }}>
                        <h2 className="banner-title" style={{ fontWeight: 800, marginBottom: '1rem' }}>Stream Your Favorites</h2>
                        <p style={{ opacity: 0.9, fontSize: '1rem', maxWidth: '500px', marginBottom: '2rem' }}>Discover thousands of songs and movies in one place. Your perfect entertainment companion.</p>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <button onClick={() => setActiveTab('music')} style={{ padding: '0.8rem 1.5rem', borderRadius: '50px', background: 'white', color: 'black', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Explore Music</button>
                            <button onClick={() => setActiveTab('drive')} style={{ padding: '0.8rem 1.5rem', borderRadius: '50px', background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.4)', fontWeight: 700, cursor: 'pointer' }}>My Local Drive</button>
                        </div>
                    </div>
                    <div className="banner-circle" style={{ position: 'absolute', right: '-10%', top: '-20%', width: '200px', height: '200px', background: 'white', opacity: 0.1, borderRadius: '50%' }}></div>
               </div>
            </div>

            <div style={{ marginBottom: '3rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem' }}>Popular Songs</h2>
                <button onClick={() => setActiveTab('music')} className="nav-link" style={{ background: 'none', color: 'var(--primary)' }}>View All</button>
              </div>
              <div className="media-grid">
                {filteredSongs.slice(0, 4).map(song => (
                  <MediaCard key={song._id} item={song} type="music" onClick={setCurrentSong} />
                ))}
              </div>
            </div>
            
            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem' }}>Trending Movies</h2>
                <button onClick={() => setActiveTab('movies')} className="nav-link" style={{ background: 'none', color: 'var(--primary)' }}>View All</button>
              </div>
              <div className="media-grid">
                {filteredMovies.slice(0, 4).map(movie => (
                  <MediaCard key={movie._id} item={movie} type="movie" onClick={setPlayingVideo} />
                ))}
              </div>
            </section>
          </section>
        )}

        {activeTab === 'drive' && (
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1>My Local Drive</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Play songs and movies directly from your computer.</p>
                </div>
                <button onClick={handleFolderSelect} style={{ padding: '1rem 2rem', borderRadius: '50px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <Plus size={20} /> Select Media Folder
                </button>
            </div>

            {isScanning ? (
                <div style={{ textAlign: 'center', padding: '5rem' }}>
                    <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid var(--glass-border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
                    <p>Scanning your files...</p>
                </div>
            ) : localDriveMedia.length > 0 ? (
                <div className="media-grid">
                    {localDriveMedia.map(item => (
                        <MediaCard 
                            key={item._id} 
                            item={item} 
                            type={item.category} 
                            onClick={item.category === 'music' ? setCurrentSong : setPlayingVideo} 
                        />
                    ))}
                </div>
            ) : (
                <div className="glass" style={{ padding: '5rem', textAlign: 'center', border: '2px dashed var(--glass-border)', background: 'transparent' }}>
                    <HardDrive size={64} style={{ opacity: 0.3, marginBottom: '1.5rem' }} />
                    <h2 style={{ opacity: 0.8 }}>No Local Media Loaded</h2>
                    <p style={{ opacity: 0.6, maxWidth: '400px', margin: '0 auto 2rem' }}>Click the button above to select a folder on your computer.</p>
                    <button onClick={handleFolderSelect} style={{ padding: '0.8rem 2rem', borderRadius: 'var(--radius)', background: 'var(--surface-hover)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Connect Folder</button>
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
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Tip: When you select a song, we'll automatically detect the title and artist for you!</p>
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
                                image: imageUrl
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
                        <div style={{ textAlign: 'right' }}>
                            <div className="control-btn play" style={{ width: '32px', height: '32px', display: 'inline-flex', background: currentSong?._id === song._id ? 'white' : 'var(--surface-hover)' }}>
                                <Play size={16} fill="currentColor" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
          </section>
        )}

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
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>New Cinematic Entry</h2>
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
                <MediaCard key={movie._id} item={movie} type="movie" onClick={setPlayingVideo} />
              ))}
            </div>
          </section>
        )}

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
        songs={currentSong?.isLocal ? localDriveMedia.filter(m => m.category === 'music') : songs} 
        onNext={handleNext} 
        onPrev={handlePrev} 
      />

      <VideoModal 
        video={playingVideo} 
        onClose={() => setPlayingVideo(null)} 
      />
    </div>
  );
}

export default App;
