import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Maximize2, Shuffle, Repeat } from 'lucide-react';

const AudioPlayer = ({ currentSong, songs, onNext, onPrev, isShuffle, setIsShuffle, isRepeat, setIsRepeat }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (currentSong && audioRef.current) {
        audioRef.current.src = currentSong.url;
        audioRef.current.play().then(() => setIsPlaying(true)).catch(e => console.error(e));
    }
  }, [currentSong]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime;
    const dur = audioRef.current.duration;
    setCurrentTime(current);
    setDuration(dur || 0);
    setProgress((current / dur) * 100 || 0);
  };

  const handleSeek = (e) => {
    if (!audioRef.current || !audioRef.current.duration) return;
    const width = e.target.clientWidth;
    const rect = e.target.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const duration = audioRef.current.duration;
    const newTime = (clickX / width) * duration;
    if (isFinite(newTime)) {
        audioRef.current.currentTime = newTime;
    }
  };


  const formatTime = (time) => {
    if (!time) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  if (!currentSong) return null;

  return (
    <div className="player-bar">
      <audio 
        ref={audioRef} 
        onTimeUpdate={handleTimeUpdate} 
        onEnded={onNext}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      
      <div className="player-info">
        <div style={{ position: 'relative' }}>
            <img 
                src={currentSong.image} 
                alt={currentSong.title} 
                className={`player-thumb ${isPlaying ? 'rotating' : ''}`} 
                style={{ borderRadius: '50%', border: '2px solid var(--primary)' }}
            />
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '10px', height: '10px', background: 'var(--background)', borderRadius: '50%', border: '1px solid var(--primary)' }}></div>
        </div>
        <div>
          <div className="card-title" style={{ maxWidth: '200px', fontSize: '0.9rem' }}>{currentSong.title}</div>
          <div className="card-subtitle" style={{ fontSize: '0.8rem' }}>{currentSong.artist}</div>
        </div>
      </div>

      <div className="player-controls">
        <div className="control-buttons">
          <button 
            className={`control-btn ${isShuffle ? 'active-loop' : ''}`} 
            onClick={() => setIsShuffle(!isShuffle)}
            style={{ color: isShuffle ? 'var(--primary)' : 'var(--text-muted)' }}
          >
            <Shuffle size={18} />
          </button>
          
          <button className="control-btn" onClick={onPrev}><SkipBack size={20} /></button>
          
          <button className="control-btn play" onClick={togglePlay} style={{ width: '45px', height: '45px' }}>
            {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
          </button>
          
          <button className="control-btn" onClick={onNext}><SkipForward size={20} /></button>
          
          <button 
            className={`control-btn ${isRepeat ? 'active-loop' : ''}`} 
            onClick={() => setIsRepeat(!isRepeat)}
            style={{ color: isRepeat ? 'var(--primary)' : 'var(--text-muted)' }}
          >
            <Repeat size={18} />
          </button>
        </div>
        
        <div className="progress-container">
          <span style={{ minWidth: '35px' }}>{formatTime(currentTime)}</span>
          <div className="progress-bar" onClick={handleSeek}>
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <span style={{ minWidth: '35px' }}>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="player-info mobile-hide-volume" style={{ justifyContent: 'flex-end', width: '200px' }}>
        <button className="control-btn"><Volume2 size={20} /></button>
        <button className="control-btn"><Maximize2 size={20} /></button>
      </div>

      <style>{`
        .rotating { animation: rotate 10s linear infinite; }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 600px) {
            .mobile-hide-volume { display: none !important; }
            .player-bar { padding: 0.5rem; gap: 0.5rem; }
            .control-buttons { gap: 1rem; }
        }
      `}</style>
    </div>
  );
};

export default AudioPlayer;

