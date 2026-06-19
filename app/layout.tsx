import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Water Footprint Decision Tool',
  description: 'Professional water footprint decision support website with user accounts, saved projects, reports, and online database.',
  manifest: '/tool/site.webmanifest'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <body>
        <header className="navbar">
          <div className="container nav-inner">
            <a className="logo" href="/">
              <span className="logo-mark">WF</span>
              <span>Water Footprint Decision Tool</span>
            </a>
            <nav className="nav-links">
              <a href="/#features">Features</a>
              <a href="/tool">Tool</a>
              <a href="/dashboard">Dashboard</a>
              <a href="/contact">Contact</a>
              <a className="btn btn-primary" href="/auth/login">Login</a>
            </nav>
          </div>
        </header>
        {children}
        <footer className="footer">
          <div className="container footer-inner">
            <span>© {new Date().getFullYear()} Water Footprint Decision Tool</span>
            <span><a href="/privacy">Privacy</a> · <a href="/terms">Terms</a> · <a href="/contact">Email</a></span>
          </div>
        </footer>
      </body>
    </html>
  )
}
