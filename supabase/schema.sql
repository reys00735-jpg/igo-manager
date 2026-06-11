create extension if not exists "uuid-ossp";

create table if not exists public.users (
  id uuid primary key default uuid_generate_v4(),
  auth_user_id uuid unique,
  nombre text not null,
  empresa text,
  correo text not null,
  celular text,
  sector text,
  tamano text,
  edad text,
  genero text,
  rol text not null default 'emprendedor',
  created_at timestamptz not null default now()
);

create table if not exists public.iniciativas (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  titulo text not null,
  descripcion text,
  importancia int not null default 5,
  gobernabilidad int not null default 5,
  cuadrante text not null default 'I',
  created_at timestamptz not null default now()
);

create table if not exists public.planes_accion (
  id uuid primary key default uuid_generate_v4(),
  iniciativa_id uuid references public.iniciativas(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  deadline date,
  presupuesto numeric(10,2),
  aliados text,
  estado text not null default 'Pendiente',
  created_at timestamptz not null default now()
);

create or replace function public.calculate_quadrant(importance int, governability int)
returns text as $$
  begin
    if importance >= 6 and governability >= 6 then
      return 'I';
    elsif importance >= 6 and governability < 6 then
      return 'II';
    elsif importance < 6 and governability >= 6 then
      return 'III';
    else
      return 'IV';
    end if;
  end;
$$ language plpgsql;

create or replace function public.set_iniciativa_quadrant()
returns trigger as $$
begin
  new.cuadrante := public.calculate_quadrant(new.importancia, new.gobernabilidad);
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_set_iniciativa_quadrant on public.iniciativas;
create trigger trg_set_iniciativa_quadrant
before insert or update of importancia, gobernabilidad on public.iniciativas
for each row execute procedure public.set_iniciativa_quadrant();

create or replace view public.iniciativas_anonimas as
select
  i.id,
  i.titulo,
  i.importancia,
  i.gobernabilidad,
  i.cuadrante,
  u.sector,
  i.created_at
from public.iniciativas i
join public.users u on u.id = i.user_id;

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

create policy admin_read on public.users for select using (auth.jwt() ->> 'role' = 'superadmin');
create policy admin_read_iniciativas on public.iniciativas for select using (auth.jwt() ->> 'role' = 'superadmin');
create policy admin_read_planes on public.planes_accion for select using (auth.jwt() ->> 'role' = 'superadmin');
