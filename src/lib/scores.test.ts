import { describe, expect, it } from 'vitest'
import { entityTotal, nextPoints, scoreKey, scoresToMap, scoresToPayload } from './scores'

describe('participation score helpers', () => {
  it('cycles exactly from 0 to 1 to 2 to 3 to 0', () => {
    expect(nextPoints(0)).toBe(1)
    expect(nextPoints(1)).toBe(2)
    expect(nextPoints(2)).toBe(3)
    expect(nextPoints(3)).toBe(0)
  })

  it('serializes only non-zero scores and preserves all twelve opportunity positions', () => {
    const scores = new Map<string, number>([
      [scoreKey('student-a', 1), 2],
      [scoreKey('student-a', 12), 3],
      [scoreKey('student-a', 6), 0],
    ])
    expect(scoresToPayload(scores)).toEqual([
      { entity_id: 'student-a', opportunity_number: 1, points: 2 },
      { entity_id: 'student-a', opportunity_number: 12, points: 3 },
    ])
    expect(entityTotal('student-a', scores)).toBe(5)
  })

  it('reconstructs persisted score state', () => {
    const mapped = scoresToMap([{ entityId: 'group-a', opportunityNumber: 4, points: 3 }])
    expect(mapped.get('group-a:4')).toBe(3)
  })
})
