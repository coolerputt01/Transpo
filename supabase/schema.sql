create type user_role as enum ('buyer', 'seller', 'driver', 'storekeeper');
create type verification_status as enum ('pending', 'verified', 'rejected');
create type delivery_status as enum (
  'pending',
  'in_transit',
  'successful',
  'failed',
  'disputed',
  'stored',
  'returned',
  'redelivery_planned'
);
create type transaction_status as enum ('pending', 'held', 'released', 'failed', 'disputed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  phone text not null,
  role user_role not null,
  verification_status verification_status not null default 'pending',
  wallet_balance numeric(14, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.deliveries (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references public.profiles(id),
  buyer_email text not null,
  driver_id uuid references public.profiles(id),
  storekeeper_id uuid references public.profiles(id),
  title text not null,
  pickup_address text not null,
  delivery_address text not null,
  amount numeric(14, 2) not null,
  status delivery_status not null default 'pending',
  failure_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  payer_email text not null,
  recipient_email text not null,
  amount numeric(14, 2) not null,
  type text not null,
  status transaction_status not null default 'pending',
  delivery_id uuid references public.deliveries(id),
  payment_provider_ref text,
  created_at timestamptz not null default now()
);

create table public.storage_requests (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references public.profiles(id),
  storekeeper_id uuid references public.profiles(id),
  delivery_id uuid references public.deliveries(id),
  goods_description text not null,
  fee numeric(14, 2) not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table public.relationships (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references public.profiles(id),
  related_user_id uuid references public.profiles(id),
  relationship_type text not null,
  last_transaction_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.deliveries enable row level security;
alter table public.transactions enable row level security;
alter table public.storage_requests enable row level security;
alter table public.relationships enable row level security;
