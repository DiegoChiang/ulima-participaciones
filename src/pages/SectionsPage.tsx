import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Alert } from '../components/Alert'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { EmptyState } from '../components/EmptyState'
import { LoadingState } from '../components/LoadingState'
import { Modal } from '../components/Modal'
import { createSection, deleteSection, listSections, updateSection } from '../lib/api'
import { friendlyError } from '../lib/errors'
import type { SectionSummary } from '../lib/types'

export function SectionsPage() {
  const [sections, setSections] = useState<SectionSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<SectionSummary | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [deleting, setDeleting] = useState<SectionSummary | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setSections(await listSections())
    } catch (caught) {
      setError(friendlyError(caught))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('es')
    if (!normalized) return sections
    return sections.filter((section) => `${section.courseName} ${section.label}`.toLocaleLowerCase('es').includes(normalized))
  }, [query, sections])

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const handleSaved = async (values: { courseName: string; sectionLabel: string }) => {
    setBusy(true)
    setError('')
    try {
      if (editing) await updateSection(editing.id, values.courseName, values.sectionLabel)
      else await createSection(values.courseName, values.sectionLabel)
      setFormOpen(false)
      setNotice(editing ? 'Sección actualizada.' : 'Sección creada.')
      await load()
    } catch (caught) {
      setError(friendlyError(caught))
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async () => {
    if (!deleting) return
    setBusy(true)
    try {
      await deleteSection(deleting.id)
      setDeleting(null)
      setNotice('Sección eliminada junto con sus datos relacionados.')
      await load()
    } catch (caught) {
      setError(friendlyError(caught))
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <LoadingState label="Cargando secciones…" />

  return (
    <div className="page-container">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Organización académica</p>
          <h1>Secciones</h1>
          <p>Administra cada combinación de curso y sección desde un único lugar.</p>
        </div>
        <button className="button button-primary" type="button" onClick={openCreate}>Nueva sección</button>
      </header>
      {error ? <Alert tone="error">{error}</Alert> : null}
      {notice ? <Alert tone="success">{notice}</Alert> : null}
      {sections.length > 0 ? (
        <div className="toolbar">
          <label className="search-field">
            <span className="sr-only">Buscar curso o sección</span>
            <input type="search" placeholder="Buscar curso o sección" value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
          <span className="result-count">{filtered.length} {filtered.length === 1 ? 'sección' : 'secciones'}</span>
        </div>
      ) : null}
      {sections.length === 0 ? (
        <EmptyState title="Aún no hay secciones" description="Crea la primera combinación de curso y sección para comenzar." action={<button className="button button-primary" onClick={openCreate}>Crear primera sección</button>} />
      ) : filtered.length === 0 ? (
        <EmptyState title="Sin resultados" description="Prueba con otro nombre de curso o número de sección." />
      ) : (
        <div className="section-list">
          {filtered.map((section) => (
            <article className="section-row" key={section.id}>
              <Link className="section-main" to={`/sections/${section.id}/students`}>
                <span className="section-course">{section.courseName}</span>
                <span className="section-divider" aria-hidden="true">/</span>
                <span className="section-label">Sección {section.label}</span>
              </Link>
              <div className="row-actions">
                <button className="button button-tertiary" type="button" onClick={() => { setEditing(section); setFormOpen(true) }}>Editar</button>
                <button className="button button-tertiary button-text-danger" type="button" onClick={() => setDeleting(section)}>Eliminar</button>
              </div>
            </article>
          ))}
        </div>
      )}
      <SectionFormModal open={formOpen} initial={editing} busy={busy} onClose={() => setFormOpen(false)} onSubmit={handleSaved} />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Eliminar sección"
        description={`Se eliminarán la sección ${deleting?.label ?? ''}, sus grupos, matrículas y registros de participación. Esta acción no se puede deshacer.`}
        busy={busy}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}

function SectionFormModal({ open, initial, busy, onClose, onSubmit }: {
  open: boolean
  initial: SectionSummary | null
  busy: boolean
  onClose: () => void
  onSubmit: (values: { courseName: string; sectionLabel: string }) => Promise<void>
}) {
  const [courseName, setCourseName] = useState('')
  const [sectionLabel, setSectionLabel] = useState('')

  useEffect(() => {
    if (!open) return
    setCourseName(initial?.courseName ?? '')
    setSectionLabel(initial?.label ?? '')
  }, [open, initial])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    void onSubmit({ courseName: courseName.trim(), sectionLabel: sectionLabel.trim() })
  }

  return (
    <Modal open={open} title={initial ? 'Editar curso y sección' : 'Nueva sección'} onClose={onClose}>
      <form className="form-stack" onSubmit={submit}>
        <label className="field"><span>Curso</span><input autoFocus value={courseName} onChange={(event) => setCourseName(event.target.value)} required /></label>
        <label className="field"><span>Sección</span><input value={sectionLabel} onChange={(event) => setSectionLabel(event.target.value)} required /></label>
        <p className="field-help">La combinación ignora espacios al inicio o final y diferencias de mayúsculas.</p>
        <footer className="modal-actions">
          <button className="button button-secondary" type="button" onClick={onClose} disabled={busy}>Cancelar</button>
          <button className="button button-primary" type="submit" disabled={busy}>{busy ? 'Guardando…' : 'Guardar'}</button>
        </footer>
      </form>
    </Modal>
  )
}
