import fs from 'fs';

let code = fs.readFileSync('c:/CircuitFordge/frontend/src/pages/AdminDashboard.jsx', 'utf8');

// Inject new imports
code = code.replace(`import PageTransition from '../components/PageTransition'`, `import PageTransition from '../components/PageTransition'
import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getAdminStats, getAllProjects, updateProjectStatus } from '../services/adminService'
import { supabase } from '../lib/supabase'
import { Loader2 } from 'lucide-react'`);

// Remove mock data block
const mockStart = code.indexOf('/* ── Mock data ── */');
const sidebarStart = code.indexOf('/* ── Admin Sidebar ── */');

const statusMapStr = `const statusMap = {
  pending:     { label: 'Pending',     badge: 'badge-amber',   color: 'var(--amber-400)' },
  in_progress: { label: 'In Progress', badge: 'badge-primary', color: 'var(--primary-400)' },
  review:      { label: 'In Review',   badge: 'badge-cyan',    color: 'var(--cyan-400)' },
  delivered:   { label: 'Delivered',   badge: 'badge-emerald', color: 'var(--emerald-400)' },
  approved:    { label: 'Approved',    badge: 'badge-emerald', color: 'var(--emerald-400)' },
  cancelled:   { label: 'Cancelled',   badge: 'badge-rose',    color: 'var(--rose-400)' },
}`;

const adminNavItemsStr = `const adminNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
  { icon: FileText, label: 'Orders', id: 'orders' },
  { icon: Users, label: 'Students', id: 'students' },
  { icon: BarChart3, label: 'Analytics', id: 'analytics' },
  { icon: Upload, label: 'File Manager', id: 'files' },
  { icon: Truck, label: 'Delivery', id: 'delivery' },
  { icon: Bell, label: 'Notifications', id: 'notifications' },
  { icon: Settings, label: 'Settings', id: 'settings' },
]`;

code = code.substring(0, mockStart) + 
       statusMapStr + '\\n\\n' + adminNavItemsStr + '\\n\\n' +
       code.substring(sidebarStart);


// AdminSidebar
code = code.replace(/function AdminSidebar\\(\\{ active, setActive, open, setOpen \\}\\) \\{/g, `function AdminSidebar({ active, setActive, open, setOpen, logout, profile }) {`);
code = code.replace(/Admin User/g, `{profile?.full_name || 'Admin'}`);
code = code.replace(/onClick=\\{.*?navigate\\('\\/login'\\).*?\\}/g, `onClick={logout}`);

// AdminDashboardPanel
code = code.replace(/function AdminDashboardPanel\\(\\)/, `function AdminDashboardPanel({ stats, projects })`);
code = code.replace(/const stats = \\[[\\s\\S]*?\\]/m, `const statCards = [
    { label: 'Total Orders', value: stats?.totalProjects || 0, change: 'All time', color: 'var(--primary-400)', icon: FileText },
    { label: 'Active', value: stats?.activeProjects || 0, change: 'In Progress', color: 'var(--cyan-400)', icon: Zap },
    { label: 'Delivered', value: stats?.deliveredProjects || 0, change: 'Completed', color: 'var(--emerald-400)', icon: CheckCircle2 },
    { label: 'Total Users', value: stats?.totalUsers || 0, change: 'Students', color: 'var(--amber-400)', icon: Users },
  ]`);
code = code.replace(/stats\\.map/g, `statCards.map`);
code = code.replace(/ORDERS\\.length/g, `(projects || []).length`);
code = code.replace(/ORDERS\\.slice/g, `(projects || []).slice`);
code = code.replace(/\\{o\\.id\\}/g, `{o.project_ref || String(o.id).substring(0,8)}`);
code = code.replace(/\\{o\\.student\\}/g, `{o.student?.full_name || 'Unknown'}`);
code = code.replace(/\\{o\\.project\\}/g, `{o.title}`);
code = code.replace(/\\{o\\.college\\}/g, `{o.student?.college_name}`);
code = code.replace(/\\{o\\.progress\\}/g, `{o.progress || 0}`);
code = code.replace(/\\{o\\.deadline\\}/g, `{new Date(o.deadline).toLocaleDateString()}`);


// OrdersPanel
code = code.replace(/function OrdersPanel\\(\\)/, `function OrdersPanel({ projects })`);
code = code.replace(/const filtered = ORDERS\\.filter/g, `const filtered = (projects || []).filter`);
code = code.replace(/o\\.student\\.toLowerCase/g, `(o.student?.full_name || '').toLowerCase`);
code = code.replace(/o\\.project\\.toLowerCase/g, `o.title.toLowerCase`);

// AnalyticsPanel
code = code.replace(/function AnalyticsPanel\\(\\)/, `function AnalyticsPanel({ stats, projects })`);

// FileManagerPanel
code = code.replace(/function FileManagerPanel\\(\\)/, `function FileManagerPanel({ projects })`);


// Main AdminDashboard
code = code.replace(/export default function AdminDashboard\\(\\)/, `export default function AdminDashboard()`);
code = code.replace(/export default function AdminDashboard\\(\\) \\{[\\s\\S]*?const panels = \\{/m, `export default function AdminDashboard() {
  const [active, setActive] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { session, profile, getAccessToken, signOut } = useAuth()
  const navigate = useNavigate()
  
  const [projects, setProjects] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      setLoading(true)
      const token = getAccessToken()
      if (!token) return
      
      const [statsRes, projRes] = await Promise.all([
        getAdminStats(token),
        getAllProjects(token)
      ])
      
      setStats(statsRes.stats)
      setProjects(projRes.projects)
    } catch (err) {
      console.error('Failed to load admin data', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Admin global subscriptions
  useEffect(() => {
    const sub = supabase.channel('admin_all')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        fetchData() // Simple refetch on any project change for admin
      })
      .subscribe()
    return () => { sub.unsubscribe() }
  }, [])

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  const panels = {`);

code = code.replace(/<AdminDashboardPanel \\/>/g, `<AdminDashboardPanel stats={stats} projects={projects} />`);
code = code.replace(/<OrdersPanel \\/>/g, `<OrdersPanel projects={projects} />`);
code = code.replace(/<AnalyticsPanel \\/>/g, `<AnalyticsPanel stats={stats} projects={projects} />`);
code = code.replace(/<FileManagerPanel \\/>/g, `<FileManagerPanel projects={projects} />`);

code = code.replace(/<AdminSidebar active=\\{active\\} setActive=\\{setActive\\} open=\\{sidebarOpen\\} setOpen=\\{setSidebarOpen\\} \\/>/g, `<AdminSidebar active={active} setActive={setActive} open={sidebarOpen} setOpen={setSidebarOpen} logout={handleLogout} profile={profile} />`);


const loadingCode = `
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-void)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <Loader2 size={32} color=\"var(--primary-500)\" style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)' }}>LOADING ADMIN PORTAL...</span>
        </div>
        <style>{\`@keyframes spin { 100% { transform: rotate(360deg); } }\`}</style>
      </div>
    )
  }
`;

code = code.replace(/return \\(\\s*<PageTransition>/, loadingCode + `\\n  return (\\n    <PageTransition>`);

// Fix missing status map references for some statuses (fallback)
code = code.replace(/const s = statusMap\\[o\\.status\\]/g, `const s = statusMap[o.status] || { label: o.status, badge: 'badge-primary', color: 'var(--primary-400)' }`);

fs.writeFileSync('c:/CircuitFordge/frontend/src/pages/AdminDashboard.jsx', code);
console.log('AdminDashboard rewritten successfully.');
