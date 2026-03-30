import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Maximize2 } from 'lucide-react';

const AudioPlayer = ({ currentSong, songs, onNext, onPrev }) => {
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
    const current = audioRef.current.currentTime;
    const dur = audioRef.current.duration;
    setCurrentTime(current);
    setDuration(dur || 0);
    setProgress((current / dur) * 100 || 0);
  };

  const handleSeek = (e) => {
    const width = e.target.clientWidth;
    const clickX = e.nativeEvent.offsetX;
    const duration = audioRef.current.duration;
    audioRef.current.currentTime = (clickX / width) * duration;
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
      />
      
      <div className="player-info">
        <img src={currentSong.image} alt={currentSong.title} className="player-thumb" />
        <div>
          <div className="card-title" style={{ maxWidth: '200px' }}>{currentSong.title}</div>
          <div className="card-subtitle">{currentSong.artist}</div>
        </div>
      </div>

      <div className="player-controls">
        <div className="control-buttons">
          <button className="control-btn" onClick={onPrev}><SkipBack size={20} /></button>
          <button className="control-btn play" onClick={togglePlay}>
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
          </button>
          <button className="control-btn" onClick={onNext}><SkipForward size={20} /></button>
        </div>
        
        <div className="progress-container">
          <span>{formatTime(currentTime)}</span>
          <div className="progress-bar" onClick={handleSeek}>
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="player-info" style={{ justifyContent: 'flex-end', width: '200px' }}>
        <button className="control-btn"><Volume2 size={20} /></button>
        <button className="control-btn"><Maximize2 size={20} /></button>
      </div>
    </div>
  );
};

export default AudioPlayer;
