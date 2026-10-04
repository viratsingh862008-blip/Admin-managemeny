create or replace function public.create_website_reservation(
  p_room_type_id uuid,
  p_check_in date,
  p_check_out date,
  p_guests integer,
  p_full_name text,
  p_phone text,
  p_email text default null,
  p_notes text default null
)
returns table(
  reservation_id uuid,
  confirmation_code text,
  room_number text,
  room_type text,
  check_in date,
  check_out date,
  total numeric
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_room public.rooms%rowtype;
  v_guest_id uuid;
  v_nights integer;
  v_rate numeric;
  v_subtotal numeric;
  v_tax numeric;
  v_total numeric;
  v_confirmation text;
begin
  if nullif(trim(p_full_name), '') is null then
    raise exception 'Guest name is required';
  end if;

  if p_check_out <= p_check_in then
    raise exception 'Check-out must be after check-in';
  end if;

  if p_check_in < current_date then
    raise exception 'Check-in cannot be in the past';
  end if;

  if p_guests is null or p_guests < 1 then
    raise exception 'At least one guest is required';
  end if;

  v_nights := p_check_out - p_check_in;

  select r.*
  into v_room
  from public.rooms r
  join public.room_types rt on rt.id = r.room_type_id
  where r.room_type_id = p_room_type_id
    and r.active = true
    and r.status not in ('out_of_order', 'maintenance')
    and rt.active = true
    and p_guests <= rt.max_guests
    and not exists (
      select 1
      from public.reservations existing
      where existing.room_id = r.id
        and existing.status in ('pending','confirmed','checked_in','in_house')
        and daterange(existing.check_in, existing.check_out, '[)') &&
            daterange(p_check_in, p_check_out, '[)')
    )
    and not exists (
      select 1
      from public.room_blocks block
      where block.room_id = r.id
        and daterange(block.start_date, block.end_date, '[)') &&
            daterange(p_check_in, p_check_out, '[)')
    )
  order by r.room_number
  for update of r skip locked
  limit 1;

  if v_room.id is null then
    raise exception 'No rooms available for the selected dates';
  end if;

  select rt.base_price
  into v_rate
  from public.room_types rt
  where rt.id = p_room_type_id
    and rt.active = true;

  if v_rate is null then
    raise exception 'Room type is unavailable';
  end if;

  v_subtotal := v_rate * v_nights;
  select round(v_subtotal * (coalesce(h.tax_percent, 12) / 100), 2)
  into v_tax
  from public.hotel_settings h
  order by h.created_at
  limit 1;
  v_tax := coalesce(v_tax, round(v_subtotal * 0.12, 2));
  v_total := v_subtotal + v_tax;

  insert into public.guests(full_name, phone, email, notes)
  values (trim(p_full_name), nullif(trim(p_phone), ''), nullif(trim(p_email), ''), nullif(trim(p_notes), ''))
  returning id into v_guest_id;

  v_confirmation := upper('BI-' || substring(replace(gen_random_uuid()::text, '-', '') from 1 for 8));

  insert into public.reservations(
    confirmation_code, guest_id, room_id, check_in, check_out, guests, status, source,
    nightly_rate, subtotal, tax, total, notes
  )
  values (
    v_confirmation, v_guest_id, v_room.id, p_check_in, p_check_out, p_guests, 'pending', 'website',
    v_rate, v_subtotal, v_tax, v_total, nullif(trim(p_notes), '')
  )
  returning id into reservation_id;

  confirmation_code := v_confirmation;
  room_number := v_room.room_number;

  select rt.name into room_type
  from public.room_types rt
  where rt.id = p_room_type_id;

  check_in := p_check_in;
  check_out := p_check_out;
  total := v_total;

  return next;
end;
$$;

revoke all on function public.create_website_reservation(uuid,date,date,integer,text,text,text,text) from public, anon, authenticated;
grant execute on function public.create_website_reservation(uuid,date,date,integer,text,text,text,text) to anon, authenticated;