import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: '#111', border: '1px solid rgba(201,160,80,0.25)',
          borderRadius: '20px', padding: '48px', maxWidth: '420px', width: '100%',
          boxShadow: '0 0 50px rgba(201,160,80,0.12)',
        }}
      >
        {/* Back link */}
        <Link
          to="/login"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            color: 'rgba(255,255,255,0.4)', fontSize: '13px', textDecoration: 'none',
            marginBottom: '28px', transition: 'color 0.2s',
          }}
          onMouseOver={e => (e.currentTarget.style.color = '#C9A050')}
          onMouseOut={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
        >
          <ArrowLeft size={14} /> Back to Sign In
        </Link>

        {!sent ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '20px',
                background: 'rgba(201,160,80,0.1)', border: '1px solid rgba(201,160,80,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <Mail size={28} color="#C9A050" />
              </div>
              <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '8px', color: '#C9A050' }}>
                Reset Password
              </h2>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                padding: '12px 14px', borderRadius: '10px', fontSize: '13px',
                marginBottom: '20px', border: '1px solid rgba(239,68,68,0.2)',
              }}>
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginBottom: '7px', fontWeight: 500 }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 16px',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none',
                  }}
                />
              </div>

              <button
                disabled={loading}
                style={{
                  width: '100%', padding: '14px', borderRadius: '11px',
                  background: 'linear-gradient(135deg, #C9A050, #E5C97A)',
                  border: 'none', color: '#0A0A0A', fontWeight: 700, fontSize: '15px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 0 25px rgba(201,160,80,0.35)', opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ textAlign: 'center' }}
          >
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px',
            }}>
              <CheckCircle size={36} color="#22c55e" />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px', color: '#fff' }}>
              Check Your Email
            </h2>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: '32px' }}>
              We've sent a password reset link to <strong style={{ color: '#C9A050' }}>{email}</strong>.
              Check your inbox and follow the instructions.
            </p>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', marginBottom: '20px' }}>
              Didn't receive an email? Check your spam folder or{' '}
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                style={{ background: 'none', border: 'none', color: '#C9A050', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}
              >
                try again
              </button>.
            </p>
            <Link
              to="/login"
              style={{
                display: 'inline-block', padding: '12px 32px', borderRadius: '10px',
                border: '1px solid rgba(201,160,80,0.3)', color: '#C9A050',
                textDecoration: 'none', fontWeight: 600, fontSize: '14px',
              }}
            >
              Back to Sign In
            </Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
