import type { PersistedScore, ScorePayload } from './types'

export const OPPORTUNITIES = Array.from({ length: 12 }, (_, index) => index + 1)

export function nextPoints(current: number): number {
  if (!Number.isInteger(current) || current < 0 || current > 3) return 0
  return current === 3 ? 0 : current + 1
}

export function scoreKey(entityId: string, opportunityNumber: number): string {
  return `${entityId}:${opportunityNumber}`
}

export function scoresToMap(scores: PersistedScore[]): Map<string, number> {
  return new Map(scores.map((score) => [scoreKey(score.entityId, score.opportunityNumber), score.points]))
}

export function scoresToPayload(scores: Map<string, number>): ScorePayload[] {
  const payload: ScorePayload[] = []
  scores.forEach((points, key) => {
    if (points < 1 || points > 3) return
    const separator = key.lastIndexOf(':')
    payload.push({
      entity_id: key.slice(0, separator),
      opportunity_number: Number(key.slice(separator + 1)),
      points,
    })
  })
  return payload
}

export function entityTotal(entityId: string, scores: Map<string, number>): number {
  return OPPORTUNITIES.reduce(
    (total, opportunity) => total + (scores.get(scoreKey(entityId, opportunity)) ?? 0),
    0,
  )
}

export function toLocalDateTimeInput(isoValue: string): string {
  const date = new Date(isoValue)
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}
