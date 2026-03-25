import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { mockPrices, goldChartData, btcChartData, ethChartData } from '../mock/data';

const tradePairs = [
  { symbol:'GOLD', name:'Gold',    icon:'🥇', color:'#C9A050', data:goldChartData, fee:'0.1%' },
  { symbol:'BTC',  name:'Bitcoin', icon:'₿',  color:'#F7931A', data:btcChartData,  fee:'0.1%' },
  { symbol:'ETH',  name:'Ethereum',icon:'⟠',  color:'#627EEA', data:ethChartData,  fee:'0.1%' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'rgba(10,10,10,0.95)', border:'1px solid rgba(201,160,80,0.3)', borderRadius:'10px', padding:'10px 14px' }}>
      <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)', marginBottom:'4px' }}>{label}</div>
      <div style={{ fontSize:'15px', fontWeight:700, color:'#C9A050' }}>
        ${Number(payload[0].value).toLocaleString(undefined,{minimumFractionDigits:2})}
      </div>
    </div>
  );
};

export default function TradingPage() {
  const [selectedPair, setSelectedPair] = useState(0);
  const [orderType, setOrderType] = useState<'buy'|'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const pair = tradePairs[selectedPair];
  const price = mockPrices[pair.symbol as keyof typeof mockPrices];
  const up = price.change >= 0;
  const total = amount ? (parseFloat(amount) * price.price).toFixed(2) : '0.00';
  const fee = amount ? (parseFloat(amount) * price.price * 0.001).toFixed(4) : '0.0000';

  const handleSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setAmount(''); }, 2500);
  };

  return (
    <div style={{ paddingTop:'92px', minHeight:'100vh', padding:'92px 24px 60px', background:'#0A0A0A' }}>
      <div style={{ maxWidth:'1280px', margin:'0 auto' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'24px', flexWrap:'wrap', gap:'12px' }}>
          <div>
            <h1 style={{ fontSize:'clamp(22px, 3vw, 36px)', fontWeight:800, marginBottom:'6px' }}>
              <span className="gradient-text-gold">Trading</span> Interface
            </h1>
            <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'14px' }}>Execute gold and crypto trades at live market prices</p>
          </div>
          {/* Live price strip */}
          <div style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
            {tradePairs.map(p => {
              const pr = mockPrices[p.symbol as keyof typeof mockPrices];
              return (
                <div key={p.symbol} style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)' }}>
                  <span style={{ color:p.color, fontWeight:600 }}>{p.symbol} </span>
                  ${pr.price.toLocaleString(undefined,{maximumFractionDigits:2})}
                  <span style={{ color:pr.change>=0?'#22c55e':'#ef4444', marginLeft:'6px' }}>
                    {pr.change>=0?'+':''}{pr.change}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main grid */}
        <div className="r-grid-trading">
          {/* Left: Chart panel */}
          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            {/* Pair selector */}
            <div style={{ display:'flex', gap:'8px' }}>
              {tradePairs.map((p, i) => (
                <button
                  key={p.symbol}
                  onClick={() => setSelectedPair(i)}
                  style={{
                    display:'flex', alignItems:'center', gap:'8px',
                    padding:'10px 18px', borderRadius:'10px', cursor:'pointer',
                    background: selectedPair===i ? `${p.color}18` : 'rgba(255,255,255,0.03)',
                    border:`1px solid ${selectedPair===i ? `${p.color}70` : 'rgba(255,255,255,0.07)'}`,
                    color: selectedPair===i ? p.color : 'rgba(255,255,255,0.55)',
                    fontWeight:600, fontSize:'14px', transition:'all 0.2s',
                  }}
                >
                  <span>{p.icon}</span> {p.symbol}/USD
                </button>
              ))}
            </div>

            {/* Chart area */}
            <div style={{ background:'#111', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', padding:'24px' }}>
              {/* Price header */}
              <div style={{ display:'flex', alignItems:'center', gap:'16px', marginBottom:'20px', flexWrap:'wrap' }}>
                <div>
                  <div style={{ fontSize:'30px', fontWeight:800, color:pair.color }}>
                    ${price.price.toLocaleString(undefined,{minimumFractionDigits:2})}
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', marginTop:'4px' }}>
                    <span style={{
                      display:'inline-flex', alignItems:'center', gap:'4px',
                      fontSize:'14px', fontWeight:600,
                      color:up?'#22c55e':'#ef4444',
                      background:up?'rgba(34,197,94,0.1)':'rgba(239,68,68,0.1)',
                      padding:'4px 10px', borderRadius:'7px',
                    }}>
                      {up ? <TrendingUp size={13}/> : <TrendingDown size={13}/>}
                      {up?'+':''}{price.change}% ({up?'+':''}${Math.abs(price.changeAmt).toLocaleString()})
                    </span>
                  </div>
                </div>
              </div>

              {/* Recharts line chart */}
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={pair.data} margin={{ top:5, right:10, bottom:5, left:10 }}>
                  <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="time" tick={{ fill:'rgba(255,255,255,0.25)', fontSize:11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fill:'rgba(255,255,255,0.25)', fontSize:11 }} axisLine={false} tickLine={false}
                    tickFormatter={v => `$${v >= 1000 ? (v/1000).toFixed(1)+'k' : v}`} width={60} domain={['auto','auto']} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="price" stroke={pair.color} strokeWidth={2.5}
                    dot={false} activeDot={{ r:5, fill:pair.color, strokeWidth:0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Open positions */}
            <div style={{ background:'#111', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px', padding:'20px' }}>
              <h3 style={{ fontSize:'15px', fontWeight:700, marginBottom:'14px' }}>Open Positions</h3>
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                      {['Asset','Side','Size','Entry','Mark','Unrl. P&L','Action'].map(h => (
                        <th key={h} style={{ textAlign:'left', padding:'7px 10px', fontSize:'11px', color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.07em', fontWeight:600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { asset:'GOLD',type:'buy', size:2.0,  entry:3300.00, mark:3342.50, pnl:85.00, pnlPct:2.58 },
                      { asset:'BTC', type:'buy', size:0.05, entry:84000,   mark:87420,   pnl:171.02,pnlPct:4.07 },
                      { asset:'ETH', type:'sell',size:0.2,  entry:3300,    mark:3218.7,  pnl:16.26, pnlPct:2.46 },
                    ].map((pos, i) => (
                      <tr key={i} className="table-row-hover" style={{ borderBottom:'1px solid rgba(255,255,255,0.03)' }}>
                        <td style={{ padding:'11px 10px', fontWeight:700 }}>{pos.asset}</td>
                        <td style={{ padding:'11px 10px' }}>
                          <span style={{
                            fontSize:'12px', padding:'2px 10px', borderRadius:'5px', fontWeight:600, textTransform:'capitalize',
                            background:pos.type==='buy'?'rgba(34,197,94,0.1)':'rgba(0,229,255,0.1)',
                            color:pos.type==='buy'?'#22c55e':'#00E5FF',
                          }}>{pos.type}</span>
                        </td>
                        <td style={{ padding:'11px 10px', fontSize:'13px', color:'rgba(255,255,255,0.7)' }}>{pos.size}</td>
                        <td style={{ padding:'11px 10px', fontSize:'13px' }}>${pos.entry.toLocaleString()}</td>
                        <td style={{ padding:'11px 10px', fontSize:'13px' }}>${pos.mark.toLocaleString()}</td>
                        <td style={{ padding:'11px 10px', color:'#22c55e', fontWeight:700, fontSize:'13px' }}>+${pos.pnl} ({pos.pnlPct}%)</td>
                        <td style={{ padding:'11px 10px' }}>
                          <button style={{
                            padding:'5px 12px', borderRadius:'6px', fontSize:'12px', fontWeight:600,
                            background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)',
                            color:'#ef4444', cursor:'pointer',
                          }}>Close</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right: Order panel */}
          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            <div style={{
              background:'#111', border:'1px solid rgba(255,255,255,0.07)',
              borderRadius:'16px', padding:'24px',
            }}>
              <h3 style={{ fontSize:'16px', fontWeight:700, marginBottom:'18px' }}>Place Order</h3>

              {/* Buy / Sell toggle */}
              <div style={{
                display:'flex', background:'rgba(255,255,255,0.04)',
                borderRadius:'11px', padding:'4px', marginBottom:'20px',
              }}>
                {(['buy','sell'] as const).map(side => (
                  <button
                    key={side}
                    onClick={() => setOrderType(side)}
                    style={{
                      flex:1, padding:'10px', borderRadius:'9px', fontSize:'14px', fontWeight:700,
                      border:'none', cursor:'pointer', transition:'all 0.2s', textTransform:'capitalize',
                      background: orderType===side
                        ? (side==='buy' ? 'linear-gradient(135deg,#16a34a,#22c55e)' : 'linear-gradient(135deg,#b91c1c,#ef4444)')
                        : 'transparent',
                      color: orderType===side ? '#fff' : 'rgba(255,255,255,0.5)',
                    }}
                  >
                    {side === 'buy' ? '↑ Buy / Long' : '↓ Sell / Short'}
                  </button>
                ))}
              </div>

              {/* Amount input */}
              <div style={{ marginBottom:'14px' }}>
                <label style={{ display:'block', fontSize:'12px', color:'rgba(255,255,255,0.45)', marginBottom:'7px', fontWeight:500 }}>
                  Amount ({pair.symbol})
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  style={{
                    width:'100%', padding:'13px 16px',
                    background:'rgba(255,255,255,0.04)', border:`1px solid ${orderType==='buy'?'rgba(34,197,94,0.3)':'rgba(239,68,68,0.3)'}`,
                    borderRadius:'10px', color:'#fff', fontSize:'16px', fontWeight:600, outline:'none',
                  }}
                />
              </div>

              {/* Quick amount buttons */}
              <div style={{ display:'flex', gap:'6px', marginBottom:'16px' }}>
                {['25%','50%','75%','MAX'].map(pct => (
                  <button key={pct} style={{
                    flex:1, padding:'6px', borderRadius:'7px', fontSize:'12px', fontWeight:600,
                    background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)',
                    color:'rgba(255,255,255,0.5)', cursor:'pointer', transition:'all 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor='rgba(201,160,80,0.4)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor='rgba(255,255,255,0.08)')}
                  >{pct}</button>
                ))}
              </div>

              {/* Order summary */}
              <div style={{
                background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)',
                borderRadius:'10px', padding:'14px', marginBottom:'16px',
              }}>
                {[
                  { label:'Mark Price', value:`$${price.price.toLocaleString(undefined,{minimumFractionDigits:2})}` },
                  { label:'Estimated Total', value:`$${parseFloat(total).toLocaleString(undefined,{minimumFractionDigits:2})}` },
                  { label:'Fee (0.1%)', value:`$${parseFloat(fee).toFixed(4)}` },
                ].map(row => (
                  <div key={row.label} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0' }}>
                    <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.45)' }}>{row.label}</span>
                    <span style={{ fontSize:'12px', fontWeight:600 }}>{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                style={{
                  width:'100%', padding:'14px', borderRadius:'11px',
                  background: submitted ? '#22c55e' : (orderType==='buy' ? 'linear-gradient(135deg,#16a34a,#22c55e)' : 'linear-gradient(135deg,#b91c1c,#ef4444)'),
                  border:'none', color:'#fff', fontWeight:700, fontSize:'15px',
                  cursor:'pointer', transition:'all 0.3s',
                  boxShadow: orderType==='buy' ? '0 0 20px rgba(34,197,94,0.3)' : '0 0 20px rgba(239,68,68,0.3)',
                }}
              >
                {submitted ? '✓ Order Placed!' : `${orderType === 'buy' ? '↑ Buy' : '↓ Sell'} ${pair.symbol}`}
              </button>
            </div>

            {/* Risk warning */}
            <div style={{
              background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.2)',
              borderRadius:'12px', padding:'14px', display:'flex', gap:'8px',
            }}>
              <AlertTriangle size={15} color="#ef4444" style={{ flexShrink:0, marginTop:'2px' }} />
              <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.45)', margin:0, lineHeight:1.65 }}>
                Trading involves significant risk. You may lose your entire investment. Only trade with funds you can afford to lose.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
