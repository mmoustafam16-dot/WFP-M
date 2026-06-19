'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/browser'

type ProjectForm = {
  id?: string
  name: string
  country: string
  crop: string
  scenario: string
  irrigation_method: string
  inputs_json: string
  outputs_json: string
  notes: string
}

const emptyForm: ProjectForm = {
  name: '',
  country: '',
  crop: '',
  scenario: '',
  irrigation_method: '',
  inputs_json: '{\n  "seasonalRainfallMm": 0,\n  "irrigationEfficiency": 0.85\n}',
  outputs_json: '{\n  "greenWF": 0,\n  "blueWF": 0,\n  "greyWF": 0\n}',
  notes: ''
}

export default function ProjectEditor() {
  const [form, setForm] = useState<ProjectForm>(emptyForm)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  function update(key: keyof ProjectForm, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('id')
    if (!id) return
    ;(async () => {
      setStatus('Loading project...')
      const { data, error } = await supabase.from('projects').select('*').eq('id', id).single()
      if (error) { setError(error.message); setStatus(''); return }
      setForm({
        id: data.id,
        name: data.name ?? '',
        country: data.country ?? '',
        crop: data.crop ?? '',
        scenario: data.scenario ?? '',
        irrigation_method: data.irrigation_method ?? '',
        inputs_json: JSON.stringify(data.inputs ?? {}, null, 2),
        outputs_json: JSON.stringify(data.outputs ?? {}, null, 2),
        notes: data.notes ?? ''
      })
      setStatus('')
    })()
  }, [])

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setStatus('Saving...')

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      setError('Please login first.')
      setStatus('')
      return
    }

    let inputs: unknown
    let outputs: unknown
    try {
      inputs = JSON.parse(form.inputs_json || '{}')
      outputs = JSON.parse(form.outputs_json || '{}')
    } catch {
      setError('Inputs/outputs must be valid JSON.')
      setStatus('')
      return
    }

    const payload = {
      user_id: userData.user.id,
      name: form.name,
      country: form.country || null,
      crop: form.crop || null,
      scenario: form.scenario || null,
      irrigation_method: form.irrigation_method || null,
      inputs,
      outputs,
      notes: form.notes || null,
      updated_at: new Date().toISOString()
    }

    const query = form.id
      ? supabase.from('projects').update(payload).eq('id', form.id).select().single()
      : supabase.from('projects').insert(payload).select().single()

    const { data, error } = await query
    if (error) {
      setError(error.message)
      setStatus('')
      return
    }
    setForm((prev) => ({ ...prev, id: data.id }))
    setStatus('Project saved successfully online.')
  }

  async function remove() {
    if (!form.id) return
    if (!confirm('Delete this project?')) return
    const { error } = await supabase.from('projects').delete().eq('id', form.id)
    if (error) { setError(error.message); return }
    window.location.href = '/dashboard'
  }

  return (
    <form className="form" onSubmit={save}>
      <div className="grid-2">
        <div className="field"><label>Project name</label><input className="input" required value={form.name} onChange={(e) => update('name', e.target.value)} /></div>
        <div className="field"><label>Country</label><input className="input" value={form.country} onChange={(e) => update('country', e.target.value)} /></div>
        <div className="field"><label>Crop</label><input className="input" value={form.crop} onChange={(e) => update('crop', e.target.value)} /></div>
        <div className="field"><label>Scenario</label><input className="input" value={form.scenario} onChange={(e) => update('scenario', e.target.value)} /></div>
        <div className="field"><label>Irrigation method</label><input className="input" value={form.irrigation_method} onChange={(e) => update('irrigation_method', e.target.value)} /></div>
      </div>
      <div className="grid-2">
        <div className="field"><label>Inputs JSON</label><textarea className="textarea" value={form.inputs_json} onChange={(e) => update('inputs_json', e.target.value)} /></div>
        <div className="field"><label>Outputs JSON</label><textarea className="textarea" value={form.outputs_json} onChange={(e) => update('outputs_json', e.target.value)} /></div>
      </div>
      <div className="field"><label>Notes</label><textarea className="input" style={{ minHeight: 110 }} value={form.notes} onChange={(e) => update('notes', e.target.value)} /></div>
      <div className="actions">
        <button className="btn btn-primary" type="submit">Save online</button>
        <a className="btn btn-soft" href="/tool">Open calculator</a>
        <a className="btn btn-outline" href="/dashboard">Back to dashboard</a>
        {form.id && <button type="button" className="btn btn-danger" onClick={remove}>Delete</button>}
      </div>
      {status && <div className="status">{status}</div>}
      {error && <div className="status error">{error}</div>}
    </form>
  )
}
