import { Link, useLocation, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  TrendingUp, 
  LogOut,
  ChevronRight,
  Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import jtcLogo from '../../assets/images/logos/jtc_logo_full.png';
import ConfirmModal from '../ui/ConfirmModal';

const adminNav = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Users', to: '/admin/users', icon: Users },
  { label: 'Transactions', to: '/admin/transactions', icon: CreditCard },
  { label: 'Active Trades', to: '/admin/trades', icon: TrendingUp },
];

export default function AdminLayout() {
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { signOut } = useAuth();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#080808', color: '#fff' }}>
      {/* Sidebar */}
      <aside style={{
        width: '260px',
        background: '#111',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{ padding: '32px 24px' }}>
          <img 
            src={jtcLogo} 
            alt="JTC Admin" 
            style={{ height: '40px', width: 'auto' }} 
            loading="lazy"
          />
          <div style={{ 
            marginTop: '8px', 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '6px',
            background: 'rgba(201,160,80,0.15)',
            padding: '2px 8px',
            borderRadius: '4px',
            border: '1px solid rgba(201,160,80,0.3)'
          }}>
            <Shield size={10} color="#C9A050" />
            <span style={{ fontSize: '10px', color: '#C9A050', fontWeight: 700, letterSpacing: '0.05em' }}>ADMIN PORTAL</span>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '0 16px' }}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px', paddingLeft: '8px' }}>
            Main Menu
          </div>
          {adminNav.map(item => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.label}
                to={item.to}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  color: isActive ? '#C9A050' : 'rgba(255,255,255,0.6)',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 500,
                  background: isActive ? 'rgba(201,160,80,0.1)' : 'transparent',
                  marginBottom: '4px',
                  transition: 'all 0.2s',
                }}
              >
                <item.icon size={18} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {isActive && <ChevronRight size={14} />}
              </Link>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <Link to="/" style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px', borderRadius: '8px', color: 'rgba(255,255,255,0.5)',
            fontSize: '13px', textDecoration: 'none', marginBottom: '8px'
          }}>
            <LogOut size={16} /> Exit to Site
          </Link>
          <button 
            onClick={() => setShowLogoutConfirm(true)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px',
              borderRadius: '8px',
              color: '#ef4444',
              fontSize: '13px',
              background: 'rgba(239,68,68,0.1)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, marginLeft: '260px', padding: '0' }}>
        {/* Topbar */}
        <header style={{
          height: '72px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '0 32px',
          background: '#080808',
          position: 'sticky',
          top: 0,
          zIndex: 90,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>Administrator</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Super Admin Access</div>
            </div>
            <div style={{ 
              width: '36px', height: '36px', borderRadius: '50%', 
              background: 'linear-gradient(135deg, #C9A050, #E5C97A)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#0A0A0A', fontWeight: 700, fontSize: '14px'
            }}>
              AD
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ padding: '32px' }}>
          <Outlet />
        </div>
      </main>

      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={() => {
          signOut();
          setShowLogoutConfirm(false);
        }}
        title="Admin Logout"
        message="You are about to log out of the administrative portal. Are you sure?"
        confirmLabel="Logout"
        variant="danger"
      />
    </div>
  );
}
