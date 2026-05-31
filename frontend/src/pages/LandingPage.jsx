import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Zap, ArrowRight, Upload, BarChart3, Package, CheckCircle2,
  Star, ChevronDown, Cpu, CircuitBoard, Layers, Shield,
  Clock, FileText, Play, Truck, Users, Award, Sparkles,
  Code2, Microscope, Battery
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CircuitBackground from '../components/CircuitBackground'
import PageTransition from '../components/PageTransition'

/* ── helpers ── */
function FadeIn({ children, delay = 0, direction = 'up' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const dirs = { up: [0, 32], down: [0, -32], left: [32, 0], right: [-32, 0] }
  const [x, y] = dirs[direction] || [0, 32]
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x, y }}
      animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

/* ── HERO ── */
function HeroSection() {
  return (
    <section style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(79,70,229,0.15) 0%, transparent 60%), var(--bg-void)',
    }}>
      <CircuitBackground />

      {/* Glow orbs */}
      <div className="glow-orb" style={{ width: 600, height: 600, background: 'rgba(79,70,229,0.12)', top: '-10%', left: '-15%' }} />
      <div className="glow-orb" style={{ width: 400, height: 400, background: 'rgba(0,196,240,0.08)', top: '20%', right: '-10%' }} />

      <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'center', paddingTop: '6rem' }}>
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}
        >
          <div className="badge badge-cyan" style={{ fontSize: '0.7rem', padding: '0.35rem 1rem' }}>
            <span className="pulse-dot" />
            Nagpur's #1 Electronics Project Platform
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.5rem, 7vw, 4.8rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            marginBottom: '1.5rem',
          }}
        >
          Build Your Future,<br />
          <span className="gradient-text">Circuit by Circuit</span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: 'var(--text-secondary)',
            maxWidth: 580,
            margin: '0 auto 2.5rem',
            lineHeight: 1.7,
          }}
        >
          Professional electronics engineering projects for students — hardware, documentation, and demonstration delivered 10 days before your deadline.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <Link to="/submit-project" className="btn btn-cyan btn-lg">
            <Zap size={18} />
            Submit Your Project
            <ArrowRight size={16} />
          </Link>
          <a href="#how-it-works" className="btn btn-ghost btn-lg">
            <Play size={16} />
            See How It Works
          </a>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          style={{
            display: 'flex', gap: '2.5rem', justifyContent: 'center',
            marginTop: '4rem', flexWrap: 'wrap',
          }}
        >
          {[
            { value: '500+', label: 'Projects Delivered' },
            { value: '98%', label: 'On-Time Delivery' },
            { value: '4.9★', label: 'Student Rating' },
            { value: '50+', label: 'Colleges Served' },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.8rem', letterSpacing: '-0.03em' }} className="gradient-text-blue">{stat.value}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          style={{ marginTop: '4rem', display: 'flex', justifyContent: 'center' }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{ color: 'var(--text-muted)' }}
          >
            <ChevronDown size={22} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

/* ── SERVICES ── */
const services = [
  {
    icon: CircuitBoard,
    title: 'Custom PCB Design',
    desc: 'Professionally designed printed circuit boards tailored to your project requirements and specifications.',
    accent: 'var(--cyan-400)',
    badge: 'Hardware',
  },
  {
    icon: Code2,
    title: 'Firmware & Embedded Code',
    desc: 'Complete embedded software development — Arduino, STM32, ESP32, and more, fully commented and documented.',
    accent: 'var(--primary-400)',
    badge: 'Software',
  },
  {
    icon: FileText,
    title: 'Technical Documentation',
    desc: 'Comprehensive project report, circuit diagrams, component list, and viva preparation material.',
    accent: 'var(--purple-400)',
    badge: 'Docs',
  },
  {
    icon: Play,
    title: 'Demo Video',
    desc: 'Professional demonstration video recorded and delivered with your project for presentations.',
    accent: 'var(--emerald-400)',
    badge: 'Media',
  },
  {
    icon: Truck,
    title: 'Hardware Delivery',
    desc: 'Physical delivery or pickup in Nagpur with 10-day advance notice before your deadline.',
    accent: 'var(--amber-400)',
    badge: 'Delivery',
  },
  {
    icon: Shield,
    title: 'Post-Delivery Support',
    desc: 'Viva Q&A prep, troubleshooting assistance, and revision support even after delivery.',
    accent: 'var(--rose-400)',
    badge: 'Support',
  },
]

function ServicesSection() {
  return (
    <section id="services" className="section">
      <div className="container">
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-16)' }}>
            <div className="section-label"><Layers size={12} />Our Services</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, marginBottom: '1rem' }}>
              Everything You Need,<br /><span className="gradient-text">One Platform</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
              From concept to completion — we handle every aspect of your electronics engineering project so you can focus on learning.
            </p>
          </div>
        </FadeIn>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'var(--space-6)',
        }}>
          {services.map((s, i) => (
            <FadeIn key={s.title} delay={i * 0.08}>
              <div
                className="card card-hover"
                style={{ padding: 'var(--space-6)', height: '100%', cursor: 'default', position: 'relative', overflow: 'hidden' }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = `${s.accent}33`
                  e.currentTarget.querySelector('.svc-icon-bg').style.boxShadow = `0 0 20px ${s.accent}40`
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)'
                  e.currentTarget.querySelector('.svc-icon-bg').style.boxShadow = 'none'
                }}
              >
                <div className="svc-icon-bg" style={{
                  width: 48, height: 48,
                  borderRadius: 'var(--radius-lg)',
                  background: `${s.accent}15`,
                  border: `1px solid ${s.accent}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 'var(--space-4)',
                  transition: 'box-shadow var(--transition-base)',
                }}>
                  <s.icon size={22} color={s.accent} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                  <h3 style={{ fontSize: 'var(--text-lg)', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>{s.title}</h3>
                  <span style={{ fontSize: 'var(--text-xs)', color: s.accent, fontFamily: 'var(--font-mono)', background: `${s.accent}12`, padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>{s.badge}</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── HOW IT WORKS ── */
const steps = [
  { num: '01', icon: Upload, title: 'Submit Requirements', desc: 'Fill in your project details, upload your abstract, and specify your deadline. Takes less than 5 minutes.' },
  { num: '02', icon: CheckCircle2, title: 'Review & Confirmation', desc: 'Our team reviews your requirements and confirms feasibility within 24 hours with a detailed quote.' },
  { num: '03', icon: Cpu, title: 'Development Begins', desc: 'Hardware design, PCB fabrication, firmware coding, and documentation start simultaneously.' },
  { num: '04', icon: BarChart3, title: 'Track Progress', desc: 'Monitor your project in real-time through the dashboard with milestone updates and previews.' },
  { num: '05', icon: FileText, title: 'Files Uploaded', desc: 'Project report PDF and demonstration video uploaded 10 days before your deadline.' },
  { num: '06', icon: Package, title: 'Hardware Delivered', desc: 'Collect your completed hardware from our Nagpur pickup point or get it delivered.' },
]

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="section" style={{ background: 'linear-gradient(180deg, var(--bg-void) 0%, var(--bg-deep) 50%, var(--bg-void) 100%)' }}>
      <div className="container">
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-16)' }}>
            <div className="section-label"><Clock size={12} />Process</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, marginBottom: '1rem' }}>
              How <span className="gradient-text">CircuitForge</span> Works
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto' }}>Six simple steps from submission to delivery. Professional, transparent, and on time — every time.</p>
          </div>
        </FadeIn>

        <div style={{ position: 'relative' }}>
          {/* Vertical line */}
          <div style={{
            position: 'absolute', left: '50%', top: 0, bottom: 0,
            width: 1, background: 'linear-gradient(180deg, transparent, var(--border-medium), transparent)',
            transform: 'translateX(-50%)',
          }} className="timeline-line" />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            {steps.map((step, i) => (
              <FadeIn key={step.num} delay={i * 0.07} direction={i % 2 === 0 ? 'left' : 'right'}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-6)',
                  flexDirection: i % 2 === 0 ? 'row' : 'row-reverse',
                }} className="timeline-row">
                  {/* Card */}
                  <div className="card" style={{ flex: 1, padding: 'var(--space-6)', maxWidth: 420, marginLeft: i % 2 === 0 ? 'auto' : 0, marginRight: i % 2 === 0 ? 0 : 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 'var(--radius-lg)',
                        background: 'rgba(79,70,229,0.12)', border: '1px solid var(--border-soft)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <step.icon size={20} color="var(--primary-400)" />
                      </div>
                      <div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--primary-400)', marginBottom: '0.25rem' }}>Step {step.num}</div>
                        <h3 style={{ fontSize: 'var(--text-base)', fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: '0.5rem' }}>{step.title}</h3>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{step.desc}</p>
                      </div>
                    </div>
                  </div>

                  {/* Center dot */}
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'var(--bg-surface)', border: '2px solid var(--border-medium)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, position: 'relative', zIndex: 1,
                    boxShadow: 'var(--glow-primary)',
                  }} className="timeline-dot">
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700, color: 'var(--cyan-300)' }}>{step.num}</span>
                  </div>

                  <div style={{ flex: 1 }} className="timeline-spacer" />
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .timeline-line { display: none; }
          .timeline-dot { display: none; }
          .timeline-spacer { display: none; }
          .timeline-row { flex-direction: column !important; align-items: flex-start !important; }
          .timeline-row > div:first-child { max-width: 100% !important; margin: 0 !important; }
        }
      `}</style>
    </section>
  )
}

/* ── FEATURES ── */
const features = [
  { icon: Zap, title: 'Realtime Project Tracking', desc: 'Live dashboard with milestone updates and progress percentage — always know where your project stands.' },
  { icon: Shield, title: 'Deadline Guaranteed', desc: 'We commit to delivering files 10 days before your deadline. If we miss it, we refund fully.' },
  { icon: Award, title: 'Viva-Ready Documentation', desc: 'Reports written to academic standards with viva Q&A prep — walk into your exam confident.' },
  { icon: Microscope, title: 'Professional Hardware', desc: 'Custom PCBs, tested circuits, and sourced components — built to work flawlessly every time.' },
  { icon: Users, title: 'Dedicated Project Manager', desc: 'Every project gets a dedicated manager you can chat with for updates and queries.' },
  { icon: Battery, title: 'Revision Support', desc: 'Free revisions during development and 2 weeks post-delivery support for any issues.' },
]

function FeaturesSection() {
  return (
    <section id="features" className="section">
      <div className="container">
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-16)' }}>
            <div className="section-label"><Sparkles size={12} />Features</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, marginBottom: '1rem' }}>
              Built for <span className="gradient-text">Engineering Students</span>
            </h2>
          </div>
        </FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-5)' }}>
          {features.map((f, i) => (
            <FadeIn key={f.title} delay={i * 0.06}>
              <div className="glass-card-bright" style={{ padding: 'var(--space-6)', display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, var(--primary-600), var(--cyan-500))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <f.icon size={18} color="#fff" />
                </div>
                <div>
                  <h3 style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: '0.4rem' }}>{f.title}</h3>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── TESTIMONIALS ── */
const testimonials = [
  { name: 'Arjun Patel', college: 'VNIT Nagpur, 7th Sem', text: 'CircuitForge delivered my IoT project 12 days before deadline. The documentation was so thorough I aced my viva. Absolutely worth it!', rating: 5, project: 'Smart Home Automation' },
  { name: 'Priya Sharma', college: 'PCE Nagpur, 6th Sem', text: 'I was worried about the hardware quality, but it exceeded my expectations. The circuit worked perfectly and the demo video was professional.', rating: 5, project: 'Medical Alert System' },
  { name: 'Rohit Meshram', college: 'RCOEM, 8th Sem', text: 'The real-time tracking dashboard is amazing — I knew exactly where my project was at every stage. Worth every rupee.', rating: 5, project: 'Industrial Automation' },
  { name: 'Sneha Kulkarni', college: 'Symbiosis, 5th Sem', text: 'Submitted last minute and they still delivered on time. Customer support was outstanding. Will use again next semester!', rating: 5, project: 'Gesture Control Robot' },
  { name: 'Kiran Bonde', college: 'YCCE Nagpur, 6th Sem', text: 'The report was better than anything my seniors had. Viva preparation material was spot-on. Highly recommend CircuitForge.', rating: 5, project: 'Power Monitoring System' },
  { name: 'Anjali Deshmukh', college: 'GHRCE Nagpur, 7th Sem', text: 'Three of us from the same class used CircuitForge. All three passed with distinction. Says everything.', rating: 5, project: 'Agricultural Drone System' },
]

function TestimonialsSection() {
  return (
    <section id="testimonials" className="section" style={{ background: 'linear-gradient(180deg, var(--bg-void) 0%, var(--bg-deep) 100%)' }}>
      <div className="container">
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-16)' }}>
            <div className="section-label"><Star size={12} />Testimonials</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, marginBottom: '1rem' }}>
              Trusted by <span className="gradient-text">500+ Students</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto' }}>
              Real reviews from students across Nagpur's top engineering colleges.
            </p>
          </div>
        </FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-5)' }}>
          {testimonials.map((t, i) => (
            <FadeIn key={t.name} delay={i * 0.07}>
              <div className="card" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {/* Stars */}
                <div style={{ display: 'flex', gap: '0.2rem' }}>
                  {Array.from({ length: t.rating }).map((_, j) => <Star key={j} size={14} fill="var(--amber-400)" color="var(--amber-400)" />)}
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.7, flex: 1 }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 'var(--text-sm)' }}>{t.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>{t.college}</div>
                  </div>
                  <div style={{ background: 'rgba(0,196,240,0.08)', border: '1px solid rgba(0,196,240,0.15)', borderRadius: 'var(--radius-sm)', padding: '0.2rem 0.5rem', fontSize: '0.65rem', color: 'var(--cyan-300)', fontFamily: 'var(--font-mono)' }}>
                    {t.project}
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── FAQ ── */
const faqs = [
  { q: 'What types of electronics projects do you handle?', a: 'We handle all types — IoT, automation, robotics, embedded systems, signal processing, power electronics, communication systems, and more. If it involves circuits, we can build it.' },
  { q: 'How long does a project take to complete?', a: 'Most projects take 15–25 days depending on complexity. We always deliver project files (PDF + video) at least 10 days before your submission deadline.' },
  { q: 'Will the hardware actually work?', a: 'Yes, every piece of hardware is fully assembled, tested, and verified before delivery. You get a working project, not just documentation.' },
  { q: 'What if I need changes after delivery?', a: 'We provide 2 weeks of post-delivery support including minor revisions. Major changes may incur additional charges discussed transparently upfront.' },
  { q: 'Is this service available for diploma students too?', a: 'Absolutely. We serve B.Tech (3rd–8th sem) and Diploma (3rd–6th sem) students across all branches in Nagpur.' },
  { q: 'How do I track my project progress?', a: 'You get a personal dashboard with realtime progress updates, milestone notifications, and direct chat access to your project manager.' },
]

function FAQSection() {
  const [open, setOpen] = useState(null)
  return (
    <section id="faq" className="section">
      <div className="container">
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-16)' }}>
            <div className="section-label"><ChevronDown size={12} />FAQ</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800 }}>
              Common <span className="gradient-text">Questions</span>
            </h2>
          </div>
        </FadeIn>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {faqs.map((faq, i) => (
            <FadeIn key={i} delay={i * 0.05}>
              <div
                className="card"
                style={{ overflow: 'hidden', cursor: 'pointer', borderColor: open === i ? 'var(--border-soft)' : 'var(--border-subtle)', transition: 'border-color var(--transition-base)' }}
                onClick={() => setOpen(open === i ? null : i)}
              >
                <div style={{ padding: 'var(--space-5) var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>{faq.q}</span>
                  <motion.div animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ flexShrink: 0, color: 'var(--text-muted)' }}>
                    <ChevronDown size={18} />
                  </motion.div>
                </div>
                <motion.div
                  initial={false}
                  animate={{ height: open === i ? 'auto' : 0, opacity: open === i ? 1 : 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ overflow: 'hidden' }}
                >
                  <p style={{ padding: '0 var(--space-6) var(--space-5)', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.7, borderTop: '1px solid var(--border-subtle)' }}>{faq.a}</p>
                </motion.div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── CTA BANNER ── */
function CTABanner() {
  return (
    <section className="section-sm" style={{ background: 'var(--bg-deep)' }}>
      <div className="container">
        <FadeIn>
          <div style={{
            background: 'linear-gradient(135deg, rgba(79,70,229,0.15) 0%, rgba(0,196,240,0.08) 100%)',
            border: '1px solid var(--border-soft)',
            borderRadius: 'var(--radius-2xl)',
            padding: 'var(--space-12) var(--space-8)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div className="glow-orb" style={{ width: 400, height: 200, background: 'rgba(79,70,229,0.15)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)', fontWeight: 800, marginBottom: '1rem' }}>
                Ready to Submit Your Project?
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: 500, margin: '0 auto 2rem' }}>
                Join 500+ students who trusted CircuitForge with their engineering projects. Professional, reliable, on-time.
              </p>
              <Link to="/submit" className="btn btn-cyan btn-lg">
                <Zap size={18} />
                Start Your Project Today
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

/* ── PAGE ── */
export default function LandingPage() {
  return (
    <PageTransition>
      <div className="page-wrapper">
        <Navbar />
        <HeroSection />
        <ServicesSection />
        <HowItWorksSection />
        <FeaturesSection />
        <TestimonialsSection />
        <FAQSection />
        <CTABanner />
        <Footer />
      </div>
    </PageTransition>
  )
}
