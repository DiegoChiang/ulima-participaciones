import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Alert } from '../components/Alert'
import { EmptyState } from '../components/EmptyState'
import { LoadingState } from '../components/LoadingState'
import { ParticipationMatrix } from '../components/ParticipationMatrix'
import { getParticipationRecord, getParticipationScores, listMatrixEntities, saveParticipationRecord } from '../lib/api'
import { friendlyError } from '../lib/errors'
import { scoresToMap, scoresToPayload, toLocalDateTimeInput } from '../lib/scores'
import type { MatrixEntity, ParticipationType } from '../lib/types'
import { useSection } from '../layout/SectionLayout'

export function ParticipationEditorPage({ type }: { type: ParticipationType }) {
  const { section } = useSection()
  const { recordId } = useParams()
  const navigate = useNavigate()
  const [entities, setEntities] = useState<MatrixEntity[]>([])
  const [scores, setScores] = useState<Map<string, number>>(new Map())
  const [occurredAt, setOccurredAt] = useState(() => toLocalDateTimeInput(new Date().toISOString()))
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const routeSegment = type === 'individual' ? 'individual-participations' : 'group-participations'
  const base = `/sections/${section.id}/${routeSegment}`
  const entityLabel = type === 'individual' ? 'alumnos' : 'grupos'

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      if (recordId) {
        const [nextEntities, record, persistedScores] = await Promise.all([
          listMatrixEntities(section.id, type),
          getParticipationRecord(recordId),
          getParticipationScores(recordId, type),
        ])
        setEntities(nextEntities)
        setOccurredAt(toLocalDateTimeInput(record.occurredAt))
        setScores(scoresToMap(persistedScores))
      } else {
        setEntities(await listMatrixEntities(section.id, type))
      }
    } catch (caught) { setError(friendlyError(caught)) }
    finally { setLoading(false) }
  }, [recordId, section.id, type])
  useEffect(() => { void load() }, [load])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await saveParticipationRecord({
        recordId,
        sectionId: section.id,
        type,
        occurredAt: new Date(occurredAt).toISOString(),
        scores: scoresToPayload(scores),
      })
      navigate(base, { replace: true })
    } catch (caught) { setError(friendlyError(caught)) }
    finally { setBusy(false) }
  }

  if (loading) return <LoadingState label="Preparando matriz…" />
  return (
    <section className="participation-editor" aria-labelledby="editor-title">
      <Link className="back-link" to={base}>← Volver al historial</Link>
      <header className="content-heading editor-heading">
        <div><p className="eyebrow">{recordId ? 'Editar registro' : 'Nuevo registro'}</p><h2 id="editor-title">Participación {type === 'individual' ? 'individual' : 'grupal'}</h2><p>Activa cada celda para recorrer 0, 1, 2 y 3 puntos.</p></div>
      </header>
      {error ? <Alert tone="error">{error}</Alert> : null}
      <form onSubmit={handleSubmit}>
        <div className="record-meta">
          <label className="field"><span>Fecha y hora efectiva</span><input type="datetime-local" value={occurredAt} onChange={(event) => setOccurredAt(event.target.value)} required /></label>
          <div className="matrix-legend" aria-label="Leyenda de puntos"><span><b>Vacío</b> 0</span><span><b>✓</b> 1</span><span><b>✓✓</b> 2</span><span><b>✓✓✓</b> 3</span></div>
        </div>
        {entities.length === 0 ? (
          <EmptyState title={`No hay ${entityLabel} disponibles`} description={`Agrega ${entityLabel} activos antes de guardar un registro de participación.`} />
        ) : <ParticipationMatrix entities={entities} scores={scores} onScoresChange={setScores} />}
        <footer className="editor-actions"><Link className="button button-secondary" to={base}>Cancelar</Link><button className="button button-primary" type="submit" disabled={busy || entities.length === 0}>{busy ? 'Guardando…' : 'Guardar registro'}</button></footer>
      </form>
    </section>
  )
}
