import { nextPoints } from '../lib/scores'

export function ScoreCell({ entityLabel, opportunity, value, onChange }: {
  entityLabel: string
  opportunity: number
  value: number
  onChange: (value: number) => void
}) {
  const label = `${entityLabel}, oportunidad ${opportunity}: ${value} ${value === 1 ? 'punto' : 'puntos'}`
  return (
    <button
      className={`score-cell score-${value}`}
      type="button"
      aria-label={label}
      title={`${value}/3 puntos`}
      onClick={() => onChange(nextPoints(value))}
    >
      <span aria-hidden="true">{value === 0 ? '' : '✓'.repeat(value)}</span>
    </button>
  )
}
