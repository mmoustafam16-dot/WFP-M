'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/browser'

type Mode = 'login' | 'register'

export default function AuthForm({ mode }: { mode: Mode }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setStatus('Processing...')

    const redirectTo = `${window.location.origin}/dashboard`

    if (mode === 'register') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName }, emailRedirectTo: redirectTo }
      })
      if (error) {
        setError(error.message)
        setStatus('')
        return
      }
      setStatus('Account created. Check your email if confirmation is enabled, then login.')
      return
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setStatus('')
      return
    }
    window.location.href = '/dashboard'
  }

  return (
    <form className="form" onSubmit={submit}>
      {mode === 'register' && (
        <div className="field">
          <label>Full name</label>
          <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
        </div>
      )}
      <div className="field">
        <label>Email</label>
        <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
      </div>
      <div className="field">
        <label>Password</label>
        <input className="input" type="password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 6 characters" />
      </div>
      <button className="btn btn-primary" type="submit">{mode === 'login' ? 'Login' : 'Create account'}</button>
      {status && <div className="status">{status}</div>}
      {error && <div className="status error">{error}</div>}
    </form>
  )
}
