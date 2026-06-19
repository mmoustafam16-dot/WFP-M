import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json()
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
    }

    const apiKey = process.env.RESEND_API_KEY
    const from = process.env.CONTACT_FROM_EMAIL
    const to = process.env.CONTACT_TO_EMAIL

    if (!apiKey || !from || !to) {
      return NextResponse.json({ error: 'Email environment variables are not configured.' }, { status: 500 })
    }

    const resend = new Resend(apiKey)
    await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `[WFP Tool] ${subject}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
