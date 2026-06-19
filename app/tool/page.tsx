export default function ToolPage() {
  return (
    <main className="section">
      <div className="container">
        <div className="section-title">
          <div>
            <h1>Calculator</h1>
            <p className="lead">The current calculator is embedded here as the first professional web version.</p>
          </div>
          <div className="actions">
            <a className="btn btn-primary" href="/projects/new">Save project online</a>
            <a className="btn btn-soft" href="/dashboard">Dashboard</a>
          </div>
        </div>
        <iframe className="tool-frame" src="/tool/index.html" title="Water Footprint Decision Tool" />
      </div>
    </main>
  )
}
