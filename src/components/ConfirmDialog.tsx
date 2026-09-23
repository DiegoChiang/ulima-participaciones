import { Modal } from './Modal'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  busy?: boolean
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmDialog({ open, title, description, confirmLabel = 'Eliminar', busy, onConfirm, onClose }: ConfirmDialogProps) {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <p className="modal-description">{description}</p>
      <footer className="modal-actions">
        <button className="button button-secondary" type="button" onClick={onClose} disabled={busy}>Cancelar</button>
        <button className="button button-danger" type="button" onClick={onConfirm} disabled={busy}>
          {busy ? 'Procesando…' : confirmLabel}
        </button>
      </footer>
    </Modal>
  )
}
