import { Home, Music, Film, Plus, Settings, HardDrive, Heart, Search } from 'lucide-react';



const Sidebar = ({ activeTab, setActiveTab, playlists, setSelectedPlaylistId, selectedPlaylistId }) => {
  const menuItems = [
    { id: 'home', icon: <Home size={20} />, label: 'Home' },
    { id: 'discover', icon: <Search size={20} />, label: 'Search' },
    { id: 'library', icon: <Plus size={20} />, label: 'Your Library' },
  ];

  return (
    <div className="sidebar" style={{ background: 'rgba(10, 10, 20, 0.4)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(255,255,255,0.03)' }}>
      <div className="logo" style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '3rem', padding: '0 1rem', letterSpacing: '-0.05em' }}>
        STREAM<span style={{ color: 'var(--text)' }}>IFY</span>
      </div>
      
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
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
            style={{ borderRadius: '12px', padding: '0.8rem 1.2rem', fontSize: '1rem' }}
          >
            {item.icon}
            <span style={{ fontWeight: 600 }}>{item.label}</span>
          </a>
        ))}
      </nav>
      
      <div style={{ marginTop: '3rem', flex: 1, overflowY: 'auto' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1.25rem', padding: '0 1.2rem', letterSpacing: '0.1em' }}>Library</p>
          
          <a href="#liked" className={`nav-link ${selectedPlaylistId === 'liked' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('library'); setSelectedPlaylistId('liked'); }} style={{ borderRadius: '12px', padding: '0.8rem 1.2rem' }}>
             <div style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #c7d2fe 100%)', width: '28px', height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '0.8rem', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)' }}>
                <Heart size={16} fill="white" color="white" />
             </div>
             <span style={{ fontWeight: 600 }}>Liked Songs</span>
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
                style={{ borderRadius: '12px', padding: '0.8rem 1.2rem' }}
             >
                <div style={{ background: 'rgba(255,255,255,0.05)', width: '28px', height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '0.8rem' }}>
                    <Music size={16} color="var(--text-muted)" />
                </div>
                <span style={{ fontWeight: 600 }}>{playlist.label || playlist.name}</span>
             </a>
          ))}
      </div>
    </div>
  );
};

export default Sidebar;
