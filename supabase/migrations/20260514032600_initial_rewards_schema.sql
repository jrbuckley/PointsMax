create extension if not exists "pgcrypto";

create type goal_preference as enum (
  'MAX_VALUE',
  'KEEP_IT_SIMPLE',
  'TRAVEL_FOCUSED',
  'CASHLIKE'
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.users_profile (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  goal_preference goal_preference not null default 'KEEP_IT_SIMPLE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_users_profile_updated_at
before update on public.users_profile
for each row
execute function public.set_updated_at();

create table public.reward_programs (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  issuer text,
  point_name text,
  is_active boolean not null default true
);

create table public.user_reward_balances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users_profile(id) on delete cascade,
  reward_program_id uuid not null references public.reward_programs(id) on delete restrict,
  balance integer not null default 0 check (balance >= 0),
  source text not null default 'manual',
  last_updated_at timestamptz not null default now(),
  unique (user_id, reward_program_id)
);

create table public.redemption_methods (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  difficulty text
);

create table public.transfer_partners (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  type text
);

create table public.reward_program_transfer_partners (
  id uuid primary key default gen_random_uuid(),
  reward_program_id uuid not null references public.reward_programs(id) on delete cascade,
  transfer_partner_id uuid not null references public.transfer_partners(id) on delete cascade,
  transfer_ratio_num integer not null default 1 check (transfer_ratio_num > 0),
  transfer_ratio_den integer not null default 1 check (transfer_ratio_den > 0),
  unique (reward_program_id, transfer_partner_id)
);

create table public.valuation_rules (
  id uuid primary key default gen_random_uuid(),
  reward_program_id uuid not null references public.reward_programs(id) on delete cascade,
  redemption_method_id uuid not null references public.redemption_methods(id) on delete cascade,
  transfer_partner_id uuid references public.transfer_partners(id) on delete cascade,
  min_cpp numeric(8, 4) not null check (min_cpp >= 0),
  max_cpp numeric(8, 4) not null check (max_cpp >= min_cpp),
  typical_cpp numeric(8, 4) not null check (
    typical_cpp >= min_cpp
    and typical_cpp <= max_cpp
  ),
  difficulty text,
  title text
);

create index user_reward_balances_user_id_idx
on public.user_reward_balances(user_id);

create index user_reward_balances_reward_program_id_idx
on public.user_reward_balances(reward_program_id);

create index reward_program_transfer_partners_reward_program_id_idx
on public.reward_program_transfer_partners(reward_program_id);

create index reward_program_transfer_partners_transfer_partner_id_idx
on public.reward_program_transfer_partners(transfer_partner_id);

create index valuation_rules_reward_program_id_idx
on public.valuation_rules(reward_program_id);

create index valuation_rules_redemption_method_id_idx
on public.valuation_rules(redemption_method_id);

create index valuation_rules_transfer_partner_id_idx
on public.valuation_rules(transfer_partner_id);

create unique index valuation_rules_direct_unique_idx
on public.valuation_rules(reward_program_id, redemption_method_id)
where transfer_partner_id is null;

create unique index valuation_rules_transfer_unique_idx
on public.valuation_rules(
  reward_program_id,
  redemption_method_id,
  transfer_partner_id
)
where transfer_partner_id is not null;

alter table public.users_profile enable row level security;
alter table public.user_reward_balances enable row level security;
alter table public.reward_programs enable row level security;
alter table public.redemption_methods enable row level security;
alter table public.transfer_partners enable row level security;
alter table public.reward_program_transfer_partners enable row level security;
alter table public.valuation_rules enable row level security;

create policy "Users can read their own profile"
on public.users_profile
for select
using (auth.uid() = id);

create policy "Users can insert their own profile"
on public.users_profile
for insert
with check (auth.uid() = id);

create policy "Users can update their own profile"
on public.users_profile
for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Users can read their own reward balances"
on public.user_reward_balances
for select
using (auth.uid() = user_id);

create policy "Users can insert their own reward balances"
on public.user_reward_balances
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own reward balances"
on public.user_reward_balances
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own reward balances"
on public.user_reward_balances
for delete
using (auth.uid() = user_id);

create policy "Reward programs are readable"
on public.reward_programs
for select
using (true);

create policy "Redemption methods are readable"
on public.redemption_methods
for select
using (true);

create policy "Transfer partners are readable"
on public.transfer_partners
for select
using (true);

create policy "Reward program transfer partners are readable"
on public.reward_program_transfer_partners
for select
using (true);

create policy "Valuation rules are readable"
on public.valuation_rules
for select
using (true);
