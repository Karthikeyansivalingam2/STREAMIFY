import React from 'react';
import { Home, Music, Film, Plus, Settings, HardDrive } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'home', icon: <Home size={20} />, label: 'Home' },
    { id: 'music', icon: <Music size={20} />, label: 'Music' },
    { id: 'movies', icon: <Film size={20} />, label: 'Movies' },
    { id: 'drive', icon: <HardDrive size={20} />, label: 'My Drive' },
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
      
      <div style={{ marginTop: 'auto' }}>
         <a href="#settings" className="nav-link">
            <Settings size={20} />
            Settings
         </a>
      </div>
    </div>
  );
};

export default Sidebar;
