import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ScoreCell } from './ScoreCell'

describe('ScoreCell', () => {
  it('is keyboard operable and exposes the current score', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ScoreCell entityLabel="Ana Torres" opportunity={2} value={2} onChange={onChange} />)
    const button = screen.getByRole('button', { name: 'Ana Torres, oportunidad 2: 2 puntos' })
    button.focus()
    await user.keyboard('{Enter}')
    expect(onChange).toHaveBeenCalledWith(3)
    expect(button).toHaveTextContent('✓✓')
  })

  it('returns to zero after three points', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ScoreCell entityLabel="Grupo A" opportunity={12} value={3} onChange={onChange} />)
    await user.click(screen.getByRole('button'))
    expect(onChange).toHaveBeenCalledWith(0)
  })
})
