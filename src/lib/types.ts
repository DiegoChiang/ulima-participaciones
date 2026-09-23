export type ParticipationType = 'individual' | 'group'

export interface SectionSummary {
  id: string
  courseId: string
  courseName: string
  label: string
  createdAt: string
}

export interface StudentEnrollment {
  id: string
  studentId: string
  studentCode: string
  firstNames: string
  lastNames: string
}

export interface GroupSummary {
  id: string
  name: string
  memberEnrollmentIds: string[]
}

export interface ParticipationRecord {
  id: string
  occurredAt: string
  createdAt: string
  updatedAt: string
}

export interface MatrixEntity {
  id: string
  label: string
  detail?: string
}

export interface PersistedScore {
  entityId: string
  opportunityNumber: number
  points: number
}

export interface ScorePayload {
  entity_id: string
  opportunity_number: number
  points: number
}
