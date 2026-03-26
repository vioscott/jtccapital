import { motion } from 'framer-motion';
import { Shield, Eye, Lock, Globe, Award, Users, FileText, CheckCircle } from 'lucide-react';

import alexandraImg from '../assets/team/alexandra_ceo.jpeg';
import davidImg from '../assets/team/david_cto.png';
import priyaImg from '../assets/team/priya_compliance.jpeg';
import marcusImg from '../assets/team/marcus_trading.png';

const mission = [
  { icon: Globe, title: 'Global Access', desc: 'We believe everyone deserves access to institutional-grade investment tools, regardless of geography or background.' },
  { icon: Shield, title: 'Security First', desc: 'All assets are protected with 256-bit SSL encryption, cold storage custody, and multi-signature wallet architecture.' },
  { icon: Eye, title: 'Full Transparency', desc: 'We disclose all fees, risks, and operations openly. No hidden charges, no misleading promised returns.' },
];

const compliance = [
  { label: 'AML / KYC Compliance', icon: FileText },
  { label: 'GDPR Data Protection', icon: Lock },
  { label: 'Cold Storage Custody', icon: Shield },
  { label: 'Regular 3rd-party Audits', icon: Award },
  { label: 'Multi-sig Authorisations', icon: CheckCircle },
  { label: '24/7 Security Monitoring', icon: Eye },
];

const team = [
  { name: 'Alexandra J.', role: 'CTO & Co-founder', img: alexandraImg },
  { name: 'David C.', role: 'CEO & Co-founder', img: davidImg },
  { name: 'Priya M.', role: 'Head of Compliance', img: priyaImg },
  { name: 'Marcus W.', role: 'Head of Trading Systems', img: marcusImg },
];

export default function AboutPage() {
  return (
    <div style={{ paddingTop: '100px' }}>
      {/* Header */}
      <section style={{ padding: '0 24px 60px', textAlign: 'center' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(201,160,80,0.1)', border: '1px solid rgba(201,160,80,0.3)',
              borderRadius: '100px', padding: '6px 18px', marginBottom: '20px',
            }}>
              <Award size={14} color="#C9A050" />
              <span style={{ color: '#C9A050', fontSize: '13px', fontWeight: 500 }}>About JTC Capital Holdings</span>
            </div>
            <h1 style={{ fontSize: 'clamp(32px, 4.5vw, 54px)', fontWeight: 800, lineHeight: 1.15, marginBottom: '18px' }}>
              Built on <span className="gradient-text-gold">Trust</span>,<br />Driven by <span className="gradient-text-cyan">Innovation</span>
            </h1>
            <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.75 }}>
              JTC Capital Holdings is a next-generation investment platform dedicated to making gold and crypto markets accessible, transparent, and secure for every investor.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission cards */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '24px' }}>
          {mission.map((m, i) => (
            <motion.div
              key={m.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12 }}
              viewport={{ once: true }}
              style={{
                background: '#111', border: '1px solid rgba(201,160,80,0.2)',
                borderRadius: '18px', padding: '32px',
              }}
            >
              <div style={{
                width: '52px', height: '52px', borderRadius: '14px',
                background: 'rgba(201,160,80,0.15)', border: '1px solid rgba(201,160,80,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px',
              }}>
                <m.icon size={24} color="#C9A050" />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '10px' }}>{m.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, fontSize: '14px' }}>{m.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Compliance section */}
      <section style={{ padding: '60px 24px', background: '#0D0D0D', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="r-grid-2" style={{ maxWidth: '1280px', margin: '0 auto', gap: '40px', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: 'clamp(24px, 3vw, 38px)', fontWeight: 700, marginBottom: '16px' }}>
              Regulatory <span className="gradient-text-gold">Compliance</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, fontSize: '15px', marginBottom: '28px' }}>
              We operate under strict financial compliance frameworks to protect our users and maintain the integrity of the platform. Our legal and compliance team ensures we meet international standards at every level.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {compliance.map(item => (
                <div key={item.label} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  background: 'rgba(201,160,80,0.06)', border: '1px solid rgba(201,160,80,0.15)',
                  borderRadius: '10px', padding: '12px 14px',
                }}>
                  <item.icon size={16} color="#C9A050" />
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)' }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Transparency panel */}
          <div style={{
            background: 'rgba(201,160,80,0.06)', border: '1px solid rgba(201,160,80,0.2)',
            borderRadius: '20px', padding: '36px',
          }}>
            <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '20px', color: '#C9A050' }}>Asset Storage</h3>
            {[
              { label: 'Cold Storage (Crypto)', pct: 95, color: '#00E5FF', value: '95% offline' },
              { label: 'Gold Vault (Insured)', pct: 100, color: '#C9A050', value: 'Fully insured' },
              { label: 'Hot Wallet Exposure', pct: 5, color: '#ef4444', value: '≤5% liquidity' },
              { label: '3rd-party Audited', pct: 100, color: '#22c55e', value: 'Quarterly' },
            ].map(row => (
              <div key={row.label} style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>{row.label}</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: row.color }}>{row.value}</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${row.pct}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    viewport={{ once: true }}
                    style={{ height: '6px', background: row.color, borderRadius: '3px', boxShadow: `0 0 10px ${row.color}60` }}
                  />
                </div>
              </div>
            ))}
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '20px', lineHeight: 1.6 }}>
              Independent audits performed quarterly by certified third-party firms. Last audit: March 2026.
            </p>
          </div>
        </div>
      </section>

      {/* Team */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: 'clamp(24px, 3vw, 38px)', fontWeight: 700, marginBottom: '12px' }}>
              Meet the <span className="gradient-text-gold">Team</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px' }}>The people building the future of gold and crypto investing</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '20px' }}>
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                style={{
                  background: '#111', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '16px', padding: '28px', textAlign: 'center',
                  transition: 'all 0.3s',
                }}
                whileHover={{ borderColor: 'rgba(201,160,80,0.4)', boxShadow: '0 0 20px rgba(201,160,80,0.15)' }}
              >
                <div style={{
                  width: '100px', height: '100px', borderRadius: '50%',
                  overflow: 'hidden', margin: '0 auto 16px',
                  border: '2px solid rgba(201,160,80,0.3)',
                  background: 'rgba(255,255,255,0.05)'
                }}>
                  <img
                    src={member.img}
                    alt={member.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    loading="lazy"
                  />
                </div>
                <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>{member.name}</div>
                <div style={{ fontSize: '13px', color: '#C9A050' }}>{member.role}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section style={{ padding: '60px 24px 80px', background: '#0D0D0D' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
          <Users size={36} color="#C9A050" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 34px)', fontWeight: 700, marginBottom: '16px' }}>
            Our <span className="gradient-text-gold">Promise</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.85, fontSize: '15px' }}>
            We will never guarantee unrealistic returns. We will never hide fees. We will never compromise on security.
            Our platform is built on the foundational belief that transparency and user protection are non-negotiable.
            When you invest with JTC Capital Holdings, you invest with a team that treats your capital with the same respect as their own.
          </p>
        </div>
      </section>
    </div>
  );
}
