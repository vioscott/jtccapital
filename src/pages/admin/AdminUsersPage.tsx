import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Edit2, Shield, User, Loader2, Wallet, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ASSETS = ['BTC', 'ETH', 'USDT', 'GOLD'];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [defaultAddresses, setDefaultAddresses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editingWallets, setEditingWallets] = useState<Record<string, string>>({});
  const [editingAddresses, setEditingAddresses] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'balance' | 'addresses'>('profile');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [{ data: profilesData }, { data: walletsData }, { data: defaultsData }] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('wallets').select('*'),
        supabase.from('default_wallet_addresses').select('asset, address')
      ]);
      if (profilesData) setUsers(profilesData);
      if (walletsData) setWallets(walletsData);
      if (defaultsData) {
        const defaultsMap: Record<string, string> = {};
        defaultsData.forEach(item => {
          defaultsMap[item.asset] = item.address;
        });
        setDefaultAddresses(defaultsMap);
      }
    } catch (err) {
      console.error('Error fetching admin users data:', err);
    } finally {
      setLoading(false);
    }
  }

  const openEdit = (user: any) => {
    setEditingUser({ ...user });
    const userWallets = wallets.filter(w => w.user_id === user.id);
    const initial: Record<string, string> = {};
    const addresses: Record<string, string> = {};
    ASSETS.forEach(asset => {
      const found = userWallets.find(w => w.asset === asset);
      initial[asset] = found ? String(found.balance) : '0';
      addresses[asset] = found ? (found.address || '') : '';
    });
    setEditingWallets(initial);
    setEditingAddresses(addresses);
    setActiveTab('profile');
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSaving(true);

    try {
      // Update profile
      const { error: profileErr } = await supabase
        .from('profiles')
        .update({
          tier: Number(editingUser.tier),
          role: editingUser.role,
          full_name: editingUser.full_name,
        })
        .eq('id', editingUser.id);

      if (profileErr) throw profileErr;

      // Update wallets
      for (const asset of ASSETS) {
        const newBalance = parseFloat(editingWallets[asset] || '0');
        const newAddress = editingAddresses[asset] || '';
        const existing = wallets.find(w => w.user_id === editingUser.id && w.asset === asset);
        if (existing) {
          const { error } = await supabase
            .from('wallets')
            .update({ balance: newBalance, address: newAddress })
            .eq('user_id', editingUser.id)
            .eq('asset', asset);
          if (error) throw error;
        }
      }

      // Refresh local state
      setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
      const { data: freshWallets } = await supabase.from('wallets').select('*');
      if (freshWallets) setWallets(freshWallets);
      setEditingUser(null);
    } catch (err) {
      console.error('Error updating user:', err);
      alert('Failed to save changes. Check console for details.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.id.toLowerCase().includes(search.toLowerCase())
  );

  const getUserTotalBalance = (userId: string) => {
    return wallets
      .filter(w => w.user_id === userId)
      .reduce((sum, w) => sum + Number(w.balance), 0);
  };

  const isUsingDefaultAddress = (asset: string, userAddress: string) => {
    const defaultAddr = defaultAddresses[asset];
    return defaultAddr && userAddress === defaultAddr;
  };

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
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '4px' }}>User Management</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>Total of {users.length} registered members</p>
        </div>
        
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search by name or UUID..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '12px 12px 12px 40px',
              background: '#111', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none',
            }}
          />
        </div>
      </div>

      <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              {['User', 'Status/Role', 'Membership', 'Total Portfolio', 'Joined', ''].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', color: 'rgba(255,255,255,0.35)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }}>
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(201,160,80,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={18} color="#C9A050" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{user.full_name || 'Unnamed User'}</div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>{user.id.slice(0, 18)}...</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '20px 24px' }}>
                  <span style={{ 
                    fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '6px', 
                    background: user.role === 'admin' ? 'rgba(201,160,80,0.15)' : 'rgba(255,255,255,0.05)',
                    color: user.role === 'admin' ? '#C9A050' : 'rgba(255,255,255,0.5)',
                    display: 'inline-flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase',
                  }}>
                    {user.role === 'admin' && <Shield size={12} />}
                    {user.role || 'user'}
                  </span>
                </td>
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>Tier {user.tier}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{user.tier === 3 ? 'Platinum' : user.tier === 2 ? 'Gold' : 'Standard'}</div>
                </td>
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Wallet size={14} color="rgba(255,255,255,0.3)" />
                    <span style={{ fontWeight: 600 }}>${getUserTotalBalance(user.id).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </td>
                <td style={{ padding: '20px 24px', fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                  <button 
                    onClick={() => openEdit(user)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px', color: 'rgba(255,255,255,0.4)', transition: 'color 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.color = '#C9A050'}
                    onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                  >
                    <Edit2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingUser && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ background: '#111', border: '1px solid rgba(201,160,80,0.3)', borderRadius: '20px', padding: '32px', maxWidth: '480px', width: '100%', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
            >
              <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>Edit Member</h2>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '24px', fontFamily: 'monospace' }}>{editingUser.id}</div>

              {/* Tabs */}
              <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '10px', marginBottom: '24px' }}>
                {(['profile', 'balance', 'addresses'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '7px', fontSize: '13px', fontWeight: 600,
                      border: 'none', cursor: 'pointer', textTransform: 'capitalize',
                      background: activeTab === tab ? 'rgba(201,160,80,0.15)' : 'transparent',
                      color: activeTab === tab ? '#C9A050' : 'rgba(255,255,255,0.4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    }}
                  >
                    {tab === 'profile' ? <User size={14} /> : tab === 'balance' ? <DollarSign size={14} /> : <Wallet size={14} />}
                    {tab === 'profile' ? 'Profile' : tab === 'balance' ? 'Balances' : 'Addresses'}
                  </button>
                ))}
              </div>

              <form onSubmit={handleUpdateUser}>
                {activeTab === 'profile' ? (
                  <>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>Full Name</label>
                      <input 
                        type="text" 
                        value={editingUser.full_name || ''} 
                        onChange={e => setEditingUser({ ...editingUser, full_name: e.target.value })}
                        style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', outline: 'none' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>Membership Tier</label>
                        <select 
                          value={editingUser.tier} 
                          onChange={e => setEditingUser({ ...editingUser, tier: e.target.value })}
                          style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', outline: 'none' }}
                        >
                          <option value={1}>Tier 1 (Standard)</option>
                          <option value={2}>Tier 2 (Gold)</option>
                          <option value={3}>Tier 3 (Platinum)</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>System Role</label>
                        <select 
                          value={editingUser.role} 
                          onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
                          style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', outline: 'none' }}
                        >
                          <option value="user">Standard User</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </div>
                    </div>
                  </>
                ) : activeTab === 'balance' ? (
                  <div style={{ marginBottom: '24px' }}>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginBottom: '16px' }}>
                      Edit individual asset balances. Changes take effect immediately on save.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {ASSETS.map(asset => (
                        <div key={asset} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ 
                            width: '40px', height: '40px', borderRadius: '10px',
                            background: 'rgba(201,160,80,0.08)', border: '1px solid rgba(201,160,80,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#C9A050' }}>{asset}</span>
                          </div>
                          <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginBottom: '4px' }}>{asset} Balance</label>
                            <input
                              type="number"
                              step="any"
                              min="0"
                              value={editingWallets[asset] || '0'}
                              onChange={e => setEditingWallets(prev => ({ ...prev, [asset]: e.target.value }))}
                              style={{
                                width: '100%', padding: '10px 12px',
                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: 600, outline: 'none',
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ marginBottom: '24px' }}>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginBottom: '16px' }}>
                      Edit deposit wallet addresses for each asset. Users will see these addresses for deposits.
                      <br />
                      <a 
                        href="/admin/wallet-defaults" 
                        style={{ color: '#C9A050', textDecoration: 'underline', fontSize: '11px' }}
                        onClick={(e) => {
                          e.preventDefault();
                          window.location.href = '/admin/wallet-defaults';
                        }}
                      >
                        Manage default addresses →
                      </a>
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {ASSETS.map(asset => (
                        <div key={asset}>
                          <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px', fontWeight: 500 }}>
                            {asset} Deposit Address
                            {isUsingDefaultAddress(asset, editingAddresses[asset] || '') && (
                              <span style={{ marginLeft: '8px', fontSize: '10px', color: '#10B981', fontWeight: 'bold' }}>
                                (Using Default)
                              </span>
                            )}
                          </label>
                          <input
                            type="text"
                            value={editingAddresses[asset] || ''}
                            onChange={e => setEditingAddresses(prev => ({ ...prev, [asset]: e.target.value }))}
                            placeholder={`Enter ${asset} wallet address...`}
                            style={{
                              width: '100%', padding: '10px 12px',
                              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                              borderRadius: '8px', color: '#fff', fontSize: '13px', outline: 'none',
                              fontFamily: 'monospace',
                            }}
                          />
                          {defaultAddresses[asset] && (
                            <div style={{ marginTop: '4px', fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
                              Default: {defaultAddresses[asset].slice(0, 20)}...
                              <button
                                type="button"
                                onClick={() => setEditingAddresses(prev => ({ ...prev, [asset]: defaultAddresses[asset] }))}
                                style={{
                                  marginLeft: '8px',
                                  background: 'none',
                                  border: 'none',
                                  color: '#C9A050',
                                  cursor: 'pointer',
                                  fontSize: '11px',
                                  textDecoration: 'underline'
                                }}
                              >
                                Use Default
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}


                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    type="button" 
                    onClick={() => setEditingUser(null)}
                    style={{ flex: 1, padding: '14px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSaving}
                    style={{ 
                      flex: 1, padding: '14px', borderRadius: '10px', 
                      background: 'linear-gradient(135deg, #C9A050, #E5C97A)', 
                      color: '#0A0A0A', border: 'none', cursor: isSaving ? 'not-allowed' : 'pointer', 
                      fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    }}
                  >
                    {isSaving ? <Loader2 size={18} className="spin" /> : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
