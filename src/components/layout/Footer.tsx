import { Link } from 'react-router-dom';
import { Mail, Shield, Globe, MessageCircle, Send, Rss } from 'lucide-react';
import jtcLogo from '../../assets/images/logos/jtc_logo_full.png';

const footerLinks = {
  Platform: [
    { label: 'Markets', to: '/markets' },
    { label: 'Investment Plans', to: '/plans' },
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Wallet', to: '/wallet' },
    { label: 'Trading', to: '/trading' },
  ],
  Company: [
    { label: 'About Us', to: '/about' },
    { label: 'Support', to: '/support' },
    { label: 'Contact', to: '/support' },
  ],
  Legal: [
    { label: 'Privacy Policy', to: '#' },
    { label: 'Terms of Service', to: '#' },
    { label: 'Risk Disclaimer', to: '#' },
    { label: 'Cookie Policy', to: '#' },
  ],
};

const socials = [
  { icon: MessageCircle, href: '#' },
  { icon: Send, href: '#' },
  { icon: Rss, href: '#' },
  { icon: Mail, href: '#' },
];

export default function Footer() {
  return (
    <footer style={{
      background: '#060606',
      borderTop: '1px solid rgba(201,160,80,0.15)',
      padding: '60px 24px 32px',
      marginTop: '80px',
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '40px',
          marginBottom: '48px',
        }}>
          {/* Brand column */}
          <div>
            <Link to="/" style={{ display: 'block', textDecoration: 'none', marginBottom: '16px' }}>
              <img src={jtcLogo} alt="JTC management INC" style={{ height: '54px', width: 'auto', display: 'block' }} />
            </Link>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', lineHeight: '1.7', marginBottom: '20px' }}>
              A next-generation investment platform for Crypto and real world assets. Trade smarter, grow faster.
            </p>
            {/* Badges */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { icon: Shield, text: '256-bit SSL Secured' },
                { icon: Globe, text: 'Regulated & Compliant' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon size={14} color="#C9A050" />
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 style={{ color: '#C9A050', fontSize: '13px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
                {section}
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {links.map(link => (
                  <li key={link.label}>
                    <Link to={link.to} style={{
                      color: 'rgba(255,255,255,0.5)', fontSize: '14px',
                      textDecoration: 'none', transition: 'color 0.2s',
                    }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#C9A050')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Risk disclaimer */}
        <div style={{
          background: 'rgba(201,160,80,0.05)',
          border: '1px solid rgba(201,160,80,0.12)',
          borderRadius: '12px', padding: '16px 20px',
          marginBottom: '32px',
        }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', lineHeight: '1.7', margin: 0 }}>
            <strong style={{ color: 'rgba(201,160,80,0.7)' }}>Risk Disclaimer: </strong>
            Trading and investing in cryptocurrencies involves significant risk of loss and is not suitable for all investors.
            Past performance is not indicative of future results. You may lose all of your invested capital. Please read our full risk disclaimer before trading.
          </p>
        </div>

        {/* Bottom bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', margin: 0 }}>
            © {new Date().getFullYear()} JTC management INC. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            {socials.map(({ icon: Icon, href }, i) => (
              <a key={i} href={href} style={{
                width: '36px', height: '36px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'rgba(255,255,255,0.5)', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,160,80,0.5)'; e.currentTarget.style.color = '#C9A050'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
              >
                <Icon size={15} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

