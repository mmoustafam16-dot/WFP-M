import AuthForm from '@/components/AuthForm'

export default function RegisterPage() {
  return (
    <main className="section">
      <div className="container grid-2">
        <div>
          <h1>Create account</h1>
          <p className="lead">Register to save online projects, manage scenarios, and keep a database-backed calculation history.</p>
          <p>Already registered? <a className="kbd" href="/auth/login">Login</a></p>
        </div>
        <div className="card"><AuthForm mode="register" /></div>
      </div>
    </main>
  )
}
