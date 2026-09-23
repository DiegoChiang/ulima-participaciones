import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { Alert } from '../components/Alert'
import { friendlyError } from '../lib/errors'
import { isSupabaseConfigured } from '../lib/supabase'

export function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const { session, signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  if (session) return <Navigate to="/" replace />

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setBusy(true)
    try {
      if (mode === 'login') {
        await signIn(email.trim(), password)
        const destination = (location.state as { from?: string } | null)?.from ?? '/'
        navigate(destination, { replace: true })
      } else {
        const confirmationRequired = await signUp(email.trim(), password)
        if (confirmationRequired) {
          setMessage('Cuenta creada. Revisa tu correo para confirmar el registro antes de iniciar sesión.')
        } else {
          navigate('/', { replace: true })
        }
      }
    } catch (caught) {
      setError(friendlyError(caught))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-intro">
        <p className="eyebrow">Gestión académica</p>
        <h1>Participaciones claras, sección por sección.</h1>
        <p>Registra alumnos, organiza grupos y conserva cada sesión de participación en una matriz accesible de doce oportunidades.</p>
        <div className="auth-feature-list" aria-label="Características principales">
          <span>12 oportunidades por registro</span>
          <span>Participación individual y grupal</span>
          <span>Datos aislados por usuario</span>
        </div>
      </section>
      <section className="auth-panel" aria-labelledby="auth-title">
        <p className="eyebrow">Acceso seguro</p>
        <h2 id="auth-title">{mode === 'login' ? 'Inicia sesión' : 'Crea tu cuenta'}</h2>
        <p className="form-intro">
          {mode === 'login' ? 'Ingresa con tu correo y contraseña.' : 'Usa un correo válido y una contraseña de al menos 8 caracteres.'}
        </p>
        {!isSupabaseConfigured ? (
          <Alert tone="info">Configura VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY en .env.local para habilitar el acceso.</Alert>
        ) : null}
        {error ? <Alert tone="error">{error}</Alert> : null}
        {message ? <Alert tone="success">{message}</Alert> : null}
        <form className="form-stack" onSubmit={handleSubmit}>
          <label className="field">
            <span>Correo electrónico</span>
            <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label className="field">
            <span>Contraseña</span>
            <input
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          <button className="button button-primary button-full" type="submit" disabled={busy || !isSupabaseConfigured}>
            {busy ? 'Procesando…' : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </button>
        </form>
        <p className="auth-switch">
          {mode === 'login' ? '¿Aún no tienes una cuenta?' : '¿Ya tienes una cuenta?'}{' '}
          <Link to={mode === 'login' ? '/register' : '/login'}>{mode === 'login' ? 'Regístrate' : 'Inicia sesión'}</Link>
        </p>
      </section>
    </main>
  )
}
