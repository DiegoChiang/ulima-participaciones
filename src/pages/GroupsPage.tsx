import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { Alert } from '../components/Alert'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { EmptyState } from '../components/EmptyState'
import { LoadingState } from '../components/LoadingState'
import { Modal } from '../components/Modal'
import { archiveGroup, createGroup, listGroups, listStudents, removeGroupMembership, renameGroup, setGroupMembership } from '../lib/api'
import { friendlyError } from '../lib/errors'
import type { GroupSummary, StudentEnrollment } from '../lib/types'
import { useSection } from '../layout/SectionLayout'

export function GroupsPage() {
  const { section } = useSection()
  const [groups, setGroups] = useState<GroupSummary[]>([])
  const [students, setStudents] = useState<StudentEnrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<GroupSummary | null>(null)
  const [removing, setRemoving] = useState<GroupSummary | null>(null)
  const [busy, setBusy] = useState(false)
  const [changingStudent, setChangingStudent] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [nextGroups, nextStudents] = await Promise.all([listGroups(section.id), listStudents(section.id)])
      setGroups(nextGroups)
      setStudents(nextStudents)
    } catch (caught) { setError(friendlyError(caught)) }
    finally { setLoading(false) }
  }, [section.id])
  useEffect(() => { void load() }, [load])

  const membershipByStudent = useMemo(() => {
    const map = new Map<string, string>()
    groups.forEach((group) => group.memberEnrollmentIds.forEach((studentId) => map.set(studentId, group.id)))
    return map
  }, [groups])

  const handleSave = async (name: string) => {
    setBusy(true)
    try {
      if (editing) await renameGroup(editing.id, name)
      else await createGroup(section.id, name)
      setFormOpen(false)
      setNotice(editing ? 'Grupo renombrado.' : 'Grupo creado.')
      await load()
    } catch (caught) { setError(friendlyError(caught)) }
    finally { setBusy(false) }
  }

  const handleArchive = async () => {
    if (!removing) return
    setBusy(true)
    try {
      await archiveGroup(removing.id)
      setRemoving(null)
      setNotice('Grupo eliminado de la sección. Sus participaciones históricas se conservan.')
      await load()
    } catch (caught) { setError(friendlyError(caught)) }
    finally { setBusy(false) }
  }

  const handleMembership = async (studentId: string, groupId: string) => {
    setChangingStudent(studentId)
    setError('')
    try {
      if (groupId) await setGroupMembership(section.id, groupId, studentId)
      else await removeGroupMembership(section.id, studentId)
      setNotice(groupId ? 'Asignación de grupo actualizada.' : 'Alumno retirado del grupo.')
      await load()
    } catch (caught) { setError(friendlyError(caught)) }
    finally { setChangingStudent(null) }
  }

  if (loading) return <LoadingState label="Cargando grupos…" />
  return (
    <section aria-labelledby="groups-title">
      <header className="content-heading">
        <div><h2 id="groups-title">Grupos</h2><p>Cada alumno puede integrar un solo grupo en esta sección.</p></div>
        <button className="button button-primary" type="button" onClick={() => { setEditing(null); setFormOpen(true) }}>Crear grupo</button>
      </header>
      {error ? <Alert tone="error">{error}</Alert> : null}
      {notice ? <Alert tone="success">{notice}</Alert> : null}
      {groups.length === 0 ? (
        <EmptyState title="Aún no hay grupos" description="Crea un grupo y luego asigna alumnos de la sección." />
      ) : (
        <div className="group-summary-grid">
          {groups.map((group) => (
            <article className="group-card" key={group.id}>
              <div><p className="group-name">{group.name}</p><p>{group.memberEnrollmentIds.length} {group.memberEnrollmentIds.length === 1 ? 'integrante' : 'integrantes'}</p></div>
              <div className="row-actions"><button className="button button-tertiary" onClick={() => { setEditing(group); setFormOpen(true) }}>Renombrar</button><button className="button button-tertiary button-text-danger" onClick={() => setRemoving(group)}>Eliminar</button></div>
            </article>
          ))}
        </div>
      )}
      <div className="subsection-heading"><h3>Asignación de alumnos</h3><p>Mueve alumnos eligiendo otro grupo o selecciona “Sin grupo”.</p></div>
      {students.length === 0 ? (
        <EmptyState title="No hay alumnos disponibles" description="Agrega alumnos desde la pestaña Alumnos antes de asignarlos a grupos." />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Alumno</th><th>Código</th><th>Grupo</th></tr></thead>
            <tbody>{students.map((student) => (
              <tr key={student.id}>
                <td>{student.lastNames}, {student.firstNames}</td><td className="mono-cell">{student.studentCode}</td>
                <td>
                  <select
                    aria-label={`Grupo de ${student.firstNames} ${student.lastNames}`}
                    value={membershipByStudent.get(student.id) ?? ''}
                    onChange={(event) => void handleMembership(student.id, event.target.value)}
                    disabled={changingStudent === student.id}
                  >
                    <option value="">Sin grupo</option>
                    {groups.map((group) => <option value={group.id} key={group.id}>{group.name}</option>)}
                  </select>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
      <GroupFormModal open={formOpen} initialName={editing?.name ?? ''} busy={busy} onClose={() => setFormOpen(false)} onSubmit={handleSave} />
      <ConfirmDialog open={Boolean(removing)} title="Eliminar grupo" description="El grupo dejará de estar activo y sus alumnos quedarán sin grupo. Las participaciones históricas se conservarán." confirmLabel="Eliminar grupo" busy={busy} onClose={() => setRemoving(null)} onConfirm={handleArchive} />
    </section>
  )
}

function GroupFormModal({ open, initialName, busy, onClose, onSubmit }: { open: boolean; initialName: string; busy: boolean; onClose: () => void; onSubmit: (name: string) => Promise<void> }) {
  const [name, setName] = useState('')
  useEffect(() => { if (open) setName(initialName) }, [open, initialName])
  const submit = (event: FormEvent) => { event.preventDefault(); void onSubmit(name.trim()) }
  return (
    <Modal open={open} title={initialName ? 'Renombrar grupo' : 'Crear grupo'} onClose={onClose}>
      <form className="form-stack" onSubmit={submit}>
        <label className="field"><span>Nombre del grupo</span><input autoFocus value={name} onChange={(event) => setName(event.target.value)} required /></label>
        <footer className="modal-actions"><button className="button button-secondary" type="button" onClick={onClose} disabled={busy}>Cancelar</button><button className="button button-primary" type="submit" disabled={busy}>{busy ? 'Guardando…' : 'Guardar'}</button></footer>
      </form>
    </Modal>
  )
}
