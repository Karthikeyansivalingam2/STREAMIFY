import { Home, Music, Film, Plus, Settings, HardDrive, Heart, Search } from 'lucide-react';



const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'home', icon: <Home size={20} />, label: 'Home' },
    { id: 'discover', icon: <Search size={20} />, label: 'Search' },
    { id: 'library', icon: <Plus size={20} />, label: 'Your Library' },
  ];

  return (
    <div className="sidebar">
      <div className="logo" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '2rem' }}>
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
            }}
          >
            {item.icon}
            {item.label}
          </a>
        ))}
      </nav>
      
      <div style={{ marginTop: '2rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem', padding: '0 1rem' }}>Playlist</p>
          <a href="#create" className="nav-link" onClick={(e) => { e.preventDefault(); setActiveTab('library'); }}>
             <Plus size={20} style={{ background: '#2a2a4a', color: 'var(--text-muted)', borderRadius: '4px', padding: '4px' }} />
             Create Playlist
          </a>
          <a href="#liked" className="nav-link" onClick={(e) => { e.preventDefault(); setActiveTab('library'); }}>
             <Heart size={20} style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #c7d2fe 100%)', color: 'white', borderRadius: '4px', padding: '4px' }} />
             Liked Songs
          </a>
      </div>
    </div>
  );
};

export default Sidebar;
