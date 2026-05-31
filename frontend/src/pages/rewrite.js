import fs from 'fs';

let code = fs.readFileSync('c:/CircuitFordge/frontend/src/pages/StudentDashboard.jsx', 'utf8');

// 1. Add new imports
code = code.replace(`import PageTransition from '../components/PageTransition'`, `import PageTransition from '../components/PageTransition'\nimport { useAuth } from '../contexts/AuthContext'\nimport { useNotifications } from '../hooks/useNotifications'\nimport { getStudentProjects, getProjectDetails, subscribeToProjectUpdates, subscribeToProjectStatus, getSignedFileUrl } from '../services/projectService'\nimport { subscribeToDeliveryUpdates } from '../services/notificationService'\nimport { Loader2, WifiOff } from 'lucide-react'`);

// 2. Remove mock data PROJECT and NOTIFICATIONS, keep navItems
const mockStart = code.indexOf('/* â”€â”€ Mock data â”€â”€ */');
const sidebarStart = code.indexOf('/* â”€â”€ Sidebar â”€â”€ */');
const navItemsMatch = code.match(/const navItems = \[[\s\S]*?\]/);

code = code.substring(0, mockStart) + 
       `/* ── Nav Items ── */\n` + navItemsMatch[0] + `\n\n` +
       code.substring(sidebarStart);

// 3. Update Sidebar to use real profile and project
code = code.replace(/function Sidebar\(\{ active, setActive, open, setOpen \}\) \{/g, `function Sidebar({ active, setActive, open, setOpen, project, profile, unreadCount, logout }) {`);
code = code.replace(/\{PROJECT\.id\}/g, `{project?.project_ref || 'N/A'}`);
code = code.replace(/\{PROJECT\.title\}/g, `{project?.title || 'No Project'}`);
code = code.replace(/\{PROJECT\.progress\}/g, `{project?.progress || 0}`);
code = code.replace(/Arjun Patel/g, `{profile?.full_name || 'Student'}`);
code = code.replace(/VNIT · 6th Sem/g, `{profile?.college_name || 'College'} · {profile?.semester || 'Semester'}`);
code = code.replace(/onClick=\{.*?navigate\('\/login'\).*?\}/g, `onClick={logout}`);

// Update unread count badge in Sidebar
code = code.replace(/\{item\.badge && \(/g, `{item.id === 'notifications' && unreadCount > 0 ? (
                <span style={{ background: 'var(--primary-600)', color: '#fff', borderRadius: 'var(--radius-full)', fontSize: '0.6rem', padding: '0.1rem 0.4rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{unreadCount}</span>
              ) : item.badge && (`);
code = code.replace(/\{item\.badge\}<\/span>\n\s*\)\}/g, `{item.badge}</span>\n              )}`);


// 4. Update OverviewPanel
code = code.replace(/function OverviewPanel\\(\\)/, `function OverviewPanel({ project, profile, notifications })`);
code = code.replace(/const daysLeft = .*?;/g, `
  const daysLeft = project?.deadline ? Math.ceil((new Date(project.deadline) - new Date()) / 86400000) : 0;
  
  // Build timeline phases based on project updates
  const updates = project?.project_updates || [];
  const activePhase = project?.current_phase || 'Initial Setup';
  
  const timeline = [
    { label: 'Project Submitted', done: true, date: new Date(project?.created_at).toLocaleDateString() },
    ...(project?.status !== 'pending' ? [{ label: 'Requirements Approved', done: true, date: 'Done' }] : []),
    ...updates.map(u => ({ label: u.phase, done: true, date: new Date(u.created_at).toLocaleDateString() })),
    { label: activePhase, done: false, active: project?.status === 'in_progress', date: 'In progress' }
  ];
`);
code = code.replace(/Good evening, Arjun/g, `Welcome back, {profile?.full_name?.split(' ')[0] || 'Student'}`);
code = code.replace(/PROJECT\.phases\.map/g, `timeline.map`);
code = code.replace(/\{PROJECT\.currentPhase\}/g, `{activePhase}`);
code = code.replace(/NOTIFICATIONS\.slice/g, `(notifications || []).slice`);

// 5. Update ReportsPanel
code = code.replace(/function ReportsPanel\(\)/, `function ReportsPanel({ project })`);
code = code.replace(/function ReportsPanel\(\{ project \}\) \{/g, `function ReportsPanel({ project }) {\n  const files = project?.project_files || [];\n  const { session } = useAuth();\n  const download = async (path, bucket) => { try { const res = await getSignedFileUrl(bucket, path, session?.access_token); window.open(res.signedUrl, '_blank'); } catch(e) { alert('Download failed'); } };\n`);
code = code.replace(/\{ icon: FileText, title: 'Project Report PDF'.*?\}/g, `{ icon: FileText, title: 'Project Report PDF', status: files.find(f => f.file_type === 'report_pdf') ? 'ready' : 'pending', desc: 'Full technical documentation, circuit diagrams, code listings, and BOM.', color: 'var(--primary-400)', file: files.find(f => f.file_type === 'report_pdf') }`);
code = code.replace(/\{ icon: Play, title: 'Demonstration Video'.*?\}/g, `{ icon: Play, title: 'Demonstration Video', status: files.find(f => f.file_type === 'demo_video') ? 'ready' : 'pending', desc: 'Professional video showcasing working hardware with narration.', color: 'var(--emerald-400)', file: files.find(f => f.file_type === 'demo_video') }`);
code = code.replace(/\{ icon: FileText, title: 'Viva Q&A Sheet'.*?\}/g, `{ icon: FileText, title: 'Viva Q&A Sheet', status: files.find(f => f.file_type === 'other' && f.label.includes('Viva')) ? 'ready' : 'pending', desc: 'Curated set of expected viva questions with model answers.', color: 'var(--purple-400)', file: files.find(f => f.file_type === 'other' && f.label.includes('Viva')) }`);
code = code.replace(/\{ icon: Download, title: 'Source Code Archive'.*?\}/g, `{ icon: Download, title: 'Source Code Archive', status: files.find(f => f.file_type === 'source_code') ? 'ready' : 'pending', desc: 'All firmware and software source files with comments.', color: 'var(--cyan-400)', file: files.find(f => f.file_type === 'source_code') }`);
code = code.replace(/<span className=\"badge badge-amber\">Preparing<\/span>/g, `{r.status === 'ready' ? <span className=\"badge badge-emerald\">Ready</span> : <span className=\"badge badge-amber\">Preparing</span>}`);
code = code.replace(/<button disabled.*?Download\s*<\/button>/gs, `<button disabled={r.status !== 'ready'} onClick={() => r.file && download(r.file.storage_path, r.file.bucket_name)} className=\"btn btn-ghost btn-sm\" style={{ opacity: r.status === 'ready' ? 1 : 0.4, cursor: r.status === 'ready' ? 'pointer' : 'not-allowed', fontSize: 'var(--text-xs)', color: r.status === 'ready' ? 'var(--text-primary)' : 'inherit' }}><Download size={12} /> Download</button>`);

// 6. Update NotificationsPanel
code = code.replace(/function NotificationsPanel\(\)/, `function NotificationsPanel({ notifications, markAsRead })`);
code = code.replace(/NOTIFICATIONS\.map/g, `(notifications || []).map`);
code = code.replace(/key=\{n\.id\}/g, `key={n.id} onClick={() => !n.is_read && markAsRead(n.id)}`);
code = code.replace(/n\.read/g, `n.is_read`);

// 7. Update DeliveryPanel
code = code.replace(/function DeliveryPanel\(\)/, `function DeliveryPanel({ project })`);
code = code.replace(/function DeliveryPanel\(\{ project \}\) \{/g, `function DeliveryPanel({ project }) {\n  const tracking = project?.delivery_tracking || {};\n`);
code = code.replace(/Hardware is still in development — delivery options will appear here once ready\./g, `{tracking.status ? 'Current Status: ' + tracking.status : 'Hardware is still in development — delivery options will appear here once ready.'}`);

// 8. Update SupportPanel
code = code.replace(/function SupportPanel\(\)/, `function SupportPanel({ project })`);
code = code.replace(/\{PROJECT\.manager\}/g, `{project?.users?.name || 'Project Manager'}`);


// 9. Update StudentDashboard component
code = code.replace(/export default function StudentDashboard\(\)/, `export default function StudentDashboard()`);
code = code.replace(/export default function StudentDashboard\(\) \{[\s\S]*?const panels = \{/m, `export default function StudentDashboard() {
  const [active, setActive] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { session, profile, getAccessToken, signOut } = useAuth()
  const navigate = useNavigate()
  
  const [projects, setProjects] = useState([])
  const [activeProject, setActiveProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [realtimeStatus, setRealtimeStatus] = useState('connecting') // connecting, connected, offline
  
  const { notifications, unreadCount, markAsRead, loading: notifLoading } = useNotifications()

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      const token = getAccessToken()
      if (!token) return;
      const res = await getStudentProjects(token)
      setProjects(res.projects || [])
      
      if (res.projects && res.projects.length > 0) {
        const details = await getProjectDetails(res.projects[0].id, token)
        setActiveProject(details.project)
      }
    } catch (err) {
      console.error(err)
      setError('Failed to load dashboard data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [getAccessToken])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  // Realtime subscriptions
  useEffect(() => {
    if (!activeProject) return
    
    setRealtimeStatus('connected')
    
    let updatesSub, statusSub, deliverySub;
    
    const setupSubs = async () => {
      updatesSub = await subscribeToProjectUpdates(activeProject.id, (update) => {
        setActiveProject(prev => prev ? {
          ...prev, 
          project_updates: [update, ...(prev.project_updates || [])]
        } : prev)
      })
      
      statusSub = await subscribeToProjectStatus(activeProject.id, (updatedProj) => {
        setActiveProject(prev => prev ? { ...prev, ...updatedProj } : prev)
      })
      
      deliverySub = await subscribeToDeliveryUpdates(activeProject.id, (event) => {
        setActiveProject(prev => prev ? {
          ...prev,
          delivery_tracking: event.delivery
        } : prev)
      })
    }
    
    setupSubs().catch(() => setRealtimeStatus('offline'))

    return () => {
      if (updatesSub) updatesSub.unsubscribe()
      if (statusSub) statusSub.unsubscribe()
      if (deliverySub) deliverySub.unsubscribe()
    }
  }, [activeProject?.id])

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  const panels = {`);

code = code.replace(/<OverviewPanel \/>/g, `<OverviewPanel project={activeProject} profile={profile} notifications={notifications} />`);
code = code.replace(/<ReportsPanel \/>/g, `<ReportsPanel project={activeProject} />`);
code = code.replace(/<NotificationsPanel \/>/g, `<NotificationsPanel notifications={notifications} markAsRead={markAsRead} />`);
code = code.replace(/<DeliveryPanel \/>/g, `<DeliveryPanel project={activeProject} />`);
code = code.replace(/<SupportPanel \/>/g, `<SupportPanel project={activeProject} />`);

code = code.replace(/<Sidebar active=\{active\} setActive=\{setActive\} open=\{sidebarOpen\} setOpen=\{setSidebarOpen\} \/>/g, `<Sidebar active={active} setActive={setActive} open={sidebarOpen} setOpen={setSidebarOpen} project={activeProject} profile={profile} unreadCount={unreadCount} logout={handleLogout} />`);

code = code.replace(/<div className=\"badge badge-emerald\"><span className=\"pulse-dot\" \/>Active Project<\/div>/g, `
  {realtimeStatus === 'connected' ? (
    <div className=\"badge badge-emerald\"><span className=\"pulse-dot\" />Live Updates</div>
  ) : realtimeStatus === 'offline' ? (
    <div className=\"badge badge-amber\"><WifiOff size={12} /> Offline</div>
  ) : null}
`);

const loadingCode = `
  if (loading || notifLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-void)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <Loader2 size={32} color=\"var(--primary-500)\" style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)' }}>LOADING DASHBOARD...</span>
        </div>
        <style>{\`@keyframes spin { 100% { transform: rotate(360deg); } }\`}</style>
      </div>
    )
  }
  
  if (!activeProject && !loading) {
    return (
      <div className=\"dashboard-layout\">
        <Sidebar active={active} setActive={setActive} open={sidebarOpen} setOpen={setSidebarOpen} profile={profile} logout={handleLogout} />
        <main className=\"main-content\" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', maxWidth: 400 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(79,70,229,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <LayoutDashboard size={24} color=\"var(--primary-400)\" />
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>No Active Projects</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>You haven't submitted any projects yet.</p>
            <Link to=\"/submit-project\" className=\"btn btn-primary\" style={{ justifyContent: 'center' }}>Submit a Project</Link>
          </div>
        </main>
      </div>
    )
  }
`;

code = code.replace(/return \(\s*<PageTransition>/, loadingCode + `\n  return (\n    <PageTransition>`);

fs.writeFileSync('c:/CircuitFordge/frontend/src/pages/StudentDashboard.jsx', code);
console.log('StudentDashboard rewritten.');
