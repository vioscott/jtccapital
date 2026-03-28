import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    
    if (error) {
      setError(error.message);
    } else if (data.user) {
      // Check role for redirect
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();
      
      if (profile?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'0 24px' }}>
      <motion.div
        initial={{ opacity:0, y:20 }}
        animate={{ opacity:1, y:0 }}
        style={{
          background:'#111', border:'1px solid rgba(201,160,80,0.25)',
          borderRadius:'20px', padding:'48px', maxWidth:'420px', width:'100%',
          boxShadow:'0 0 50px rgba(201,160,80,0.12)',
        }}
      >
        <div style={{ textAlign:'center', marginBottom:'32px' }}>
          <div style={{ fontSize:'32px', marginBottom:'12px' }}>🥇</div>
          <h2 style={{ fontSize:'26px', fontWeight:800, marginBottom:'8px', color:'#C9A050' }}>Welcome Back</h2>
          <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.45)' }}>Sign in to access your portfolio</p>
        </div>

        {error && (
          <div style={{ background:'rgba(239,68,68,0.1)', color:'#ef4444', padding:'10px', borderRadius:'8px', fontSize:'13px', marginBottom:'20px', textAlign:'center', border:'1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom:'14px' }}>
            <label style={{ display:'block', fontSize:'12px', color:'rgba(255,255,255,0.45)', marginBottom:'7px', fontWeight:500 }}>Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                width:'100%', padding:'12px 16px',
                background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)',
                borderRadius:'10px', color:'#fff', fontSize:'14px', outline:'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
              <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: '12px', color: '#C9A050', textDecoration: 'none', fontWeight: 500 }}>Forgot Password?</Link>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{
                width:'100%', padding:'12px 16px',
                background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)',
                borderRadius:'10px', color:'#fff', fontSize:'14px', outline:'none',
              }}
            />
          </div>

          <button disabled={loading} style={{
            width:'100%', padding:'14px', borderRadius:'11px', marginTop:'8px',
            background:'linear-gradient(135deg, #C9A050, #E5C97A)',
            border:'none', color:'#0A0A0A', fontWeight:700, fontSize:'15px', cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow:'0 0 25px rgba(201,160,80,0.35)', opacity: loading ? 0.7 : 1,
          }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign:'center', fontSize:'13px', color:'rgba(255,255,255,0.4)', marginTop:'20px' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color:'#C9A050', textDecoration:'none', fontWeight:500 }}>Sign Up</Link>
        </p>

        <div style={{ marginTop: '32px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Internal Access Only
          </p>
          <Link to="/login" style={{ fontSize: '12px', color: 'rgba(201,160,80,0.5)', textDecoration: 'none', fontWeight: 600 }}>
            Staff Access Portal
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
