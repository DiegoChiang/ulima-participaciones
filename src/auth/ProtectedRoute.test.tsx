import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { ProtectedRoute } from './ProtectedRoute'

const authState = vi.hoisted(() => ({ session: null as object | null, loading: false }))
vi.mock('./AuthContext', () => ({ useAuth: () => authState }))

describe('ProtectedRoute', () => {
  it('redirects unauthenticated visitors to login', () => {
    authState.session = null
    render(<MemoryRouter initialEntries={['/private']}><Routes><Route path="/login" element={<p>Acceso</p>} /><Route element={<ProtectedRoute />}><Route path="/private" element={<p>Privado</p>} /></Route></Routes></MemoryRouter>)
    expect(screen.getByText('Acceso')).toBeInTheDocument()
  })

  it('renders private content for an authenticated session', () => {
    authState.session = { user: { id: 'one' } }
    render(<MemoryRouter initialEntries={['/private']}><Routes><Route path="/login" element={<p>Acceso</p>} /><Route element={<ProtectedRoute />}><Route path="/private" element={<p>Privado</p>} /></Route></Routes></MemoryRouter>)
    expect(screen.getByText('Privado')).toBeInTheDocument()
  })
})
