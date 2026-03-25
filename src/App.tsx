import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

import LandingPage    from './pages/LandingPage';
import AboutPage      from './pages/AboutPage';
import MarketsPage    from './pages/MarketsPage';
import PlansPage      from './pages/PlansPage';
import DashboardPage  from './pages/DashboardPage';
import WalletPage     from './pages/WalletPage';
import TradingPage    from './pages/TradingPage';
import SupportPage    from './pages/SupportPage';

// Page-level transition wrapper
function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.32, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}

// Pages that should NOT show Footer (app pages have their own scroll layout)
const NO_FOOTER_ROUTES = ['/dashboard', '/wallet', '/trading'];

function AppContent() {
  const location = useLocation();
  const showFooter = !NO_FOOTER_ROUTES.some(r => location.pathname.startsWith(r));

  return (
    <>
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/"          element={<PageTransition><LandingPage /></PageTransition>} />
          <Route path="/about"     element={<PageTransition><AboutPage /></PageTransition>} />
          <Route path="/markets"   element={<PageTransition><MarketsPage /></PageTransition>} />
          <Route path="/plans"     element={<PageTransition><PlansPage /></PageTransition>} />
          <Route path="/dashboard" element={<PageTransition><DashboardPage /></PageTransition>} />
          <Route path="/wallet"    element={<PageTransition><WalletPage /></PageTransition>} />
          <Route path="/trading"   element={<PageTransition><TradingPage /></PageTransition>} />
          <Route path="/support"   element={<PageTransition><SupportPage /></PageTransition>} />
          {/* Login / Register placeholders */}
          <Route path="/login"    element={<PageTransition><AuthPlaceholder mode="login" /></PageTransition>} />
          <Route path="/register" element={<PageTransition><AuthPlaceholder mode="register" /></PageTransition>} />
          {/* 404 */}
          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </AnimatePresence>
      {showFooter && <Footer />}
    </>
  );
}

// Simple auth placeholder screens
function AuthPlaceholder({ mode }: { mode: 'login' | 'register' }) {
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'0 24px' }}>
      <div style={{
        background:'#111', border:'1px solid rgba(201,160,80,0.25)',
        borderRadius:'20px', padding:'48px', maxWidth:'420px', width:'100%',
        boxShadow:'0 0 50px rgba(201,160,80,0.12)',
      }}>
        <div style={{ textAlign:'center', marginBottom:'32px' }}>
          <div style={{ fontSize:'32px', marginBottom:'12px' }}>🥇</div>
          <h2 style={{ fontSize:'26px', fontWeight:800, marginBottom:'8px', color:'#C9A050' }}>
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.45)' }}>
            {mode === 'login' ? 'Sign in to access your portfolio' : 'Start investing in Gold & Crypto today'}
          </p>
        </div>

        {[
          ...(mode === 'register' ? [{ label:'Full Name', placeholder:'John Doe', type:'text' }] : []),
          { label:'Email Address', placeholder:'you@example.com', type:'email' },
          { label:'Password',      placeholder:'••••••••',       type:'password' },
        ].map(field => (
          <div key={field.label} style={{ marginBottom:'14px' }}>
            <label style={{ display:'block', fontSize:'12px', color:'rgba(255,255,255,0.45)', marginBottom:'7px', fontWeight:500 }}>{field.label}</label>
            <input
              type={field.type}
              placeholder={field.placeholder}
              style={{
                width:'100%', padding:'12px 16px',
                background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)',
                borderRadius:'10px', color:'#fff', fontSize:'14px', outline:'none',
              }}
            />
          </div>
        ))}

        <button style={{
          width:'100%', padding:'14px', borderRadius:'11px', marginTop:'8px',
          background:'linear-gradient(135deg, #C9A050, #E5C97A)',
          border:'none', color:'#0A0A0A', fontWeight:700, fontSize:'15px', cursor:'pointer',
          boxShadow:'0 0 25px rgba(201,160,80,0.35)',
        }}>
          {mode === 'login' ? 'Sign In' : 'Create Free Account'}
        </button>

        <p style={{ textAlign:'center', fontSize:'13px', color:'rgba(255,255,255,0.4)', marginTop:'20px' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <a href={mode === 'login' ? '/register' : '/login'} style={{ color:'#C9A050', textDecoration:'none', fontWeight:500 }}>
            {mode === 'login' ? 'Sign Up' : 'Sign In'}
          </a>
        </p>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'24px' }}>
      <div style={{ fontSize:'80px', marginBottom:'16px' }}>🔍</div>
      <h1 style={{ fontSize:'42px', fontWeight:800, color:'#C9A050', marginBottom:'12px' }}>404</h1>
      <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'16px', marginBottom:'28px' }}>Page not found</p>
      <a href="/" style={{
        padding:'12px 28px', borderRadius:'10px',
        background:'linear-gradient(135deg, #C9A050, #E5C97A)',
        color:'#0A0A0A', fontWeight:700, textDecoration:'none',
      }}>Back to Home</a>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
