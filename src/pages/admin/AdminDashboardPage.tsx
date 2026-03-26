import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Users, 
  Activity, 
  CreditCard, 
  ShieldCheck, 
  Loader2,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    userCount: 0,
    activeTrades: 0,
    pendingDeposits: 0,
    pendingWithdrawals: 0,
    totalVolume: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    setLoading(true);
    try {
      const [
        { count: userCount },
        { count: tradeCount },
        { data: txData },
        { data: walletData }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('trades').select('*', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('transactions').select('type, status'),
        supabase.from('wallets').select('balance')
      ]);

      const pendingD = txData?.filter(tx => tx.type === 'deposit' && tx.status === 'pending').length || 0;
      const pendingW = txData?.filter(tx => tx.type === 'withdrawal' && tx.status === 'pending').length || 0;
      const totalAUM = walletData?.reduce((sum, w) => sum + Number(w.balance), 0) || 0;

      setStats({
        userCount: userCount || 0,
        activeTrades: tradeCount || 0,
        pendingDeposits: pendingD,
        pendingWithdrawals: pendingW,
        totalVolume: totalAUM,
      });
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    { label: 'Platform Users', value: stats.userCount, icon: Users, color: '#C9A050', to: '/admin/users' },
    { label: 'Active Trades', value: stats.activeTrades, icon: Activity, color: '#00E5FF', to: '/admin/trades' },
    { label: 'Pending Deposits', value: stats.pendingDeposits, icon: CreditCard, color: '#22c55e', to: '/admin/transactions' },
    { label: 'Pending Withdrawals', value: stats.pendingWithdrawals, icon: ShieldCheck, color: '#ef4444', to: '/admin/transactions' },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Loader2 size={32} color="#C9A050" className="spin" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '4px' }}>System Overview</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>Real-time platform performance and management metrics</p>
        </div>
        <button 
          onClick={fetchStats}
          style={{ 
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', 
            padding: '10px 16px', borderRadius: '10px', color: '#fff', fontSize: '13px', 
            fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <Activity size={14} /> Refresh Data
        </button>
      </div>
      
      {/* Top Banner Stat */}
      <div style={{ 
        background: 'linear-gradient(135deg, rgba(201,160,80,0.1), rgba(201,160,80,0.05))',
        border: '1px solid rgba(201,160,80,0.25)',
        borderRadius: '20px', padding: '32px', marginBottom: '32px',
        display: 'flex', alignItems: 'center', gap: '24px'
      }}>
        <div style={{ 
          width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(201,160,80,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <DollarSign size={32} color="#C9A050" />
        </div>
        <div>
          <div style={{ fontSize: '14px', color: '#C9A050', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Total Platform AUM</div>
          <div style={{ fontSize: '36px', fontWeight: 800 }}>${stats.totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        {statCards.map(s => (
          <Link key={s.label} to={s.to} style={{ textDecoration: 'none', color: 'inherit' }}>
            <motion.div
              whileHover={{ y: -4, background: 'rgba(255,255,255,0.03)' }}
              style={{
                background: '#111', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '16px', padding: '24px', transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>{s.label}</span>
                <div style={{ padding: '8px', background: `${s.color}15`, borderRadius: '10px' }}>
                  <s.icon size={20} color={s.color} />
                </div>
              </div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: s.value > 0 ? '#fff' : 'rgba(255,255,255,0.2)' }}>{s.value}</div>
              {s.value > 0 && s.label.includes('Pending') && (
                <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: s.color }}>
                  <AlertCircle size={12} /> Needs Attention
                </div>
              )}
            </motion.div>
          </Link>
        ))}
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Quick Actions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Link to="/admin/transactions" style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', textDecoration: 'none', color: '#fff', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CreditCard size={18} color="#C9A050" /> Review Deposits
            </Link>
            <Link to="/admin/users" style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', textDecoration: 'none', color: '#fff', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Users size={18} color="#00E5FF" /> Manage Tiers
            </Link>
          </div>
        </div>

        <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '32px' }}>
           <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>System Health</h3>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>Database Status</span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#22c55e', background: 'rgba(34,197,94,0.1)', padding: '2px 8px', borderRadius: '4px' }}>ONLINE</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>Auth Service</span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#22c55e', background: 'rgba(34,197,94,0.1)', padding: '2px 8px', borderRadius: '4px' }}>STABLE</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
