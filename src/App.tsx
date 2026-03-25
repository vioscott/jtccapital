import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MarketProvider } from './context/MarketContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';

import LandingPage    from './pages/LandingPage';
import AboutPage      from './pages/AboutPage';
import MarketsPage    from './pages/MarketsPage';
import PlansPage      from './pages/PlansPage';
import DashboardPage  from './pages/DashboardPage';
import WalletPage     from './pages/WalletPage';
import TradingPage    from './pages/TradingPage';
import SupportPage    from './pages/SupportPage';
import LoginPage      from './pages/LoginPage';
import RegisterPage   from './pages/RegisterPage';

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

// Protected Route Wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuth();
  if (isLoading) return <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}><div className="pulse-gold" style={{width:20,height:20,borderRadius:'50%',background:'#C9A050'}}/></div>;
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
}



function AppContent() {
  const location = useLocation();
  const isDashboard = ['/dashboard', '/wallet', '/trading'].some(path => location.pathname.startsWith(path));
  const showFooter = !isDashboard;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        {isDashboard && (
          <div className="hidden-mobile">
            <Sidebar />
          </div>
        )}
        <main 
          style={{ flex: 1, width: '100%' }} 
          className={isDashboard ? 'dashboard-main-content' : ''}
        >
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/"          element={<PageTransition><LandingPage /></PageTransition>} />
              <Route path="/about"     element={<PageTransition><AboutPage /></PageTransition>} />
              <Route path="/markets"   element={<PageTransition><MarketsPage /></PageTransition>} />
              <Route path="/plans"     element={<PageTransition><PlansPage /></PageTransition>} />
              
              <Route path="/dashboard" element={<ProtectedRoute><PageTransition><DashboardPage /></PageTransition></ProtectedRoute>} />
              <Route path="/wallet"    element={<ProtectedRoute><PageTransition><WalletPage /></PageTransition></ProtectedRoute>} />
              <Route path="/trading"   element={<ProtectedRoute><PageTransition><TradingPage /></PageTransition></ProtectedRoute>} />
              <Route path="/support"   element={<PageTransition><SupportPage /></PageTransition>} />
              
              <Route path="/login"    element={<PageTransition><LoginPage /></PageTransition>} />
              <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
              <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
      {showFooter && <Footer />}

      <style>{`
        @media (min-width: 768px) {
          .dashboard-main-content {
            padding-left: 260px;
          }
        }
        @media (max-width: 767px) {
          .dashboard-main-content {
            padding-left: 0;
          }
        }
      `}</style>
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
    <AuthProvider>
      <MarketProvider>
        <Router>
          <AppContent />
        </Router>
      </MarketProvider>
    </AuthProvider>
  );
}
