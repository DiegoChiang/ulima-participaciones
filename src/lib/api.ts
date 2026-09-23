import { supabase } from './supabase'
import type {
  GroupSummary,
  MatrixEntity,
  ParticipationRecord,
  ParticipationType,
  PersistedScore,
  ScorePayload,
  SectionSummary,
  StudentEnrollment,
} from './types'

async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  if (!data.user) throw new Error('Authentication required')
  return data.user.id
}

export async function listSections(): Promise<SectionSummary[]> {
  const { data, error } = await supabase
    .from('sections')
    .select('id, course_id, label, created_at, courses!inner(name)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map((row) => {
    const typed = row as unknown as {
      id: string
      course_id: string
      label: string
      created_at: string
      courses: { name: string } | { name: string }[]
    }
    const course = Array.isArray(typed.courses) ? typed.courses[0] : typed.courses
    return {
      id: typed.id,
      courseId: typed.course_id,
      courseName: course.name,
      label: typed.label,
      createdAt: typed.created_at,
    }
  })
}

export async function getSection(sectionId: string): Promise<SectionSummary> {
  const { data, error } = await supabase
    .from('sections')
    .select('id, course_id, label, created_at, courses!inner(name)')
    .eq('id', sectionId)
    .single()
  if (error) throw error
  const typed = data as unknown as {
    id: string
    course_id: string
    label: string
    created_at: string
    courses: { name: string } | { name: string }[]
  }
  const course = Array.isArray(typed.courses) ? typed.courses[0] : typed.courses
  return { id: typed.id, courseId: typed.course_id, courseName: course.name, label: typed.label, createdAt: typed.created_at }
}

export async function createSection(courseName: string, sectionLabel: string): Promise<string> {
  const { data, error } = await supabase.rpc('create_course_section', {
    p_course_name: courseName,
    p_section_label: sectionLabel,
  })
  if (error) throw error
  return data as string
}

export async function updateSection(sectionId: string, courseName: string, sectionLabel: string): Promise<void> {
  const { error } = await supabase.rpc('edit_course_section', {
    p_section_id: sectionId,
    p_course_name: courseName,
    p_section_label: sectionLabel,
  })
  if (error) throw error
}

export async function deleteSection(sectionId: string): Promise<void> {
  const { error } = await supabase.rpc('delete_section_and_orphan_course', { p_section_id: sectionId })
  if (error) throw error
}

export async function listStudents(sectionId: string): Promise<StudentEnrollment[]> {
  const { data, error } = await supabase
    .from('section_students')
    .select('id, student_id, students!inner(student_code, first_names, last_names)')
    .eq('section_id', sectionId)
    .is('archived_at', null)
    .order('created_at')
  if (error) throw error
  return (data ?? []).map((row) => {
    const typed = row as unknown as {
      id: string
      student_id: string
      students: { student_code: string; first_names: string; last_names: string } | Array<{ student_code: string; first_names: string; last_names: string }>
    }
    const student = Array.isArray(typed.students) ? typed.students[0] : typed.students
    return {
      id: typed.id,
      studentId: typed.student_id,
      studentCode: student.student_code,
      firstNames: student.first_names,
      lastNames: student.last_names,
    }
  })
}

export async function addStudentToSection(
  sectionId: string,
  student: { studentCode: string; firstNames: string; lastNames: string },
): Promise<string> {
  const { data, error } = await supabase.rpc('upsert_section_student', {
    p_section_id: sectionId,
    p_student_code: student.studentCode,
    p_first_names: student.firstNames,
    p_last_names: student.lastNames,
  })
  if (error) throw error
  return data as string
}

export async function updateStudent(
  studentId: string,
  student: { studentCode: string; firstNames: string; lastNames: string },
): Promise<void> {
  const { error } = await supabase
    .from('students')
    .update({
      student_code: student.studentCode.trim(),
      first_names: student.firstNames.trim(),
      last_names: student.lastNames.trim(),
    })
    .eq('id', studentId)
  if (error) throw error
}

export async function archiveStudentEnrollment(enrollmentId: string): Promise<void> {
  const { error } = await supabase.rpc('archive_section_student', { p_section_student_id: enrollmentId })
  if (error) throw error
}

export async function listGroups(sectionId: string): Promise<GroupSummary[]> {
  const [groupsResult, membershipsResult] = await Promise.all([
    supabase.from('groups').select('id, name').eq('section_id', sectionId).is('archived_at', null).order('created_at'),
    supabase.from('group_memberships').select('group_id, section_student_id').eq('section_id', sectionId),
  ])
  if (groupsResult.error) throw groupsResult.error
  if (membershipsResult.error) throw membershipsResult.error
  const memberships = (membershipsResult.data ?? []) as Array<{ group_id: string; section_student_id: string }>
  return ((groupsResult.data ?? []) as Array<{ id: string; name: string }>).map((group) => ({
    id: group.id,
    name: group.name,
    memberEnrollmentIds: memberships.filter((item) => item.group_id === group.id).map((item) => item.section_student_id),
  }))
}

export async function createGroup(sectionId: string, name: string): Promise<void> {
  const ownerId = await requireUserId()
  const { error } = await supabase.from('groups').insert({ owner_id: ownerId, section_id: sectionId, name: name.trim() })
  if (error) throw error
}

export async function renameGroup(groupId: string, name: string): Promise<void> {
  const { error } = await supabase.from('groups').update({ name: name.trim() }).eq('id', groupId)
  if (error) throw error
}

export async function archiveGroup(groupId: string): Promise<void> {
  const { error } = await supabase.rpc('archive_group', { p_group_id: groupId })
  if (error) throw error
}

export async function setGroupMembership(
  sectionId: string,
  groupId: string,
  enrollmentId: string,
): Promise<void> {
  const ownerId = await requireUserId()
  const { error } = await supabase.from('group_memberships').upsert(
    { owner_id: ownerId, section_id: sectionId, group_id: groupId, section_student_id: enrollmentId },
    { onConflict: 'section_id,section_student_id' },
  )
  if (error) throw error
}

export async function removeGroupMembership(sectionId: string, enrollmentId: string): Promise<void> {
  const { error } = await supabase
    .from('group_memberships')
    .delete()
    .eq('section_id', sectionId)
    .eq('section_student_id', enrollmentId)
  if (error) throw error
}

export async function listParticipationRecords(sectionId: string, type: ParticipationType): Promise<ParticipationRecord[]> {
  const { data, error } = await supabase
    .from('participation_records')
    .select('id, occurred_at, created_at, updated_at')
    .eq('section_id', sectionId)
    .eq('type', type)
    .order('occurred_at', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) throw error
  return ((data ?? []) as Array<{ id: string; occurred_at: string; created_at: string; updated_at: string }>).map((record) => ({
    id: record.id,
    occurredAt: record.occurred_at,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  }))
}

export async function getParticipationRecord(recordId: string): Promise<ParticipationRecord> {
  const { data, error } = await supabase
    .from('participation_records')
    .select('id, occurred_at, created_at, updated_at')
    .eq('id', recordId)
    .single()
  if (error) throw error
  const record = data as { id: string; occurred_at: string; created_at: string; updated_at: string }
  return { id: record.id, occurredAt: record.occurred_at, createdAt: record.created_at, updatedAt: record.updated_at }
}

export async function listMatrixEntities(sectionId: string, type: ParticipationType): Promise<MatrixEntity[]> {
  if (type === 'individual') {
    const students = await listStudents(sectionId)
    return students.map((student) => ({
      id: student.id,
      label: `${student.lastNames}, ${student.firstNames}`,
      detail: student.studentCode,
    }))
  }
  const groups = await listGroups(sectionId)
  return groups.map((group) => ({ id: group.id, label: group.name }))
}

export async function getParticipationScores(recordId: string, type: ParticipationType): Promise<PersistedScore[]> {
  const table = type === 'individual' ? 'student_participation_scores' : 'group_participation_scores'
  const entityColumn = type === 'individual' ? 'section_student_id' : 'group_id'
  const { data, error } = await supabase
    .from(table)
    .select(`${entityColumn}, opportunity_number, points`)
    .eq('record_id', recordId)
  if (error) throw error
  return ((data ?? []) as unknown as Array<Record<string, string | number>>).map((score) => ({
    entityId: String(score[entityColumn]),
    opportunityNumber: Number(score.opportunity_number),
    points: Number(score.points),
  }))
}

export async function saveParticipationRecord(input: {
  recordId?: string
  sectionId: string
  type: ParticipationType
  occurredAt: string
  scores: ScorePayload[]
}): Promise<string> {
  const { data, error } = await supabase.rpc('save_participation_record', {
    p_record_id: input.recordId ?? null,
    p_section_id: input.sectionId,
    p_type: input.type,
    p_occurred_at: input.occurredAt,
    p_scores: input.scores,
  })
  if (error) throw error
  return data as string
}

export async function deleteParticipationRecord(recordId: string): Promise<void> {
  const { error } = await supabase.from('participation_records').delete().eq('id', recordId)
  if (error) throw error
}
