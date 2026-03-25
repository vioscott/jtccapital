import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertTriangle, ArrowRight, Zap, TrendingUp, Star, Loader2, X } from 'lucide-react';
import { mockPlans } from '../mock/data';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function PlansPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [usdtBalance, setUsdtBalance] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [investAmt, setInvestAmt] = useState('');
  const [message, setMessage] = useState<{ type: 'success'|'error', text: string } | null>(null);

  useEffect(() => {
    async function fetchBalance() {
      if (!user) return;
      const { data } = await supabase.from('wallets').select('balance').eq('user_id', user.id).eq('asset', 'USDT').single();
      if (data) setUsdtBalance(Number(data.balance));
    }
    fetchBalance();
  }, [user]);

  async function handleInvest() {
    if (!user || !selectedPlan || !investAmt) return;
    const amt = Number(investAmt);

    if (amt < selectedPlan.minAmount) {
      setMessage({ type: 'error', text: `Minimum investment for this plan is $${selectedPlan.minAmount}` });
      return;
    }
    if (selectedPlan.maxAmount && amt > selectedPlan.maxAmount) {
      setMessage({ type: 'error', text: `Maximum investment for this plan is $${selectedPlan.maxAmount}` });
      return;
    }
    if (amt > usdtBalance) {
      setMessage({ type: 'error', text: 'Insufficient USDT balance. Please deposit more funds first.' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      // 1. Create investment
      const { error: iErr } = await supabase.from('investments').insert({
        user_id: user.id,
        plan_name: selectedPlan.name,
        amount: amt,
        status: 'active',
        start_date: new Date().toISOString()
      });
      if (iErr) throw iErr;

      // 2. Deduct USDT
      const { error: wErr } = await supabase.from('wallets')
        .update({ balance: usdtBalance - amt })
        .eq('user_id', user.id)
        .eq('asset', 'USDT');
      if (wErr) throw wErr;

      setMessage({ type: 'success', text: `Investment of $${amt} in ${selectedPlan.name} successful!` });
      setUsdtBalance(prev => prev - amt);
      setTimeout(() => {
        setSelectedPlan(null);
        setInvestAmt('');
        navigate('/dashboard');
      }, 2000);

    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Investment failed' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ paddingTop:'100px', padding:'100px 24px 60px' }}>
      <div style={{ maxWidth:'1100px', margin:'0 auto' }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:'24px' }}>
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>
            <h1 style={{ fontSize:'clamp(28px, 4vw, 50px)', fontWeight:800, marginBottom:'16px' }}>
              Investment <span className="gradient-text-gold">Plans</span>
            </h1>
            <p style={{ color:'rgba(255,255,255,0.55)', fontSize:'17px', maxWidth:'560px', margin:'0 auto 24px' }}>
              Lock your capital for a chosen duration and earn projected returns through our actively managed gold and crypto portfolios.
            </p>
          </motion.div>
        </div>

        {/* Risk disclaimer banner */}
        <div style={{
          background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)',
          borderRadius:'12px', padding:'14px 20px',
          display:'flex', alignItems:'center', gap:'12px', marginBottom:'48px',
        }}>
          <AlertTriangle size={18} color="#ef4444" style={{ flexShrink:0 }} />
          <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.6)', margin:0, lineHeight:1.6 }}>
            <strong style={{ color:'#ef4444' }}>Risk Warning: </strong>
            All investments carry risk. Projected ROI figures are indicative based on historical performance and do not constitute a guarantee of future returns. You may lose part or all of your invested capital.
          </p>
        </div>

        {/* Plan cards */}
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fit, minmax(290px, 1fr))',
          gap:'24px', alignItems:'start', marginBottom:'60px',
        }}>
          {mockPlans.map((plan, i) => {
            const isPopular = plan.popular;
            const colors = { 1:'#888', 2:'#26A17B', 3:'#C9A050', 4:'#00E5FF', 5:'#8b5cf6' };
            const accentColor = colors[plan.tier as keyof typeof colors] || '#C9A050';
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity:0, y:30 }}
                animate={{ opacity:1, y:0 }}
                transition={{ delay: i * 0.1 }}
                style={{
                  background:'#111',
                  border:`1px solid ${isPopular ? 'rgba(201,160,80,0.5)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius:'20px',
                  padding:'32px',
                  position:'relative',
                  boxShadow: isPopular ? '0 0 40px rgba(201,160,80,0.2)' : 'none',
                  transform: isPopular ? 'scale(1.03)' : 'scale(1)',
                }}
              >
                {isPopular && (
                  <div style={{
                    position:'absolute', top:'-15px', left:'50%', transform:'translateX(-50%)',
                    background:'linear-gradient(135deg, #C9A050, #E5C97A)',
                    color:'#0A0A0A', fontSize:'11px', fontWeight:800, padding:'5px 18px',
                    borderRadius:'100px', whiteSpace:'nowrap',
                    display:'flex', alignItems:'center', gap:'5px',
                  }}>
                    <Star size={10} fill="#0A0A0A" /> MOST POPULAR
                  </div>
                )}

                {/* Plan name */}
                <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px' }}>
                  <div style={{
                    width:'42px', height:'42px', borderRadius:'12px',
                    background:`${accentColor}20`, border:`1px solid ${accentColor}40`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                  }}>
                    {plan.tier === 1 ? <Zap size={18} color={accentColor} /> : plan.tier === 2 ? <TrendingUp size={18} color={accentColor} /> : plan.tier === 3 ? <Star size={18} color={accentColor} /> : plan.tier === 4 ? <Zap size={18} color={accentColor} fill={accentColor} /> : <TrendingUp size={18} color={accentColor} strokeWidth={3} />}
                  </div>
                  <div>
                    <div style={{ fontSize:'20px', fontWeight:800, color:accentColor }}>{plan.name}</div>
                    <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)' }}>{plan.duration}-day lock period</div>
                  </div>
                </div>

                {/* ROI */}
                <div style={{ marginBottom:'20px', paddingBottom:'20px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ fontSize:'40px', fontWeight:800, color:'#fff', lineHeight:1 }}>
                    {plan.roiMin}–{plan.roiMax}<span style={{ fontSize:'20px', color:accentColor }}>%</span>
                  </div>
                  <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.4)', marginTop:'4px' }}>Projected APY Target</div>
                </div>

                {/* Min/Max */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'20px' }}>
                  <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:'10px', padding:'12px' }}>
                    <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', marginBottom:'4px' }}>Min. Investment</div>
                    <div style={{ fontWeight:700, color:'#fff' }}>${plan.minAmount.toLocaleString()}</div>
                  </div>
                  <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:'10px', padding:'12px' }}>
                    <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', marginBottom:'4px' }}>Max. Investment</div>
                    <div style={{ fontWeight:700, color:'#fff' }}>
                      {plan.maxAmount ? `$${plan.maxAmount.toLocaleString()}` : 'Unlimited'}
                    </div>
                  </div>
                </div>

                {/* Features */}
                <ul style={{ listStyle:'none', padding:0, margin:'0 0 24px', display:'flex', flexDirection:'column', gap:'10px' }}>
                  {plan.features.map(feat => (
                    <li key={feat} style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                      <div style={{
                        width:'20px', height:'20px', borderRadius:'50%', flexShrink:0,
                        background:`${accentColor}20`, border:`1px solid ${accentColor}50`,
                        display:'flex', alignItems:'center', justifyContent:'center',
                      }}>
                        <Check size={11} color={accentColor} />
                      </div>
                      <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.7)' }}>{feat}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {user ? (
                  <button
                    onClick={() => { setSelectedPlan(plan); setInvestAmt(String(plan.minAmount)); }}
                    style={{
                      width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
                      padding:'14px', borderRadius:'12px', cursor:'pointer',
                      fontWeight:700, fontSize:'15px', transition:'all 0.2s',
                      background: isPopular ? 'linear-gradient(135deg, #C9A050, #E5C97A)' : 'rgba(255,255,255,0.05)',
                      border: isPopular ? 'none' : `1px solid ${accentColor}40`,
                      color: isPopular ? '#0A0A0A' : accentColor,
                      boxShadow: isPopular ? '0 0 30px rgba(201,160,80,0.3)' : 'none',
                    }}
                  >
                    Invest Now <ArrowRight size={16} />
                  </button>
                ) : (
                  <Link to="/register" style={{
                    display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
                    padding:'14px', borderRadius:'12px', textDecoration:'none',
                    fontWeight:700, fontSize:'15px', transition:'all 0.2s',
                    background: isPopular ? 'linear-gradient(135deg, #C9A050, #E5C97A)' : 'rgba(255,255,255,0.05)',
                    border: isPopular ? 'none' : `1px solid ${accentColor}40`,
                    color: isPopular ? '#0A0A0A' : accentColor,
                    boxShadow: isPopular ? '0 0 30px rgba(201,160,80,0.3)' : 'none',
                  }}>
                    Get Started <ArrowRight size={16} />
                  </Link>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Investment Modal */}
        <AnimatePresence>
          {selectedPlan && (
            <div style={{
              position:'fixed', top:0, left:0, right:0, bottom:0,
              background:'rgba(0,0,0,0.85)', backdropFilter:'blur(5px)',
              zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px'
            }}>
              <motion.div
                initial={{ opacity:0, scale:0.9 }}
                animate={{ opacity:1, scale:1 }}
                exit={{ opacity:0, scale:0.9 }}
                style={{
                  background:'#111', border:'1px solid rgba(255,255,255,0.1)',
                  borderRadius:'24px', padding:'32px', maxWidth:'440px', width:'100%', position:'relative'
                }}
              >
                <button 
                  onClick={() => setSelectedPlan(null)}
                  style={{ position:'absolute', right:'20px', top:'20px', background:'none', border:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer' }}
                ><X size={24} /></button>

                <h3 style={{ fontSize:'22px', fontWeight:800, marginBottom:'8px' }}>Invest in {selectedPlan.name}</h3>
                <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.5)', marginBottom:'24px' }}>
                  Available Balance: <strong style={{ color:'#C9A050' }}>${usdtBalance.toLocaleString()} USDT</strong>
                </p>

                <div style={{ marginBottom:'20px' }}>
                   <label style={{ display:'block', fontSize:'12px', color:'rgba(255,255,255,0.4)', marginBottom:'8px' }}>Investment Amount (USDT)</label>
                   <input 
                    type="number"
                    value={investAmt}
                    onChange={e => setInvestAmt(e.target.value)}
                    placeholder={`Min. $${selectedPlan.minAmount}`}
                    style={{
                      width:'100%', padding:'14px', borderRadius:'12px', background:'rgba(255,255,255,0.05)',
                      border:'1px solid rgba(255,255,255,0.1)', color:'#fff', fontSize:'18px', fontWeight:700, outline:'none'
                    }}
                   />
                </div>

                {message && (
                  <div style={{
                    padding:'12px 16px', borderRadius:'10px', marginBottom:'20px', fontSize:'14px',
                    background: message.type==='success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                    border: `1px solid ${message.type==='success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                    color: message.type==='success' ? '#22c55e' : '#ef4444'
                  }}>{message.text}</div>
                )}

                <button
                  disabled={isSubmitting}
                  onClick={handleInvest}
                  style={{
                    width:'100%', padding:'16px', borderRadius:'14px',
                    background:'linear-gradient(135deg, #C9A050, #E5C97A)',
                    color:'#0A0A0A', fontWeight:800, fontSize:'16px', border:'none',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer', transition:'all 0.2s',
                    display:'flex', alignItems:'center', justifyContent:'center', gap:'10px'
                  }}
                >
                  {isSubmitting ? <><Loader2 className="spin" size={20} /> Processing...</> : 'Confirm Investment'}
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* FAQ mini */}
        <div style={{ background:'#111', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'18px', padding:'32px' }}>
          <h3 style={{ fontSize:'20px', fontWeight:700, marginBottom:'20px' }}>Plan FAQ</h3>
          {[
            { q:'Can I withdraw early?', a:'Yes, with a 2% early-exit penalty, applied to ensure fund stability for other investors.' },
            { q:'How are returns calculated?', a:'Returns are based on blended performance across our managed gold and crypto portfolios, credited at plan maturity.' },
            { q:'Is my principal protected?', a:'No. Market conditions can cause principal loss. Invest only what you can afford to lose.' },
          ].map(item => (
            <div key={item.q} style={{ padding:'16px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontWeight:600, fontSize:'14px', marginBottom:'6px' }}>{item.q}</div>
              <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', lineHeight:1.7 }}>{item.a}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
