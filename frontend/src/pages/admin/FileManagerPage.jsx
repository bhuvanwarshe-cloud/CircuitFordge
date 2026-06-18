import { useEffect, useState } from 'react'
import { FileText, Download, Loader2 } from 'lucide-react'
import { useAdminData } from '../../contexts/AdminDataContext'
import { getAdminProject } from '../../services/adminService'

export default function FileManagerPage() {
  const { projects } = useAdminData()
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadFiles() {
      setLoading(true)
      try {
        const results = await Promise.all(
          (projects || []).slice(0, 20).map(p =>
            getAdminProject(p.id)
              .then(res => (res.project?.project_files || []).map(f => ({
                ...f,
                project_ref: res.project?.project_ref || p.project_ref,
                project_title: res.project?.title || p.title,
              })))
              .catch(() => [])
          )
        )
        if (!cancelled) {
          setFiles(results.flat().sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))
        }
      } catch (err) {
        console.error('[FileManagerPage]', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    if (projects?.length) loadFiles()
    else setLoading(false)

    return () => { cancelled = true }
  }, [projects])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-2xl)' }}>File Manager</h1>
      <div className="card" style={{ padding: 'var(--space-5)' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>Uploaded Project Files</h3>
        {files.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>No files uploaded yet. Upload files from a project detail page.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {files.map(f => (
              <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', borderRadius: 'var(--radius-lg)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'rgba(79,70,229,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={16} color="var(--primary-400)" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)' }}>{f.label || f.file_type}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    {f.project_ref || 'Project'} · {f.project_title} · {f.file_type}
                  </div>
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {f.created_at ? new Date(f.created_at).toLocaleDateString() : '—'}
                </div>
                <button className="btn btn-ghost btn-sm" style={{ padding: '0.3rem' }} title="Download via project detail"><Download size={12} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
