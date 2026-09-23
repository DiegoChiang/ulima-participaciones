-- Normalized, multi-tenant schema for academic participation tracking.
-- Zero-point cells are intentionally represented by the absence of a score row.

create type public.participation_type as enum ('individual', 'group');

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete restrict,
  name text not null check (btrim(name) <> ''),
  normalized_name text generated always as (lower(btrim(name))) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint courses_id_owner_key unique (id, owner_id),
  constraint courses_owner_normalized_name_key unique (owner_id, normalized_name)
);

create table public.sections (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  course_id uuid not null,
  label text not null check (btrim(label) <> ''),
  normalized_label text generated always as (lower(btrim(label))) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sections_id_owner_key unique (id, owner_id),
  constraint sections_course_label_key unique (course_id, normalized_label),
  constraint sections_course_owner_fkey foreign key (course_id, owner_id)
    references public.courses(id, owner_id) on delete restrict
);

create table public.students (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete restrict,
  student_code text not null check (btrim(student_code) <> ''),
  normalized_student_code text generated always as (lower(btrim(student_code))) stored,
  first_names text not null check (btrim(first_names) <> ''),
  last_names text not null check (btrim(last_names) <> ''),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint students_id_owner_key unique (id, owner_id),
  constraint students_owner_code_key unique (owner_id, normalized_student_code)
);

create table public.section_students (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  section_id uuid not null,
  student_id uuid not null,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint section_students_id_section_owner_key unique (id, section_id, owner_id),
  constraint section_students_section_student_key unique (section_id, student_id),
  constraint section_students_section_owner_fkey foreign key (section_id, owner_id)
    references public.sections(id, owner_id) on delete cascade,
  constraint section_students_student_owner_fkey foreign key (student_id, owner_id)
    references public.students(id, owner_id) on delete restrict
);

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  section_id uuid not null,
  name text not null check (btrim(name) <> ''),
  normalized_name text generated always as (lower(btrim(name))) stored,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint groups_id_section_owner_key unique (id, section_id, owner_id),
  constraint groups_section_owner_fkey foreign key (section_id, owner_id)
    references public.sections(id, owner_id) on delete cascade
);

create unique index groups_active_section_name_key
  on public.groups(section_id, normalized_name)
  where archived_at is null;

create table public.group_memberships (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  section_id uuid not null,
  group_id uuid not null,
  section_student_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint group_memberships_section_student_key unique (section_id, section_student_id),
  constraint group_memberships_group_section_owner_fkey foreign key (group_id, section_id, owner_id)
    references public.groups(id, section_id, owner_id) on delete cascade,
  constraint group_memberships_student_section_owner_fkey foreign key (section_student_id, section_id, owner_id)
    references public.section_students(id, section_id, owner_id) on delete cascade
);

create table public.participation_records (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  section_id uuid not null,
  type public.participation_type not null,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint participation_records_identity_key unique (id, section_id, owner_id, type),
  constraint participation_records_section_owner_fkey foreign key (section_id, owner_id)
    references public.sections(id, owner_id) on delete cascade
);

create table public.student_participation_scores (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  section_id uuid not null,
  record_id uuid not null,
  record_type public.participation_type not null default 'individual',
  section_student_id uuid not null,
  opportunity_number smallint not null check (opportunity_number between 1 and 12),
  points smallint not null check (points between 1 and 3),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint student_scores_record_type_check check (record_type = 'individual'),
  constraint student_scores_cell_key unique (record_id, section_student_id, opportunity_number),
  constraint student_scores_record_section_owner_fkey foreign key (record_id, section_id, owner_id, record_type)
    references public.participation_records(id, section_id, owner_id, type) on delete cascade,
  constraint student_scores_student_section_owner_fkey foreign key (section_student_id, section_id, owner_id)
    references public.section_students(id, section_id, owner_id) on delete cascade
);

create table public.group_participation_scores (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  section_id uuid not null,
  record_id uuid not null,
  record_type public.participation_type not null default 'group',
  group_id uuid not null,
  opportunity_number smallint not null check (opportunity_number between 1 and 12),
  points smallint not null check (points between 1 and 3),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint group_scores_record_type_check check (record_type = 'group'),
  constraint group_scores_cell_key unique (record_id, group_id, opportunity_number),
  constraint group_scores_record_section_owner_fkey foreign key (record_id, section_id, owner_id, record_type)
    references public.participation_records(id, section_id, owner_id, type) on delete cascade,
  constraint group_scores_group_section_owner_fkey foreign key (group_id, section_id, owner_id)
    references public.groups(id, section_id, owner_id) on delete cascade
);

-- Every foreign key/filter used by joins, cascades, or RLS has a leading index.
create index sections_owner_idx on public.sections(owner_id);
create index sections_course_idx on public.sections(course_id);
create index students_owner_idx on public.students(owner_id);
create index section_students_owner_idx on public.section_students(owner_id);
create index section_students_student_idx on public.section_students(student_id);
create index section_students_active_section_idx on public.section_students(section_id) where archived_at is null;
create index groups_owner_idx on public.groups(owner_id);
create index groups_section_idx on public.groups(section_id);
create index group_memberships_owner_idx on public.group_memberships(owner_id);
create index group_memberships_group_idx on public.group_memberships(group_id);
create index group_memberships_student_idx on public.group_memberships(section_student_id);
create index participation_records_owner_idx on public.participation_records(owner_id);
create index participation_records_history_idx on public.participation_records(section_id, type, occurred_at desc, created_at desc);
create index student_scores_owner_idx on public.student_participation_scores(owner_id);
create index student_scores_record_idx on public.student_participation_scores(record_id);
create index student_scores_student_idx on public.student_participation_scores(section_student_id);
create index group_scores_owner_idx on public.group_participation_scores(owner_id);
create index group_scores_record_idx on public.group_participation_scores(record_id);
create index group_scores_group_idx on public.group_participation_scores(group_id);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger courses_set_updated_at before update on public.courses
  for each row execute function public.set_updated_at();
create trigger sections_set_updated_at before update on public.sections
  for each row execute function public.set_updated_at();
create trigger students_set_updated_at before update on public.students
  for each row execute function public.set_updated_at();
create trigger section_students_set_updated_at before update on public.section_students
  for each row execute function public.set_updated_at();
create trigger groups_set_updated_at before update on public.groups
  for each row execute function public.set_updated_at();
create trigger group_memberships_set_updated_at before update on public.group_memberships
  for each row execute function public.set_updated_at();
create trigger participation_records_set_updated_at before update on public.participation_records
  for each row execute function public.set_updated_at();
create trigger student_scores_set_updated_at before update on public.student_participation_scores
  for each row execute function public.set_updated_at();
create trigger group_scores_set_updated_at before update on public.group_participation_scores
  for each row execute function public.set_updated_at();

create function public.validate_active_group_membership()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.groups g
    where g.id = new.group_id and g.section_id = new.section_id
      and g.owner_id = new.owner_id and g.archived_at is null
  ) then
    raise exception 'The group is not active in this section';
  end if;
  if not exists (
    select 1 from public.section_students ss
    where ss.id = new.section_student_id and ss.section_id = new.section_id
      and ss.owner_id = new.owner_id and ss.archived_at is null
  ) then
    raise exception 'The student is not actively enrolled in this section';
  end if;
  return new;
end;
$$;

create trigger group_memberships_validate_active
  before insert or update on public.group_memberships
  for each row execute function public.validate_active_group_membership();

-- Public functions remain SECURITY INVOKER (the default), so RLS applies.
create function public.create_course_section(p_course_name text, p_section_label text)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  v_owner uuid := (select auth.uid());
  v_course_id uuid;
  v_section_id uuid;
begin
  if v_owner is null then raise exception 'Authentication required'; end if;
  if btrim(p_course_name) = '' or btrim(p_section_label) = '' then
    raise exception 'Course and section are required';
  end if;

  insert into public.courses(owner_id, name)
  values (v_owner, btrim(p_course_name))
  on conflict (owner_id, normalized_name) do nothing;

  select id into strict v_course_id from public.courses
  where owner_id = v_owner and normalized_name = lower(btrim(p_course_name));

  insert into public.sections(owner_id, course_id, label)
  values (v_owner, v_course_id, btrim(p_section_label))
  returning id into v_section_id;
  return v_section_id;
end;
$$;

create function public.edit_course_section(
  p_section_id uuid,
  p_course_name text,
  p_section_label text
)
returns void
language plpgsql
set search_path = ''
as $$
declare
  v_owner uuid := (select auth.uid());
  v_old_course_id uuid;
  v_new_course_id uuid;
begin
  if v_owner is null then raise exception 'Authentication required'; end if;
  if btrim(p_course_name) = '' or btrim(p_section_label) = '' then
    raise exception 'Course and section are required';
  end if;

  select course_id into strict v_old_course_id from public.sections
  where id = p_section_id and owner_id = v_owner;

  insert into public.courses(owner_id, name)
  values (v_owner, btrim(p_course_name))
  on conflict (owner_id, normalized_name) do nothing;
  select id into strict v_new_course_id from public.courses
  where owner_id = v_owner and normalized_name = lower(btrim(p_course_name));

  update public.sections set course_id = v_new_course_id, label = btrim(p_section_label)
  where id = p_section_id and owner_id = v_owner;

  if v_old_course_id <> v_new_course_id
    and not exists (select 1 from public.sections where course_id = v_old_course_id) then
    delete from public.courses where id = v_old_course_id and owner_id = v_owner;
  end if;
end;
$$;

create function public.delete_section_and_orphan_course(p_section_id uuid)
returns void
language plpgsql
set search_path = ''
as $$
declare
  v_owner uuid := (select auth.uid());
  v_course_id uuid;
begin
  if v_owner is null then raise exception 'Authentication required'; end if;
  select course_id into strict v_course_id from public.sections
  where id = p_section_id and owner_id = v_owner;
  delete from public.sections where id = p_section_id and owner_id = v_owner;
  if not exists (select 1 from public.sections where course_id = v_course_id) then
    delete from public.courses where id = v_course_id and owner_id = v_owner;
  end if;
end;
$$;

create function public.upsert_section_student(
  p_section_id uuid,
  p_student_code text,
  p_first_names text,
  p_last_names text
)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  v_owner uuid := (select auth.uid());
  v_student_id uuid;
  v_enrollment_id uuid;
begin
  if v_owner is null then raise exception 'Authentication required'; end if;
  if btrim(p_student_code) = '' or btrim(p_first_names) = '' or btrim(p_last_names) = '' then
    raise exception 'Student code, first names and last names are required';
  end if;
  if not exists (select 1 from public.sections where id = p_section_id and owner_id = v_owner) then
    raise exception 'Section not found';
  end if;

  insert into public.students(owner_id, student_code, first_names, last_names)
  values (v_owner, btrim(p_student_code), btrim(p_first_names), btrim(p_last_names))
  on conflict (owner_id, normalized_student_code) do nothing;
  select id into strict v_student_id from public.students
  where owner_id = v_owner and normalized_student_code = lower(btrim(p_student_code));

  insert into public.section_students(owner_id, section_id, student_id)
  values (v_owner, p_section_id, v_student_id)
  on conflict (section_id, student_id)
  do update set archived_at = null
  returning id into v_enrollment_id;
  return v_enrollment_id;
end;
$$;

create function public.archive_section_student(p_section_student_id uuid)
returns void
language plpgsql
set search_path = ''
as $$
declare v_owner uuid := (select auth.uid());
begin
  if v_owner is null then raise exception 'Authentication required'; end if;
  delete from public.group_memberships
  where section_student_id = p_section_student_id and owner_id = v_owner;
  update public.section_students set archived_at = now()
  where id = p_section_student_id and owner_id = v_owner;
  if not found then raise exception 'Enrollment not found'; end if;
end;
$$;

create function public.archive_group(p_group_id uuid)
returns void
language plpgsql
set search_path = ''
as $$
declare v_owner uuid := (select auth.uid());
begin
  if v_owner is null then raise exception 'Authentication required'; end if;
  delete from public.group_memberships where group_id = p_group_id and owner_id = v_owner;
  update public.groups set archived_at = now() where id = p_group_id and owner_id = v_owner;
  if not found then raise exception 'Group not found'; end if;
end;
$$;

create function public.save_participation_record(
  p_record_id uuid,
  p_section_id uuid,
  p_type public.participation_type,
  p_occurred_at timestamptz,
  p_scores jsonb
)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  v_owner uuid := (select auth.uid());
  v_record_id uuid;
begin
  if v_owner is null then raise exception 'Authentication required'; end if;
  if p_occurred_at is null then raise exception 'Participation date is required'; end if;
  if jsonb_typeof(coalesce(p_scores, '[]'::jsonb)) <> 'array' then
    raise exception 'Scores must be a JSON array';
  end if;
  if not exists (select 1 from public.sections where id = p_section_id and owner_id = v_owner) then
    raise exception 'Section not found';
  end if;

  if p_record_id is null then
    insert into public.participation_records(owner_id, section_id, type, occurred_at)
    values (v_owner, p_section_id, p_type, p_occurred_at)
    returning id into v_record_id;
  else
    update public.participation_records
      set occurred_at = p_occurred_at
      where id = p_record_id and owner_id = v_owner
        and section_id = p_section_id and type = p_type
      returning id into v_record_id;
    if v_record_id is null then raise exception 'Participation record not found'; end if;
  end if;

  if p_type = 'individual' then
    delete from public.student_participation_scores
      where record_id = v_record_id and owner_id = v_owner;
    insert into public.student_participation_scores(
      owner_id, section_id, record_id, record_type,
      section_student_id, opportunity_number, points
    )
    select v_owner, p_section_id, v_record_id, 'individual'::public.participation_type,
      item.entity_id, item.opportunity_number, item.points
    from jsonb_to_recordset(coalesce(p_scores, '[]'::jsonb))
      as item(entity_id uuid, opportunity_number smallint, points smallint);
  else
    delete from public.group_participation_scores
      where record_id = v_record_id and owner_id = v_owner;
    insert into public.group_participation_scores(
      owner_id, section_id, record_id, record_type,
      group_id, opportunity_number, points
    )
    select v_owner, p_section_id, v_record_id, 'group'::public.participation_type,
      item.entity_id, item.opportunity_number, item.points
    from jsonb_to_recordset(coalesce(p_scores, '[]'::jsonb))
      as item(entity_id uuid, opportunity_number smallint, points smallint);
  end if;
  return v_record_id;
end;
$$;

-- Explicit Data API privileges. Anonymous clients receive no table access.
revoke all on all tables in schema public from anon;
revoke all on all functions in schema public from public, anon;
grant select, insert, update, delete on table
  public.courses,
  public.sections,
  public.students,
  public.section_students,
  public.groups,
  public.group_memberships,
  public.participation_records,
  public.student_participation_scores,
  public.group_participation_scores
to authenticated;
grant execute on function public.create_course_section(text, text) to authenticated;
grant execute on function public.edit_course_section(uuid, text, text) to authenticated;
grant execute on function public.delete_section_and_orphan_course(uuid) to authenticated;
grant execute on function public.upsert_section_student(uuid, text, text, text) to authenticated;
grant execute on function public.archive_section_student(uuid) to authenticated;
grant execute on function public.archive_group(uuid) to authenticated;
grant execute on function public.save_participation_record(uuid, uuid, public.participation_type, timestamptz, jsonb) to authenticated;

-- Direct ownership policies are intentionally uniform and non-recursive.
alter table public.courses enable row level security;
alter table public.sections enable row level security;
alter table public.students enable row level security;
alter table public.section_students enable row level security;
alter table public.groups enable row level security;
alter table public.group_memberships enable row level security;
alter table public.participation_records enable row level security;
alter table public.student_participation_scores enable row level security;
alter table public.group_participation_scores enable row level security;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'courses', 'sections', 'students', 'section_students', 'groups',
    'group_memberships', 'participation_records',
    'student_participation_scores', 'group_participation_scores'
  ] loop
    execute format(
      'create policy %I on public.%I for select to authenticated using ((select auth.uid()) = owner_id)',
      table_name || '_select_own', table_name
    );
    execute format(
      'create policy %I on public.%I for insert to authenticated with check ((select auth.uid()) = owner_id)',
      table_name || '_insert_own', table_name
    );
    execute format(
      'create policy %I on public.%I for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id)',
      table_name || '_update_own', table_name
    );
    execute format(
      'create policy %I on public.%I for delete to authenticated using ((select auth.uid()) = owner_id)',
      table_name || '_delete_own', table_name
    );
  end loop;
end;
$$;
