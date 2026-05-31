import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Cpu, Menu, X, Zap, LayoutDashboard, LogIn, UserPlus } from 'lucide-react'

const navLinks = [
  { label: 'Services', href: '/#services' },
  { label: 'How it Works', href: '/#how-it-works' },
  { label: 'Features', href: '/#features' },
  { label: 'Testimonials', href: '/#testimonials' },
  { label: 'FAQ', href: '/#faq' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isDashboard = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin')

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 'var(--z-nav)',
        padding: '0 0',
        transition: 'all var(--transition-base)',
        borderBottom: scrolled ? '1px solid var(--border-subtle)' : '1px solid transparent',
        background: scrolled
          ? 'rgba(8, 13, 26, 0.92)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
      }}
    >
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '68px' }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
            <div style={{
              width: 36, height: 36,
              background: 'linear-gradient(135deg, var(--primary-600), var(--cyan-500))',
              borderRadius: 'var(--radius-lg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--glow-cyan)',
            }}>
              <Cpu size={20} color="#fff" />
            </div>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '1.2rem',
              letterSpacing: '-0.02em',
            }}>
              Circuit<span className="gradient-text-blue">Forge</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          {!isDashboard && (
            <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="desktop-nav">
              {navLinks.map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                    transition: 'color var(--transition-fast)',
                    fontFamily: 'var(--font-heading)',
                  }}
                  onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          )}

          {/* CTA Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link to="/login" className="btn btn-ghost btn-sm desktop-nav" style={{ display: 'flex' }}>
              <LogIn size={14} />
              Log in
            </Link>
            <Link to="/signup" className="btn btn-primary btn-sm">
              <Zap size={14} />
              Get Started
            </Link>
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileOpen(v => !v)}
              style={{
                background: 'none', border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)', padding: '0.4rem',
                color: 'var(--text-secondary)', cursor: 'pointer',
                display: 'none',
              }}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              background: 'rgba(8,13,26,0.98)',
              borderTop: '1px solid var(--border-subtle)',
              backdropFilter: 'blur(20px)',
              overflow: 'hidden',
            }}
          >
            <div className="container" style={{ padding: '1rem var(--space-6)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {navLinks.map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    padding: '0.75rem 0',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-secondary)',
                    borderBottom: '1px solid var(--border-subtle)',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 500,
                  }}
                >
                  {link.label}
                </a>
              ))}
              <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
                <Link to="/login" className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: 'center' }}>Log in</Link>
                <Link to="/signup" className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>Get Started</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </motion.nav>
  )
}
