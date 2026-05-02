-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New query)

-- Profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  headline text,
  bio text,
  avatar_url text,
  role text not null default 'both' check (role in ('founder', 'talent', 'both')),
  primary_role text not null default 'Developer' check (primary_role in ('Founder', 'Developer', 'Designer', 'Marketing', 'Data', 'CTO', 'Finance', 'Ops')),
  looking_for text not null default 'Cofounder' check (looking_for in ('Cofounder', 'Collaborator', 'Advisor', 'Hiring', 'Mentorship')),
  experience text not null default 'mid' check (experience in ('junior', 'mid', 'senior', 'expert')),
  lat double precision,
  lng double precision,
  availability text not null default 'Open' check (availability in ('Open', 'Busy')),
  open_to_equity boolean not null default false,
  full_time boolean not null default true,
  age integer,
  linkedin_verified boolean not null default false,
  linkedin_url text,
  twitter_url text,
  portfolio_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Skills table
create table public.skills (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  name text not null,
  level text not null check (level in ('Beginner', 'Intermediate', 'Expert'))
);

-- Interests / industry verticals table
create table public.interests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  name text not null
);

-- Indexes for geo queries and lookups
create index idx_profiles_location on public.profiles (lat, lng);
create index idx_profiles_role on public.profiles (primary_role);
create index idx_skills_user on public.skills (user_id);
create index idx_interests_user on public.interests (user_id);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.skills enable row level security;
alter table public.interests enable row level security;

-- RLS policies: anyone can read, only owner can write
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Skills are viewable by everyone"
  on public.skills for select using (true);

create policy "Users can manage own skills"
  on public.skills for all using (auth.uid() = user_id);

create policy "Interests are viewable by everyone"
  on public.interests for select using (true);

create policy "Users can manage own interests"
  on public.interests for all using (auth.uid() = user_id);

-- Auto-update updated_at on profiles
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_profile_updated
  before update on public.profiles
  for each row execute function public.handle_updated_at();
