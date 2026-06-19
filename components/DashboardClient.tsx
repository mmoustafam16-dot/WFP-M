'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/browser'

type Project = {
  id: string
  name: string
  country: string | null
  crop: string | null
  scenario: string | null
  created_at: string
  updated_at: string
}

export default function DashboardClient() {
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState<string | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      setEmail(null)
      setLoading(false)
      return
    }
    setEmail(userData.user.email ?? null)
    const { data, error } = await supabase
      .from('projects')
      .select('id,name,country,crop,scenario,created_at,updated_at')
      .order('updated_at', { ascending: false })
    if (error) setError(error.message)
    setProjects(data ?? [])
    setLoading(false)
  }

  async function logout() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  useEffect(() => { load() }, [])

  if (loading) return <div className="status">Loading dashboard...</div>
  if (!email) {
    return (
      <div className="card">
        <h3>You are not logged in</h3>
        <p>Please login or create an account to save online projects.</p>
        <div className="actions">
          <a className="btn btn-primary" href="/auth/login">Login</a>
          <a className="btn btn-soft" href="/auth/register">Create account</a>
        </div>
      </div>
    )
  }

  return (
    <div className="form">
      <div className="card">
        <div className="section-title">
          <div>
            <h2>Dashboard</h2>
            <p>Logged in as {email}</p>
          </div>
          <div className="actions">
            <a className="btn btn-primary" href="/projects/new">New project</a>
            <a className="btn btn-soft" href="/tool">Open tool</a>
            <button className="btn btn-outline" onClick={logout}>Logout</button>
          </div>
        </div>
      </div>
      {error && <div className="status error">{error}</div>}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Project</th>
              <th>Country</th>
              <th>Crop</th>
              <th>Scenario</th>
              <th>Updated</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 && (
              <tr><td colSpan={6}>No saved projects yet.</td></tr>
            )}
            {projects.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.country ?? '-'}</td>
                <td>{p.crop ?? '-'}</td>
                <td>{p.scenario ?? '-'}</td>
                <td>{new Date(p.updated_at).toLocaleString()}</td>
                <td><a className="kbd" href={`/projects/new?id=${p.id}`}>Edit</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
