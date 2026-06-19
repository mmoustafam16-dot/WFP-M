const features = [
  ['Decision Support', 'Estimate green, blue, and grey water footprint outputs with structured agricultural inputs and scenarios.'],
  ['Saved Projects', 'Registered users can save project records online and return to them later from a secure dashboard.'],
  ['Professional Reports', 'Keep the existing calculator and prepare future PDF/Excel report workflows for researchers and consultants.'],
  ['Bilingual Identity', 'Designed for Arabic and English presentation with clean layout, scientific positioning, and responsive screens.'],
  ['Database Ready', 'Supabase PostgreSQL schema is included with Row Level Security policies for user-owned project data.'],
  ['Email Ready', 'Contact form and Resend integration are prepared for professional domain-based email.']
]

export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="badge">Professional Web Edition</span>
            <h1>Water Footprint Decision Tool for Agricultural Planning</h1>
            <p className="lead">
              A full online decision-support website for crop water footprint calculations, scenario comparison,
              saved projects, database-backed access, and professional communication.
            </p>
            <div className="actions">
              <a className="btn btn-primary" href="/tool">Open Calculator</a>
              <a className="btn btn-soft" href="/auth/register">Create Account</a>
              <a className="btn btn-outline" href="/dashboard">My Projects</a>
            </div>
          </div>
          <div className="hero-card">
            <div className="metric"><span>Website Type</span><strong>Full‑Stack</strong></div>
            <div className="metric"><span>Database</span><strong>PostgreSQL</strong></div>
            <div className="metric"><span>Authentication</span><strong>Supabase</strong></div>
            <div className="metric"><span>Email</span><strong>Domain Ready</strong></div>
            <div className="metric"><span>Hosting</span><strong>Vercel</strong></div>
          </div>
        </div>
      </section>

      <section id="features" className="section">
        <div className="container">
          <div className="section-title">
            <h2>What this edition adds</h2>
            <a className="btn btn-outline" href="/contact">Request access</a>
          </div>
          <div className="grid-3">
            {features.map(([title, body]) => (
              <article className="card" key={title}>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container grid-2">
          <div className="card">
            <h3>For researchers</h3>
            <p>
              Present the tool as a reproducible software product with project records, input/output history,
              scientific references, and online availability.
            </p>
          </div>
          <div className="card">
            <h3>For consultants and users</h3>
            <p>
              Create an account, run a water footprint scenario, save the project, and use the contact form for
              technical support or paid professional analysis.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
