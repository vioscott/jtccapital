import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Loader2,
  Search,
  RefreshCw
} from 'lucide-react';

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  async function fetchTransactions() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          profiles:user_id (full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) console.error('Fetch error:', error);
      if (data) setTransactions(data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleApprove = async (tx: any) => {
    setProcessingId(tx.id);
    try {
      if (tx.type === 'deposit') {
        // For deposits: add the approved amount to user's wallet
        const { data: wallet } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', tx.user_id)
          .eq('asset', tx.asset)
          .single();

        if (wallet) {
          const { error: wErr } = await supabase
            .from('wallets')
            .update({ balance: Number(wallet.balance) + Number(tx.amount) })
            .eq('user_id', tx.user_id)
            .eq('asset', tx.asset);
          if (wErr) throw wErr;
        }
      } else if (tx.type === 'withdrawal') {
        // For withdrawals: deduct the amount + fee from user's wallet
        const { data: wallet } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', tx.user_id)
          .eq('asset', tx.asset)
          .single();

        if (wallet) {
          const totalDeduction = Number(tx.amount) + (Number(tx.fee) || 0);
          const { error: wErr } = await supabase
            .from('wallets')
            .update({ balance: Number(wallet.balance) - totalDeduction })
            .eq('user_id', tx.user_id)
            .eq('asset', tx.asset);
          if (wErr) throw wErr;
        }
      }

      const { error: txErr } = await supabase
        .from('transactions')
        .update({ status: 'completed' })
        .eq('id', tx.id);
      if (txErr) throw txErr;

      setTransactions(prev => prev.map(t => t.id === tx.id ? { ...t, status: 'completed' } : t));
    } catch (err) {
      console.error('Approval failed:', err);
      alert('Failed to approve transaction');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (tx: any) => {
    setProcessingId(tx.id);
    try {
      // For deposits and withdrawals: no wallet action needed on rejection
      // Deposits never added funds, withdrawals never deducted funds (they're pending approval)
      
      const { error: txErr } = await supabase
        .from('transactions')
        .update({ status: 'failed' })
        .eq('id', tx.id);
      if (txErr) throw txErr;

      setTransactions(prev => prev.map(t => t.id === tx.id ? { ...t, status: 'failed' } : t));
    } catch (err) {
      console.error('Rejection failed:', err);
      alert('Failed to reject transaction');
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = transactions.filter(t => {
    const matchesStatus = filter === 'all' || t.status === filter;
    const matchesSearch = !search || 
      t.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      t.user_id?.toLowerCase().includes(search.toLowerCase()) ||
      t.id?.toLowerCase().includes(search.toLowerCase()) ||
      t.asset?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Loader2 size={32} color="#C9A050" className="spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '4px' }}>Transaction Monitoring</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
            {transactions.length} total transactions · {transactions.filter(t => t.status === 'pending').length} pending review
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={16} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search user, ID, asset..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                padding: '10px 12px 10px 36px',
                background: '#111', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '10px', color: '#fff', fontSize: '13px',
                outline: 'none', width: '220px',
              }}
            />
          </div>

          {/* Refresh */}
          <button
            onClick={fetchTransactions}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px', padding: '10px 14px', color: 'rgba(255,255,255,0.6)',
              cursor: 'pointer', fontSize: '13px', fontWeight: 600,
            }}
          >
            <RefreshCw size={14} /> Refresh
          </button>

          {/* Status filters */}
          <div style={{ display: 'flex', gap: '4px', background: '#111', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.07)' }}>
            {(['pending', 'completed', 'failed', 'all'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '8px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: 600,
                  border: 'none', cursor: 'pointer', transition: 'all 0.2s', textTransform: 'capitalize',
                  background: filter === f ? 'rgba(201,160,80,0.15)' : 'transparent',
                  color: filter === f ? '#C9A050' : 'rgba(255,255,255,0.4)',
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              {['Type', 'User', 'Amount', 'Status', 'Date', 'Action'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', color: 'rgba(255,255,255,0.35)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(tx => {
              const statusColor = tx.status === 'completed' ? '#22c55e' : tx.status === 'pending' ? '#f59e0b' : '#ef4444';
              const isProcessing = processingId === tx.id;

              return (
                <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ 
                        width: '32px', height: '32px', borderRadius: '8px', 
                        background: tx.type === 'deposit' ? 'rgba(34,197,94,0.1)' : 'rgba(0,176,208,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {tx.type === 'deposit' ? <ArrowDownLeft size={16} color="#22c55e" /> : <ArrowUpRight size={16} color="#00B0D0" />}
                      </div>
                      <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{tx.type}</span>
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ fontWeight: 500 }}>{tx.profiles?.full_name || 'Unknown User'}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>{tx.user_id?.slice(0, 14)}...</div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ fontWeight: 700, fontSize: '15px' }}>{tx.amount} {tx.asset}</div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <span style={{ 
                      fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '6px', 
                      background: `${statusColor}15`, color: statusColor,
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      textTransform: 'uppercase'
                    }}>
                      {tx.status === 'pending' && <Clock size={12} />}
                      {tx.status === 'completed' && <CheckCircle size={12} />}
                      {tx.status === 'failed' && <XCircle size={12} />}
                      {tx.status}
                    </span>
                  </td>
                  <td style={{ padding: '20px 24px', fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
                    {new Date(tx.created_at).toLocaleDateString()}
                    <div style={{ fontSize: '11px' }}>{new Date(tx.created_at).toLocaleTimeString()}</div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    {tx.status === 'pending' ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => handleApprove(tx)}
                          disabled={isProcessing}
                          style={{ 
                            background: '#22c55e', color: '#fff', border: 'none', 
                            padding: '6px 14px', borderRadius: '6px', fontSize: '12px', 
                            fontWeight: 700, cursor: isProcessing ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', gap: '4px'
                          }}
                        >
                          {isProcessing ? <Loader2 size={12} className="spin" /> : <CheckCircle size={12} />}
                          Approve
                        </button>
                        <button 
                          onClick={() => handleReject(tx)}
                          disabled={isProcessing}
                          style={{ 
                            background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', 
                            padding: '6px 14px', borderRadius: '6px', fontSize: '12px', 
                            fontWeight: 700, cursor: isProcessing ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {isProcessing ? <Loader2 size={12} className="spin" /> : 'Reject'}
                        </button>
                      </div>
                    ) : (
                      <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Processed <CheckCircle size={12} />
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '60px', textAlign: 'center', color: 'rgba(255,255,255,0.2)' }}>
                  <div style={{ marginBottom: '12px', fontSize: '32px' }}>📭</div>
                  No {filter !== 'all' ? filter : ''} transactions found.
                  {transactions.length === 0 && (
                    <div style={{ fontSize: '12px', marginTop: '8px', color: 'rgba(255,255,255,0.15)' }}>
                      Ensure admin RLS policies are applied in your Supabase project.
                    </div>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
