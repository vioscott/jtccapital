import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MarketProvider } from './context/MarketContext';
import { supabase } from './lib/supabase';
import ToastContainer from './components/ui/Toast';
import type { ToastItem } from './components/ui/Toast';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';
import { lazy, Suspense } from 'react';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const MarketsPage = lazy(() => import('./pages/MarketsPage'));
const PlansPage = lazy(() => import('./pages/PlansPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const WalletPage = lazy(() => import('./pages/WalletPage'));
const TradingPage = lazy(() => import('./pages/TradingPage'));
const SupportPage = lazy(() => import('./pages/SupportPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
import AdminRoute     from './components/auth/AdminRoute';
import AdminLayout    from './components/layout/AdminLayout';

import AdminDashboardPage    from './pages/admin/AdminDashboardPage';
import AdminUsersPage        from './pages/admin/AdminUsersPage';
import AdminTransactionsPage from './pages/admin/AdminTransactionsPage';
import AdminTradesPage       from './pages/admin/AdminTradesPage';
import AdminWalletDefaultsPage from './pages/admin/AdminWalletDefaultsPage';

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
  const { session, isLoading, isDataLoading } = useAuth();
  console.log("ProtectedRoute - Session:", session, "Auth Loading:", isLoading, "Data Loading:", isDataLoading)
  
  if (isLoading) {
    console.log("Showing auth loading spinner")
    return <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}><div className="pulse-gold" style={{width:20,height:20,borderRadius:'50%',background:'#C9A050'}}/></div>;
  }
  
  if (!session) {
    console.log("No session, redirecting to login")
    return <Navigate to="/login" replace />;
  }
  
  if (isDataLoading) {
    console.log("Showing data loading spinner")
    return <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'16px' }}>
      <div className="pulse-gold" style={{width:20,height:20,borderRadius:'50%',background:'#C9A050'}}/>
      <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>Loading your data...</span>
    </div>;
  }
  
  return <>{children}</>;
}



function AppContent() {
  const { user, role, session, isLoading, isDataLoading } = useAuth();
  console.log("Session:", session)
  console.log("Loading:", isLoading)
  console.log("Data Loading:", isDataLoading)
  console.log("User:", session?.user)
  const location = useLocation();
  const navigate = useNavigate();
  const isDashboard = ['/dashboard', '/wallet', '/trading'].some(path => location.pathname.startsWith(path));
  const isAdmin = location.pathname.startsWith('/admin');
  const showFooter = !isDashboard && !isAdmin;
  const [notification, setNotification] = useState<string | null>(null);
  const [showNotif, setShowNotif] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [prevOpenTrades, setPrevOpenTrades] = useState<number | null>(null);
  const [prevWalletValue, setPrevWalletValue] = useState<number | null>(null);
  const [lastToast, setLastToast] = useState<{ key: string; timestamp: number } | null>(null);

  const addToast = (message: string, type: 'info' | 'success' | 'warning' | 'danger' = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const newToast: ToastItem = { id, message, type };
    const dedupeWindowMs = 12000; // ignore exact repeats during this window
    const toastKey = `${type}|${message}`;

    if (lastToast && lastToast.key === toastKey && Date.now() - lastToast.timestamp < dedupeWindowMs) {
      return;
    }

    setLastToast({ key: toastKey, timestamp: Date.now() });
    setToasts(prev => [...prev, newToast]);
  };

  useEffect(() => {
    if (!user) {
      setNotification(null);
      return;
    }

    const fetchNotification = async () => {
      console.log("Fetching notifications for user:", user?.id)
      try {
        const { data: pending } = await supabase
          .from('transactions')
          .select('id')
          .eq('user_id', user.id)
          .in('status', ['pending', 'failed']);

        console.log("Pending transactions found:", pending?.length || 0)

        if (pending && pending.length > 0) {
          setNotification(`You have ${pending.length} open transaction(s).`);
        } else {
          setNotification('No outstanding transactions. All clear.');
        }

        // Open trade update notification
        const { data: openTrades } = await supabase
          .from('trades')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'open');
        const currentOpenTrades = openTrades?.length || 0;
        console.log("Open trades found:", currentOpenTrades)
        if (prevOpenTrades !== null && currentOpenTrades !== prevOpenTrades) {
          addToast(`Open trades: ${currentOpenTrades} (was ${prevOpenTrades})`, 'info');
        }
        setPrevOpenTrades(currentOpenTrades);

        // Wallet balance change notification
        const { data: wallets } = await supabase
          .from('wallets')
          .select('balance');
        const walletSum = wallets?.reduce((sum: number, w: any) => sum + Number(w.balance), 0) || 0;
        console.log("Wallet total balance:", walletSum)
        if (prevWalletValue !== null && Math.abs(walletSum - prevWalletValue) > 0.001) {
          const diff = (walletSum - prevWalletValue).toFixed(2);
          addToast(`Wallet value changed by ${diff} USDT`, diff.startsWith('-') ? 'warning' : 'success');
        }
        setPrevWalletValue(walletSum);
      } catch (err) {
        console.error('Notification sync error:', err);
      }
    };

    fetchNotification();
    const interval = setInterval(fetchNotification, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Redirect admin users to admin dashboard after role is loaded
  useEffect(() => {
    if (!user) return;
    if (role === null || role === undefined) return;

    if (role === 'admin' && !location.pathname.startsWith('/admin') && location.pathname !== '/login') {
      navigate('/admin/dashboard');
    } else if (role !== 'admin' && location.pathname.startsWith('/admin')) {
      navigate('/dashboard');
    }
  }, [user, role, location.pathname, navigate]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <ToastContainer toasts={toasts} onDismiss={id => setToasts(prev => prev.filter(t => t.id !== id))} />
      {!isAdmin && <Navbar notification={notification} showNotif={showNotif} setShowNotif={setShowNotif} />}
      <div style={{ display: 'flex', flex: 1 }}>
        {isDashboard && (
          <div className="hidden-mobile">
            <Sidebar />
          </div>
        )}
        <main 
          style={{ flex: 1, width: '100%' }} 
          className={isDashboard || isAdmin ? 'dashboard-main-content' : ''}
        >
          <AnimatePresence mode="wait">
            <Suspense fallback={
              <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C9A050', background: '#050505' }}>
                Loading...
              </div>
            }>
              <Routes location={location} key={location.pathname}>
              <Route path="/"          element={<PageTransition><LandingPage /></PageTransition>} />
              <Route path="/about"     element={<PageTransition><AboutPage /></PageTransition>} />
              <Route path="/markets"   element={<PageTransition><MarketsPage /></PageTransition>} />
              <Route path="/plans"     element={<PageTransition><PlansPage /></PageTransition>} />
              
              <Route path="/dashboard" element={<ProtectedRoute><PageTransition><DashboardPage /></PageTransition></ProtectedRoute>} />
              <Route path="/wallet"    element={<ProtectedRoute><PageTransition><WalletPage /></PageTransition></ProtectedRoute>} />
              <Route path="/trading"   element={<ProtectedRoute><PageTransition><TradingPage /></PageTransition></ProtectedRoute>} />
              <Route path="/support"   element={<PageTransition><SupportPage /></PageTransition>} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard"    element={<PageTransition><AdminDashboardPage /></PageTransition>} />
                <Route path="users"        element={<PageTransition><AdminUsersPage /></PageTransition>} />
                <Route path="wallet-defaults" element={<PageTransition><AdminWalletDefaultsPage /></PageTransition>} />
                <Route path="transactions" element={<PageTransition><AdminTransactionsPage /></PageTransition>} />
                <Route path="trades"       element={<PageTransition><AdminTradesPage /></PageTransition>} />
              </Route>

              <Route path="/login"    element={<PageTransition><LoginPage /></PageTransition>} />
              <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
              <Route path="/forgot-password" element={<PageTransition><ForgotPasswordPage /></PageTransition>} />
              <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
              </Routes>
            </Suspense>
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
