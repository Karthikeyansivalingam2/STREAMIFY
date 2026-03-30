import React from 'react';
import { Play } from 'lucide-react';

const MediaCard = ({ item, type, onClick }) => {
  return (
    <div className="media-card" onClick={() => onClick(item)}>
      <div className="card-img-container">
        <img 
          src={type === 'music' ? item.image : item.thumbnail} 
          alt={item.title} 
          className="card-img" 
        />
        <div className="play-overlay">
          <div className="control-btn play" style={{ width: '50px', height: '50px' }}>
            <Play fill="currentColor" size={24} />
          </div>
        </div>
      </div>
      <div className="card-content">
        <div className="card-title">{item.title}</div>
        <div className="card-subtitle">
          {type === 'music' ? item.artist : item.category}
        </div>
      </div>
    </div>
  );
};

export default MediaCard;
