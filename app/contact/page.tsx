import ContactForm from '@/components/ContactForm'

export default function ContactPage() {
  return (
    <main className="section">
      <div className="container grid-2">
        <div>
          <h1>Contact</h1>
          <p className="lead">Use this form for technical support, institutional requests, consulting, or custom deployment.</p>
          <div className="card">
            <h3>Professional email</h3>
            <p>After connecting the domain, use addresses such as <span className="kbd">contact@yourdomain.com</span> or <span className="kbd">support@yourdomain.com</span>.</p>
          </div>
        </div>
        <div className="card"><ContactForm /></div>
      </div>
    </main>
  )
}
