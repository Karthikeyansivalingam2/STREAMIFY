import { Home, Music, Film, Plus, Settings, HardDrive, Heart, Search } from 'lucide-react';



const Sidebar = ({ activeTab, setActiveTab, playlists, setSelectedPlaylistId, selectedPlaylistId }) => {
  const menuItems = [
    { id: 'home', icon: <Home size={20} />, label: 'Home' },
    { id: 'discover', icon: <Search size={20} />, label: 'Search' },
    { id: 'library', icon: <Plus size={20} />, label: 'Your Library' },
  ];

  return (
    <div className="sidebar">
      <div className="logo" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '2rem', padding: '0 1rem' }}>
        STREAM<span style={{ color: 'var(--text)' }}>IFY</span>
      </div>
      
      <nav>
        {menuItems.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab(item.id);
              setSelectedPlaylistId(null);
            }}
          >
            {item.icon}
            {item.label}
          </a>
        ))}
      </nav>
      
      <div style={{ marginTop: '2rem', flex: 1, overflowY: 'auto' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem', padding: '0 1rem' }}>Playlists</p>
          
          <a href="#liked" className={`nav-link ${selectedPlaylistId === 'liked' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('library'); setSelectedPlaylistId('liked'); }}>
             <div style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #c7d2fe 100%)', width: '24px', height: '24px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '0.5rem' }}>
                <Heart size={14} fill="white" color="white" />
             </div>
             Liked Songs
          </a>

          {playlists.map(playlist => (
             <a 
                key={playlist.id} 
                href={`#playlist-${playlist.id}`} 
                className={`nav-link ${selectedPlaylistId === playlist.id ? 'active' : ''}`}
                onClick={(e) => {
                    e.preventDefault();
                    setActiveTab('library');
                    setSelectedPlaylistId(playlist.id);
                }}
             >
                <Music size={20} color="var(--text-muted)" />
                {playlist.label || playlist.name}
             </a>
          ))}
      </div>
    </div>
  );
};

export default Sidebar;
