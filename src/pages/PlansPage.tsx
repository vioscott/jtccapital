import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, AlertTriangle, ArrowRight, Zap, TrendingUp, Star } from 'lucide-react';
import { mockPlans } from '../mock/data';

export default function PlansPage() {

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
            const accentColor = plan.tier === 1 ? '#888' : plan.tier === 2 ? '#C9A050' : '#00E5FF';
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
                    {plan.tier === 1 ? <Zap size={18} color={accentColor} /> : plan.tier === 2 ? <TrendingUp size={18} color={accentColor} /> : <Star size={18} color={accentColor} />}
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
              </motion.div>
            );
          })}
        </div>

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
