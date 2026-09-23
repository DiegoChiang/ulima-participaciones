import { useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { friendlyError } from '../lib/errors'

export function AppLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSignOut = async () => {
    setBusy(true)
    setError('')
    try {
      await signOut()
      navigate('/login', { replace: true })
    } catch (caught) {
      setError(friendlyError(caught))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-inner">
          <Link className="product-name" to="/" aria-label="Ir a secciones">
            <span className="product-mark" aria-hidden="true" />
            <span>Participaciones académicas</span>
          </Link>
          <div className="header-account">
            <span className="account-email" title={user?.email}>{user?.email}</span>
            <button className="button button-secondary button-compact" type="button" onClick={handleSignOut} disabled={busy}>
              {busy ? 'Saliendo…' : 'Cerrar sesión'}
            </button>
          </div>
        </div>
        {error ? <div className="header-error" role="alert">{error}</div> : null}
      </header>
      <main className="app-main"><Outlet /></main>
      <footer className="app-footer">Herramienta independiente con diseño inspirado en el lenguaje visual ULima.</footer>
    </div>
  )
}
