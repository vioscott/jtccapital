import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, TrendingUp, Zap, ChevronRight, Star, Lock, Globe } from 'lucide-react';
import { mockPlans } from '../mock/data';
import { useMarketData } from '../context/MarketContext';

// ── Animated counter ──
function Counter({ to, prefix = '', suffix = '' }: { to: number; prefix?: string; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let start = 0;
    const step = to / 60;
    const id = setInterval(() => {
      start += step;
      if (start >= to) { setVal(to); clearInterval(id); }
      else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(id);
  }, [to]);
  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
}

// ── Price Ticker (marquee) ──
function PriceTicker() {
  const { prices } = useMarketData();
  const items = [
    { label:'BTC/USD', price: prices.BTC?.price || 0,  change: prices.BTC?.change || 0  },
    { label:'ETH/USD', price: prices.ETH?.price || 0,  change: prices.ETH?.change || 0  },
    { label:'WTI CRUDE', price: prices.OIL?.price || 0, change: prices.OIL?.change || 0 },
    { label:'XAU/USD', price: prices.GOLD?.price || 0, change: prices.GOLD?.change || 0 },
    { label:'BTC/USD', price: prices.BTC?.price || 0,  change: prices.BTC?.change || 0  },
    { label:'ETH/USD', price: prices.ETH?.price || 0,  change: prices.ETH?.change || 0  },
    { label:'WTI CRUDE', price: prices.OIL?.price || 0, change: prices.OIL?.change || 0 },
    { label:'XAU/USD', price: prices.GOLD?.price || 0, change: prices.GOLD?.change || 0 },
  ];
  return (
    <div style={{
      background:'rgba(201,160,80,0.05)', borderTop:'1px solid rgba(201,160,80,0.15)',
      borderBottom:'1px solid rgba(201,160,80,0.15)', overflow:'hidden', padding:'10px 0',
    }}>
      <div className="marquee-track" style={{ display:'flex', gap:'48px', width:'max-content' }}>
        {items.map((item, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:'10px', whiteSpace:'nowrap' }}>
            <span style={{ color:'rgba(255,255,255,0.5)', fontSize:'13px' }}>{item.label}</span>
            <span style={{ color:'#fff', fontSize:'13px', fontWeight:600 }}>
              ${item.price.toLocaleString(undefined, { minimumFractionDigits:2, maximumFractionDigits:2 })}
            </span>
            <span style={{ fontSize:'12px', fontWeight:600, color: item.change >= 0 ? '#22c55e' : '#ef4444' }}>
              {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
            </span>
            <span style={{ color:'rgba(255,255,255,0.15)' }}>●</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const assets = [
  { symbol:'BTC',  name:'Bitcoin',    icon:'₿',   desc:'The original digital asset. Store of value for the new era.',   color:'#F7931A' },
  { symbol:'ETH',  name:'Ethereum',   icon:'⟠',   desc:'Programmable money powering the decentralised economy.',       color:'#627EEA' },
  { symbol:'OIL',  name:'Crude Oil',  icon:'🛢️', desc:'Access global energy markets with WTI Crude Oil futures.', color:'#f97316' },
  { symbol:'GOLD', name:'Gold (XAU)', icon:'🥇', desc:'Invest in real-time spot gold with institutional-grade precision', color:'#C9A050' },
];

const steps = [
  { num:'01', title:'Create Account', desc:'Sign up in under 2 minutes with email verification and optional 2FA security.' },
  { num:'02', title:'Fund Your Wallet', desc:'Deposit crypto or fiat instantly. Your assets are secured in cold storage vaults.' },
  { num:'03', title:'Start Investing', desc:'Choose managed plans or self-trade gold and crypto at live market prices.' },
];

const stats = [
  { label:'Active Investors',   value:42000, suffix:'+'   },
  { label:'Assets Under Mgmt', value:180,   prefix:'$', suffix:'M+' },
  { label:'Countries Served',  value:95,    suffix:'+'   },
  { label:'Uptime SLA',        value:99,    suffix:'.9%' },
];

const testimonials = [
  { name:'Marcus T.',   role:'Private Investor',  text:'JTC Invest gave me exposure to gold I never thought possible. Returns have been solid and the interface is beautiful.', stars:5 },
  { name:'Priya K.',   role:'Crypto Trader',     text:'The trading interface rivals the best platforms out there. Execution is fast and charts are detailed.', stars:5 },
  { name:'James O.',   role:'Portfolio Manager', text:'The managed investment plans are transparent and realistic. Finally a platform that doesn\'t oversell returns.', stars:5 },
];

export default function LandingPage() {
  const { prices } = useMarketData();

  return (
    <div style={{ paddingTop:'72px' }}>
      {/* Ticker */}
      <PriceTicker />

      {/* ── HERO ── */}
      <section style={{
        minHeight:'92vh', display:'flex', alignItems:'center',
        padding:'0 24px',
        position:'relative', overflow:'hidden',
      }}>
        {/* BG radial glow */}
        <div style={{
          position:'absolute', top:'-20%', left:'50%', transform:'translateX(-50%)',
          width:'800px', height:'600px', borderRadius:'50%',
          background:'radial-gradient(circle, rgba(201,160,80,0.12) 0%, transparent 70%)',
          pointerEvents:'none',
        }} />
        <div style={{
          position:'absolute', bottom:0, right:'-10%',
          width:'500px', height:'500px', borderRadius:'50%',
          background:'radial-gradient(circle, rgba(0,229,255,0.07) 0%, transparent 70%)',
          pointerEvents:'none',
        }} />

        <div className="r-grid-hero" style={{ maxWidth:'1280px', margin:'0 auto', width:'100%' }}>
          {/* Left text */}
          <motion.div initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7 }}>
            <div style={{
              display:'inline-flex', alignItems:'center', gap:'8px',
              background:'rgba(201,160,80,0.1)', border:'1px solid rgba(201,160,80,0.3)',
              borderRadius:'100px', padding:'6px 16px', marginBottom:'24px',
            }}>
              <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#22c55e' }} className="pulse-gold" />
              <span style={{ color:'#C9A050', fontSize:'13px', fontWeight:500 }}>Live markets — trading now</span>
            </div>

            <h1 style={{
              fontSize:'clamp(38px, 5vw, 62px)', fontWeight:800, lineHeight:1.1,
              letterSpacing:'-1.5px', marginBottom:'20px',
            }}>
              Invest in{' '}
              <span className="gradient-text-gold text-glow-gold">Gold & Crypto</span>
              <br />with Confidence
            </h1>

            <p style={{ fontSize:'18px', color:'rgba(255,255,255,0.6)', lineHeight:1.7, marginBottom:'36px', maxWidth:'480px' }}>
              A unified platform for real-time gold spot trading and crypto investment. Institutional-grade tools, human-friendly design.
            </p>

            <div style={{ display:'flex', gap:'16px', flexWrap:'wrap' }}>
              <Link to="/register" style={{
                display:'flex', alignItems:'center', gap:'8px',
                padding:'15px 32px', borderRadius:'12px',
                background:'linear-gradient(135deg, #C9A050, #E5C97A)',
                color:'#0A0A0A', fontWeight:700, fontSize:'16px',
                textDecoration:'none', boxShadow:'0 0 30px rgba(201,160,80,0.4)',
                transition:'transform 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                Start Investing <ArrowRight size={18} />
              </Link>
              <Link to="/markets" style={{
                display:'flex', alignItems:'center', gap:'8px',
                padding:'15px 28px', borderRadius:'12px',
                background:'rgba(255,255,255,0.05)',
                border:'1px solid rgba(255,255,255,0.12)',
                color:'#fff', fontWeight:500, fontSize:'16px',
                textDecoration:'none', transition:'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(201,160,80,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.12)'; }}
              >
                Live Markets <TrendingUp size={16} />
              </Link>
            </div>

            {/* Trust badges */}
            <div style={{ display:'flex', gap:'20px', marginTop:'32px', flexWrap:'wrap' }}>
              {[{ icon: Shield, text:'SSL Secured' }, { icon: Lock, text:'Cold Storage' }, { icon: Globe, text:'95+ Countries' }].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                  <Icon size={14} color="#C9A050" />
                  <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)' }}>{text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right hero visual — floating cards */}
          <motion.div
            initial={{ opacity:0, scale:0.9 }}
            animate={{ opacity:1, scale:1 }}
            transition={{ duration:0.8, delay:0.2 }}
            style={{ position:'relative', height:'460px' }}
            className="float-animation hidden-mobile"
          >
            {/* Main portfolio card */}
            <div className="glass" style={{
              borderRadius:'20px', padding:'24px',
              position:'absolute', top:0, left:'50%', transform:'translateX(-50%)',
              width:'320px',
            }}>
              <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', marginBottom:'6px' }}>Total Portfolio</div>
              <div style={{ fontSize:'32px', fontWeight:800, color:'#C9A050', marginBottom:'4px' }} className="text-glow-gold">
                $24,650.80
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                <span style={{ color:'#22c55e', fontSize:'14px', fontWeight:600 }}>▲ +3.42% today</span>
              </div>
              <div style={{ marginTop:'18px', display:'flex', flexDirection:'column', gap:'10px' }}>
                {[
                  { a:'BTC',  pct:45.2, color:'#F7931A' },
                  { a:'ETH',  pct:22.5, color:'#627EEA' },
                  { a:'OIL',  pct:18.3, color:'#f97316' },
                  { a:'GOLD', pct:14.0, color:'#C9A050' }
                ].map(row => (
                  <div key={row.a}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                      <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.7)' }}>{row.a}</span>
                      <span style={{ fontSize:'13px', color:row.color }}>{row.pct}%</span>
                    </div>
                    <div style={{ height:'4px', background:'rgba(255,255,255,0.08)', borderRadius:'2px' }}>
                      <div style={{ height:'4px', width:`${row.pct}%`, background:row.color, borderRadius:'2px' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gold price mini card */}
            <div className="glass" style={{
              borderRadius:'14px', padding:'14px 18px',
              position:'absolute', bottom:'60px', left:'0',
              display:'flex', alignItems:'center', gap:'12px',
            }}>
              <div style={{ fontSize:'22px' }}>🥇</div>
              <div>
                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.5)' }}>XAU/USD</div>
                <div style={{ fontSize:'16px', fontWeight:700, color:'#C9A050' }}>$3,342.50</div>
                <div style={{ fontSize:'12px', color:'#22c55e' }}>+1.24%</div>
              </div>
            </div>

            {/* BTC mini card */}
            <div className="glass-cyan" style={{
              borderRadius:'14px', padding:'14px 18px',
              position:'absolute', bottom:'60px', right:'0',
              display:'flex', alignItems:'center', gap:'12px',
            }}>
              <div style={{ fontSize:'22px' }}>₿</div>
              <div>
                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.5)' }}>BTC/USD</div>
                <div style={{ fontSize:'16px', fontWeight:700, color:'#00E5FF' }}>$87,420</div>
                <div style={{ fontSize:'12px', color:'#22c55e' }}>+2.85%</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ padding:'60px 24px', background:'rgba(201,160,80,0.04)', borderTop:'1px solid rgba(201,160,80,0.1)', borderBottom:'1px solid rgba(201,160,80,0.1)' }}>
        <div className="r-grid-stats" style={{ maxWidth:'1280px', margin:'0 auto' }}>
          {stats.map(s => (
            <div key={s.label} style={{ textAlign:'center' }}>
              <div style={{ fontSize:'clamp(28px, 4vw, 42px)', fontWeight:800, color:'#C9A050' }} className="text-glow-gold stat-value">
                <Counter to={s.value} prefix={s.prefix} suffix={s.suffix} />
              </div>
              <div style={{ fontSize:'14px', color:'rgba(255,255,255,0.5)', marginTop:'4px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ASSETS ── */}
      <section style={{ padding:'80px 24px' }}>
        <div style={{ maxWidth:'1280px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'48px' }}>
            <h2 style={{ fontSize:'clamp(26px, 3.5vw, 40px)', fontWeight:700, marginBottom:'12px' }}>
              Supported <span className="gradient-text-gold">Assets</span>
            </h2>
            <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'16px' }}>Trade gold and top cryptocurrencies on one unified platform</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:'20px' }}>
            {assets.map(asset => {
              const liveData = prices[asset.symbol];
              const changeStr = liveData ? `${liveData.change >= 0 ? '+' : ''}${liveData.change.toFixed(2)}%` : '0.00%';
              const up = liveData ? liveData.change >= 0 : true;
              return (
              <motion.div
                key={asset.name}
                whileHover={{ y:-6, scale:1.02 }}
                transition={{ type:'spring', stiffness:300 }}
                style={{
                  background:'#111111', border:`1px solid ${asset.color}30`,
                  borderRadius:'16px', padding:'24px',
                  cursor:'pointer', position:'relative', overflow:'hidden',
                }}
              >
                <div className="shimmer" style={{ position:'absolute', inset:0, borderRadius:'16px', pointerEvents:'none' }} />
                <div style={{ fontSize:'36px', marginBottom:'12px' }}>{asset.icon}</div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px' }}>
                  <div style={{ fontSize:'16px', fontWeight:700, color:'#fff' }}>{asset.name}</div>
                  <span style={{ fontSize:'13px', fontWeight:600, color:up?'#22c55e':'#ef4444', background:up?'rgba(34,197,94,0.1)':'rgba(239,68,68,0.1)', padding:'3px 8px', borderRadius:'6px' }}>
                    {changeStr}
                  </span>
                </div>
                <p style={{ color:'rgba(255,255,255,0.45)', fontSize:'13px', lineHeight:1.6 }}>{asset.desc}</p>
                <div style={{ marginTop:'16px', display:'flex', alignItems:'center', gap:'4px', color:asset.color, fontSize:'13px', fontWeight:500 }}>
                  Trade now <ChevronRight size={14} />
                </div>
              </motion.div>
            )})}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding:'80px 24px', background:'#0D0D0D' }}>
        <div style={{ maxWidth:'1280px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'56px' }}>
            <h2 style={{ fontSize:'clamp(26px, 3.5vw, 40px)', fontWeight:700, marginBottom:'12px' }}>
              How It <span className="gradient-text-gold">Works</span>
            </h2>
            <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'16px' }}>Start investing in three simple steps</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:'32px' }}>
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity:0, y:30 }}
                whileInView={{ opacity:1, y:0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once:true }}
                style={{
                  background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)',
                  borderRadius:'18px', padding:'32px', position:'relative', overflow:'hidden',
                }}
                className="border-glow-animate"
              >
                <div style={{
                  fontSize:'64px', fontWeight:800,
                  color:'rgba(201,160,80,0.08)', lineHeight:1,
                  position:'absolute', top:'12px', right:'20px',
                  fontVariantNumeric:'tabular-nums',
                }}>
                  {step.num}
                </div>
                <div style={{
                  width:'48px', height:'48px', borderRadius:'12px',
                  background:'rgba(201,160,80,0.15)', border:'1px solid rgba(201,160,80,0.3)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  marginBottom:'20px',
                }}>
                  {i === 0 ? <Zap size={22} color="#C9A050" /> : i === 1 ? <Shield size={22} color="#C9A050" /> : <TrendingUp size={22} color="#C9A050" />}
                </div>
                <h3 style={{ fontSize:'20px', fontWeight:700, marginBottom:'10px' }}>{step.title}</h3>
                <p style={{ color:'rgba(255,255,255,0.5)', lineHeight:1.7, fontSize:'14px' }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANS PREVIEW ── */}
      <section style={{ padding:'80px 24px' }}>
        <div style={{ maxWidth:'1280px', margin:'0 auto', textAlign:'center' }}>
          <h2 style={{ fontSize:'clamp(26px, 3.5vw, 40px)', fontWeight:700, marginBottom:'12px' }}>
            Investment <span className="gradient-text-gold">Plans</span>
          </h2>
          <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'16px', marginBottom:'40px' }}>
            Choose a managed plan or self-trade at market prices
          </p>
          <div style={{ display:'flex', gap:'20px', justifyContent:'center', flexWrap:'wrap' }}>
            {mockPlans.map(plan => {
              const colors = { 1:'#888', 2:'#26A17B', 3:'#C9A050', 4:'#00E5FF', 5:'#8b5cf6' };
              const color = colors[plan.tier as keyof typeof colors] || '#C9A050';
              return (
              <div key={plan.name} style={{
                background:'#111', border:`1px solid ${color}40`,
                borderRadius:'16px', padding:'28px 24px', minWidth:'220px', flex:'1',
                maxWidth:'280px', position:'relative',
                boxShadow: plan.popular ? `0 0 30px ${color}30` : 'none',
              }}>
                {plan.popular && (
                  <div style={{
                    position:'absolute', top:'-14px', left:'50%', transform:'translateX(-50%)',
                    background:'linear-gradient(135deg, #C9A050, #E5C97A)',
                    color:'#0A0A0A', fontSize:'11px', fontWeight:800, padding:'4px 14px', borderRadius:'100px',
                  }}>MOST POPULAR</div>
                )}
                <div style={{ fontSize:'18px', fontWeight:800, color:color, marginBottom:'8px' }}>{plan.name}</div>
                <div style={{ fontSize:'28px', fontWeight:800, color:'#fff', marginBottom:'4px' }}>{plan.roiMin}–{plan.roiMax}%</div>
                <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.45)', marginBottom:'16px' }}>APY Target · {plan.duration} days</div>
                <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)' }}>From <strong style={{ color:'#fff' }}>${plan.minAmount.toLocaleString()}</strong></div>
              </div>
            )})}
          </div>
          <Link to="/plans" style={{
            display:'inline-flex', alignItems:'center', gap:'8px',
            marginTop:'32px', padding:'13px 28px', borderRadius:'11px',
            border:'1px solid rgba(201,160,80,0.4)', color:'#C9A050',
            fontWeight:500, textDecoration:'none', fontSize:'15px',
            transition:'all 0.2s',
          }}>
            View All Plans <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding:'80px 24px', background:'#0D0D0D' }}>
        <div style={{ maxWidth:'1280px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'48px' }}>
            <h2 style={{ fontSize:'clamp(26px, 3.5vw, 40px)', fontWeight:700, marginBottom:'12px' }}>
              Trusted by <span className="gradient-text-gold">Investors</span>
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:'24px' }}>
            {testimonials.map(t => (
              <div key={t.name} className="glass" style={{ borderRadius:'16px', padding:'28px' }}>
                <div style={{ display:'flex', gap:'4px', marginBottom:'16px' }}>
                  {Array.from({ length: t.stars }).map((_,i) => (
                    <Star key={i} size={14} fill="#C9A050" color="#C9A050" />
                  ))}
                </div>
                <p style={{ color:'rgba(255,255,255,0.7)', lineHeight:1.7, fontSize:'14px', marginBottom:'18px' }}>"{t.text}"</p>
                <div>
                  <div style={{ fontWeight:600, fontSize:'14px' }}>{t.name}</div>
                  <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)' }}>{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ padding:'80px 24px' }}>
        <div style={{ maxWidth:'800px', margin:'0 auto', textAlign:'center' }}>
          <div style={{
            background:'linear-gradient(135deg, rgba(201,160,80,0.15), rgba(201,160,80,0.05))',
            border:'1px solid rgba(201,160,80,0.3)',
            borderRadius:'24px', padding:'60px 40px',
          }} className="border-glow-animate">
            <h2 style={{ fontSize:'clamp(26px, 3.5vw, 42px)', fontWeight:800, marginBottom:'16px' }}>
              Ready to start your<br /><span className="gradient-text-gold">investment journey?</span>
            </h2>
            <p style={{ color:'rgba(255,255,255,0.55)', fontSize:'16px', marginBottom:'32px' }}>
              Join 42,000+ investors trading gold and crypto with confidence.
            </p>
            <Link to="/register" style={{
              display:'inline-flex', alignItems:'center', gap:'8px',
              padding:'16px 40px', borderRadius:'13px',
              background:'linear-gradient(135deg, #C9A050, #E5C97A)',
              color:'#0A0A0A', fontWeight:700, fontSize:'17px',
              textDecoration:'none', boxShadow:'0 0 40px rgba(201,160,80,0.4)',
            }}>
              Create Free Account <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
        }
      `}</style>
    </div>
  );
}
