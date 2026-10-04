create or replace function public.get_available_room_types(
  p_check_in date,
  p_check_out date,
  p_guests integer default 1
)
returns table(
  id uuid,
  name text,
  slug text,
  description text,
  max_guests integer,
  size_sqft integer,
  base_price numeric,
  bed_description text,
  available_rooms bigint
)
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select
    rt.id, rt.name, rt.slug, rt.description, rt.max_guests, rt.size_sqft,
    rt.base_price, rt.bed_description,
    count(r.id) filter (
      where r.active = true
        and r.status not in ('out_of_order','maintenance')
        and not exists (
          select 1 from public.reservations b
          where b.room_id = r.id
            and b.status in ('pending','confirmed','checked_in','in_house')
            and daterange(b.check_in,b.check_out,'[)') &&
                daterange(p_check_in,p_check_out,'[)')
        )
        and not exists (
          select 1 from public.room_blocks rb
          where rb.room_id = r.id
            and daterange(rb.start_date,rb.end_date,'[)') &&
                daterange(p_check_in,p_check_out,'[)')
        )
    ) as available_rooms
  from public.room_types rt
  left join public.rooms r on r.room_type_id = rt.id
  where rt.active = true
    and p_check_out > p_check_in
    and p_check_in >= current_date
    and p_guests >= 1
    and p_guests <= rt.max_guests
  group by rt.id
  order by rt.base_price;
$$;

revoke all on function public.get_available_room_types(date,date,integer) from public,anon,authenticated;
grant execute on function public.get_available_room_types(date,date,integer) to anon,authenticated;