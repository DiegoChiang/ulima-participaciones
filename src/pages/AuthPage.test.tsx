import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AuthPage } from './AuthPage'

const signIn = vi.hoisted(() => vi.fn())
const signUp = vi.hoisted(() => vi.fn())
vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({ session: null, signIn, signUp }),
}))
vi.mock('../lib/supabase', () => ({ isSupabaseConfigured: true }))

describe('AuthPage', () => {
  it('submits email and password login', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><AuthPage mode="login" /></MemoryRouter>)
    await user.type(screen.getByLabelText('Correo electrónico'), 'docente@example.com')
    await user.type(screen.getByLabelText('Contraseña'), 'secure-pass')
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))
    expect(signIn).toHaveBeenCalledWith('docente@example.com', 'secure-pass')
  })

  it('submits email and password registration', async () => {
    signUp.mockResolvedValue(true)
    const user = userEvent.setup()
    render(<MemoryRouter><AuthPage mode="register" /></MemoryRouter>)
    await user.type(screen.getByLabelText('Correo electrónico'), 'nuevo@example.com')
    await user.type(screen.getByLabelText('Contraseña'), 'secure-pass')
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))
    expect(signUp).toHaveBeenCalledWith('nuevo@example.com', 'secure-pass')
    expect(await screen.findByText(/Cuenta creada/)).toBeInTheDocument()
  })
})
