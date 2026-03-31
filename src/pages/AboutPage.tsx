import { motion } from 'framer-motion';
import { Shield, Eye, Lock, Globe, Award, Users, FileText, CheckCircle } from 'lucide-react';

import lindaImg from '../assets/team/Linda fakhoury.jpeg';
import davidImg from '../assets/team/david_cto.jpeg';
import sarahImg from '../assets/team/Sarah Coe.jpeg';
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
  { name: 'David C.', role: 'CEO & Co-founder', img: davidImg },
  { name: 'Linda Fakhoury', role: 'CTO & Co-founder', img: lindaImg },
  { name: 'Sarah Coe', role: 'Head of Compliance', img: sarahImg },
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
              <span style={{ color: '#C9A050', fontSize: '13px', fontWeight: 500 }}>About JTC management INC</span>
            </div>
            <h1 style={{ fontSize: 'clamp(32px, 4.5vw, 54px)', fontWeight: 800, lineHeight: 1.15, marginBottom: '18px' }}>
              Built on <span className="gradient-text-gold">Trust</span>,<br />Driven by <span className="gradient-text-cyan">Innovation</span>
            </h1>
            <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.75 }}>
              JTC management INC is a next-generation investment platform dedicated to making gold and crypto markets accessible, transparent, and secure for every investor.
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
      <section style={{ padding: '100px 24px', background: 'radial-gradient(ellipse at bottom, rgba(201,160,80,0.05) 0%, #0A0A0A 60%)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, marginBottom: '14px' }}>
              Meet the <span className="gradient-text-gold">Leadership</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}>
              The visionary experts and technologists building the future of secure, transparent gold and crypto investing.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '30px' }}>
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15, duration: 0.6, ease: 'easeOut' }}
                viewport={{ once: true, margin: "-50px" }}
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(201,160,80,0.01) 100%)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '24px', padding: '40px 24px', textAlign: 'center',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                  position: 'relative', overflow: 'hidden'
                }}
                whileHover={{
                  y: -10,
                  borderColor: 'rgba(201,160,80,0.5)',
                  boxShadow: '0 20px 40px rgba(201,160,80,0.15)',
                  background: 'linear-gradient(180deg, rgba(201,160,80,0.06) 0%, rgba(0,0,0,0.8) 100%)'
                }}
              >
                {/* Glow behind avatar */}
                <div style={{
                  position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%)',
                  width: '120px', height: '120px', background: 'rgba(201,160,80,0.2)',
                  filter: 'blur(40px)', borderRadius: '50%', zIndex: 0
                }} />

                <div style={{
                  width: '130px', height: '130px', borderRadius: '50%',
                  overflow: 'hidden', margin: '0 auto 24px',
                  border: '3px solid rgba(201,160,80,0.4)',
                  background: 'rgba(255,255,255,0.05)',
                  position: 'relative', zIndex: 1,
                  boxShadow: '0 0 20px rgba(201,160,80,0.3)'
                }}>
                  <img
                    src={member.img}
                    alt={member.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    loading="lazy"
                  />
                </div>

                <h3 style={{ fontWeight: 800, fontSize: '20px', marginBottom: '6px', color: '#fff', position: 'relative', zIndex: 1 }}>{member.name}</h3>
                <div style={{ fontSize: '14px', color: '#C9A050', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '20px', position: 'relative', zIndex: 1 }}>{member.role}</div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', position: 'relative', zIndex: 1 }}>
                  <motion.a whileHover={{ scale: 1.1, color: '#C9A050' }} href="#" style={{ color: 'rgba(255,255,255,0.3)', transition: 'color 0.2s', display: 'flex' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                  </motion.a>
                  <motion.a whileHover={{ scale: 1.1, color: '#C9A050' }} href="#" style={{ color: 'rgba(255,255,255,0.3)', transition: 'color 0.2s', display: 'flex' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                  </motion.a>
                </div>
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
            When you invest with JTC management INC, you invest with a team that treats your capital with the same respect as their own.
          </p>
        </div>
      </section>
    </div>
  );
}

