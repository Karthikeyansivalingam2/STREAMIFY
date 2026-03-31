import { Play, Heart } from 'lucide-react';

const MediaCard = ({ item, type, onClick, isLiked, onLike }) => {
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
        {type === 'music' && (
           <button 
               className="like-btn"
               onClick={(e) => { e.stopPropagation(); onLike(); }}
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
