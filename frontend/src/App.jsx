import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'

// ── Public Pages ───────────────────────────────────────────────
import LandingPage    from './pages/LandingPage'
import LoginPage      from './pages/LoginPage'
import SignupPage     from './pages/SignupPage'
import ForgotPassword from './pages/ForgotPassword'

// ── Student Protected Pages ────────────────────────────────────
import StudentDashboard from './pages/StudentDashboard'
import SubmitProject    from './pages/SubmitProject'

// ── Admin Pages (hidden — no public links) ─────────────────────
import AdminLogin         from './pages/admin/AdminLogin'
import AdminLayout        from './pages/admin/AdminLayout'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import OrdersPage         from './pages/admin/OrdersPage'
import StudentsPage       from './pages/admin/StudentsPage'
import AnalyticsPage      from './pages/admin/AnalyticsPage'
import FileManagerPage    from './pages/admin/FileManagerPage'
import DeliveryPage       from './pages/admin/DeliveryPage'
import NotificationsPage  from './pages/admin/NotificationsPage'
import SettingsPage       from './pages/admin/SettingsPage'

// ── Route Guards ───────────────────────────────────────────────
import {
  RequireAuth,
  RequireAdmin,
  RedirectIfAuthenticated,
} from './components/guards/RouteGuards'

export default function App() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>

        {/* ── Public ─────────────────────────────────────────── */}
        <Route path="/" element={<LandingPage />} />

        {/* ── Auth pages — redirect away if already logged in ── */}
        <Route path="/login" element={
          <RedirectIfAuthenticated><LoginPage /></RedirectIfAuthenticated>
        } />
        <Route path="/signup" element={
          <RedirectIfAuthenticated><SignupPage /></RedirectIfAuthenticated>
        } />
        <Route path="/forgot-password" element={
          <RedirectIfAuthenticated><ForgotPassword /></RedirectIfAuthenticated>
        } />

        {/* ── Student Protected ───────────────────────────────── */}
        <Route path="/dashboard" element={
          <RequireAuth><StudentDashboard /></RequireAuth>
        } />
        <Route path="/submit-project" element={
          <RequireAuth><SubmitProject /></RequireAuth>
        } />

        {/* ── Admin (HIDDEN — access via direct URL only) ─────── */}
        <Route path="/admin/login" element={
          <RedirectIfAuthenticated adminRedirect="/admin">
            <AdminLogin />
          </RedirectIfAuthenticated>
        } />
        <Route path="/admin" element={
          <RequireAdmin><AdminLayout /></RequireAdmin>
        }>
          <Route index element={<AdminDashboardPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="files" element={<FileManagerPage />} />
          <Route path="delivery" element={<DeliveryPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* ── 404 ─────────────────────────────────────────────── */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AnimatePresence>
  )
}

function NotFoundPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-void)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', textAlign: 'center', padding: '2rem' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '4rem', fontWeight: 800, color: 'var(--text-muted)' }}>404</div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800 }}>Page Not Found</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>The route you're looking for doesn't exist.</p>
      <a href="/" style={{ color: 'var(--primary-400)', fontSize: '0.875rem', fontWeight: 600 }}>← Back to Home</a>
    </div>
  )
}
