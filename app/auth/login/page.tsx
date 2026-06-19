import AuthForm from '@/components/AuthForm'

export default function LoginPage() {
  return (
    <main className="section">
      <div className="container grid-2">
        <div>
          <h1>Login</h1>
          <p className="lead">Access your saved Water Footprint projects and continue previous calculations.</p>
          <p>New user? <a className="kbd" href="/auth/register">Create an account</a></p>
        </div>
        <div className="card"><AuthForm mode="login" /></div>
      </div>
    </main>
  )
}
