import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { Alert } from '../components/Alert'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { EmptyState } from '../components/EmptyState'
import { LoadingState } from '../components/LoadingState'
import { Modal } from '../components/Modal'
import { archiveStudentEnrollment, addStudentToSection, listStudents, updateStudent } from '../lib/api'
import { friendlyError } from '../lib/errors'
import type { StudentEnrollment } from '../lib/types'
import { useSection } from '../layout/SectionLayout'

type StudentForm = { studentCode: string; firstNames: string; lastNames: string }

export function StudentsPage() {
  const { section } = useSection()
  const [students, setStudents] = useState<StudentEnrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [query, setQuery] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<StudentEnrollment | null>(null)
  const [removing, setRemoving] = useState<StudentEnrollment | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try { setStudents(await listStudents(section.id)) }
    catch (caught) { setError(friendlyError(caught)) }
    finally { setLoading(false) }
  }, [section.id])

  useEffect(() => { void load() }, [load])

  const filtered = useMemo(() => {
    const value = query.trim().toLocaleLowerCase('es')
    if (!value) return students
    return students.filter((student) =>
      `${student.studentCode} ${student.firstNames} ${student.lastNames}`.toLocaleLowerCase('es').includes(value),
    )
  }, [query, students])

  const handleSave = async (values: StudentForm) => {
    setBusy(true)
    setError('')
    try {
      if (editing) await updateStudent(editing.studentId, values)
      else await addStudentToSection(section.id, values)
      setFormOpen(false)
      setNotice(editing ? 'Datos del alumno actualizados en todas sus secciones.' : 'Alumno agregado a la sección.')
      await load()
    } catch (caught) { setError(friendlyError(caught)) }
    finally { setBusy(false) }
  }

  const handleRemove = async () => {
    if (!removing) return
    setBusy(true)
    try {
      await archiveStudentEnrollment(removing.id)
      setRemoving(null)
      setNotice('Alumno desvinculado de la sección. Su historial se conserva.')
      await load()
    } catch (caught) { setError(friendlyError(caught)) }
    finally { setBusy(false) }
  }

  if (loading) return <LoadingState label="Cargando alumnos…" />
  return (
    <section aria-labelledby="students-title">
      <header className="content-heading">
        <div><h2 id="students-title">Alumnos</h2><p>Matrícula activa de esta sección.</p></div>
        <button className="button button-primary" type="button" onClick={() => { setEditing(null); setFormOpen(true) }}>Agregar alumno</button>
      </header>
      {error ? <Alert tone="error">{error}</Alert> : null}
      {notice ? <Alert tone="success">{notice}</Alert> : null}
      {students.length > 0 ? (
        <div className="toolbar">
          <label className="search-field"><span className="sr-only">Buscar alumnos</span><input type="search" placeholder="Buscar por código o nombre" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
          <span className="result-count">{filtered.length} {filtered.length === 1 ? 'alumno' : 'alumnos'}</span>
        </div>
      ) : null}
      {students.length === 0 ? (
        <EmptyState title="No hay alumnos matriculados" description="Agrega alumnos para crear participaciones individuales y organizar grupos." />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Código</th><th>Apellidos</th><th>Nombres</th><th><span className="sr-only">Acciones</span></th></tr></thead>
            <tbody>
              {filtered.map((student) => (
                <tr key={student.id}>
                  <td className="mono-cell">{student.studentCode}</td><td>{student.lastNames}</td><td>{student.firstNames}</td>
                  <td className="table-actions">
                    <button className="button button-tertiary" onClick={() => { setEditing(student); setFormOpen(true) }}>Editar</button>
                    <button className="button button-tertiary button-text-danger" onClick={() => setRemoving(student)}>Quitar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <StudentFormModal open={formOpen} initial={editing} busy={busy} onClose={() => setFormOpen(false)} onSubmit={handleSave} />
      <ConfirmDialog open={Boolean(removing)} title="Quitar alumno de la sección" description="El alumno saldrá de su grupo y de la matrícula activa. Sus puntuaciones históricas se conservarán." confirmLabel="Quitar alumno" busy={busy} onClose={() => setRemoving(null)} onConfirm={handleRemove} />
    </section>
  )
}

function StudentFormModal({ open, initial, busy, onClose, onSubmit }: {
  open: boolean; initial: StudentEnrollment | null; busy: boolean; onClose: () => void; onSubmit: (values: StudentForm) => Promise<void>
}) {
  const [values, setValues] = useState<StudentForm>({ studentCode: '', firstNames: '', lastNames: '' })
  useEffect(() => {
    if (!open) return
    setValues(initial ? { studentCode: initial.studentCode, firstNames: initial.firstNames, lastNames: initial.lastNames } : { studentCode: '', firstNames: '', lastNames: '' })
  }, [open, initial])
  const submit = (event: FormEvent) => { event.preventDefault(); void onSubmit(values) }
  const change = (field: keyof StudentForm, value: string) => setValues((current) => ({ ...current, [field]: value }))
  return (
    <Modal open={open} title={initial ? 'Editar alumno' : 'Agregar alumno'} onClose={onClose}>
      <form className="form-stack" onSubmit={submit}>
        <label className="field"><span>Código de alumno</span><input autoFocus value={values.studentCode} onChange={(event) => change('studentCode', event.target.value)} required /></label>
        <label className="field"><span>Nombres</span><input value={values.firstNames} onChange={(event) => change('firstNames', event.target.value)} required /></label>
        <label className="field"><span>Apellidos</span><input value={values.lastNames} onChange={(event) => change('lastNames', event.target.value)} required /></label>
        {!initial ? <p className="field-help">Si el código ya existe en tu cuenta, se reutilizará la ficha del alumno.</p> : null}
        <footer className="modal-actions"><button className="button button-secondary" type="button" onClick={onClose} disabled={busy}>Cancelar</button><button className="button button-primary" type="submit" disabled={busy}>{busy ? 'Guardando…' : 'Guardar'}</button></footer>
      </form>
    </Modal>
  )
}
