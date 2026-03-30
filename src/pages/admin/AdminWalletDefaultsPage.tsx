import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Loader2, Wallet, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const DEFAULT_ASSETS = ['BTC', 'ETH', 'USDT'];

export default function AdminWalletDefaultsPage() {
  const [defaults, setDefaults] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copiedAsset, setCopiedAsset] = useState<string | null>(null);

  useEffect(() => {
    fetchDefaults();
  }, []);

  async function fetchDefaults() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('default_wallet_addresses')
        .select('asset, address');

      if (error) throw error;

      const defaultsMap: Record<string, string> = {};
      data?.forEach(item => {
        defaultsMap[item.asset] = item.address;
      });
      setDefaults(defaultsMap);
    } catch (err) {
      console.error('Error fetching default addresses:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Update or insert each default address
      for (const asset of DEFAULT_ASSETS) {
        const address = defaults[asset] || '';

        if (address.trim()) {
          const { error } = await supabase
            .from('default_wallet_addresses')
            .upsert({
              asset,
              address: address.trim(),
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'asset'
            });

          if (error) throw error;
        } else {
          // If address is empty, delete the record
          const { error } = await supabase
            .from('default_wallet_addresses')
            .delete()
            .eq('asset', asset);

          if (error) throw error;
        }
      }

      alert('Default wallet addresses updated successfully!');
      fetchDefaults(); // Refresh data
    } catch (err) {
      console.error('Error saving default addresses:', err);
      alert('Failed to save changes. Check console for details.');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = async (text: string, asset: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAsset(asset);
      setTimeout(() => setCopiedAsset(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <Loader2 className="animate-spin" size={24} />
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wallet size={24} />
            Default Wallet Addresses
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)' }}>
            Set default deposit addresses that will be automatically assigned to new users.
            These addresses will be used for BTC, ETH, and USDT wallets when users register.
          </p>
        </div>

        <form onSubmit={handleSave}>
          <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
              Default Deposit Addresses
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {DEFAULT_ASSETS.map(asset => (
                <div key={asset} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#C9A050' }}>
                    {asset} Address
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      value={defaults[asset] || ''}
                      onChange={e => setDefaults(prev => ({ ...prev, [asset]: e.target.value }))}
                      placeholder={`Enter default ${asset} deposit address`}
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: '#0b0b0b',
                        color: '#fff',
                        fontSize: '14px'
                      }}
                    />
                    {(defaults[asset] || '').trim() && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(defaults[asset], asset)}
                        style={{
                          padding: '12px',
                          borderRadius: '8px',
                          border: '1px solid rgba(255,255,255,0.2)',
                          background: 'rgba(255,255,255,0.05)',
                          color: copiedAsset === asset ? '#10B981' : '#fff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {copiedAsset === asset ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    )}
                  </div>
                  {copiedAsset === asset && (
                    <span style={{ fontSize: '12px', color: '#10B981' }}>
                      Copied to clipboard!
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  background: saving ? 'rgba(201,160,80,0.5)' : 'rgba(201,160,80,0.8)',
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                {saving ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Default Addresses
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        <div style={{ marginTop: '24px', background: 'rgba(201,160,80,0.1)', border: '1px solid rgba(201,160,80,0.2)', borderRadius: '14px', padding: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#C9A050' }}>
            How it works
          </h3>
          <ul style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.6' }}>
            <li>• New users will automatically receive these addresses for their BTC, ETH, and USDT wallets</li>
            <li>• Admins can still override individual user addresses in the Users management page</li>
            <li>• GOLD and OIL wallets don't use addresses (they're internal assets)</li>
            <li>• Leave fields empty to remove default addresses for that asset</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}