import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, ChevronUp, MessageSquare, Ticket, Phone, Mail } from 'lucide-react';
import { mockFAQ, faqCategories } from '../mock/data';

export default function SupportPage() {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('All');
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [ticketForm, setTicketForm] = useState({ subject: '', message: '', email: '' });
  const [submitted, setSubmitted] = useState(false);

  const filtered = mockFAQ.filter(f =>
    (cat === 'All' || f.cat === cat) &&
    (query === '' || f.q.toLowerCase().includes(query.toLowerCase()) || f.a.toLowerCase().includes(query.toLowerCase()))
  );

  const handleTicketSubmit = () => {
    if (!ticketForm.subject || !ticketForm.message || !ticketForm.email) {
      alert('Please fill in email, subject, and message to submit a ticket.');
      return;
    }

    const mailto = `mailto:jtccapitalmanagement@gmail.com?subject=${encodeURIComponent('Support Ticket: ' + ticketForm.subject)}&body=${encodeURIComponent(
      `From: ${ticketForm.email}\n\nSubject: ${ticketForm.subject}\n\nMessage:\n${ticketForm.message}`
    )}`;
    window.location.href = mailto;

    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3500);
    setTicketForm({ subject: '', message: '', email: '' });
  };



  return (
    <div style={{ paddingTop: '92px', minHeight: '100vh', padding: '92px 24px 60px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 style={{ fontSize: 'clamp(26px, 4vw, 50px)', fontWeight: 800, marginBottom: '12px' }}>
              How can we <span className="gradient-text-gold">help you?</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px', marginBottom: '28px' }}>
              Search our knowledge base or reach out to our team directly
            </p>

            {/* Search */}
            <div style={{ maxWidth: '560px', margin: '0 auto', position: 'relative' }}>
              <Search size={18} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search FAQs, topics, keywords..."
                style={{
                  width: '100%', padding: '15px 20px 15px 48px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(201,160,80,0.3)',
                  borderRadius: '14px', color: '#fff', fontSize: '16px', outline: 'none',
                  boxShadow: '0 0 30px rgba(201,160,80,0.1)',
                }}
              />
            </div>
          </motion.div>
        </div>

        {/* Quick links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '48px' }}>
          {[
            { icon: Mail, label: 'Email Support', desc: '24h response time', color: '#C9A050' },
            { icon: Phone, label: 'Phone Support', desc: '+1 (800) 555-0192', color: '#00E5FF' },
            { icon: MessageSquare, label: 'Live Chat', desc: 'Mon–Fri 9am–6pm UTC', color: '#22c55e' },
            { icon: Ticket, label: 'Submit Ticket', desc: 'Track your issue', color: '#a78bfa' },
          ].map(item => (
            <motion.div
              key={item.label}
              whileHover={{ y: -3, scale: 1.02 }}
              style={{
                background: '#111', border: `1px solid ${item.color}30`,
                borderRadius: '14px', padding: '20px',
                display: 'flex', flexDirection: 'column', gap: '8px',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: `${item.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <item.icon size={18} color={item.color} />
              </div>
              <div style={{ fontWeight: 700, fontSize: '15px' }}>{item.label}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{item.desc}</div>
            </motion.div>
          ))}
        </div>

        {/* Main grid */}
        <div className="r-grid-contact">
          {/* FAQ */}
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '16px' }}>
              Frequently Asked <span className="gradient-text-gold">Questions</span>
            </h2>

            {/* Category tabs */}
            <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {faqCategories.map(c => (
                <button key={c} onClick={() => setCat(c)} style={{
                  padding: '7px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 500,
                  background: cat === c ? 'rgba(201,160,80,0.15)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${cat === c ? 'rgba(201,160,80,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  color: cat === c ? '#C9A050' : 'rgba(255,255,255,0.5)',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}>{c}</button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filtered.map((item, i) => (
                <div
                  key={i}
                  style={{
                    background: '#111', border: `1px solid ${openFAQ === i ? 'rgba(201,160,80,0.35)' : 'rgba(255,255,255,0.07)'}`,
                    borderRadius: '12px', overflow: 'hidden',
                    boxShadow: openFAQ === i ? '0 0 15px rgba(201,160,80,0.1)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  <button
                    onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '16px 20px', background: 'none', border: 'none',
                      color: '#fff', cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <span style={{ fontSize: '14px', fontWeight: 600, flex: 1, marginRight: '12px' }}>{item.q}</span>
                    {openFAQ === i ? <ChevronUp size={16} color="#C9A050" /> : <ChevronDown size={16} color="rgba(255,255,255,0.4)" />}
                  </button>
                  <AnimatePresence>
                    {openFAQ === i && (
                      <motion.div
                        key={`faq-${i}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{ padding: '0 20px 18px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, margin: '14px 0 0' }}>{item.a}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          {/* Contact panel */}
          <div style={{
            background: '#111', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '18px', padding: '24px', position: 'sticky', top: '92px',
          }}>
            {/* Ticket Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginBottom: '7px', fontWeight: 500 }}>Email</label>
                <input
                  value={ticketForm.email}
                  onChange={e => setTicketForm(v => ({ ...v, email: e.target.value }))}
                  placeholder="your@email.com"
                  style={{ width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '9px', color: '#fff', fontSize: '14px', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginBottom: '7px', fontWeight: 500 }}>Subject</label>
                <input
                  value={ticketForm.subject}
                  onChange={e => setTicketForm(v => ({ ...v, subject: e.target.value }))}
                  placeholder="Briefly describe your issue..."
                  style={{ width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '9px', color: '#fff', fontSize: '14px', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginBottom: '7px', fontWeight: 500 }}>Message</label>
                <textarea
                  value={ticketForm.message}
                  onChange={e => setTicketForm(v => ({ ...v, message: e.target.value }))}
                  placeholder="Describe your issue in detail..."
                  rows={5}
                  style={{ width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '9px', color: '#fff', fontSize: '14px', outline: 'none', resize: 'vertical' }}
                />
              </div>
              <button onClick={handleTicketSubmit} style={{
                padding: '13px', borderRadius: '10px',
                background: submitted ? '#22c55e' : 'linear-gradient(135deg, #C9A050, #E5C97A)',
                border: 'none', color: '#0A0A0A', fontWeight: 700, fontSize: '15px', cursor: 'pointer', transition: 'all 0.3s',
              }}>
                {submitted ? '✓ Ticket Submitted!' : 'Submit Ticket'}
              </button>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
                Average response time: &lt; 4 hours
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

