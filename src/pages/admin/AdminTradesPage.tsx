import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Activity, Clock, Search, Loader2 } from 'lucide-react';

export default function AdminTradesPage() {
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTrades();
  }, []);

  async function fetchTrades() {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('trades')
        .select(`
          *,
          profiles:user_id (full_name)
        `)
        .order('created_at', { ascending: false });

      if (data) setTrades(data);
    } catch (err) {
      console.error('Error fetching global trades:', err);
    } finally {
      setLoading(false);
    }
  }

  const filteredTrades = trades.filter(t => 
    t.asset.toLowerCase().includes(search.toLowerCase()) ||
    t.profiles?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

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
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '4px' }}>Global Trade Monitoring</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>Real-time overview of all active and closed positions</p>
        </div>

        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search by asset or user..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 12px 12px 40px',
              background: '#111',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '10px',
              color: '#fff',
              fontSize: '14px',
              outline: 'none'
            }}
          />
        </div>
      </div>

      <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              {['User', 'Asset', 'Type', 'Amount', 'Entry Price', 'Status', 'Opened'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', color: 'rgba(255,255,255,0.35)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredTrades.map(trade => (
              <tr key={trade.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ fontWeight: 600 }}>{trade.profiles?.full_name || 'System User'}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{trade.user_id.slice(0, 12)}...</div>
                </td>
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700 }}>{trade.asset}</span>
                  </div>
                </td>
                <td style={{ padding: '20px 24px' }}>
                  <span style={{ 
                    fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '6px', 
                    background: trade.type === 'buy' ? 'rgba(34,197,94,0.1)' : 'rgba(0,176,208,0.1)',
                    color: trade.type === 'buy' ? '#22c55e' : '#00E5FF'
                  }}>
                    {trade.type.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '20px 24px', fontWeight: 600 }}>
                  {trade.amount}
                </td>
                <td style={{ padding: '20px 24px', fontWeight: 600 }}>
                  ${Number(trade.entry_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td style={{ padding: '20px 24px' }}>
                  <span style={{ 
                    fontSize: '11px', fontWeight: 600, padding: '4px 8px', borderRadius: '6px',
                    background: trade.status === 'open' ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.05)',
                    color: trade.status === 'open' ? '#f59e0b' : 'rgba(255,255,255,0.4)',
                    display: 'inline-flex', alignItems: 'center', gap: '4px'
                  }}>
                    {trade.status === 'open' ? <Activity size={12} /> : <Clock size={12} />}
                    {trade.status}
                  </span>
                </td>
                <td style={{ padding: '20px 24px', fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
                  {new Date(trade.created_at).toLocaleDateString()}
                  <div style={{ fontSize: '11px' }}>{new Date(trade.created_at).toLocaleTimeString()}</div>
                </td>
              </tr>
            ))}
            {filteredTrades.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: '60px', textAlign: 'center', color: 'rgba(255,255,255,0.2)' }}>
                  No trades found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
