-- Initial schema for IGO Manager
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
