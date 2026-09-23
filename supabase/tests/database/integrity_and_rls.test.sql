begin;

select plan(22);

select has_table('public', 'courses', 'courses exists');
select has_table('public', 'sections', 'sections exists');
select has_table('public', 'students', 'students exists');
select has_table('public', 'section_students', 'section_students exists');
select has_table('public', 'groups', 'groups exists');
select has_table('public', 'group_memberships', 'group_memberships exists');
select has_table('public', 'participation_records', 'participation_records exists');
select has_table('public', 'student_participation_scores', 'student scores exist');
select has_table('public', 'group_participation_scores', 'group scores exist');

insert into auth.users(id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-0000-0000-0000000000a1', 'authenticated', 'authenticated', 'owner-a@example.com', '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-0000000000b2', 'authenticated', 'authenticated', 'owner-b@example.com', '{}'::jsonb, '{}'::jsonb, now(), now());

insert into public.courses(id, owner_id, name) values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-0000000000a1', 'Física I'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-0000000000b2', 'Física I');

insert into public.sections(id, owner_id, course_id, label) values
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-0000000000a1', '10000000-0000-0000-0000-000000000001', '701'),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-0000000000a1', '10000000-0000-0000-0000-000000000001', '702');

select throws_ok(
  $$insert into public.sections(owner_id, course_id, label) values ('00000000-0000-0000-0000-0000000000a1', '10000000-0000-0000-0000-000000000001', ' 701 ')$$,
  '23505', null, 'course and normalized section are unique per owner'
);

insert into public.students(id, owner_id, student_code, first_names, last_names) values
  ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-0000000000a1', '20260001', 'Ana', 'Torres'),
  ('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-0000000000a1', '20260002', 'Luis', 'Ramos');

select throws_ok(
  $$insert into public.students(owner_id, student_code, first_names, last_names) values ('00000000-0000-0000-0000-0000000000a1', ' 20260001 ', 'Otra', 'Persona')$$,
  '23505', null, 'student code is normalized and unique per owner'
);

insert into public.section_students(id, owner_id, section_id, student_id) values
  ('40000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-0000000000a1', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-0000000000a1', '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002');

select throws_ok(
  $$insert into public.section_students(owner_id, section_id, student_id) values ('00000000-0000-0000-0000-0000000000a1', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001')$$,
  '23505', null, 'student cannot be enrolled twice in the same section'
);

insert into public.groups(id, owner_id, section_id, name) values
  ('50000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-0000000000a1', '20000000-0000-0000-0000-000000000001', 'Grupo A'),
  ('50000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-0000000000a1', '20000000-0000-0000-0000-000000000001', 'Grupo B'),
  ('50000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-0000000000a1', '20000000-0000-0000-0000-000000000002', 'Grupo 702');

insert into public.group_memberships(owner_id, section_id, group_id, section_student_id)
values ('00000000-0000-0000-0000-0000000000a1', '20000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001');

select throws_ok(
  $$insert into public.group_memberships(owner_id, section_id, group_id, section_student_id) values ('00000000-0000-0000-0000-0000000000a1', '20000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001')$$,
  '23505', null, 'student can belong to only one group per section'
);

select throws_ok(
  $$insert into public.group_memberships(owner_id, section_id, group_id, section_student_id) values ('00000000-0000-0000-0000-0000000000a1', '20000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002')$$,
  'P0001', 'The student is not actively enrolled in this section', 'student from another section cannot join a group'
);

insert into public.participation_records(id, owner_id, section_id, type, occurred_at) values
  ('60000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-0000000000a1', '20000000-0000-0000-0000-000000000001', 'individual', now()),
  ('60000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-0000000000a1', '20000000-0000-0000-0000-000000000001', 'group', now());

select throws_ok(
  $$insert into public.student_participation_scores(owner_id, section_id, record_id, section_student_id, opportunity_number, points) values ('00000000-0000-0000-0000-0000000000a1', '20000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 13, 1)$$,
  '23514', null, 'opportunity must be between 1 and 12'
);

select throws_ok(
  $$insert into public.student_participation_scores(owner_id, section_id, record_id, section_student_id, opportunity_number, points) values ('00000000-0000-0000-0000-0000000000a1', '20000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 1, 4)$$,
  '23514', null, 'points must be between 1 and 3'
);

select throws_ok(
  $$insert into public.student_participation_scores(owner_id, section_id, record_id, section_student_id, opportunity_number, points) values ('00000000-0000-0000-0000-0000000000a1', '20000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002', 1, 2)$$,
  '23503', null, 'individual score student must belong to record section'
);

select throws_ok(
  $$insert into public.group_participation_scores(owner_id, section_id, record_id, group_id, opportunity_number, points) values ('00000000-0000-0000-0000-0000000000a1', '20000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000003', 1, 2)$$,
  '23503', null, 'group score group must belong to record section'
);

set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}';

select results_eq(
  $$select count(*)::bigint from public.courses$$,
  array[1::bigint],
  'user A can read only their course'
);
select results_eq(
  $$update public.courses set name = 'Forbidden update' where id = '10000000-0000-0000-0000-000000000002' returning id$$,
  array[]::uuid[],
  'user A cannot update user B data'
);
select results_eq(
  $$delete from public.courses where id = '10000000-0000-0000-0000-000000000002' returning id$$,
  array[]::uuid[],
  'user A cannot delete user B data'
);
select throws_ok(
  $$insert into public.courses(owner_id, name) values ('00000000-0000-0000-0000-0000000000b2', 'Foreign course')$$,
  '42501', null, 'user A cannot insert data for user B'
);

select * from finish();
rollback;
