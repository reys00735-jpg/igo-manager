alter table public.users enable row level security;
alter table public.iniciativas enable row level security;
alter table public.planes_accion enable row level security;

create policy users_self on public.users
  for all using (auth.uid() = auth_user_id) with check (auth.uid() = auth_user_id);

create policy iniciativas_self on public.iniciativas
  for all using (user_id in (select id from public.users where auth_user_id = auth.uid()))
  with check (user_id in (select id from public.users where auth_user_id = auth.uid()));

create policy planes_self on public.planes_accion
  for all using (user_id in (select id from public.users where auth_user_id = auth.uid()))
  with check (user_id in (select id from public.users where auth_user_id = auth.uid()));
