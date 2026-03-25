import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, RefreshCw, BarChart2, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { goldChartData, btcChartData, ethChartData, oilChartData, generateChartData } from '../mock/data';
import { useMarketData, type AssetPrice } from '../context/MarketContext';

const assets = [
  { symbol:'GOLD', name:'Gold (XAU/USD)',  icon:'🥇', data: goldChartData, color:'#C9A050', mktCap:'$13.9T', vol24h:'$214B' },
  { symbol:'BTC',  name:'Bitcoin',         icon:'₿',  data: btcChartData,  color:'#F7931A', mktCap:'$1.7T',  vol24h:'$48B'  },
  { symbol:'ETH',  name:'Ethereum',        icon:'⟠',  data: ethChartData,  color:'#627EEA', mktCap:'$387B',  vol24h:'$21B'  },
  { symbol:'OIL',  name:'Crude Oil',       icon:'🛢️', data: oilChartData,  color:'#f97316', mktCap:'$2.1T',  vol24h:'$90B'  },
];

const timeframes = ['1H','4H','1D','1W','1M'];

function PriceCard({ asset, isSelected, onClick, priceData }: { asset: typeof assets[0]; isSelected: boolean; onClick: () => void; priceData: AssetPrice }) {
  const p = priceData || { price:0, change:0, changeAmt:0 };
  const up = p.change >= 0;
  return (
    <motion.div
      whileHover={{ scale:1.02 }}
      onClick={onClick}
      style={{
        background: isSelected ? 'rgba(201,160,80,0.08)' : '#111',
        border: `1px solid ${isSelected ? 'rgba(201,160,80,0.5)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius:'14px', padding:'20px', cursor:'pointer',
        boxShadow: isSelected ? '0 0 20px rgba(201,160,80,0.2)' : 'none',
        transition:'all 0.2s',
      }}
    >
      <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px' }}>
        <span style={{ fontSize:'24px' }}>{asset.icon}</span>
        <div>
          <div style={{ fontWeight:700, fontSize:'14px' }}>{asset.symbol}</div>
          <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)' }}>{asset.name}</div>
        </div>
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:'4px', fontSize:'12px', color: up?'#22c55e':'#ef4444' }}>
          {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          {up?'+':''}{p.change.toFixed(2)}%
        </div>
      </div>
      <div style={{ fontSize:'22px', fontWeight:800, color: asset.color }}>
        ${p.price.toLocaleString(undefined,{ minimumFractionDigits:2, maximumFractionDigits:2 })}
      </div>
      <div style={{ fontSize:'12px', color: up?'#22c55e':'#ef4444', marginTop:'4px' }}>
        {up?'+':''}{Math.abs(p.changeAmt).toLocaleString(undefined,{maximumFractionDigits:2})} today
      </div>
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background:'rgba(10,10,10,0.95)', border:'1px solid rgba(201,160,80,0.3)',
      borderRadius:'10px', padding:'10px 14px',
    }}>
      <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)', marginBottom:'4px' }}>{label}</div>
      <div style={{ fontSize:'16px', fontWeight:700, color:'#C9A050' }}>
        ${Number(payload[0].value).toLocaleString(undefined, { minimumFractionDigits:2 })}
      </div>
    </div>
  );
};

export default function MarketsPage() {
  const { prices, refresh, loading } = useMarketData();
  const [selected, setSelected] = useState(0);
  const [tf, setTf] = useState('1H');
  const [chartData, setChartData] = useState(assets[0].data);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const asset = assets[selected];
    const base = prices[asset.symbol]?.price || 0;
    const vol = asset.symbol === 'GOLD' ? 15 : asset.symbol === 'BTC' ? 800 : asset.symbol === 'OIL' ? 2 : 60;
    if (base > 0) {
      setChartData(generateChartData(base, vol, 30));
    }
  }, [selected, tf, prices]);

  useEffect(() => {
    const id = setInterval(() => setLastUpdate(new Date()), 5000);
    return () => clearInterval(id);
  }, []);

  const currentAsset = assets[selected];
  const currentPrice = prices[currentAsset.symbol] || { price:0, change:0, changeAmt:0 };
  const up = currentPrice.change >= 0;

  return (
    <div style={{ paddingTop:'100px', padding:'100px 24px 40px' }}>
      <div style={{ maxWidth:'1280px', margin:'0 auto' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'32px', flexWrap:'wrap', gap:'16px' }}>
          <div>
            <h1 style={{ fontSize:'clamp(24px, 3vw, 38px)', fontWeight:800, marginBottom:'6px' }}>
              Live <span className="gradient-text-gold">Markets</span>
            </h1>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', color:'rgba(255,255,255,0.4)', fontSize:'13px' }}>
              <Clock size={13} />
              Updated {lastUpdate.toLocaleTimeString()}
              <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#22c55e' }} className="pulse-gold" />
            </div>
          </div>
          <button
            onClick={() => { refresh(); setLastUpdate(new Date()); }}
            disabled={loading}
            style={{
              display:'flex', alignItems:'center', gap:'8px',
              background:'rgba(201,160,80,0.1)', border:'1px solid rgba(201,160,80,0.3)',
              borderRadius:'10px', padding:'10px 18px',
              color:'#C9A050', fontSize:'13px', fontWeight:500, cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            <RefreshCw size={14} className={loading?"spin":""} /> {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Asset cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:'16px', marginBottom:'32px' }}>
          {assets.map((a, i) => (
            <PriceCard key={a.symbol} asset={a} isSelected={selected === i} onClick={() => setSelected(i)} priceData={prices[a.symbol]} />
          ))}
        </div>

        {/* Main chart */}
        <div style={{
          background:'#111', border:'1px solid rgba(255,255,255,0.07)',
          borderRadius:'18px', padding:'28px', marginBottom:'24px',
        }}>
          {/* Chart header */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'24px', flexWrap:'wrap', gap:'12px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
              <span style={{ fontSize:'28px' }}>{currentAsset.icon}</span>
              <div>
                <div style={{ fontWeight:700, fontSize:'18px' }}>{currentAsset.name}</div>
                <div style={{ display:'flex', gap:'10px', alignItems:'center', marginTop:'4px' }}>
                  <span style={{ fontSize:'24px', fontWeight:800, color:currentAsset.color }}>
                    ${currentPrice.price.toLocaleString(undefined,{ minimumFractionDigits:2 })}
                  </span>
                  <span style={{
                    fontSize:'14px', fontWeight:600, padding:'3px 10px', borderRadius:'7px',
                    color: up?'#22c55e':'#ef4444',
                    background: up?'rgba(34,197,94,0.1)':'rgba(239,68,68,0.1)',
                    display:'flex', alignItems:'center', gap:'4px',
                  }}>
                    {up ? <TrendingUp size={13}/> : <TrendingDown size={13}/>}
                    {up?'+':''}{currentPrice.change.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Timeframes */}
            <div style={{ display:'flex', gap:'6px' }}>
              {timeframes.map(t => (
                <button
                  key={t}
                  onClick={() => setTf(t)}
                  style={{
                    padding:'7px 14px', borderRadius:'8px', fontSize:'13px', fontWeight:500,
                    background: tf===t ? 'rgba(201,160,80,0.2)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${tf===t ? 'rgba(201,160,80,0.5)' : 'rgba(255,255,255,0.08)'}`,
                    color: tf===t ? '#C9A050' : 'rgba(255,255,255,0.5)',
                    cursor:'pointer', transition:'all 0.2s',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Chart */}
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData} margin={{ top:5, right:10, bottom:5, left:10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="time" tick={{ fill:'rgba(255,255,255,0.3)', fontSize:11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fill:'rgba(255,255,255,0.3)', fontSize:11 }} axisLine={false} tickLine={false}
                tickFormatter={v => `$${v.toLocaleString()}`} width={70} domain={['auto','auto']} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="price" stroke={currentAsset.color} strokeWidth={2.5}
                dot={false} activeDot={{ r:5, fill:currentAsset.color, strokeWidth:0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Market details */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:'16px' }}>
          <div style={{
            background:'#111', border:'1px solid rgba(255,255,255,0.07)',
            borderRadius:'14px', padding:'24px',
          }}>
            <h3 style={{ fontSize:'15px', fontWeight:600, marginBottom:'16px', display:'flex', alignItems:'center', gap:'8px' }}>
              <BarChart2 size={16} color="#C9A050" /> Market Statistics
            </h3>
            {[
              { label:'Market Cap', value: currentAsset.mktCap },
              { label:'24h Volume', value: currentAsset.vol24h },
              { label:'24h Change', value: `${up?'+':''}${currentPrice.change.toFixed(2)}%`, color: up?'#22c55e':'#ef4444' },
              { label:'24h Change $', value: `${up?'+':''}$${Math.abs(currentPrice.changeAmt).toLocaleString(undefined,{minimumFractionDigits:2})}` },
            ].map(row => (
              <div key={row.label} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)' }}>{row.label}</span>
                <span style={{ fontSize:'13px', fontWeight:600, color: row.color || '#fff' }}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* Sparklines for other assets */}
          <div style={{ background:'#111', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px', padding:'24px' }}>
            <h3 style={{ fontSize:'15px', fontWeight:600, marginBottom:'16px' }}>Other Assets</h3>
            {assets.filter((_,i) => i !== selected).map(a => {
              const p = prices[a.symbol] || { price:0, change:0 };
              const uup = p.change >= 0;
              return (
                <div
                  key={a.symbol}
                  onClick={() => setSelected(assets.indexOf(a))}
                  style={{
                    display:'flex', alignItems:'center', gap:'12px', padding:'12px',
                    borderRadius:'10px', cursor:'pointer', marginBottom:'8px',
                    background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)',
                    transition:'all 0.2s',
                  }}
                  onMouseEnter={e=> (e.currentTarget.style.borderColor='rgba(201,160,80,0.3)')}
                  onMouseLeave={e=> (e.currentTarget.style.borderColor='rgba(255,255,255,0.05)')}
                >
                  <span style={{ fontSize:'22px' }}>{a.icon}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:'14px' }}>{a.symbol}</div>
                    <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)' }}>{a.name}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontWeight:700, color:a.color, fontSize:'14px' }}>
                      ${p.price.toLocaleString(undefined,{ maximumFractionDigits:2 })}
                    </div>
                    <div style={{ fontSize:'12px', color:uup?'#22c55e':'#ef4444' }}>
                      {uup?'+':''}{p.change.toFixed(2)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
