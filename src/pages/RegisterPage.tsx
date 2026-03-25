import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // 1. Register with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    // 2. Since email verification might be required, show success state instead of instant redirect
    if (authData.user && authData.user.identities && authData.user.identities.length === 0) {
      setError("This email is already registered. Please sign in.");
    } else {
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000); // Auto redirect if instant login is enabled
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
          <h2 style={{ fontSize:'26px', fontWeight:800, marginBottom:'8px', color:'#C9A050' }}>Create Account</h2>
          <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.45)' }}>Start investing in Gold & Crypto today</p>
        </div>

        {error && (
          <div style={{ background:'rgba(239,68,68,0.1)', color:'#ef4444', padding:'10px', borderRadius:'8px', fontSize:'13px', marginBottom:'20px', textAlign:'center', border:'1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ background:'rgba(34,197,94,0.1)', color:'#22c55e', padding:'10px', borderRadius:'8px', fontSize:'13px', marginBottom:'20px', textAlign:'center', border:'1px solid rgba(34,197,94,0.2)' }}>
            Account created successfully! Redirecting...
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div style={{ marginBottom:'14px' }}>
            <label style={{ display:'block', fontSize:'12px', color:'rgba(255,255,255,0.45)', marginBottom:'7px', fontWeight:500 }}>Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              required
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              style={{
                width:'100%', padding:'12px 16px',
                background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)',
                borderRadius:'10px', color:'#fff', fontSize:'14px', outline:'none',
              }}
            />
          </div>

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

          <div style={{ marginBottom:'14px' }}>
            <label style={{ display:'block', fontSize:'12px', color:'rgba(255,255,255,0.45)', marginBottom:'7px', fontWeight:500 }}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              required
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{
                width:'100%', padding:'12px 16px',
                background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)',
                borderRadius:'10px', color:'#fff', fontSize:'14px', outline:'none',
              }}
            />
          </div>

          <button disabled={loading || success} style={{
            width:'100%', padding:'14px', borderRadius:'11px', marginTop:'8px',
            background:'linear-gradient(135deg, #C9A050, #E5C97A)',
            border:'none', color:'#0A0A0A', fontWeight:700, fontSize:'15px', cursor: (loading || success) ? 'not-allowed' : 'pointer',
            boxShadow:'0 0 25px rgba(201,160,80,0.35)', opacity: (loading || success) ? 0.7 : 1,
          }}>
            {loading ? 'Creating...' : 'Create Free Account'}
          </button>
        </form>

        <p style={{ textAlign:'center', fontSize:'13px', color:'rgba(255,255,255,0.4)', marginTop:'20px' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color:'#C9A050', textDecoration:'none', fontWeight:500 }}>Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
}
