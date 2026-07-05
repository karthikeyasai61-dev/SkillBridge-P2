import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import StarBackground from './StarBackground';

export default function Layout({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <StarBackground />

      <div className="app-layout" style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        {/* Backing backdrop overlay for mobile/tablet to close sidebar when clicking outside */}
        {sidebarOpen && (
          <div 
            className="sidebar-overlay" 
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <Sidebar 
          user={user} 
          onLogout={onLogout} 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
        />
        
        <Topbar 
          user={user} 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
        />
        
        <main className="main-content" style={{ position: 'relative', zIndex: 1 }}>
          <Outlet />
        </main>
      </div>
    </>
  );
}
