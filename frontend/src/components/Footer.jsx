import { Link } from 'react-router-dom'
import { Cpu, Globe, Code2, GitBranch, Mail, MapPin, Phone, Zap } from 'lucide-react'

const footerLinks = {
  Platform: [
    { label: 'Services', href: '/#services' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Features', href: '/#features' },
    { label: 'Submit Project', href: '/submit' },
  ],
  Students: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Project Status', href: '/dashboard' },
    { label: 'Upload Files', href: '/dashboard' },
    { label: 'Track Delivery', href: '/dashboard' },
  ],
  Company: [
    { label: 'About Us', href: '#' },
    { label: 'Contact', href: '#' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
  ],
}

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--bg-deep)',
      borderTop: '1px solid var(--border-subtle)',
      padding: 'var(--space-16) 0 var(--space-8)',
    }}>
      <div className="container">
        {/* Top grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr',
          gap: 'var(--space-12)',
          marginBottom: 'var(--space-12)',
        }} className="footer-grid">
          {/* Brand column */}
          <div>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: 'var(--space-4)' }}>
              <div style={{
                width: 34, height: 34,
                background: 'linear-gradient(135deg, var(--primary-600), var(--cyan-500))',
                borderRadius: 'var(--radius-lg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Cpu size={18} color="#fff" />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
                Circuit<span className="gradient-text-blue">Forge</span>
              </span>
            </Link>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.7, maxWidth: 280, marginBottom: 'var(--space-6)' }}>
              Professional electronics engineering project development for students in Nagpur. Hardware. Documentation. Delivery.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { icon: MapPin, text: 'Nagpur, Maharashtra, India' },
                { icon: Mail, text: 'hello@circuitforge.in' },
                { icon: Phone, text: '+91 98765 43210' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>
                  <Icon size={12} color="var(--cyan-400)" />
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-4)', fontFamily: 'var(--font-heading)' }}>
                {title}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {links.map(link => (
                  <a
                    key={link.label}
                    href={link.href}
                    style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', transition: 'color var(--transition-fast)' }}
                    onMouseEnter={e => e.target.style.color = 'var(--cyan-300)'}
                    onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="divider divider-glow" style={{ marginBottom: 'var(--space-8)' }} />

        {/* Bottom bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            © 2026 CircuitForge. Built for engineers, by engineers.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {[GitBranch, Globe, Code2].map((Icon, i) => (
              <a
                key={i}
                href="#"
                style={{
                  width: 32, height: 32,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-muted)',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-medium)'; e.currentTarget.style.color = 'var(--cyan-300)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-muted)' }}
              >
                <Icon size={14} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  )
}
