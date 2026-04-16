import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Shuffle, Repeat, ListMusic, Heart, X, ChevronDown, MoreVertical } from 'lucide-react';

const AudioPlayer = ({ currentSong, songs, onNext, onPrev, isShuffle, setIsShuffle, isRepeat, setIsRepeat, toggleLike, favorites }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(() => parseFloat(localStorage.getItem('streamify-volume') || '1'));
  const [isMuted, setIsMuted] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Clean HTML entities using a more robust regex-based method to avoid DOM issues
  const cleanText = (text) => {
    if (!text) return "";
    return text
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">");
  };

  useEffect(() => {
    if (currentSong && audioRef.current) {
        audioRef.current.src = currentSong.url;
        audioRef.current.volume = isMuted ? 0 : volume;
        audioRef.current.play().then(() => setIsPlaying(true)).catch(e => console.error(e));

        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: cleanText(currentSong.title),
                artist: cleanText(currentSong.artist),
                album: 'Streamify Premium',
                artwork: currentSong.image ? [{ src: currentSong.image, sizes: '512x512', type: 'image/jpeg' }] : []
            });
        }
    }
  }, [currentSong]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume;
    localStorage.setItem('streamify-volume', volume);
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const cur = audioRef.current.currentTime;
    const dur = audioRef.current.duration || 0;
    setCurrentTime(cur);
    setDuration(dur);
    setProgress((cur / dur) * 100 || 0);
  };

  const handleSeek = (e) => {
    if (!audioRef.current || !audioRef.current.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const newTime = ((e.clientX - rect.left) / rect.width) * audioRef.current.duration;
    audioRef.current.currentTime = newTime;
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  if (!currentSong) return null;

  return (
    <>
    {/* MINIMIZED PLAYER BAR - BEAUTIFIED */}
    <div className={`mini-player-host ${isExpanded ? 'min-hidden' : ''}`}>
        <div className="mini-player" onClick={(e) => {
            if (!e.target.closest('button') && !e.target.closest('.prog-track')) setIsExpanded(true);
        }}>
            <audio ref={audioRef} onTimeUpdate={handleTimeUpdate} onEnded={onNext} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} />
            
            <div className="mini-info">
                <img src={currentSong.image} alt="Art" className={isPlaying ? 'playing-ring' : ''} />
                <div className="mini-meta">
                    <div className="mini-title">{cleanText(currentSong.title)}</div>
                    <div className="mini-artist">{cleanText(currentSong.artist)}</div>
                </div>
                <button className={`mini-heart ${favorites?.includes(currentSong._id) ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); toggleLike(currentSong); }}>
                    <Heart size={20} fill={favorites?.includes(currentSong._id) ? "#818cf8" : "none"} />
                </button>
            </div>

            <div className="mini-controls">
                <div className="mini-btns">
                    <button className="mini-btn h-mob" onClick={(e) => { e.stopPropagation(); onPrev(); }}><SkipBack size={20} fill="white" /></button>
                    <button className="mini-play" onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
                        {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                    </button>
                    <button className="mini-btn" onClick={(e) => { e.stopPropagation(); onNext(); }}><SkipForward size={20} fill="white" /></button>
                </div>
                <div className="prog-track h-mob" onClick={(e) => { e.stopPropagation(); handleSeek(e); }}>
                    <div className="prog-fill" style={{ width: `${progress}%` }}></div>
                </div>
            </div>

            <div className="mini-extra h-mob">
                <button className="mini-btn" onClick={(e) => { e.stopPropagation(); setShowQueue(!showQueue); }}><ListMusic size={20} /></button>
                <div className="mini-vol">
                    <Volume2 size={16} />
                    <div className="prog-track vol" onClick={(e) => { e.stopPropagation(); const r = e.currentTarget.getBoundingClientRect(); setVolume((e.clientX - r.left)/r.width); }}>
                        <div className="prog-fill" style={{ width: `${volume*100}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {/* MASTERPIECE FULLSCREEN VIEW */}
    {isExpanded && (
        <div className="master-fs">
            <div className="fs-glow-bg" style={{ backgroundColor: '#222', backgroundImage: `radial-gradient(circle at center, rgba(129, 140, 248, 0.15) 0%, transparent 70%), url(${currentSong.image})` }}></div>
            
            <div className="fs-navbar">
                <button className="fs-back" onClick={() => setIsExpanded(false)}><ChevronDown size={32} /></button>
                <div className="fs-header-text">
                    <span>PLAYING FROM YOUR LIBRARY</span>
                    <strong>Streamify Premium</strong>
                </div>
                <button className="fs-opt"><MoreVertical size={24} /></button>
            </div>

            <div className="fs-content">
                <div className="fs-visual-section">
                    <img src={currentSong.image} alt="Art" className={`fs-hero-art ${isPlaying ? 'pulse' : ''}`} />
                </div>
                
                <div className="fs-interaction-section">
                    <div className="fs-track-info">
                        <div>
                            <h1 className="fs-main-title">{cleanText(currentSong.title)}</h1>
                            <p className="fs-main-artist">{cleanText(currentSong.artist)}</p>
                        </div>
                        <button className={`fs-heart ${favorites?.includes(currentSong._id) ? 'active' : ''}`} onClick={() => toggleLike(currentSong)}>
                            <Heart size={32} fill={favorites?.includes(currentSong._id) ? "#818cf8" : "none"} />
                        </button>
                    </div>

                    <div className="fs-playback-engine">
                        <div className="fs-scrubber-box">
                            <div className="fs-scrubber" onClick={handleSeek}>
                                <div className="fs-scrubber-fill" style={{ width: `${progress}%` }}></div>
                                <div className="fs-scrubber-knob" style={{ left: `${progress}%` }}></div>
                            </div>
                            <div className="fs-time-labels">
                                <span>{formatTime(currentTime)}</span>
                                <span>{formatTime(duration)}</span>
                            </div>
                        </div>

                        <div className="fs-main-btns">
                            <button className="fs-sec-btn h-mob" onClick={() => setIsShuffle(!isShuffle)}>
                                <Shuffle size={24} color={isShuffle ? '#818cf8' : 'rgba(255,255,255,0.5)'} />
                            </button>
                            <button className="fs-skip-xl" onClick={onPrev}><SkipBack size={40} fill="white" /></button>
                            <button className="fs-play-xl" onClick={togglePlay}>
                                {isPlaying ? <Pause size={40} fill="black" /> : <Play size={40} fill="black" />}
                            </button>
                            <button className="fs-skip-xl" onClick={onNext}><SkipForward size={40} fill="white" /></button>
                            <button className="fs-sec-btn h-mob" onClick={() => setIsRepeat(!isRepeat)}>
                                <Repeat size={24} color={isRepeat ? '#818cf8' : 'rgba(255,255,255,0.5)'} />
                            </button>
                        </div>

                        <div className="fs-footer-row">
                            <button className="fs-footer-btn"><ListMusic size={24} /></button>
                            <div className="fs-vol-slider h-mob">
                                <Volume2 size={20} />
                                <div className="fs-scrubber vol" onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setVolume((e.clientX - r.left)/r.width); }}>
                                    <div className="fs-scrubber-fill" style={{ width: `${volume*100}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )}

    <style>{`
        /* Minimalist Mini Player */
        .mini-player-host { position: fixed; bottom: 85px; left: 1rem; right: 1rem; z-index: 5000; transition: 0.5s ease; }
        .mini-player-host.min-hidden { transform: translateY(150%) scale(0.9); opacity: 0; pointer-events: none; }
        .mini-player { 
            background: rgba(20, 20, 20, 0.8); backdrop-filter: blur(25px); border: 1px solid rgba(255,255,255,0.05);
            border-radius: 12px; padding: 0.6rem 1rem; display: flex; align-items: center; justify-content: space-between;
            box-shadow: 0 10px 40px rgba(0,0,0,0.4);
        }
        .mini-info { display: flex; align-items: center; gap: 0.75rem; flex: 1; min-width: 0; }
        .mini-info img { width: 45px; height: 45px; border-radius: 6px; object-fit: cover; }
        .playing-ring { outline: 2px solid #818cf8; outline-offset: 2px; }
        .mini-meta { overflow: hidden; }
        .mini-title { font-weight: 700; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .mini-artist { font-size: 0.75rem; color: #999; }
        .mini-heart { background: none; border: none; color: #555; cursor: pointer; padding: 0.5rem; }
        .mini-heart.active { color: #818cf8; }

        .mini-controls { flex: 2; display: flex; flex-direction: column; align-items: center; gap: 0.4rem; }
        .mini-btns { display: flex; align-items: center; gap: 1.5rem; }
        .mini-play { width: 40px; height: 40px; background: white; border: none; border-radius: 50%; display: flex; align-items: center; justifyContent: center; cursor: pointer; }
        .mini-btn { background: none; border: none; color: white; cursor: pointer; }
        .prog-track { width: 100%; max-width: 400px; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden; cursor: pointer; }
        .prog-fill { height: 100%; background: #818cf8; border-radius: 2px; }
        
        .mini-extra { flex: 1; display: flex; justify-content: flex-end; align-items: center; gap: 1.5rem; }
        .mini-vol { display: flex; align-items: center; gap: 0.5rem; width: 100px; }
        .prog-track.vol { max-width: 80px; }

        /* Masterpiece Fullscreen */
        .master-fs { position: fixed; inset: 0; background: #000; z-index: 10000; display: flex; flex-direction: column; animation: fsEnter 0.4s cubic-bezier(0,0,0.2,1); overflow: hidden; }
        @keyframes fsEnter { from { transform: translateY(100px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .fs-glow-bg { position: absolute; inset: 0; background-size: cover; background-position: center; mix-blend-mode: lighten; filter: blur(120px) brightness(0.3); opacity: 0.6; z-index: -1; }
        
        .fs-navbar { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 2rem; }
        .fs-back, .fs-opt { background: none; border: none; color: white; cursor: pointer; opacity: 0.7; }
        .fs-header-text { display: flex; flex-direction: column; align-items: center; gap: 0.2rem; }
        .fs-header-text span { font-size: 0.7rem; letter-spacing: 2px; color: #888; font-weight: 700; }
        .fs-header-text strong { font-size: 0.85rem; }

        .fs-content { flex: 1; display: flex; flex-direction: column; padding: 0 2rem 3rem; gap: 2rem; }
        .fs-visual-section { flex: 1; display: flex; align-items: center; justify-content: center; }
        .fs-hero-art { width: 100%; max-width: 400px; aspect-ratio: 1/1; border-radius: 20px; object-fit: cover; box-shadow: 0 30px 60px rgba(0,0,0,0.6); }
        .fs-hero-art.pulse { transform: scale(1.02); transition: 0.5s; }

        .fs-interaction-section { display: flex; flex-direction: column; gap: 1.5rem; }
        .fs-track-info { display: flex; justify-content: space-between; align-items: center; }
        .fs-main-title { font-size: 1.75rem; font-weight: 850; margin: 0; letter-spacing: -0.5px; }
        .fs-main-artist { font-size: 1.1rem; color: #818cf8; margin: 0.3rem 0 0; font-weight: 500; }
        .fs-heart { background: none; border: none; color: #444; cursor: pointer; transition: 0.2s; }
        .fs-heart.active { color: #818cf8; }

        .fs-scrubber-box { width: 100%; display: flex; flex-direction: column; gap: 0.5rem; }
        .fs-scrubber { width: 100%; height: 4px; background: rgba(255,255,255,0.15); border-radius: 10px; position: relative; cursor: pointer; }
        .fs-scrubber-fill { height: 100%; background: white; border-radius: 10px; }
        .fs-scrubber-knob { position: absolute; top: 50%; width: 12px; height: 12px; background: white; border-radius: 50%; transform: translate(-50%, -50%); box-shadow: 0 0 10px rgba(0,0,0,0.5); display: none; }
        .fs-scrubber:hover .fs-scrubber-knob { display: block; }
        .fs-time-labels { display: flex; justify-content: space-between; font-size: 0.8rem; color: #777; font-weight: 600; }

        .fs-main-btns { display: flex; justify-content: space-between; align-items: center; padding: 1rem 0; }
        .fs-play-xl { width: 75px; height: 75px; background: white; border-radius: 50%; border: none; display: flex; align-items: center; justifyContent: center; cursor: pointer; box-shadow: 0 10px 30px rgba(255,255,255,0.2); }
        .fs-skip-xl, .fs-sec-btn { background: none; border: none; color: white; cursor: pointer; }

        .fs-footer-row { display: flex; justify-content: space-between; align-items: center; opacity: 0.7; }
        .fs-footer-btn { background: none; border: none; color: white; }
        .fs-vol-slider { flex: 1; max-width: 150px; display: flex; align-items: center; gap: 1rem; }

        /* Desktop Layout Refinement */
        @media (min-width: 1024px) {
            .fs-content { flex-direction: row; align-items: center; gap: 5%; padding: 0 8% 4rem; }
            .fs-visual-section { flex: 1.2; }
            .fs-hero-art { max-width: 550px; }
            .fs-interaction-section { flex: 1; gap: 3rem; }
            .fs-main-title { font-size: 3.5rem; }
            .fs-main-artist { font-size: 1.8rem; }
            .fs-play-xl { width: 90px; height: 90px; }
        }

        @media (max-width: 768px) {
            .h-mob { display: none !important; }
            .mini-player-host { bottom: 85px; left: 8px; right: 8px; }
            .mini-player { background: #1a1a1a; border-radius: 8px; }
            .fs-content { padding: 0 1.5rem 2rem; }
            .fs-hero-art { max-width: 320px; }
            .fs-main-btns { padding: 0.5rem 0; }
            .fs-main-title { font-size: 1.5rem; }
        }
    `}</style>
    </>
  );
};

export default AudioPlayer;
