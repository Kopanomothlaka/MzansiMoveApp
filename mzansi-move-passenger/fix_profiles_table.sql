-- Drop existing trigger if it exists
drop trigger if exists on_auth_user_created on auth.users;

-- Drop existing function if it exists
drop function if exists public.handle_new_user();

-- Drop existing table if it exists
drop table if exists public.profiles;

-- Create profiles table with correct structure
create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    full_name text,
    phone_number text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Create security policies
create policy "Public profiles are viewable by everyone."
    on public.profiles for select
    using ( true );

create policy "Users can insert their own profile."
    on public.profiles for insert
    with check ( auth.uid() = id );

create policy "Users can update their own profile."
    on public.profiles for update
    using ( auth.uid() = id );

-- Create function to handle user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id)
    values (new.id);
    return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user creation
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user(); 