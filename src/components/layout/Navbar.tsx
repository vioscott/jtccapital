import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronRight, Bell, User } from 'lucide-react';
import jtcLogo from '../../assets/images/logos/jtc_logo_full.png';

const navLinks = [
  { label: 'Markets', to: '/markets' },
  { label: 'Plans', to: '/plans' },
  { label: 'About', to: '/about' },
  { label: 'Support', to: '/support' },
];

// Simulate auth state — in real app this comes from AuthContext
const IS_AUTH = false;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

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
            <img src={jtcLogo} alt="JTC Invest" style={{ height: '62px', width: 'auto' }} />
          </Link>

          {/* Desktop Nav */}
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

          {/* CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {IS_AUTH ? (
              <>
                <button style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', padding: '8px' }}>
                  <Bell size={20} />
                </button>
                <Link to="/dashboard" style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 18px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, #C9A050, #E5C97A)',
                  color: '#0A0A0A', fontWeight: 600, fontSize: '14px',
                  textDecoration: 'none',
                }}>
                  <User size={16} /> Dashboard
                </Link>
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
                }}>
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
              zIndex: 99, padding: '24px',
              display: 'flex', flexDirection: 'column', gap: '8px',
            }}
          >
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (min-width: 768px) { .hidden-mobile { display: flex !important; } .show-mobile { display: none !important; } }
        @media (max-width: 767px) { .hidden-mobile { display: none !important; } .show-mobile { display: flex !important; } }
      `}</style>
    </>
  );
}
