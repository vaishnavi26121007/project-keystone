import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <aside
        style={{
          width: 240,
          background: '#0f172a',
          color: '#e2e8f0',
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontWeight: 800, fontSize: 20, letterSpacing: '0.02em' }}>KEYSTONE</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Field Service Platform</div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          <NavItem to="/">Dashboard</NavItem>
          <NavItem to="/work-orders">Work Orders</NavItem>

          {hasRole('ADMIN', 'DISPATCHER') && <NavItem to="/dispatch">Dispatch Board</NavItem>}
          {hasRole('ADMIN', 'DISPATCHER') && <NavItem to="/clients">Clients & Sites</NavItem>}
          {hasRole('ADMIN', 'DISPATCHER') && <NavItem to="/parts">Parts Inventory</NavItem>}
          {hasRole('CLIENT') && <NavItem to="/new-request">New Service Request</NavItem>}
          {hasRole('TECHNICIAN') && <NavItem to="/my-jobs">My Jobs</NavItem>}
        </nav>

        <div style={{ borderTop: '1px solid #1e293b', paddingTop: 16, marginTop: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{user?.fullName}</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 12 }}>{user?.role}</div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: '#1e293b',
              color: '#e2e8f0',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 13
            }}
          >
            Log out
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, background: '#f8fafc', padding: '32px 40px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      style={({ isActive }) => ({
        padding: '10px 12px',
        borderRadius: 6,
        color: isActive ? '#fff' : '#cbd5e1',
        background: isActive ? '#2563eb' : 'transparent',
        textDecoration: 'none',
        fontSize: 14,
        fontWeight: isActive ? 600 : 500
      })}
    >
      {children}
    </NavLink>
  );
}
