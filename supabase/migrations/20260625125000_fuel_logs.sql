-- Create fuel_logs table for Fuel Tracking System
create table public.fuel_logs (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    vehicle_id uuid references public.vehicles(id) on delete cascade not null,
    liters numeric(10, 2) not null,
    price_per_liter numeric(10, 2) not null,
    total_cost numeric(10, 2) not null,
    odometer int not null,
    fuel_type text not null,
    station_name text,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table public.fuel_logs enable row level security;

create policy "Users can view their own fuel logs"
    on public.fuel_logs for select
    using ( auth.uid() = user_id );

create policy "Users can insert their own fuel logs"
    on public.fuel_logs for insert
    with check ( auth.uid() = user_id );

create policy "Users can update their own fuel logs"
    on public.fuel_logs for update
    using ( auth.uid() = user_id );

create policy "Users can delete their own fuel logs"
    on public.fuel_logs for delete
    using ( auth.uid() = user_id );
