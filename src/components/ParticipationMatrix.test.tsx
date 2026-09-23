import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ParticipationMatrix } from './ParticipationMatrix'

describe('ParticipationMatrix', () => {
  it('renders exactly twelve opportunities and a calculated total', () => {
    render(
      <ParticipationMatrix
        entities={[{ id: 'one', label: 'Alumno Uno', detail: '20260001' }]}
        scores={new Map([['one:1', 2], ['one:12', 3]])}
        onScoresChange={vi.fn()}
      />,
    )
    expect(screen.getAllByRole('columnheader')).toHaveLength(14)
    expect(screen.getByRole('button', { name: /oportunidad 12: 3 puntos/ })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: '5' })).toBeInTheDocument()
  })
})
