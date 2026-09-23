import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert } from '../components/Alert'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { EmptyState } from '../components/EmptyState'
import { LoadingState } from '../components/LoadingState'
import { deleteParticipationRecord, listParticipationRecords } from '../lib/api'
import { friendlyError } from '../lib/errors'
import type { ParticipationRecord, ParticipationType } from '../lib/types'
import { useSection } from '../layout/SectionLayout'

const dateFormatter = new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' })

export function ParticipationHistoryPage({ type }: { type: ParticipationType }) {
  const { section } = useSection()
  const [records, setRecords] = useState<ParticipationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [deleting, setDeleting] = useState<ParticipationRecord | null>(null)
  const [busy, setBusy] = useState(false)
  const routeSegment = type === 'individual' ? 'individual-participations' : 'group-participations'
  const title = type === 'individual' ? 'Participaciones individuales' : 'Participaciones grupales'
  const entityLabel = type === 'individual' ? 'alumnos' : 'grupos'

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try { setRecords(await listParticipationRecords(section.id, type)) }
    catch (caught) { setError(friendlyError(caught)) }
    finally { setLoading(false) }
  }, [section.id, type])
  useEffect(() => { void load() }, [load])

  const handleDelete = async () => {
    if (!deleting) return
    setBusy(true)
    try {
      await deleteParticipationRecord(deleting.id)
      setDeleting(null)
      setNotice('Registro y puntuaciones eliminados.')
      await load()
    } catch (caught) { setError(friendlyError(caught)) }
    finally { setBusy(false) }
  }

  if (loading) return <LoadingState label={`Cargando ${title.toLocaleLowerCase('es')}…`} />
  const base = `/sections/${section.id}/${routeSegment}`
  return (
    <section aria-labelledby="participations-title">
      <header className="content-heading">
        <div><h2 id="participations-title">{title}</h2><p>Historial ordenado desde la participación más reciente.</p></div>
        <Link className="button button-primary" to={`${base}/new`}>Nuevo registro</Link>
      </header>
      {error ? <Alert tone="error">{error}</Alert> : null}
      {notice ? <Alert tone="success">{notice}</Alert> : null}
      {records.length === 0 ? (
        <EmptyState title="No hay registros" description={`Crea el primer registro para asignar puntos a ${entityLabel} en doce oportunidades.`} action={<Link className="button button-primary" to={`${base}/new`}>Crear registro</Link>} />
      ) : (
        <div className="table-wrap">
          <table className="data-table participation-history">
            <thead><tr><th>Fecha de participación</th><th>Creado</th><th>Última modificación</th><th><span className="sr-only">Acciones</span></th></tr></thead>
            <tbody>{records.map((record) => (
              <tr key={record.id}>
                <td><strong>{dateFormatter.format(new Date(record.occurredAt))}</strong></td>
                <td>{dateFormatter.format(new Date(record.createdAt))}</td>
                <td>{dateFormatter.format(new Date(record.updatedAt))}</td>
                <td className="table-actions"><Link className="button button-tertiary" to={`${base}/${record.id}/edit`}>Editar</Link><button className="button button-tertiary button-text-danger" onClick={() => setDeleting(record)}>Eliminar</button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
      <ConfirmDialog open={Boolean(deleting)} title="Eliminar registro de participación" description="Se eliminarán este registro y todos sus puntos. Esta acción no se puede deshacer." busy={busy} onClose={() => setDeleting(null)} onConfirm={handleDelete} />
    </section>
  )
}
