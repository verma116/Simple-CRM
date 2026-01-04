-- Create Customers Table
create table if not exists customers (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) not null,
  name text not null,
  email text not null,
  phone text,
  status text default 'New'
);

-- Enable RLS for Customers
alter table customers enable row level security;

-- Policies for Customers
create policy "Enable read access for all authenticated users"
on customers for select
to authenticated
using (true);

create policy "Enable insert for authenticated users"
on customers for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Enable update for authenticated users"
on customers for update
to authenticated
using (true);

-- Create Interactions Table
create table if not exists interactions (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  customer_id uuid references customers(id) on delete cascade not null,
  user_id uuid references auth.users(id) default auth.uid(),
  type text check (type in ('Note', 'Call', 'Email', 'Meeting')) default 'Note',
  notes text,
  date date default CURRENT_DATE
);

-- Enable RLS for Interactions
alter table interactions enable row level security;

-- Policies for Interactions
create policy "Enable read access for all authenticated users"
on interactions for select
to authenticated
using (true);

create policy "Enable insert for authenticated users"
on interactions for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Enable update for authenticated users"
on interactions for update
to authenticated
using (auth.uid() = user_id);

-- Create Followups Table
create table if not exists followups (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  customer_id uuid references customers(id) on delete cascade not null,
  user_id uuid references auth.users(id) default auth.uid(),
  followup_date date not null,
  action text,
  completed boolean default false
);

-- Enable RLS for Followups
alter table followups enable row level security;

-- Policies for Followups
create policy "Enable read access for all authenticated users"
on followups for select
to authenticated
using (true);

create policy "Enable insert for authenticated users"
on followups for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Enable update for authenticated users"
on followups for update
to authenticated
using (true);
