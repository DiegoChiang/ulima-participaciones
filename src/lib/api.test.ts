import { beforeEach, describe, expect, it, vi } from 'vitest'
import { deleteParticipationRecord, saveParticipationRecord } from './api'

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
  eq: vi.fn(),
  delete: vi.fn(),
  from: vi.fn(),
}))
vi.mock('./supabase', () => ({ supabase: { rpc: mocks.rpc, from: mocks.from } }))

describe('participation persistence service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.rpc.mockResolvedValue({ data: 'record-id', error: null })
    mocks.eq.mockResolvedValue({ error: null })
    mocks.delete.mockReturnValue({ eq: mocks.eq })
    mocks.from.mockReturnValue({ delete: mocks.delete })
  })

  it.each([
    ['individual', undefined, 'creates an individual record'],
    ['individual', 'existing-id', 'edits an individual record'],
    ['group', undefined, 'creates a group record'],
    ['group', 'existing-id', 'edits a group record'],
  ] as const)('%s: %s', async (type, recordId, description) => {
    expect(description).toBeTruthy()
    const result = await saveParticipationRecord({
      recordId,
      sectionId: 'section-id',
      type,
      occurredAt: '2026-09-23T10:00:00.000Z',
      scores: [{ entity_id: 'entity-id', opportunity_number: 12, points: 3 }],
    })
    expect(result).toBe('record-id')
    expect(mocks.rpc).toHaveBeenCalledWith('save_participation_record', expect.objectContaining({
      p_record_id: recordId ?? null,
      p_type: type,
      p_scores: [{ entity_id: 'entity-id', opportunity_number: 12, points: 3 }],
    }))
  })

  it.each(['individual record', 'group record'])('deletes a %s and relies on database score cascades', async () => {
    await deleteParticipationRecord('record-id')
    expect(mocks.from).toHaveBeenCalledWith('participation_records')
    expect(mocks.delete).toHaveBeenCalledOnce()
    expect(mocks.eq).toHaveBeenCalledWith('id', 'record-id')
  })
})
