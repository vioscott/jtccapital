import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronRight, Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import jtcLogo from '../../assets/images/logos/jtc_logo_full.png';
import ConfirmModal from '../ui/ConfirmModal';
import Sidebar from './Sidebar';

const navLinks = [
  { label: 'Markets', to: '/markets' },
  { label: 'Plans', to: '/plans' },
  { label: 'About', to: '/about' },
  { label: 'Support', to: '/support' },
];

interface NavbarProps {
  notification?: string | null;
  showNotif?: boolean;
  setShowNotif?: (v: boolean) => void;
}

export default function Navbar({ notification = null, showNotif = false, setShowNotif }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { session, signOut, role } = useAuth();

  const isDashboard = ['/dashboard', '/wallet', '/trading'].some(path => location.pathname.startsWith(path));

  const handleLogout = async () => {
    await signOut();
    setShowLogoutConfirm(false);
    navigate('/login');
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [location]);

  return (
    <>
      <header
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          transition: 'all 0.3s ease',
          background: scrolled
            ? 'rgba(10,10,10,0.95)'
            : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(201,160,80,0.15)' : '1px solid transparent',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img 
              src={jtcLogo} 
              alt="JTC management INC" 
              style={{ height: '62px', width: 'auto' }} 
              loading="lazy"
            />
          </Link>

          {/* Desktop Nav */}
          {!isDashboard && (
            <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="hidden-mobile">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    padding: '8px 16px', borderRadius: '8px',
                    fontSize: '14px', fontWeight: 500,
                    color: location.pathname === link.to ? '#C9A050' : 'rgba(255,255,255,0.7)',
                    background: location.pathname === link.to ? 'rgba(201,160,80,0.1)' : 'transparent',
                    border: location.pathname === link.to ? '1px solid rgba(201,160,80,0.3)' : '1px solid transparent',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}

          {/* CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {session ? (
              <>
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setShowNotif && setShowNotif(!showNotif)}
                    style={{
                      background: showNotif ? 'rgba(201,160,80,0.12)' : 'none',
                      border: showNotif ? '1px solid rgba(201,160,80,0.3)' : 'none',
                      borderRadius: '8px',
                      color: showNotif ? '#C9A050' : 'rgba(255,255,255,0.6)',
                      cursor: 'pointer', padding: '8px',
                      transition: 'all 0.2s',
                      position: 'relative',
                    }}
                  >
                    <Bell size={20} />
                    {notification && (
                      <span style={{
                        position: 'absolute', top: '5px', right: '5px',
                        width: '7px', height: '7px', borderRadius: '50%',
                        background: '#ef4444', border: '1.5px solid #0a0a0a',
                      }} />
                    )}
                  </button>

                  {/* Notification dropdown */}
                  <AnimatePresence>
                    {showNotif && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.18 }}
                        style={{
                          position: 'absolute', top: 'calc(100% + 12px)', right: 0,
                          width: '300px', background: '#111',
                          border: '1px solid rgba(201,160,80,0.25)',
                          borderRadius: '14px', padding: '16px',
                          boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
                          zIndex: 200,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                          <Bell size={15} color="#C9A050" />
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#C9A050', letterSpacing: '0.03em' }}>Notifications</span>
                          <button
                            onClick={() => setShowNotif && setShowNotif(false)}
                            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', lineHeight: 1 }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                        <div style={{
                          padding: '12px 14px', borderRadius: '10px',
                          background: notification?.includes('open') ? 'rgba(239,68,68,0.07)' : 'rgba(201,160,80,0.06)',
                          border: `1px solid ${notification?.includes('open') ? 'rgba(239,68,68,0.2)' : 'rgba(201,160,80,0.15)'}`,
                        }}>
                          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.5 }}>
                            {notification || 'All clear. No pending notifications.'}
                          </p>
                        </div>
                        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginTop: '10px', marginBottom: 0 }}>
                          Updates every 30 seconds
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <Link to="/dashboard" style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 18px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, #C9A050, #E5C97A)',
                  color: '#0A0A0A', fontWeight: 600, fontSize: '14px',
                  textDecoration: 'none',
                }} className="hidden-mobile">
                  <User size={16} /> Dashboard
                </Link>
                {role === 'admin' && (
                  <Link to="/admin/dashboard" style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 18px', borderRadius: '10px',
                    background: 'rgba(201,160,80,0.1)', border: '1px solid rgba(201,160,80,0.3)',
                    color: '#C9A050', fontWeight: 600, fontSize: '14px',
                    textDecoration: 'none',
                  }} className="hidden-mobile">
                    Admin
                  </Link>
                )}
                <button onClick={() => setShowLogoutConfirm(true)} style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: 'none', border:'1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px', padding: '8px 14px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
                }} className="hidden-mobile">
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" style={{
                  padding: '8px 18px', borderRadius: '10px',
                  border: '1px solid rgba(201,160,80,0.4)',
                  color: '#C9A050', fontWeight: 500, fontSize: '14px',
                  textDecoration: 'none', transition: 'all 0.2s',
                }} className="hidden-mobile">
                  Sign In
                </Link>
                <Link to="/register" style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 20px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, #C9A050, #E5C97A)',
                  color: '#0A0A0A', fontWeight: 600, fontSize: '14px',
                  textDecoration: 'none', whiteSpace: 'nowrap',
                  boxShadow: '0 0 20px rgba(201,160,80,0.3)',
                }} className="hidden-mobile">
                  Get Started <ChevronRight size={15} />
                </Link>
              </>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setOpen(v => !v)}
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px', padding: '8px', cursor: 'pointer', color: '#fff',
                display: 'none',
              }}
              className="show-mobile"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.28 }}
            style={{
              position: 'fixed', top: 72, right: 0, bottom: 0, width: '280px',
              background: 'rgba(10,10,10,0.98)', backdropFilter: 'blur(20px)',
              borderLeft: '1px solid rgba(201,160,80,0.2)',
              zIndex: 99, padding: isDashboard ? '0' : '24px',
              display: 'flex', flexDirection: 'column', gap: '8px',
            }}
          >
            {isDashboard ? (
              <Sidebar isMobile onClose={() => setOpen(false)} />
            ) : (
              <>
                {navLinks.map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '14px 16px', borderRadius: '10px',
                      color: location.pathname === link.to ? '#C9A050' : '#fff',
                      background: location.pathname === link.to ? 'rgba(201,160,80,0.1)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${location.pathname === link.to ? 'rgba(201,160,80,0.3)' : 'rgba(255,255,255,0.06)'}`,
                      textDecoration: 'none', fontWeight: 500,
                    }}
                  >
                    {link.label} <ChevronRight size={16} />
                  </Link>
                ))}
                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {session ? (
                    <>
                      <Link to="/dashboard" style={{
                        padding: '13px', borderRadius: '10px',
                        background: 'linear-gradient(135deg, #C9A050, #E5C97A)',
                        color: '#0A0A0A', fontWeight: 600,
                        textDecoration: 'none', textAlign: 'center',
                      }}>Dashboard</Link>
                      <button onClick={() => setShowLogoutConfirm(true)} style={{
                        padding: '13px', borderRadius: '10px',
                        border: '1px solid rgba(255,255,255,0.1)', background:'transparent',
                        color: 'rgba(255,255,255,0.6)', fontWeight: 500, cursor:'pointer'
                      }}>Logout</button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" style={{
                        padding: '13px', borderRadius: '10px',
                        border: '1px solid rgba(201,160,80,0.4)',
                        color: '#C9A050', fontWeight: 500,
                        textDecoration: 'none', textAlign: 'center',
                      }}>Sign In</Link>
                      <Link to="/register" style={{
                        padding: '13px', borderRadius: '10px',
                        background: 'linear-gradient(135deg, #C9A050, #E5C97A)',
                        color: '#0A0A0A', fontWeight: 600,
                        textDecoration: 'none', textAlign: 'center',
                      }}>Get Started</Link>
                    </>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (min-width: 768px) { .hidden-mobile { display: flex !important; } .show-mobile { display: none !important; } }
        @media (max-width: 767px) { .hidden-mobile { display: none !important; } .show-mobile { display: flex !important; } }
      `}</style>

      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        message="Are you sure you want to log out? You will need to sign in again to access your portfolio."
        confirmLabel="Logout"
        variant="danger"
      />
    </>
  );
}

