'use client'

import { useState } from 'react'

export default function ContactForm() {
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('Sending...')
    setError('')
    const form = new FormData(event.currentTarget)
    const payload = Object.fromEntries(form.entries())
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Failed to send message')
      setStatus('')
      return
    }
    setStatus('Message sent successfully.')
    ;(event.target as HTMLFormElement).reset()
  }

  return (
    <form className="form" onSubmit={submit}>
      <div className="field"><label>Name</label><input className="input" name="name" required /></div>
      <div className="field"><label>Email</label><input className="input" name="email" type="email" required /></div>
      <div className="field"><label>Subject</label><input className="input" name="subject" required /></div>
      <div className="field"><label>Message</label><textarea className="input" style={{ minHeight: 130 }} name="message" required /></div>
      <button className="btn btn-primary" type="submit">Send email</button>
      {status && <div className="status">{status}</div>}
      {error && <div className="status error">{error}</div>}
    </form>
  )
}
