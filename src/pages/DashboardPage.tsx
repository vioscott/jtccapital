import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Wallet, ArrowUpRight, ArrowDownLeft, Activity, DollarSign, BarChart2, Star } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useMarketData } from '../context/MarketContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

import Skeleton from '../components/ui/Skeleton';

const COLORS = ['#C9A050', '#F7931A', '#627EEA', '#f97316', '#26A17B'];

const navItems = [
  { label:'Overview',   to:'/dashboard', icon: BarChart2     },
  { label:'Wallet',     to:'/wallet',    icon: Wallet        },
  { label:'Trading',    to:'/trading',   icon: Activity      },
  { label:'Markets',    to:'/markets',   icon: TrendingUp    },
];

function Sidebar() {
  return (
    <aside className="r-sidebar" style={{
      background:'#111', border:'1px solid rgba(255,255,255,0.07)',
      borderRadius:'16px', padding:'20px',
      display:'flex', flexDirection:'column', gap:'6px',
      height:'fit-content',
    }}>
      <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)', fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'8px', padding:'0 8px' }}>
        Navigation
      </div>
      {navItems.map(item => (
        <Link key={item.label} to={item.to} style={{
          display:'flex', alignItems:'center', gap:'10px',
          padding:'11px 12px', borderRadius:'10px',
          color:'rgba(255,255,255,0.65)', textDecoration:'none', fontSize:'14px', fontWeight:500,
          background: item.to === '/dashboard' ? 'rgba(201,160,80,0.12)' : 'transparent',
          border: item.to === '/dashboard' ? '1px solid rgba(201,160,80,0.25)' : '1px solid transparent',
          transition:'all 0.2s',
        }}>
          <item.icon size={16} color={item.to === '/dashboard' ? '#C9A050' : 'rgba(255,255,255,0.4)'} />
          <span style={{ color: item.to === '/dashboard' ? '#C9A050' : 'inherit' }}>{item.label}</span>
        </Link>
      ))}
    </aside>
  );
}

const CustomPieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'rgba(10,10,10,0.95)', border:'1px solid rgba(201,160,80,0.3)', borderRadius:'10px', padding:'10px 14px' }}>
      <div style={{ fontWeight:600 }}>{payload[0].name}</div>
      <div style={{ color:'#C9A050' }}>{payload[0].value.toFixed(1)}%</div>
    </div>
  );
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { prices, loading: marketLoading } = useMarketData();
  const [tab, setTab] = useState<'trades'|'transactions'>('trades');
  
  // Real data state
  const [profile, setProfile] = useState<any>(null);
  const [wallets, setWallets] = useState<any[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [isClaiming, setIsClaiming] = useState(false);
  const [partialClaimPercent, setPartialClaimPercent] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      setIsLoading(true);
      try {
        const [wRes, tRes, txRes, invRes] = await Promise.all([
          supabase.from('wallets').select('*').eq('user_id', user.id),
          supabase.from('trades').select('*').eq('user_id', user.id),
          supabase.from('transactions').select('*').eq('user_id', user.id),
          supabase.from('investments').select('*').eq('user_id', user.id),
        ]);

        // 🔥 LOG EVERYTHING
        console.log('wallets:', wRes);
        console.log('trades:', tRes);
        console.log('transactions:', txRes);
        console.log('investments:', invRes);
        console.log('profile:', null);

        // ✅ HANDLE ERRORS PROPERLY
        if (wRes.error) console.error('wallets error:', wRes.error);
        if (tRes.error) console.error('trades error:', tRes.error);
        if (txRes.error) console.error('transactions error:', txRes.error);
        if (invRes.error) console.error('investments error:', invRes.error);

        // ✅ SAFE STATE SETTING
        setWallets(wRes.data || []);
        setTrades(tRes.data || []);
        setTransactions(txRes.data || []);
        setInvestments(invRes.data || []);
        setProfile(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [user]);

  // Compute live values from wallets (safe fallback)
  const liveAssets = (wallets || []).map(w => {
    const activePrice = prices[w.asset]?.price || (w.asset === 'USDT' ? 1 : 0);
    return { asset: w.asset, balance: Number(w.balance), value: Number(w.balance) * activePrice };
  });

  const liveTotalValue = liveAssets.reduce((sum: number, a: any) => sum + a.value, 0);
  
  let totalChangeVal = 0;
  liveAssets.forEach((a: any) => {
    const chg = prices[a.asset]?.change || 0;
    totalChangeVal += a.value * (chg / 100);
  });

  // Calculate Total P&L from closed and open trades
  const totalPnL = trades.reduce((sum: number, t: any) => {
    const currentPrice = prices[t.asset]?.price || 0;
    const tradePnL = (currentPrice - Number(t.entry_price)) * Number(t.amount);
    return sum + (t.type === 'buy' ? tradePnL : -tradePnL);
  }, 0);
  
  const liveChange24h = liveTotalValue > 0 ? (totalChangeVal / liveTotalValue) * 100 : 0;
  const up = liveChange24h >= 0;

  const activeInvestments = investments.filter(inv => inv.status === 'active');
  const totalActiveInvested = activeInvestments.reduce((sum, inv) => sum + Number(inv.amount), 0);
  const nextMaturing = activeInvestments
    .map(inv => ({ ...inv, maturesAt: new Date(inv.matures_at) }))
    .sort((a, b) => a.maturesAt.getTime() - b.maturesAt.getTime())[0];
  const daysUntilMature = nextMaturing ? Math.max(0, Math.ceil((nextMaturing.maturesAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0;

  const maturedInvestments = investments.filter(inv => {
    const now = new Date();
    const maturesAt = new Date(inv.matures_at);
    return (inv.status === 'matured' || (inv.status === 'active' && maturesAt <= now));
  });
  const maturedTotal = maturedInvestments.reduce((sum, inv) => sum + Number(inv.original_amount || inv.amount), 0);

  const pieData = liveAssets.map((a: any) => ({ name:a.asset, value: liveTotalValue > 0 ? (a.value/liveTotalValue)*100 : 0 }));

  // Removed full-screen loader to allow skeletons

  return (
    <div style={{ paddingTop:'92px', minHeight:'100vh' }}>
      <div style={{ maxWidth:'1280px', margin:'0 auto', padding:'24px' }}>
        {/* Mobile tab bar — visible below 960px */}
        <div className="r-show-mobile mobile-tab-bar" style={{ marginBottom:'16px' }}>
          {navItems.map(item => (
            <Link key={item.label} to={item.to} style={{
              display:'flex', alignItems:'center', gap:'6px',
              padding:'9px 16px', borderRadius:'10px', whiteSpace:'nowrap',
              color: item.to === '/dashboard' ? '#C9A050' : 'rgba(255,255,255,0.6)',
              background: item.to === '/dashboard' ? 'rgba(201,160,80,0.12)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${item.to === '/dashboard' ? 'rgba(201,160,80,0.3)' : 'rgba(255,255,255,0.08)'}`,
              textDecoration:'none', fontSize:'13px', fontWeight:500, flexShrink:0,
            }}>
              <item.icon size={14} color={item.to === '/dashboard' ? '#C9A050' : 'rgba(255,255,255,0.4)'} />
              {item.label}
            </Link>
          ))}
        </div>

        <div className="r-dashboard-layout">

          <div className="r-hide-mobile">
            <Sidebar />
          </div>
          {/* Close the r-dashboard-layout div after sidebar and main content */}

        {/* Main content */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', gap:'20px' }}>

          {/* Welcome */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'12px' }}>
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '4px' }}>
                Welcome back, {profile?.full_name?.split(' ')[0] || user?.user_metadata?.full_name?.split(' ')[0] || 'User'}
              </h1>
              <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'14px' }}>Here's your portfolio overview for today.</p>
            </div>
            <div style={{ display:'flex', gap:'10px' }}>
              <Link to="/wallet" style={{
                display:'flex', alignItems:'center', gap:'6px',
                padding:'10px 18px', borderRadius:'10px',
                background:'rgba(201,160,80,0.1)', border:'1px solid rgba(201,160,80,0.3)',
                color:'#C9A050', fontWeight:500, fontSize:'14px', textDecoration:'none',
              }}>
                <ArrowDownLeft size={15} /> Deposit
              </Link>
              <Link to="/trading" style={{
                display:'flex', alignItems:'center', gap:'6px',
                padding:'10px 18px', borderRadius:'10px',
                background:'linear-gradient(135deg, #C9A050, #E5C97A)',
                color:'#0A0A0A', fontWeight:600, fontSize:'14px', textDecoration:'none',
              }}>
                <TrendingUp size={15} /> Trade
              </Link>
            </div>
          </div>

          {/* Summary cards */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:'16px' }}>
            {[
              { label:'Total Portfolio', value: `$${liveTotalValue.toLocaleString(undefined,{minimumFractionDigits:2})}`, sub: `${up?'+':''}${liveChange24h.toFixed(2)}% today`, subColor:up?'#22c55e':'#ef4444', icon:DollarSign, highlight:true },
                { label:'Active Plans', value: `$${totalActiveInvested.toLocaleString(undefined,{minimumFractionDigits:2})}`, sub: activeInvestments.length > 0 ? `${activeInvestments.length} running` : 'No active plans', subColor: activeInvestments.length > 0 ? '#C9A050' : 'rgba(255,255,255,0.4)', icon:Star },
              { label:'Total P&L', value:`${totalPnL >= 0 ? '+' : ''}$${totalPnL.toLocaleString(undefined,{minimumFractionDigits:2})}`, sub:'All time',  subColor: totalPnL >= 0 ? '#22c55e' : '#ef4444', icon:TrendingUp },
              { label:'Active Trades', value:String(trades.filter((t: any) => t.status === 'open').length), sub:'Open positions', subColor:'rgba(255,255,255,0.4)', icon:Activity },
              { label:'Pending',       value:String(transactions.filter((tx: any) => tx.status === 'pending').length), sub:'Account events',  subColor:'#f59e0b', icon:ArrowUpRight },
            ].map(card => (
              <motion.div
                key={card.label}
                whileHover={{ y:-3 }}
                style={{
                  background: card.highlight ? 'linear-gradient(135deg, rgba(201,160,80,0.15), rgba(201,160,80,0.05))' : '#111',
                  border: `1px solid ${card.highlight ? 'rgba(201,160,80,0.35)' : 'rgba(255,255,255,0.07)'}`,
                  borderRadius:'14px', padding:'20px',
                  boxShadow: card.highlight ? '0 0 30px rgba(201,160,80,0.15)' : 'none',
                }}
              >
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>
                  <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)' }}>{card.label}</span>
                  <div style={{
                    width:'32px', height:'32px', borderRadius:'8px',
                    background:'rgba(201,160,80,0.15)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                  }}>
                    <card.icon size={16} color="#C9A050" />
                  </div>
                </div>
                <div style={{ fontSize:'22px', fontWeight:800, color:card.highlight?'#C9A050':'#fff', marginBottom:'4px' }} className="stat-value">
                  {(isLoading || marketLoading) ? <Skeleton width="120px" height="28px" /> : card.value}
                </div>
                <div style={{ fontSize:'12px', color:card.subColor }}>
                  {(isLoading || marketLoading) ? <Skeleton width="80px" height="14px" style={{ marginTop: '4px' }} /> : card.sub}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Asset breakdown + pie chart */}
          <div className="r-grid-asset-pie">
            {/* Asset breakdown table */}
            <div style={{ background:'#111', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px', padding:'24px' }}>
              <h3 style={{ fontSize:'16px', fontWeight:700, marginBottom:'16px' }}>Asset Breakdown</h3>
              <div style={{ display:'grid', gridTemplateColumns:'auto 1fr auto auto', gap:'12px 16px', alignItems:'center' }}>
                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Asset</div>
                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Allocation</div>
                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.08em', textAlign:'right' }}>Balance</div>
                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.08em', textAlign:'right' }}>Value</div>
                {(isLoading || marketLoading) ? (
                  [1,2,3,4].map(i => (
                    <div key={i} style={{ display:'contents' }}>
                      <Skeleton height="16px" width="60px" />
                      <Skeleton height="16px" />
                      <Skeleton height="16px" width="80px" style={{ marginLeft: 'auto' }} />
                      <Skeleton height="16px" width="100px" style={{ marginLeft: 'auto' }} />
                    </div>
                  ))
                ) : liveAssets.map((a, i) => (
                  <div key={a.asset} style={{ display:'contents' }}>
                    <div key={`${a.asset}-icon`} style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                      <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:COLORS[i] }} />
                      <span style={{ fontWeight:600, fontSize:'14px' }}>{a.asset}</span>
                    </div>
                    <div key={`${a.asset}-bar`}>
                      <div style={{ height:'5px', background:'rgba(255,255,255,0.06)', borderRadius:'3px' }}>
                        <div style={{ height:'5px', width:`${liveTotalValue > 0 ? (a.value/liveTotalValue)*100 : 0}%`, background:COLORS[i], borderRadius:'3px' }} />
                      </div>
                    </div>
                    <div key={`${a.asset}-bal`} style={{ textAlign:'right', fontSize:'13px', color:'rgba(255,255,255,0.65)' }}>{a.balance}</div>
                    <div key={`${a.asset}-val`} style={{ textAlign:'right', fontSize:'13px', fontWeight:600, color:'#fff' }}>${a.value.toLocaleString(undefined,{minimumFractionDigits:2})}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pie chart */}
            <div style={{ background:'#111', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px', padding:'24px' }}>
              <h3 style={{ fontSize:'16px', fontWeight:700, marginBottom:'8px' }}>Allocation</h3>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" stroke="none">
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                {liveAssets.map((a, i) => (
                  <div key={a.asset} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                      <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:COLORS[i] }} />
                      <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.6)' }}>{a.asset}</span>
                    </div>
                    <span style={{ fontSize:'12px', fontWeight:600, color:COLORS[i] }}>{liveTotalValue > 0 ? ((a.value/liveTotalValue)*100).toFixed(1) : 0}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active plan details */}
          <div style={{ background:'#111', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px', padding:'18px', marginBottom:'18px' }}>
            <h3 style={{ fontSize:'16px', fontWeight:700, marginBottom:'10px' }}>Active Investment Plan</h3>
            {activeInvestments.length === 0 ? (
              <p style={{ color:'rgba(255,255,255,0.55)', margin: 0 }}>No active investment plan running. Visit Plans to lock new funds.</p>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                {activeInvestments.map((plan: any) => (
                  <div key={plan.id} style={{ border:'1px solid rgba(201,160,80,0.15)', borderRadius:'10px', padding:'10px', background:'rgba(255,255,255,0.01)' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', gap:'10px', flexWrap:'wrap' }}>
                      <strong>{plan.plan_name}</strong>
                      <span style={{ color:'#C9A050', fontWeight:700 }}>${Number(plan.amount).toLocaleString(undefined,{minimumFractionDigits:2})}</span>
                    </div>
                    <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)' }}>
                      Term: {plan.duration} days · Status: {plan.status}
                    </div>
                    <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)' }}>
                      Matures: {new Date(plan.matures_at).toLocaleDateString()} ({daysUntilMature} day{daysUntilMature === 1 ? '' : 's'} left)
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Matured Plan History */}
          <div style={{ background:'#111', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px', padding:'18px', marginBottom:'18px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'start', gap:'12px', marginBottom:'12px' }}>
              <div>
                <h3 style={{ fontSize:'16px', fontWeight:700, marginBottom:'6px' }}>Matured Plan History</h3>
                <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)' }}>
                  {maturedInvestments.length} plan(s) matured, total invested ${maturedTotal.toLocaleString(undefined,{minimumFractionDigits:2})}
                </div>
              </div>
              <button
                onClick={async () => {
                  if (!user || maturedInvestments.length === 0) return;
                  setIsClaiming(true);
                  try {
                    const walletRes = await supabase.from('wallets').select('*').eq('user_id', user.id).eq('asset', 'USDT').single();
                    if (!walletRes.data) throw new Error('USDT wallet not found');
                      let walletBalance = Number(walletRes.data.balance);

                    for (const plan of maturedInvestments) {
                      const payout = Number(plan.amount) * (1 + Number(plan.roi_max) / 100);
                      walletBalance += payout;

                      const { error: invErr } = await supabase.from('investments').update({ status: 'closed' }).eq('id', plan.id);
                      if (invErr) throw invErr;

                      const { error: txErr } = await supabase.from('transactions').insert({
                        user_id: user.id,
                        type: 'payout',
                        asset: 'USDT',
                        amount: payout,
                        status: 'completed'
                      });
                      if (txErr) throw txErr;
                    }

                    const { error: wErr } = await supabase.from('wallets').update({ balance: walletBalance }).eq('id', walletRes.data.id);
                    if (wErr) throw wErr;

                    setInvestments(prev => prev.map(inv => maturedInvestments.some(m => m.id === inv.id) ? { ...inv, status: 'closed' } : inv));
                  } catch (err: any) {
                    console.error('Claim matured plans failed:', err);
                  } finally {
                    setIsClaiming(false);
                  }
                }}
                disabled={isClaiming || maturedInvestments.length === 0}
                style={{
                  padding:'8px 12px', borderRadius:'8px', border:'1px solid rgba(201,160,80,0.4)',
                  background: maturedInvestments.length > 0 ? 'rgba(201,160,80,0.15)' : 'rgba(255,255,255,0.03)',
                  color: maturedInvestments.length > 0 ? '#C9A050' : 'rgba(255,255,255,0.4)', cursor: maturedInvestments.length > 0 ? 'pointer' : 'not-allowed'
                }}
              >
                {isClaiming ? 'Withdrawing...' : 'Withdraw maturity earnings'}
              </button>
            </div>

            {maturedInvestments.length === 0 ? (
              <p style={{ color:'rgba(255,255,255,0.55)', margin: 0 }}>No matured plans in history yet.</p>
            ) : maturedInvestments.map(plan => (
              <div key={plan.id} style={{ border:'1px solid rgba(255,255,255,0.08)', borderRadius:'10px', padding:'10px', marginBottom:'8px' }}>
                <div style={{ fontWeight:600 }}>{plan.plan_name}</div>
                <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.6)' }}>
                  Invested: ${Number(plan.amount).toLocaleString(undefined,{minimumFractionDigits:2})} • ROI max: {plan.roi_max}% • Matures: {new Date(plan.matures_at).toLocaleDateString()}
                </div>
                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.5)', marginTop:'5px' }}>
                  Approx APY: {((Math.pow(1 + Number(plan.roi_max)/100, 365/Number(plan.duration)) - 1) * 100).toFixed(2)}%
                </div>
                <div style={{ display:'flex', gap:'8px', alignItems:'center', marginTop:'8px' }}>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={partialClaimPercent[plan.id] ?? 100}
                    onChange={e => setPartialClaimPercent(prev => ({ ...prev, [plan.id]: Math.max(1, Math.min(100, Number(e.target.value) || 0)) }))}
                    style={{ width:'70px', padding:'6px 8px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.2)', background:'#0b0b0b', color:'#fff' }}
                  />
                  %
                  <button
                    onClick={async () => {
                      if (!user) return;
                      const claimPercent = partialClaimPercent[plan.id] ?? 100;
                      const baseAmount = Number(plan.amount);
                      const planROI = Number(plan.roi_max);
                      const claimAmount = (baseAmount * (1 + planROI / 100)) * (claimPercent / 100);
                      const remainderAmount = baseAmount * (1 - claimPercent / 100);
                      setIsClaiming(true);
                      try {
                        const walletRes = await supabase.from('wallets').select('*').eq('user_id', user.id).eq('asset', 'USDT').single();
                        if (!walletRes.data) throw new Error('USDT wallet not found');
                        const newBalance = Number(walletRes.data.balance) + claimAmount;
                        const updatePlan: any = { amount: remainderAmount };
                        if (claimPercent >= 100) updatePlan.status = 'closed';
                        await supabase.from('investments').update(updatePlan).eq('id', plan.id);
                        await supabase.from('wallets').update({ balance: newBalance }).eq('id', walletRes.data.id);
                        await supabase.from('transactions').insert({
                          user_id: user.id,
                          type: 'payout',
                          asset: 'USDT',
                          amount: claimAmount,
                          status: 'completed'
                        });
                        setInvestments(prev => prev.map(inv => inv.id === plan.id ? { ...inv, ...updatePlan } : inv));
                      } catch (err: any) {
                        console.error('Claim matured plan failed:', err);
                      } finally {
                        setIsClaiming(false);
                      }
                    }}
                    disabled={isClaiming}
                    style={{ padding:'6px 10px', borderRadius:'8px', border:'1px solid rgba(201,160,80,0.4)', background:'rgba(201,160,80,0.15)', color:'#C9A050', cursor:'pointer' }}
                  >
                    {isClaiming ? 'Claiming...' : 'Claim partial'}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background:'#111', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px', padding:'24px' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
              <h3 style={{ fontSize:'16px', fontWeight:700 }}>Recent Activity</h3>
              <div style={{ display:'flex', gap:'6px' }}>
                {(['trades','transactions'] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)} style={{
                    padding:'7px 16px', borderRadius:'8px', fontSize:'13px', fontWeight:500,
                    background: tab===t ? 'rgba(201,160,80,0.15)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${tab===t ? 'rgba(201,160,80,0.4)' : 'rgba(255,255,255,0.08)'}`,
                    color: tab===t ? '#C9A050' : 'rgba(255,255,255,0.5)',
                    cursor:'pointer', textTransform:'capitalize',
                  }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {tab === 'trades' ? (
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                      {['Asset','Type','Amount','Entry','Current','P&L','Opened'].map(h => (
                        <th key={h} style={{ textAlign:'left', padding:'8px 12px', fontSize:'11px', color:'rgba(255,255,255,0.35)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.07em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {trades.map(t => {
                      const currentPrice = prices[t.asset]?.price || 0;
                      const pnl = (currentPrice - Number(t.entry_price)) * Number(t.amount);
                      const pnlPct = t.entry_price > 0 ? (pnl / (Number(t.entry_price) * Number(t.amount))) * 100 : 0;
                      const isUp = pnl >= 0;
                      
                      return (
                      <tr key={t.id} className="table-row-hover" style={{ borderBottom:'1px solid rgba(255,255,255,0.03)' }}>
                        <td style={{ padding:'12px 12px', fontWeight:600 }}>{t.asset}</td>
                        <td style={{ padding:'12px 12px' }}>
                          <span style={{
                            fontSize:'12px', padding:'3px 10px', borderRadius:'6px', fontWeight:600, textTransform:'capitalize',
                            background: t.type==='buy'?'rgba(34,197,94,0.1)':'rgba(0,229,255,0.1)',
                            color: t.type==='buy'?'#22c55e':'#00E5FF',
                          }}>{t.type}</span>
                        </td>
                        <td style={{ padding:'12px 12px', fontSize:'13px', color:'rgba(255,255,255,0.7)' }}>{t.amount}</td>
                        <td style={{ padding:'12px 12px', fontSize:'13px' }}>${Number(t.entry_price).toLocaleString()}</td>
                        <td style={{ padding:'12px 12px', fontSize:'13px' }}>${currentPrice.toLocaleString()}</td>
                        <td style={{ padding:'12px 12px', fontWeight:600, color: isUp ? '#22c55e' : '#ef4444' }}>
                          {isUp?'+':''}${pnl.toLocaleString(undefined, { maximumFractionDigits:2 })} ({pnlPct.toFixed(2)}%)
                        </td>
                        <td style={{ padding:'12px 12px', fontSize:'12px', color:'rgba(255,255,255,0.4)' }}>{new Date(t.created_at).toLocaleDateString()}</td>
                      </tr>
                    )})}
                    {trades.length === 0 && (
                      <tr>
                        <td colSpan={7} style={{ padding:'32px', textAlign:'center', color:'rgba(255,255,255,0.3)', fontSize:'14px' }}>
                          No active trades found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                      {['Type','Asset','Amount','USD','Status','Date'].map(h => (
                        <th key={h} style={{ textAlign:'left', padding:'8px 12px', fontSize:'11px', color:'rgba(255,255,255,0.35)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.07em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(tx => {
                      const statusColor = tx.status === 'completed' ? '#22c55e' : tx.status === 'pending' ? '#f59e0b' : '#ef4444';
                      return (
                        <tr key={tx.id} className="table-row-hover" style={{ borderBottom:'1px solid rgba(255,255,255,0.03)' }}>
                          <td style={{ padding:'12px 12px' }}>
                            <span style={{
                              fontSize:'12px', padding:'3px 10px', borderRadius:'6px', fontWeight:600, textTransform:'capitalize',
                              background: tx.type==='deposit'?'rgba(34,197,94,0.1)':tx.type==='withdrawal'?'rgba(239,68,68,0.1)':'rgba(201,160,80,0.1)',
                              color: tx.type==='deposit'?'#22c55e':tx.type==='withdrawal'?'#ef4444':'#C9A050',
                            }}>{tx.type}</span>
                          </td>
                          <td style={{ padding:'12px 12px', fontWeight:600 }}>{tx.asset}</td>
                          <td style={{ padding:'12px 12px', fontSize:'13px', color:'rgba(255,255,255,0.7)' }}>{tx.amount}</td>
                          <td style={{ padding:'12px 12px', fontSize:'13px' }}>${(Number(tx.amount) * (prices[tx.asset]?.price || 1)).toLocaleString()}</td>
                          <td style={{ padding:'12px 12px' }}>
                            <span style={{
                              fontSize:'12px', padding:'3px 10px', borderRadius:'6px', fontWeight:600, textTransform:'capitalize',
                              background:`${statusColor}18`, color:statusColor,
                            }}>{tx.status}</span>
                          </td>
                          <td style={{ padding:'12px 12px', fontSize:'12px', color:'rgba(255,255,255,0.4)' }}>{new Date(tx.created_at).toLocaleDateString()}</td>
                        </tr>
                      );
                    })}
                    {transactions.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ padding:'32px', textAlign:'center', color:'rgba(255,255,255,0.3)', fontSize:'14px' }}>
                          No transactions found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
