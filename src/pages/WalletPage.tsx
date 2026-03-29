import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDownLeft, ArrowUpRight, Copy, Check, ExternalLink, AlertCircle } from 'lucide-react';
import { useMarketData } from '../context/MarketContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import Skeleton from '../components/ui/Skeleton';

const ASSET_COLORS: Record<string, string> = {
  'BTC': '#F7931A',
  'ETH': '#627EEA',
  'USDT': '#26A17B',
  'GOLD': '#C9A050',
  'OIL': '#f97316'
};


function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).catch(() => { });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} style={{
      background: 'none', border: 'none', cursor: 'pointer',
      color: copied ? '#22c55e' : 'rgba(255,255,255,0.4)', padding: '4px',
    }}>
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
}

export default function WalletPage() {
  const { user } = useAuth();
  const { prices, loading: marketLoading } = useMarketData();
  const [mode, setMode] = useState<'deposit' | 'withdraw'>('deposit');
  const [selectedAsset, setSelectedAsset] = useState('USDT');
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [wallets, setWallets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    async function fetchWalletData() {
      if (!user) return;
      setIsLoading(true);
      try {
        const [wRes, txRes] = await Promise.all([
          supabase.from('wallets').select('*').eq('user_id', user.id),
          supabase.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
        ]);

        if (wRes.data) setWallets(wRes.data.filter(w => w.asset !== 'GOLD' && w.asset !== 'OIL'));
        if (txRes.data) setTransactions(txRes.data);
      } catch (err) {
        console.error('Error fetching wallet data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchWalletData();
  }, [user]);

  const activeWallet = wallets.find(w => w.asset === selectedAsset) || { balance: 0, address: '0x...' };

  const filteredTransactions = statusFilter === 'All'
    ? transactions
    : transactions.filter(tx => tx.status === statusFilter.toLowerCase());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !amount || Number(amount) <= 0) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      if (mode === 'withdraw') {
        const withdrawalAmount = Number(amount);
        if (withdrawalAmount <= 0) throw new Error('Withdrawal amount must be greater than 0');
        if (withdrawalAmount > Number(activeWallet.balance)) {
          throw new Error('Insufficient balance');
        }
        if (!address) throw new Error('Recipient address is required');

        // 1. Calculate withdrawal fee (10% of withdrawal amount)
        const withdrawalFee = withdrawalAmount * 0.1;
        const totalDeduction = withdrawalAmount + withdrawalFee;
        if (totalDeduction > Number(activeWallet.balance)) {
          throw new Error(`Insufficient balance. Withdrawal + 10% fee = ${totalDeduction.toFixed(2)} ${selectedAsset}`);
        }

        // 2. Create transaction record with pending status (admin approval required)
        const { error: txErr } = await supabase.from('transactions').insert({
          user_id: user.id,
          type: 'withdrawal',
          asset: selectedAsset,
          amount: withdrawalAmount,
          fee: withdrawalFee,
          status: 'pending'
        });
        if (txErr) throw txErr;

        // Note: Wallet deduction happens only after admin approval
        setMessage({ type: 'success', text: 'Withdrawal request submitted. Awaiting admin approval.' });
      } else {
        // Deposit - currently just logging intent for MVP
        const { error: txErr } = await supabase.from('transactions').insert({
          user_id: user.id,
          type: 'deposit',
          asset: selectedAsset,
          amount: Number(amount),
          status: 'pending'
        });
        if (txErr) throw txErr;
        setMessage({ type: 'success', text: 'Deposit request created. Please send funds to the address shown.' });
      }

      // Refresh data
      const [wRes, txRes] = await Promise.all([
        supabase.from('wallets').select('*').eq('user_id', user.id),
        supabase.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      ]);
      if (wRes.data) setWallets(wRes.data.filter(w => w.asset !== 'GOLD' && w.asset !== 'OIL'));
      if (txRes.data) setTransactions(txRes.data);
      setAmount('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Operation failed' });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Removed full-screen loader to allow skeletons

  return (
    <div style={{ paddingTop: '92px', minHeight: '100vh', padding: '92px 24px 60px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <h1 style={{ fontSize: 'clamp(22px, 3vw, 36px)', fontWeight: 800, marginBottom: '6px' }}>
          My <span className="gradient-text-gold">Wallet</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginBottom: '32px' }}>Manage your assets, deposit and withdraw funds</p>

        {/* Wallet balances */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '32px' }}>
          {(isLoading || marketLoading) ? (
            [1, 2, 3, 4].map(i => (
              <div key={i} style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '18px' }}>
                <Skeleton width="34px" height="34px" borderRadius="8px" style={{ marginBottom: '12px' }} />
                <Skeleton width="100px" height="22px" style={{ marginBottom: '6px' }} />
                <Skeleton width="60px" height="14px" />
              </div>
            ))
          ) : wallets.map(w => {
            const color = ASSET_COLORS[w.asset] || '#ccc';
            const livePrice = prices[w.asset]?.price || (w.asset === 'USDT' ? 1 : 0);
            const liveUsdValue = Number(w.balance) * livePrice;
            return (
              <motion.div
                key={w.asset}
                whileHover={{ scale: 1.02, y: -2 }}
                onClick={() => setSelectedAsset(w.asset)}
                style={{
                  background: selectedAsset === w.asset ? `${color}15` : '#111',
                  border: `1px solid ${selectedAsset === w.asset ? `${color}80` : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: '14px', padding: '18px', cursor: 'pointer',
                  boxShadow: selectedAsset === w.asset ? `0 0 20px ${color}25` : 'none',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '8px',
                    background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '16px',
                  }}>
                    {w.asset === 'BTC' ? '₿' : w.asset === 'ETH' ? '⟠' : w.asset === 'USDT' ? '₮' : w.asset === 'GOLD' ? '🥇' : '🛢️'}
                  </div>
                  <span style={{
                    fontSize: '11px', padding: '2px 8px', borderRadius: '5px',
                    background: `${color}20`, color: color, fontWeight: 600,
                  }}>{w.asset}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: '18px', color: color, marginBottom: '2px' }} className="stat-value">
                  {w.balance}
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                  ≈ ${liveUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Deposit / Withdraw panel */}
        <div className="r-grid-2" style={{ marginBottom: '32px' }}>
          <div style={{
            background: '#111', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '18px', padding: '28px',
          }}>
            {/* Toggle */}
            <div style={{
              display: 'flex', background: 'rgba(255,255,255,0.04)',
              borderRadius: '11px', padding: '4px', marginBottom: '24px',
            }}>
              {(['deposit', 'withdraw'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '9px', fontSize: '14px', fontWeight: 600,
                    border: 'none', cursor: 'pointer', transition: 'all 0.2s', textTransform: 'capitalize',
                    background: mode === m ? (m === 'deposit' ? 'linear-gradient(135deg,#C9A050,#E5C97A)' : 'linear-gradient(135deg,#00B0D0,#00E5FF)') : 'transparent',
                    color: mode === m ? '#0A0A0A' : 'rgba(255,255,255,0.5)',
                  }}
                >
                  {m === 'deposit' ? <><ArrowDownLeft size={14} style={{ display: 'inline', marginRight: '6px' }} />Deposit</> : <><ArrowUpRight size={14} style={{ display: 'inline', marginRight: '6px' }} />Withdraw</>}
                </button>
              ))}
            </div>

            {/* Asset selector */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginBottom: '8px', fontWeight: 500 }}>Select Asset</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {wallets.map(w => {
                  const color = ASSET_COLORS[w.asset] || '#ccc';
                  return (
                    <button key={w.asset} onClick={() => setSelectedAsset(w.asset)} style={{
                      padding: '7px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                      border: `1px solid ${selectedAsset === w.asset ? `${color}80` : 'rgba(255,255,255,0.1)'}`,
                      background: selectedAsset === w.asset ? `${color}15` : 'rgba(255,255,255,0.03)',
                      color: selectedAsset === w.asset ? color : 'rgba(255,255,255,0.5)',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}>{w.asset}</button>
                  )
                })}
              </div>
            </div>

            {/* Amount */}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginBottom: '8px', fontWeight: 500 }}>Amount ({selectedAsset})</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    step="any"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0.00"
                    style={{
                      width: '100%', padding: '13px 16px',
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '10px', color: '#fff', fontSize: '16px', fontWeight: 600,
                      outline: 'none',
                    }}
                  />
                  <button type="button" onClick={() => setAmount(String(activeWallet.balance))} style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'rgba(201,160,80,0.15)', border: '1px solid rgba(201,160,80,0.3)',
                    borderRadius: '6px', padding: '3px 10px', color: '#C9A050', fontSize: '12px',
                    cursor: 'pointer', fontWeight: 600,
                  }}>MAX</button>
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '6px' }}>
                  Available: {activeWallet.balance} {selectedAsset} (≈ ${(Number(activeWallet.balance) * (prices[selectedAsset]?.price || (selectedAsset === 'USDT' ? 1 : 0))).toLocaleString()})
                </div>
              </div>

              {/* Withdraw-only: destination address */}
              <AnimatePresence>
                {mode === 'withdraw' && (
                  <motion.div
                    key="address"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ marginBottom: '16px', overflow: 'hidden' }}
                  >
                    <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginBottom: '8px', fontWeight: 500 }}>Destination Address</label>
                    <input
                      type="text"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      placeholder="Enter wallet address..."
                      style={{
                        width: '100%', padding: '13px 16px',
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '10px', color: '#fff', fontSize: '14px',
                        outline: 'none',
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {message && (
                <div style={{
                  padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px',
                  background: message.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                  border: `1px solid ${message.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                  color: message.type === 'success' ? '#22c55e' : '#ef4444'
                }}>
                  {message.text}
                </div>
              )}

              {/* Submit */}
              <button
                disabled={isSubmitting}
                type="submit"
                style={{
                  width: '100%', padding: '14px', borderRadius: '11px',
                  background: mode === 'deposit' ? 'linear-gradient(135deg, #C9A050, #E5C97A)' : 'linear-gradient(135deg, #00B0D0, #00E5FF)',
                  border: 'none', color: '#0A0A0A', fontWeight: 700, fontSize: '15px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1, transition: 'all 0.2s',
                }}
              >
                {isSubmitting ? 'Processing...' : (mode === 'deposit' ? '↓ Process Deposit' : '↑ Request Withdrawal')}
              </button>
            </form>
          </div>

          {/* Deposit address panel */}
          <div style={{
            background: '#111', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '18px', padding: '28px',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
              {mode === 'deposit' ? `${selectedAsset} Deposit Address` : 'Withdrawal Info'}
            </h3>
            {mode === 'deposit' ? (
              <>
                {/* Simulated QR */}
                <div style={{
                  width: '140px', height: '140px', margin: '0 auto 20px',
                  background: '#fff', borderRadius: '12px', padding: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{
                    width: '116px', height: '116px',
                    background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='white'/%3E%3Crect x='10' y='10' width='30' height='30' rx='2' fill='black'/%3E%3Crect x='15' y='15' width='20' height='20' rx='1' fill='white'/%3E%3Crect x='18' y='18' width='14' height='14' fill='black'/%3E%3Crect x='60' y='10' width='30' height='30' rx='2' fill='black'/%3E%3Crect x='65' y='15' width='20' height='20' rx='1' fill='white'/%3E%3Crect x='68' y='18' width='14' height='14' fill='black'/%3E%3Crect x='10' y='60' width='30' height='30' rx='2' fill='black'/%3E%3Crect x='15' y='65' width='20' height='20' rx='1' fill='white'/%3E%3Crect x='18' y='68' width='14' height='14' fill='black'/%3E%3Crect x='47' y='47' width='6' height='6' fill='black'/%3E%3Crect x='60' y='47' width='6' height='6' fill='black'/%3E%3Crect x='74' y='47' width='6' height='6' fill='black'/%3E%3Crect x='47' y='60' width='6' height='6' fill='black'/%3E%3Crect x='60' y='60' width='6' height='6' fill='black'/%3E%3Crect x='74' y='60' width='6' height='6' fill='black'/%3E%3Crect x='47' y='74' width='6' height='6' fill='black'/%3E%3Crect x='74' y='74' width='6' height='6' fill='black'/%3E%3C/svg%3E")`,
                    backgroundSize: 'cover',
                  }} />
                </div>

                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px 16px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginBottom: '6px' }}>Deposit Address</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                      {activeWallet.address || 'Loading...'}
                    </span>
                    <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                      <CopyButton text={activeWallet.address || ''} />
                      <ExternalLink size={14} color="rgba(255,255,255,0.3)" />
                    </div>
                  </div>
                </div>

                <div style={{ background: 'rgba(201,160,80,0.08)', border: '1px solid rgba(201,160,80,0.2)', borderRadius: '10px', padding: '12px 14px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <AlertCircle size={14} color="#C9A050" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.6 }}>
                      Only send <strong style={{ color: '#C9A050' }}>{selectedAsset}</strong> to this address. Sending any other asset may result in permanent loss of funds. Minimum deposit: 0.001 {selectedAsset}.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: 'Processing Time', value: 'Instant - 24 hours' },
                  { label: 'Withdrawal Fee', value: '10% of withdrawal amount' },
                  { label: 'Min. Withdrawal', value: selectedAsset === 'BTC' ? '0.007 BTC' : selectedAsset === 'ETH' ? '0.23 ETH' : '$500 USDT' },
                  { label: 'Manual Review', value: 'Required above $10,000' },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{row.label}</span>
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>{row.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Transaction history */}
        <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '18px', padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Transaction History</h3>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['All', 'completed', 'pending', 'failed'].map(f => (
                <button key={f} onClick={() => setStatusFilter(f)} style={{
                  padding: '6px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: 500,
                  background: statusFilter === f ? 'rgba(201,160,80,0.15)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${statusFilter === f ? 'rgba(201,160,80,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  color: statusFilter === f ? '#C9A050' : 'rgba(255,255,255,0.5)',
                  cursor: 'pointer', textTransform: 'capitalize',
                }}>{f}</button>
              ))}
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Type', 'Asset', 'Amount', 'USD Value', 'Status', 'Date', 'Hash'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map(tx => {
                  const sc = tx.status === 'completed' ? '#22c55e' : tx.status === 'pending' ? '#f59e0b' : '#ef4444';
                  const tc = tx.type === 'deposit' ? '#22c55e' : tx.type === 'withdrawal' ? '#ef4444' : '#C9A050';
                  const livePrice = prices[tx.asset]?.price || (tx.asset === 'USDT' ? 1 : 0);
                  const usdVal = Number(tx.amount) * livePrice;

                  return (
                    <tr key={tx.id} className="table-row-hover" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '13px 12px' }}>
                        <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '6px', fontWeight: 600, textTransform: 'capitalize', background: `${tc}15`, color: tc }}>
                          {tx.type}
                        </span>
                      </td>
                      <td style={{ padding: '13px 12px', fontWeight: 600 }}>{tx.asset}</td>
                      <td style={{ padding: '13px 12px', fontSize: '13px' }}>{tx.amount}</td>
                      <td style={{ padding: '13px 12px', fontSize: '13px' }}>${usdVal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                      <td style={{ padding: '13px 12px' }}>
                        <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '6px', fontWeight: 600, textTransform: 'capitalize', background: `${sc}15`, color: sc }}>
                          {tx.status}
                        </span>
                      </td>
                      <td style={{ padding: '13px 12px', fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>{new Date(tx.created_at).toLocaleDateString()}</td>
                      <td style={{ padding: '13px 12px', fontSize: '12px', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>
                        {tx.tx_hash ? `${tx.tx_hash.slice(0, 6)}...${tx.tx_hash.slice(-4)}` : '—'}
                      </td>
                    </tr>
                  );
                })}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '14px' }}>
                      No transaction history found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
