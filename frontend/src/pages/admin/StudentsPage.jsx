import { useEffect, useState } from 'react'
import { Users, Loader2 } from 'lucide-react'
import { useAdminData } from '../../contexts/AdminDataContext'
import { getUsers } from '../../services/adminService'

export default function StudentsPage() {
  const { projects } = useAdminData()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getUsers()
      .then(res => setStudents(res.users || []))
      .catch(err => console.error('[StudentsPage]', err))
      .finally(() => setLoading(false))
  }, [])

  const projectCountByStudent = (studentId) =>
    (projects || []).filter(p => p.student_id === studentId).length

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-2xl)' }}>Students</h1>
      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              {['Name', 'College', 'Program', 'Semester', 'Projects', 'Joined'].map(h => (
                <th key={h} style={{ padding: '0.85rem 1rem', textAlign: 'left', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((s, i) => (
              <tr key={s.id} style={{ borderBottom: i < students.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                <td style={{ padding: '1rem', fontWeight: 600, fontSize: 'var(--text-sm)' }}>{s.full_name}</td>
                <td style={{ padding: '1rem', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{s.college_name || '—'}</td>
                <td style={{ padding: '1rem', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{s.program || '—'}</td>
                <td style={{ padding: '1rem', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{s.semester || '—'}</td>
                <td style={{ padding: '1rem' }}>
                  <span className="badge badge-primary">{projectCountByStudent(s.id)}</span>
                </td>
                <td style={{ padding: '1rem', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {s.created_at ? new Date(s.created_at).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {students.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Users size={32} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <p>No students registered yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
