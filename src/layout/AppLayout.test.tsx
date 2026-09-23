import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AppLayout } from './AppLayout'

const signOut = vi.hoisted(() => vi.fn())
vi.mock('../auth/AuthContext', () => ({ useAuth: () => ({ user: { email: 'docente@example.com' }, signOut }) }))

describe('AppLayout', () => {
  it('logs out from the application header', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><AppLayout /></MemoryRouter>)
    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }))
    expect(signOut).toHaveBeenCalledOnce()
  })
})
