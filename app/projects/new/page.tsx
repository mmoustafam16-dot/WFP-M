import ProjectEditor from '@/components/ProjectEditor'

export default function NewProjectPage() {
  return (
    <main className="section">
      <div className="container">
        <div className="section-title">
          <div>
            <h1>Save project online</h1>
            <p className="lead">Store the water footprint scenario in the database and access it later from your account.</p>
          </div>
        </div>
        <div className="card"><ProjectEditor /></div>
      </div>
    </main>
  )
}
