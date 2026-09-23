import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useParams } from 'react-router-dom'
import { Alert } from '../components/Alert'
import { LoadingState } from '../components/LoadingState'
import { getSection } from '../lib/api'
import { friendlyError } from '../lib/errors'
import type { SectionSummary } from '../lib/types'

interface SectionContextValue {
  section: SectionSummary
  reloadSection: () => Promise<void>
}

const SectionContext = createContext<SectionContextValue | null>(null)

export function SectionLayout() {
  const { sectionId = '' } = useParams()
  const [section, setSection] = useState<SectionSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setSection(await getSection(sectionId))
    } catch (caught) {
      setError(friendlyError(caught))
    } finally {
      setLoading(false)
    }
  }, [sectionId])

  useEffect(() => { void load() }, [load])

  if (loading) return <LoadingState label="Cargando sección…" />
  if (!section) return <div className="page-container"><Alert tone="error">{error || 'No se encontró la sección.'}</Alert><Link to="/">Volver a secciones</Link></div>

  const base = `/sections/${section.id}`
  return (
    <SectionContext.Provider value={{ section, reloadSection: load }}>
      <div className="section-page">
        <header className="section-header page-container">
          <Link className="back-link" to="/">← Todas las secciones</Link>
          <p className="eyebrow">{section.courseName}</p>
          <h1>Sección {section.label}</h1>
        </header>
        <nav className="tabs-wrap" aria-label="Contenido de la sección">
          <div className="tabs page-container">
            <NavLink to={`${base}/students`}>Alumnos</NavLink>
            <NavLink to={`${base}/groups`}>Grupos</NavLink>
            <NavLink to={`${base}/individual-participations`}>Participaciones individuales</NavLink>
            <NavLink to={`${base}/group-participations`}>Participaciones grupales</NavLink>
          </div>
        </nav>
        <div className="page-container section-content"><Outlet /></div>
      </div>
    </SectionContext.Provider>
  )
}

export function useSection(): SectionContextValue {
  const context = useContext(SectionContext)
  if (!context) throw new Error('useSection must be used inside SectionLayout')
  return context
}
