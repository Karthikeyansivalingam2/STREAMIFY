import React, { useState } from 'react';
import { Play, Heart, MoreVertical, Plus } from 'lucide-react';

const MediaCard = ({ item, type, onClick, isLiked, onLike, playlists = [], onAddToPlaylist }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="media-card" onClick={() => onClick(item)}>
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
           <>
              <button 
                  className="like-btn"
                  onClick={(e) => { e.stopPropagation(); onLike(item); }}
                  style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', padding: '8px', cursor: 'pointer', zIndex: 10, display: 'flex', color: isLiked ? 'var(--secondary)' : 'white' }}
              >
                  <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
              </button>

              <button 
                  className="menu-trigger"
                  onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                  style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', padding: '6px', cursor: 'pointer', zIndex: 11, display: 'flex', color: 'white', transition: 'transform 0.2s' }}
                  onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.85)'}
                  onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                  <MoreVertical size={16} />
              </button>

              {showMenu && (
                  <div className="glass card-menu" onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', bottom: '45px', right: '10px', zIndex: 100, width: '180px', padding: '0.5rem', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
                      <p style={{ margin: '0 0 0.5rem 0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Add to Playlist</p>
                      {playlists.length === 0 && <div style={{ fontSize: '0.8rem', padding: '0.5rem', opacity: 0.5 }}>No playlists yet</div>}
                      {playlists.map(p => (
                          <button 
                              key={p.id} 
                              className="menu-item" 
                              onClick={() => { onAddToPlaylist(p.id, item); setShowMenu(false); }}
                              style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', color: 'white', padding: '0.6rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
                          >
                              <Plus size={14} /> {p.name}
                          </button>
                      ))}
                  </div>
              )}
           </>
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
