-- Sports Arena booking schema.

create extension if not exists pgcrypto;

create type public.facility_type as enum ('turf','pool','ground');
create type public.sports_booking_status as enum ('pending','confirmed','checked_in','completed','cancelled','no_show');
create type public.slot_override_mode as enum ('open','closed');
create type public.payment_status as enum ('unpaid','partial','paid','refunded');

create table public.facility_settings(
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Sports Arena',
  tagline text not null default 'Train. Play. Repeat.',
  city text not null default 'Bettiah',
  address text,
  phone text,
  whatsapp text,
  currency text not null default 'INR',
  timezone text not null default 'Asia/Kolkata',
  booking_notice text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.facilities(
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  type public.facility_type not null,
  description text not null default '',
  capacity integer not null default 10 check(capacity>0),
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.slot_templates(
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references public.facilities(id) on delete cascade,
  day_of_week integer not null check(day_of_week between 0 and 6),
  label text not null default 'Slot',
  start_time time not null,
  end_time time not null,
  price numeric(10,2) not null check(price>=0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint slot_time_order check(end_time>start_time)
);

create unique index slot_templates_unique on public.slot_templates(facility_id,day_of_week,start_time,end_time);
create index slot_templates_facility_day on public.slot_templates(facility_id,day_of_week);

create table public.date_overrides(
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references public.facilities(id) on delete cascade,
  override_date date not null,
  mode public.slot_override_mode not null,
  label text,
  start_time time,
  end_time time,
  price numeric(10,2) check(price>=0),
  note text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint override_time_pair check((start_time is null and end_time is null) or(start_time is not null and end_time is not null and end_time>start_time))
);

create index date_overrides_facility_date on public.date_overrides(facility_id,override_date);

create table public.bookings(
  id uuid primary key default gen_random_uuid(),
  booking_code text not null unique default('BK-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,8))),
  facility_id uuid not null references public.facilities(id) on delete restrict,
  booking_date date not null,
  start_time time not null,
  end_time time not null,
  customer_name text not null,
  phone text not null,
  email text,
  participants integer not null default 1 check(participants>0),
  amount numeric(10,2) not null check(amount>=0),
  status public.sports_booking_status not null default 'pending',
  payment_status public.payment_status not null default 'unpaid',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint booking_time_order check(end_time>start_time)
);

create unique index bookings_slot_unique on public.bookings(facility_id,booking_date,start_time) where status in('pending','confirmed','checked_in');
create index bookings_facility_date on public.bookings(facility_id,booking_date);

create table public.audit_logs(
  id bigint generated always as identity primary key,
  actor_user_id uuid,
  action text not null,
  entity text not null,
  entity_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

insert into public.facility_settings(name,tagline,city,booking_notice)
values('Sports Arena','Train. Play. Repeat.','Bettiah','Live timings, prices and availability are controlled from the admin panel.');

insert into public.facilities(name,slug,type,description,capacity,sort_order) values
('Sports Turf','sports-turf','turf','Book the turf by live time slot.',16,1),
('Swimming Pool','swimming-pool','pool','Reserve pool access by live slot.',20,2),
('Sports Ground','sports-ground','ground','Book the ground by live time slot.',24,3);

insert into public.slot_templates(facility_id,day_of_week,label,start_time,end_time,price)
select f.id,d.day,s.label,s.start_time,s.end_time,s.price
from public.facilities f
cross join generate_series(0,6)d(day)
cross join(values
('Morning','06:00'::time,'08:00'::time,800::numeric),
('Prime','18:00'::time,'20:00'::time,1200::numeric),
('Night','20:00'::time,'22:00'::time,1000::numeric)
)s(label,start_time,end_time,price);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path=public
as $fn$
select coalesce((auth.jwt()->'app_metadata'->>'role') in('admin','manager'),false);
$fn$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

alter table public.facility_settings enable row level security;
alter table public.facilities enable row level security;
alter table public.slot_templates enable row level security;
alter table public.date_overrides enable row level security;
alter table public.bookings enable row level security;
alter table public.audit_logs enable row level security;

create policy "public read settings" on public.facility_settings for select to anon,authenticated using(true);
create policy "public read facilities" on public.facilities for select to anon,authenticated using(active=true);
create policy "public read slots" on public.slot_templates for select to anon,authenticated using(active=true);
create policy "public read overrides" on public.date_overrides for select to anon,authenticated using(active=true);

create policy "admin manage settings" on public.facility_settings for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "admin manage facilities" on public.facilities for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "admin manage slots" on public.slot_templates for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "admin manage overrides" on public.date_overrides for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "admin read bookings" on public.bookings for select to authenticated using(public.is_admin());
create policy "admin manage bookings" on public.bookings for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "admin read audit" on public.audit_logs for select to authenticated using(public.is_admin());
create policy "admin insert audit" on public.audit_logs for insert to authenticated with check(public.is_admin());

revoke insert,update,delete on public.bookings from anon,authenticated;

create or replace function public.get_public_slots(p_date date,p_facility_id uuid)
returns table(slot_key text,start_time time,end_time time,price numeric,label text,available boolean)
language sql
stable
set search_path=public
as $$
with base as(
 select 'template:'||st.id::text slot_key,st.start_time,st.end_time,
 coalesce((select o.price from public.date_overrides o where o.facility_id=st.facility_id and o.override_date=p_date and o.active and o.mode='open' and o.start_time=st.start_time and o.end_time=st.end_time order by o.created_at desc limit 1),st.price) price,
 coalesce((select o.label from public.date_overrides o where o.facility_id=st.facility_id and o.override_date=p_date and o.active and o.mode='open' and o.start_time=st.start_time and o.end_time=st.end_time order by o.created_at desc limit 1),st.label) label
 from public.slot_templates st join public.facilities f on f.id=st.facility_id
 where st.facility_id=p_facility_id and st.active and f.active and st.day_of_week=extract(dow from p_date)::int
 and not exists(select 1 from public.date_overrides o where o.facility_id=st.facility_id and o.override_date=p_date and o.active and o.mode='closed' and(o.start_time is null or(o.start_time=st.start_time and o.end_time=st.end_time)))
),extras as(
 select 'override:'||o.id::text,o.start_time,o.end_time,o.price,coalesce(o.label,'Special slot')
 from public.date_overrides o join public.facilities f on f.id=o.facility_id
 where o.facility_id=p_facility_id and o.override_date=p_date and o.active and o.mode='open' and o.start_time is not null
 and not exists(select 1 from base b where b.start_time=o.start_time and b.end_time=o.end_time)
)
select x.slot_key,x.start_time,x.end_time,x.price,x.label,
 not exists(select 1 from public.bookings b where b.facility_id=p_facility_id and b.booking_date=p_date and b.start_time=x.start_time and b.end_time=x.end_time and b.status in('pending','confirmed','checked_in'))
from(select * from base union all select * from extras)x
where p_date>=current_date order by x.start_time;
$$;

revoke all on function public.get_public_slots(date,uuid) from public;
grant execute on function public.get_public_slots(date,uuid) to anon,authenticated;

create or replace function public.create_public_booking(p_facility_id uuid,p_booking_date date,p_start_time time,p_end_time time,p_customer_name text,p_phone text,p_email text default null,p_participants integer default 1,p_notes text default null)
returns table(booking_id uuid,booking_code text,amount numeric)
language plpgsql
security definer
set search_path=public
as $$
declare v_price numeric;v_capacity integer;v_available boolean;
begin
 if nullif(trim(p_customer_name),'') is null then raise exception 'Customer name is required';end if;
 if nullif(trim(p_phone),'') is null then raise exception 'Phone number is required';end if;
 if p_booking_date<current_date then raise exception 'Booking date cannot be in the past';end if;
 if p_end_time<=p_start_time then raise exception 'Invalid slot time';end if;
 select capacity into v_capacity from public.facilities where id=p_facility_id and active;
 if v_capacity is null then raise exception 'Facility is unavailable';end if;
 if p_participants<1 or p_participants>v_capacity then raise exception 'Participant count exceeds capacity';end if;
 select s.price,s.available into v_price,v_available from public.get_public_slots(p_booking_date,p_facility_id)s where s.start_time=p_start_time and s.end_time=p_end_time limit 1;
 if v_price is null or not coalesce(v_available,false) then raise exception 'Selected slot is unavailable';end if;
 begin
  return query insert into public.bookings(facility_id,booking_date,start_time,end_time,customer_name,phone,email,participants,amount)
  values(p_facility_id,p_booking_date,p_start_time,p_end_time,trim(p_customer_name),trim(p_phone),nullif(trim(p_email),''),p_participants,v_price)
  returning public.bookings.id,public.bookings.booking_code,public.bookings.amount;
 exception when unique_violation then raise exception 'Selected slot is already booked';end;
end;
$$;

revoke all on function public.create_public_booking(uuid,date,time,time,text,text,text,integer,text) from public;
grant execute on function public.create_public_booking(uuid,date,time,time,text,text,text,integer,text) to anon,authenticated;