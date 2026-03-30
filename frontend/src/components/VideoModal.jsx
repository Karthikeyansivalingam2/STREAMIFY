import React from 'react';
import { X } from 'lucide-react';

const VideoModal = ({ video, onClose }) => {
  if (!video) return null;

  return (
    <div className="video-overlay" onClick={onClose}>
      <div className="video-container" onClick={(e) => e.stopPropagation()}>
        <button className="close-video" onClick={onClose}>
          <X size={24} />
        </button>
        <video 
          controls 
          autoPlay 
          src={video.videoUrl} 
          poster={video.thumbnail}
        />
        <div style={{ padding: '1.5rem', background: 'var(--surface)' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{video.title}</h2>
          <p style={{ color: 'var(--text-muted)' }}>{video.category}</p>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
