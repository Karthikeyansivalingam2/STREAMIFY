import React, { useState } from 'react';
import { Play, Heart, MoreVertical, Plus } from 'lucide-react';

const MediaCard = ({ item, type, onClick, isLiked, onLike, playlists = [], onAddToPlaylist, onLongPress }) => {
  const [showMenu, setShowMenu] = useState(false);
  const touchTimer = React.useRef(null);
  const [isLongPress, setIsLongPress] = useState(false);

  const handleTouchStart = (e) => {
    if (type !== 'music') return;
    setIsLongPress(false);
    touchTimer.current = setTimeout(() => {
        setIsLongPress(true);
        if (onLongPress) onLongPress(item);
        // Vibrate if supported
        if (navigator.vibrate) navigator.vibrate(50);
    }, 600);
  };

  const handleTouchEnd = (e) => {
    if (touchTimer.current) {
        clearTimeout(touchTimer.current);
    }
  };

  const handleClick = (e) => {
    // If it was a long press, don't trigger normal click
    if (isLongPress) {
        e.preventDefault();
        e.stopPropagation();
        return;
    }
    onClick(item);
  };

  return (
    <div 
        className="media-card" 
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onContextMenu={(e) => {
            if (type === 'music') {
                e.preventDefault();
                if (onLongPress) onLongPress(item);
            }
        }}
    >
      <div className="card-img-container">
        <img 
          src={type === 'music' ? item.image : item.thumbnail} 
          alt={item.title} 
          className="card-img" 
          loading="lazy"
        />
        <div className="play-overlay">
          <div className="control-btn play" style={{ width: '50px', height: '50px' }}>
            <Play fill="currentColor" size={24} />
          </div>
        </div>
        
        {type === 'music' && (
           <button 
               className="like-btn"
               onClick={(e) => { e.stopPropagation(); onLike(item); }}
               style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', padding: '8px', cursor: 'pointer', zIndex: 10, display: 'flex', color: isLiked ? 'var(--secondary)' : 'white' }}
           >
               <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
           </button>
        )}
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
