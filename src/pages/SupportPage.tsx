import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, ChevronUp, MessageSquare, Ticket, Phone, Mail, Send } from 'lucide-react';
import { mockFAQ, faqCategories } from '../mock/data';

export default function SupportPage() {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('All');
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [contactMode, setContactMode] = useState<'ticket'|'chat'>('ticket');
  const [ticketForm, setTicketForm] = useState({ subject:'', message:'', email:'' });
  const [submitted, setSubmitted] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { from:'agent', text:'Hi! I\'m your JTC Invest support assistant. How can I help you today?', time:'now' },
  ]);

  const filtered = mockFAQ.filter(f =>
    (cat === 'All' || true) &&
    (query === '' || f.q.toLowerCase().includes(query.toLowerCase()) || f.a.toLowerCase().includes(query.toLowerCase()))
  );

  const handleTicketSubmit = () => {
    if (!ticketForm.subject || !ticketForm.message) return;
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3500);
    setTicketForm({ subject:'', message:'', email:'' });
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    const userMsg = { from:'user', text:chatInput, time:'now' };
    const agentReply = { from:'agent', text:'Thank you for your message. Our support team will respond within 24 hours.', time:'now' };
    setChatMessages(prev => [...prev, userMsg, agentReply]);
    setChatInput('');
  };

  return (
    <div style={{ paddingTop:'92px', minHeight:'100vh', padding:'92px 24px 60px' }}>
      <div style={{ maxWidth:'1100px', margin:'0 auto' }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:'48px' }}>
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>
            <h1 style={{ fontSize:'clamp(26px, 4vw, 50px)', fontWeight:800, marginBottom:'12px' }}>
              How can we <span className="gradient-text-gold">help you?</span>
            </h1>
            <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'16px', marginBottom:'28px' }}>
              Search our knowledge base or reach out to our team directly
            </p>

            {/* Search */}
            <div style={{ maxWidth:'560px', margin:'0 auto', position:'relative' }}>
              <Search size={18} color="rgba(255,255,255,0.3)" style={{ position:'absolute', left:'16px', top:'50%', transform:'translateY(-50%)' }} />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search FAQs, topics, keywords..."
                style={{
                  width:'100%', padding:'15px 20px 15px 48px',
                  background:'rgba(255,255,255,0.04)',
                  border:'1px solid rgba(201,160,80,0.3)',
                  borderRadius:'14px', color:'#fff', fontSize:'16px', outline:'none',
                  boxShadow:'0 0 30px rgba(201,160,80,0.1)',
                }}
              />
            </div>
          </motion.div>
        </div>

        {/* Quick links */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:'14px', marginBottom:'48px' }}>
          {[
            { icon: Mail,    label:'Email Support',   desc:'24h response time',    color:'#C9A050' },
            { icon: Phone,   label:'Phone Support',   desc:'+1 (800) 555-0192',    color:'#00E5FF' },
            { icon: MessageSquare, label:'Live Chat', desc:'Mon–Fri 9am–6pm UTC',  color:'#22c55e' },
            { icon: Ticket,  label:'Submit Ticket',   desc:'Track your issue',     color:'#a78bfa' },
          ].map(item => (
            <motion.div
              key={item.label}
              whileHover={{ y:-3, scale:1.02 }}
              style={{
                background:'#111', border:`1px solid ${item.color}30`,
                borderRadius:'14px', padding:'20px',
                display:'flex', flexDirection:'column', gap:'8px',
                cursor:'pointer', transition:'all 0.2s',
              }}
            >
              <div style={{
                width:'40px', height:'40px', borderRadius:'10px',
                background:`${item.color}18`, display:'flex', alignItems:'center', justifyContent:'center',
              }}>
                <item.icon size={18} color={item.color} />
              </div>
              <div style={{ fontWeight:700, fontSize:'15px' }}>{item.label}</div>
              <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)' }}>{item.desc}</div>
            </motion.div>
          ))}
        </div>

        {/* Main grid */}
        <div className="r-grid-contact">
          {/* FAQ */}
          <div>
            <h2 style={{ fontSize:'22px', fontWeight:700, marginBottom:'16px' }}>
              Frequently Asked <span className="gradient-text-gold">Questions</span>
            </h2>

            {/* Category tabs */}
            <div style={{ display:'flex', gap:'7px', flexWrap:'wrap', marginBottom:'20px' }}>
              {faqCategories.map(c => (
                <button key={c} onClick={() => setCat(c)} style={{
                  padding:'7px 14px', borderRadius:'8px', fontSize:'13px', fontWeight:500,
                  background: cat===c ? 'rgba(201,160,80,0.15)' : 'rgba(255,255,255,0.04)',
                  border:`1px solid ${cat===c ? 'rgba(201,160,80,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  color: cat===c ? '#C9A050' : 'rgba(255,255,255,0.5)',
                  cursor:'pointer', transition:'all 0.2s',
                }}>{c}</button>
              ))}
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              {filtered.map((item, i) => (
                <div
                  key={i}
                  style={{
                    background:'#111', border:`1px solid ${openFAQ===i ? 'rgba(201,160,80,0.35)' : 'rgba(255,255,255,0.07)'}`,
                    borderRadius:'12px', overflow:'hidden',
                    boxShadow: openFAQ===i ? '0 0 15px rgba(201,160,80,0.1)' : 'none',
                    transition:'all 0.2s',
                  }}
                >
                  <button
                    onClick={() => setOpenFAQ(openFAQ===i ? null : i)}
                    style={{
                      width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between',
                      padding:'16px 20px', background:'none', border:'none',
                      color:'#fff', cursor:'pointer', textAlign:'left',
                    }}
                  >
                    <span style={{ fontSize:'14px', fontWeight:600, flex:1, marginRight:'12px' }}>{item.q}</span>
                    {openFAQ === i ? <ChevronUp size={16} color="#C9A050" /> : <ChevronDown size={16} color="rgba(255,255,255,0.4)" />}
                  </button>
                  <AnimatePresence>
                    {openFAQ === i && (
                      <motion.div
                        key={`faq-${i}`}
                        initial={{ height:0, opacity:0 }}
                        animate={{ height:'auto', opacity:1 }}
                        exit={{ height:0, opacity:0 }}
                        transition={{ duration:0.25 }}
                        style={{ overflow:'hidden' }}
                      >
                        <div style={{ padding:'0 20px 18px', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
                          <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.55)', lineHeight:1.75, margin:'14px 0 0' }}>{item.a}</p>
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
            background:'#111', border:'1px solid rgba(255,255,255,0.07)',
            borderRadius:'18px', padding:'24px', position:'sticky', top:'92px',
          }}>
            {/* Toggle */}
            <div style={{
              display:'flex', background:'rgba(255,255,255,0.04)',
              borderRadius:'11px', padding:'4px', marginBottom:'22px',
            }}>
              {(['ticket','chat'] as const).map(m => (
                <button key={m} onClick={() => setContactMode(m)} style={{
                  flex:1, padding:'9px', borderRadius:'9px', fontSize:'14px', fontWeight:600,
                  border:'none', cursor:'pointer', transition:'all 0.2s', textTransform:'capitalize',
                  background: contactMode===m ? (m==='ticket' ? 'linear-gradient(135deg,#C9A050,#E5C97A)' : 'linear-gradient(135deg,#00B0D0,#00E5FF)') : 'transparent',
                  color: contactMode===m ? '#0A0A0A' : 'rgba(255,255,255,0.5)',
                }}>
                  {m === 'ticket' ? <><Ticket size={13} style={{ display:'inline', marginRight:'5px' }} />Ticket</> : <><MessageSquare size={13} style={{ display:'inline', marginRight:'5px' }} />Live Chat</>}
                </button>
              ))}
            </div>

            {contactMode === 'ticket' ? (
              <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                <div>
                  <label style={{ display:'block', fontSize:'12px', color:'rgba(255,255,255,0.45)', marginBottom:'7px', fontWeight:500 }}>Email</label>
                  <input
                    value={ticketForm.email}
                    onChange={e => setTicketForm(v => ({ ...v, email:e.target.value }))}
                    placeholder="your@email.com"
                    style={{ width:'100%', padding:'11px 14px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'9px', color:'#fff', fontSize:'14px', outline:'none' }}
                  />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'12px', color:'rgba(255,255,255,0.45)', marginBottom:'7px', fontWeight:500 }}>Subject</label>
                  <input
                    value={ticketForm.subject}
                    onChange={e => setTicketForm(v => ({ ...v, subject:e.target.value }))}
                    placeholder="Briefly describe your issue..."
                    style={{ width:'100%', padding:'11px 14px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'9px', color:'#fff', fontSize:'14px', outline:'none' }}
                  />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'12px', color:'rgba(255,255,255,0.45)', marginBottom:'7px', fontWeight:500 }}>Message</label>
                  <textarea
                    value={ticketForm.message}
                    onChange={e => setTicketForm(v => ({ ...v, message:e.target.value }))}
                    placeholder="Describe your issue in detail..."
                    rows={5}
                    style={{ width:'100%', padding:'11px 14px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'9px', color:'#fff', fontSize:'14px', outline:'none', resize:'vertical' }}
                  />
                </div>
                <button onClick={handleTicketSubmit} style={{
                  padding:'13px', borderRadius:'10px',
                  background: submitted ? '#22c55e' : 'linear-gradient(135deg, #C9A050, #E5C97A)',
                  border:'none', color:'#0A0A0A', fontWeight:700, fontSize:'15px', cursor:'pointer', transition:'all 0.3s',
                }}>
                  {submitted ? '✓ Ticket Submitted!' : 'Submit Ticket'}
                </button>
                <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)', textAlign:'center' }}>
                  Average response time: &lt; 4 hours
                </p>
              </div>
            ) : (
              /* Live chat mock */
              <div style={{ display:'flex', flexDirection:'column', height:'380px' }}>
                {/* Agent status */}
                <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'14px', padding:'10px 12px', background:'rgba(34,197,94,0.08)', borderRadius:'10px', border:'1px solid rgba(34,197,94,0.2)' }}>
                  <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#22c55e' }} className="pulse-gold" />
                  <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.7)' }}>Support Agent is <strong style={{ color:'#22c55e' }}>Online</strong></span>
                </div>

                {/* Messages */}
                <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:'10px', marginBottom:'12px' }}>
                  {chatMessages.map((msg, i) => (
                    <div key={i} style={{
                      display:'flex',
                      justifyContent: msg.from==='user' ? 'flex-end' : 'flex-start',
                    }}>
                      <div style={{
                        maxWidth:'80%', padding:'10px 14px', borderRadius:'12px',
                        background: msg.from==='user'
                          ? 'linear-gradient(135deg, #C9A050, #E5C97A)'
                          : 'rgba(255,255,255,0.06)',
                        color: msg.from==='user' ? '#0A0A0A' : 'rgba(255,255,255,0.8)',
                        fontSize:'13px', lineHeight:1.6,
                      }}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div style={{ display:'flex', gap:'8px' }}>
                  <input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendChat()}
                    placeholder="Type a message..."
                    style={{
                      flex:1, padding:'11px 14px',
                      background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)',
                      borderRadius:'10px', color:'#fff', fontSize:'14px', outline:'none',
                    }}
                  />
                  <button onClick={sendChat} style={{
                    width:'44px', height:'44px', borderRadius:'10px', flexShrink:0,
                    background:'linear-gradient(135deg, #00B0D0, #00E5FF)',
                    border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                  }}>
                    <Send size={16} color="#0A0A0A" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
