create extension if not exists btree_gist;

create type public.booking_status as enum ('pending','confirmed','checked_in','in_house','checked_out','cancelled','no_show');
create type public.room_status as enum ('vacant','dirty','cleaning','clean','inspected','out_of_order','maintenance');

create table public.hotel_settings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null default 'Bettiah',
  address text not null,
  phone text,
  check_in time not null default '12:00',
  check_out time not null default '11:00',
  tax_percent numeric(5,2) not null default 12 check (tax_percent >= 0 and tax_percent <= 100),
  timezone text not null default 'Asia/Kolkata',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.staff_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role text not null check (role in ('owner','manager','front_desk','housekeeping','accounting','editor')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.room_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  max_guests integer not null default 2 check (max_guests > 0),
  size_sqft integer check (size_sqft > 0),
  base_price numeric(12,2) not null check (base_price >= 0),
  bed_description text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  room_type_id uuid not null references public.room_types(id) on delete restrict,
  room_number text not null unique,
  floor integer,
  status public.room_status not null default 'clean',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.guests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text,
  email text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  confirmation_code text not null unique,
  guest_id uuid not null references public.guests(id) on delete restrict,
  room_id uuid not null references public.rooms(id) on delete restrict,
  check_in date not null,
  check_out date not null,
  guests integer not null default 1 check (guests > 0),
  status public.booking_status not null default 'pending',
  source text not null default 'website',
  nightly_rate numeric(12,2) not null check (nightly_rate >= 0),
  subtotal numeric(12,2) not null check (subtotal >= 0),
  tax numeric(12,2) not null check (tax >= 0),
  total numeric(12,2) not null check (total >= 0),
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (check_out > check_in),
  check (total = subtotal + tax)
);

alter table public.reservations
  add constraint reservations_room_no_overlap
  exclude using gist (
    room_id with =,
    daterange(check_in, check_out, '[)') with &&
  )
  where (status in ('pending','confirmed','checked_in','in_house'));

create table public.room_blocks (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  reason text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  check (end_date > start_date)
);

alter table public.room_blocks
  add constraint room_blocks_no_overlap
  exclude using gist (
    room_id with =,
    daterange(start_date, end_date, '[)') with &&
  );

create table public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(12,2) not null check (price >= 0),
  pricing_mode text not null check (pricing_mode in ('per_guest','per_booking','per_quantity','per_night')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.reservation_services (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references public.reservations(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete restrict,
  quantity integer not null default 1 check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references public.reservations(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  method text not null check (method in ('cash','upi','card','bank_transfer','gateway','other')),
  status text not null default 'paid' check (status in ('pending','paid','failed','refunded')),
  reference text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('gallery','menu_pdf','logo','document')),
  storage_path text not null,
  public_url text,
  title text,
  alt_text text,
  version integer not null default 1,
  published boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.audit_events (
  id bigint generated always as identity primary key,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id text,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

create table public.hotel_reviews (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  rating numeric(2,1) check (rating >= 0 and rating <= 5),
  title text,
  body text,
  review_date date,
  response text,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

insert into public.hotel_settings (name,address,phone)
values ('Hotel Bhola Inn','Station Chowk, Supriya Cinema Road, Bettiah, West Champaran, Bihar 845438','+91 91555 90188');

insert into public.room_types (name,slug,description,max_guests,size_sqft,base_price,bed_description)
values
('Deluxe Room','deluxe-room','Comfortable city stay with air conditioning and core guest amenities.',2,200,2200,'1 King Bed'),
('Suite Room','suite-room','Larger suite-style accommodation for a more spacious stay.',2,400,3200,'1 King Bed');

insert into public.rooms (room_type_id,room_number,floor)
select id, n::text, 1 from public.room_types rt cross join generate_series(101,108) n where rt.slug='deluxe-room';
insert into public.rooms (room_type_id,room_number,floor)
select id, n::text, 2 from public.room_types rt cross join generate_series(201,204) n where rt.slug='suite-room';

insert into public.services (name,price,pricing_mode) values
('Breakfast',350,'per_guest'),
('Airport / station transfer',600,'per_booking'),
('Laundry',150,'per_quantity');

alter table public.hotel_settings enable row level security;
alter table public.staff_profiles enable row level security;
alter table public.room_types enable row level security;
alter table public.rooms enable row level security;
alter table public.guests enable row level security;
alter table public.reservations enable row level security;
alter table public.room_blocks enable row level security;
alter table public.services enable row level security;
alter table public.reservation_services enable row level security;
alter table public.payments enable row level security;
alter table public.media_assets enable row level security;
alter table public.audit_events enable row level security;
alter table public.hotel_reviews enable row level security;

create or replace function public.is_hotel_staff()
returns boolean language sql stable as $$
  select exists (
    select 1 from public.staff_profiles
    where user_id = auth.uid() and active = true
  );
$$;

create policy "public can read hotel settings" on public.hotel_settings for select to anon, authenticated using (true);
create policy "staff manage hotel settings" on public.hotel_settings for all to authenticated using (public.is_hotel_staff()) with check (public.is_hotel_staff());

create policy "public read active room types" on public.room_types for select to anon, authenticated using (active = true);
create policy "staff manage room types" on public.room_types for all to authenticated using (public.is_hotel_staff()) with check (public.is_hotel_staff());
create policy "public read active rooms" on public.rooms for select to anon, authenticated using (active = true);
create policy "staff manage rooms" on public.rooms for all to authenticated using (public.is_hotel_staff()) with check (public.is_hotel_staff());
create policy "public read active services" on public.services for select to anon, authenticated using (active = true);
create policy "staff manage services" on public.services for all to authenticated using (public.is_hotel_staff()) with check (public.is_hotel_staff());

create policy "staff read guests" on public.guests for select to authenticated using (public.is_hotel_staff());
create policy "staff write guests" on public.guests for all to authenticated using (public.is_hotel_staff()) with check (public.is_hotel_staff());

create policy "staff manage reservations" on public.reservations for select to authenticated using (public.is_hotel_staff());
create policy "staff update reservations" on public.reservations for update to authenticated using (public.is_hotel_staff()) with check (public.is_hotel_staff());
create policy "public can create reservations" on public.reservations for insert to anon, authenticated with check (status = 'pending' and source = 'website');

create policy "staff manage room blocks" on public.room_blocks for all to authenticated using (public.is_hotel_staff()) with check (public.is_hotel_staff());
create policy "staff manage reservation services" on public.reservation_services for all to authenticated using (public.is_hotel_staff()) with check (public.is_hotel_staff());
create policy "staff manage payments" on public.payments for all to authenticated using (public.is_hotel_staff()) with check (public.is_hotel_staff());
create policy "public read published media" on public.media_assets for select to anon, authenticated using (published = true);
create policy "staff manage media" on public.media_assets for all to authenticated using (public.is_hotel_staff()) with check (public.is_hotel_staff());
create policy "staff manage audit" on public.audit_events for select to authenticated using (public.is_hotel_staff());
create policy "staff insert audit" on public.audit_events for insert to authenticated with check (public.is_hotel_staff());
create policy "public read published reviews" on public.hotel_reviews for select to anon, authenticated using (published = true);
create policy "staff manage reviews" on public.hotel_reviews for all to authenticated using (public.is_hotel_staff()) with check (public.is_hotel_staff());

grant select on public.hotel_settings, public.room_types, public.rooms, public.services, public.media_assets, public.hotel_reviews to anon;
grant insert on public.reservations to anon;
grant select,insert,update,delete on public.hotel_settings, public.staff_profiles, public.room_types, public.rooms, public.guests, public.reservations, public.room_blocks, public.services, public.reservation_services, public.payments, public.media_assets, public.audit_events, public.hotel_reviews to authenticated;

create or replace function public.calculate_reservation_total(
  p_room_type_id uuid, p_check_in date, p_check_out date, p_guests integer default 1
)
returns table(nights integer, nightly_rate numeric, subtotal numeric, tax numeric, total numeric)
language sql stable as $$
  with base as (
    select greatest(1, (p_check_out - p_check_in))::integer as nights,
           rt.base_price as nightly_rate,
           coalesce(h.tax_percent,12) as tax_percent
    from public.room_types rt cross join public.hotel_settings h
    where rt.id = p_room_type_id and p_check_out > p_check_in
  )
  select nights, nightly_rate,
         nightly_rate*nights as subtotal,
         round((nightly_rate*nights)*(tax_percent/100),2) as tax,
         nightly_rate*nights + round((nightly_rate*nights)*(tax_percent/100),2) as total
  from base;
$$;
grant execute on function public.calculate_reservation_total(uuid,date,date,integer) to anon, authenticated;

create index reservations_dates_idx on public.reservations(check_in,check_out);
create index reservations_guest_idx on public.reservations(guest_id);
create index reservations_room_idx on public.reservations(room_id);
create index audit_events_created_idx on public.audit_events(created_at desc);
