import { useEffect, useState } from 'react';

import { TrendingUp, TrendingDown, AlertTriangle, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { goldChartData, btcChartData, ethChartData, oilChartData } from '../mock/data';
import { useMarketData } from '../context/MarketContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const tradePairs = [
  { symbol:'GOLD', name:'Gold',    icon:'🥇', color:'#C9A050', data:goldChartData, fee:'0.1%' },
  { symbol:'BTC',  name:'Bitcoin', icon:'₿',  color:'#F7931A', data:btcChartData,  fee:'0.1%' },
  { symbol:'ETH',  name:'Ethereum',icon:'⟠',  color:'#627EEA', data:ethChartData,  fee:'0.1%' },
  { symbol:'OIL',  name:'Crude Oil',icon:'🛢️', color:'#f97316', data:oilChartData,  fee:'0.1%' },
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
  const { user } = useAuth();
  const { prices, loading: marketLoading } = useMarketData();
  const [selectedPair, setSelectedPair] = useState(0);
  const [orderType, setOrderType] = useState<'buy'|'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success'|'error', text: string } | null>(null);

  const [wallets, setWallets] = useState<any[]>([]);
  const [openTrades, setOpenTrades] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTradingData() {
      if (!user) return;
      setIsLoading(true);
      try {
        const [wRes, tRes] = await Promise.all([
          supabase.from('wallets').select('*').eq('user_id', user.id),
          supabase.from('trades').select('*').eq('user_id', user.id).eq('status', 'open')
        ]);
        if (wRes.data) setWallets(wRes.data);
        if (tRes.data) setOpenTrades(tRes.data);
      } catch (err) {
        console.error('Trading fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTradingData();
  }, [user]);

  const pair = tradePairs[selectedPair];
  const price = prices[pair.symbol] || { price: 0, change: 0, changeAmt: 0 };
  const up = price.change >= 0;
  const totalUSD = amount ? (parseFloat(amount) * price.price) : 0;
  const fee = totalUSD * 0.001;

  const usdtWallet = wallets.find(w => w.asset === 'USDT') || { balance: 0 };

  // 1. Fetch live price
  // 2. Check user wallet balance
  // 3. Deduct funds
  // 4. Create trade record
  // 5. Update wallet
  // 6. Return result
  async function executeTrade() {
    if (!user || !amount || parseFloat(amount) <= 0) {
      throw new Error('Invalid trade parameters');
    }

    // 1. Fetch live price
    const currentPrice = prices[pair.symbol]?.price;
    if (!currentPrice || currentPrice <= 0) {
      throw new Error('Unable to fetch current market price');
    }

    const tradeSize = parseFloat(amount);
    const tradeValue = tradeSize * currentPrice;
    const tradeFee = tradeValue * 0.001; // 0.1% fee

    // 2. Check user wallet balance
    const usdtBal = Number(usdtWallet.balance || 0);
    if (orderType === 'buy' && tradeValue + tradeFee > usdtBal) {
      throw new Error('Insufficient USDT balance to execute buy order');
    }

    // 3. Deduct funds (for buy orders)
    if (orderType === 'buy') {
      const { error: walletUpdateError } = await supabase.from('wallets')
        .update({ balance: usdtBal - (tradeValue + tradeFee) })
        .eq('user_id', user.id)
        .eq('asset', 'USDT');
      if (walletUpdateError) throw walletUpdateError;
    }

    // 4. Create trade record
    const { error: tradeError } = await supabase.from('trades').insert({
      user_id: user.id,
      type: orderType,
      asset: pair.symbol,
      amount: tradeSize,
      entry_price: currentPrice,
      fee: tradeFee,
      status: 'open',
      created_at: new Date().toISOString(),
    });
    if (tradeError) throw tradeError;

    // 5. Update wallet (already updated for buys, for sells we will assume close flow call handles proceeds)
    if (orderType === 'sell') {
      const matchingPos = openTrades.find(t => t.asset === pair.symbol && t.type === 'buy');
      if (!matchingPos) {
        throw new Error(`No open ${pair.symbol} position found to sell`);
      }
      // sell closes position and updates wallet balance in close trade method
      await handleCloseTrade(matchingPos.id);
    }

    // 6. Return result
    return {
      success: true,
      message: orderType === 'buy'
        ? `Bought ${tradeSize} ${pair.symbol} at $${currentPrice.toFixed(2)}`
        : `Sell order executed for ${pair.symbol}`,
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !amount || parseFloat(amount) <= 0) return;
    
    setIsSubmitting(true);
    setMessage(null);

    try {
      const result = await executeTrade();
      setMessage({ type: 'success', text: result.message });

      // Refresh data
      const [wRes, tRes] = await Promise.all([
        supabase.from('wallets').select('*').eq('user_id', user.id),
        supabase.from('trades').select('*').eq('user_id', user.id).eq('status', 'open')
      ]);
      if (wRes.data) setWallets(wRes.data);
      if (tRes.data) setOpenTrades(tRes.data);
      setAmount('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Trade execution failed' });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCloseTrade(tradeId: string) {
    if (!user) return;
    try {
      const trade = openTrades.find(t => t.id === tradeId);
      if (!trade) return;

      const currentPrice = prices[trade.asset]?.price || 0;
      const proceeds = Number(trade.amount) * currentPrice;

      // 1. Close trade
      await supabase.from('trades').update({ status: 'closed', closed_at: new Date().toISOString() }).eq('id', tradeId);
      
      // 2. Add proceeds to USDT wallet
      const currentUsdt = Number(wallets.find(w => w.asset === 'USDT')?.balance || 0);
      await supabase.from('wallets').update({ balance: currentUsdt + proceeds }).eq('user_id', user.id).eq('asset', 'USDT');

      // Refresh
      const [wRes, tRes] = await Promise.all([
        supabase.from('wallets').select('*').eq('user_id', user.id),
        supabase.from('trades').select('*').eq('user_id', user.id).eq('status', 'open')
      ]);
      if (wRes.data) setWallets(wRes.data);
      if (tRes.data) setOpenTrades(tRes.data);
    } catch (err) {
      console.error('Error closing trade:', err);
    }
  }

  if (isLoading || marketLoading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', flexDirection:'column', gap:'16px' }}>
        <Loader2 size={40} color="#C9A050" className="spin" />
        <div style={{ color:'rgba(255,255,255,0.4)', fontSize:'14px' }}>Connecting to liquidity providers...</div>
      </div>
    );
  }

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
              const pr = prices[p.symbol] || { price: 0, change: 0 };
              return (
                <div key={p.symbol} style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)' }}>
                  <span style={{ color:p.color, fontWeight:600 }}>{p.symbol} </span>
                  ${pr.price.toLocaleString(undefined,{maximumFractionDigits:2, minimumFractionDigits:2})}
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
                      {up?'+':''}{price.change.toFixed(2)}% ({up?'+':''}${Math.abs(price.changeAmt).toLocaleString(undefined,{maximumFractionDigits:2})})
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
                    {openTrades.map((pos) => {
                       const currentPrice = prices[pos.asset]?.price || 0;
                       const pnl = (currentPrice - Number(pos.entry_price)) * Number(pos.amount);
                       const pnlPct = (pnl / (Number(pos.entry_price) * Number(pos.amount))) * 100;
                       const isUp = pnl >= 0;

                       return (
                        <tr key={pos.id} className="table-row-hover" style={{ borderBottom:'1px solid rgba(255,255,255,0.03)' }}>
                          <td style={{ padding:'11px 10px', fontWeight:700 }}>{pos.asset}</td>
                          <td style={{ padding:'11px 10px' }}>
                            <span style={{
                              fontSize:'12px', padding:'2px 10px', borderRadius:'5px', fontWeight:600, textTransform:'capitalize',
                              background:pos.type==='buy'?'rgba(34,197,94,0.1)':'rgba(0,229,255,0.1)',
                              color:pos.type==='buy'?'#22c55e':'#00E5FF',
                            }}>{pos.type}</span>
                          </td>
                          <td style={{ padding:'11px 10px', fontSize:'13px', color:'rgba(255,255,255,0.7)' }}>{pos.amount}</td>
                          <td style={{ padding:'11px 10px', fontSize:'13px' }}>${Number(pos.entry_price).toLocaleString(undefined, { maximumFractionDigits:2 })}</td>
                          <td style={{ padding:'11px 10px', fontSize:'13px' }}>${currentPrice.toLocaleString(undefined, { maximumFractionDigits:2 })}</td>
                          <td style={{ padding:'11px 10px', color: isUp ? '#22c55e' : '#ef4444', fontWeight:700, fontSize:'13px' }}>
                            {isUp?'+':''}${pnl.toLocaleString(undefined, { maximumFractionDigits:2 })} ({pnlPct.toFixed(2)}%)
                          </td>
                          <td style={{ padding:'11px 10px' }}>
                            <button 
                              onClick={() => handleCloseTrade(pos.id)}
                              style={{
                                padding:'5px 12px', borderRadius:'6px', fontSize:'12px', fontWeight:600,
                                background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)',
                                color:'#ef4444', cursor:'pointer',
                              }}
                            >Close</button>
                          </td>
                        </tr>
                      )})}
                      {openTrades.length === 0 && (
                        <tr>
                          <td colSpan={7} style={{ padding:'32px', textAlign:'center', color:'rgba(255,255,255,0.3)', fontSize:'14px' }}>
                            No open positions.
                          </td>
                        </tr>
                      )}
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
                  { label:'Estimated Total', value:`$${totalUSD.toLocaleString(undefined,{minimumFractionDigits:2})}` },
                  { label:'Fee (0.1%)', value:`$${fee.toFixed(4)}` },
                  { label:'Available Balance', value:`$${Number(usdtWallet.balance).toLocaleString(undefined, { minimumFractionDigits:2 })} USDT` },
                ].map(row => (
                  <div key={row.label} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0' }}>
                    <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.45)' }}>{row.label}</span>
                    <span style={{ fontSize:'12px', fontWeight:600 }}>{row.value}</span>
                  </div>
                ))}
              </div>

              {message && (
                <div style={{
                  padding:'10px 14px', borderRadius:'8px', marginBottom:'16px', fontSize:'13px',
                  background: message.type==='success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                  border: `1px solid ${message.type==='success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                  color: message.type==='success' ? '#22c55e' : '#ef4444'
                }}>
                  {message.text}
                </div>
              )}

              {/* Submit */}
              <button
                disabled={isSubmitting}
                onClick={handleSubmit}
                style={{
                  width:'100%', padding:'14px', borderRadius:'11px',
                  background: isSubmitting ? 'rgba(255,255,255,0.1)' : (orderType==='buy' ? 'linear-gradient(135deg,#16a34a,#22c55e)' : 'linear-gradient(135deg,#b91c1c,#ef4444)'),
                  border:'none', color:'#fff', fontWeight:700, fontSize:'15px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer', transition:'all 0.3s',
                  boxShadow: orderType==='buy' ? '0 0 20px rgba(34,197,94,0.3)' : '0 0 20px rgba(239,68,68,0.3)',
                  opacity: isSubmitting ? 0.7 : 1,
                }}
              >
                {isSubmitting ? 'Executing Order...' : `${orderType === 'buy' ? '↑ Buy' : '↓ Sell'} ${pair.symbol}`}
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
