import { useMemo } from 'react'
import { entityTotal, OPPORTUNITIES, scoreKey } from '../lib/scores'
import type { MatrixEntity } from '../lib/types'
import { ScoreCell } from './ScoreCell'

export function ParticipationMatrix({ entities, scores, onScoresChange }: {
  entities: MatrixEntity[]
  scores: Map<string, number>
  onScoresChange: (scores: Map<string, number>) => void
}) {
  const totals = useMemo(() => new Map(entities.map((entity) => [entity.id, entityTotal(entity.id, scores)])), [entities, scores])
  const change = (entityId: string, opportunity: number, value: number) => {
    const next = new Map(scores)
    const key = scoreKey(entityId, opportunity)
    if (value === 0) next.delete(key)
    else next.set(key, value)
    onScoresChange(next)
  }

  return (
    <div className="matrix-frame" tabIndex={0} aria-label="Matriz de doce oportunidades; desplázate horizontalmente para ver todas las columnas">
      <table className="participation-matrix">
        <thead>
          <tr>
            <th className="matrix-entity-column">Alumno o grupo</th>
            {OPPORTUNITIES.map((opportunity) => <th className="matrix-opportunity" key={opportunity} scope="col">{opportunity}</th>)}
            <th className="matrix-total" scope="col">Total</th>
          </tr>
        </thead>
        <tbody>
          {entities.map((entity) => (
            <tr key={entity.id}>
              <th className="matrix-entity-column" scope="row">
                <span>{entity.label}</span>{entity.detail ? <small>{entity.detail}</small> : null}
              </th>
              {OPPORTUNITIES.map((opportunity) => {
                const value = scores.get(scoreKey(entity.id, opportunity)) ?? 0
                return <td key={opportunity}><ScoreCell entityLabel={entity.label} opportunity={opportunity} value={value} onChange={(next) => change(entity.id, opportunity, next)} /></td>
              })}
              <td className="matrix-total-value">{totals.get(entity.id)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
