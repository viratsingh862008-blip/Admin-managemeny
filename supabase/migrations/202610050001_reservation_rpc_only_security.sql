-- Public reservations must enter through the validated SECURITY DEFINER RPC.
-- Direct table INSERT is intentionally unavailable to anon/authenticated clients.
drop policy if exists "public can create reservations" on public.reservations;
revoke insert on public.reservations from anon, authenticated;
revoke all on function public.create_website_reservation(uuid,date,date,integer,text,text,text,text) from public, anon, authenticated;
grant execute on function public.create_website_reservation(uuid,date,date,integer,text,text,text,text) to anon, authenticated;
