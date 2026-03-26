import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Wallet, 
  TrendingUp, 
  Settings, 
  HelpCircle,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import ConfirmModal from '../ui/ConfirmModal';

const dashboardLinks = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Wallet',    to: '/wallet',    icon: Wallet },
  { label: 'Trading',   to: '/trading',   icon: TrendingUp },
  { label: 'Plans',     to: '/plans',     icon: Settings },
  { label: 'Support',   to: '/support',   icon: HelpCircle },
];

interface SidebarProps {
  onClose?: () => void;
  isMobile?: boolean;
}

export default function Sidebar({ onClose, isMobile }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { signOut } = useAuth();

  const content = (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      padding: isMobile ? '24px' : '24px 16px',
    }}>
      {/* Navigation Links */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        {dashboardLinks.map(link => {
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              onClick={onClose}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 16px', borderRadius: '12px',
                textDecoration: 'none', transition: 'all 0.2s',
                background: isActive ? 'rgba(201,160,80,0.1)' : 'transparent',
                border: `1px solid ${isActive ? 'rgba(201,160,80,0.3)' : 'transparent'}`,
                color: isActive ? '#C9A050' : 'rgba(255,255,255,0.6)',
                fontWeight: isActive ? 600 : 500,
              }}
            >
              <link.icon size={20} />
              <span style={{ fontSize: '15px' }}>{link.label}</span>
              {isActive && <ChevronRight size={14} style={{ marginLeft: 'auto' }} />}
            </Link>
          );
        })}
      </div>

      {/* Logout at bottom */}
      <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px' }}>
        <button
          onClick={() => setShowLogoutConfirm(true)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
            padding: '12px 16px', borderRadius: '12px',
            background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)',
            color: '#ef4444', fontWeight: 600, fontSize: '14px', cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );

  if (isMobile) return content;

  return (
    <aside style={{
      position: 'fixed', top: '72px', left: 0, bottom: 0, width: '260px',
      background: '#0A0A0A', borderRight: '1px solid rgba(255,255,255,0.06)',
      zIndex: 90, display: 'flex', flexDirection: 'column',
    }}>
      {content}
      
      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={async () => {
          await signOut();
          onClose?.();
          setShowLogoutConfirm(false);
          navigate('/');
        }}
        title="Confirm Logout"
        message="Are you sure you want to log out of your session?"
        confirmLabel="Logout"
        variant="danger"
      />
    </aside>
  );
}
