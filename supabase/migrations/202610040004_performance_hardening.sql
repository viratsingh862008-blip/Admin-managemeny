drop policy if exists "public can read hotel settings" on public.hotel_settings;
drop policy if exists "public read active room types" on public.room_types;
drop policy if exists "public read active rooms" on public.rooms;
drop policy if exists "public read active services" on public.services;
drop policy if exists "public read published media" on public.media_assets;
drop policy if exists "public read published reviews" on public.hotel_reviews;

create policy "public anon read hotel settings" on public.hotel_settings
for select to anon using (true);
create policy "public anon read active room types" on public.room_types
for select to anon using (active = true);
create policy "public anon read active rooms" on public.rooms
for select to anon using (active = true);
create policy "public anon read active services" on public.services
for select to anon using (active = true);
create policy "public anon read published media" on public.media_assets
for select to anon using (published = true);
create policy "public anon read published reviews" on public.hotel_reviews
for select to anon using (published = true);

drop policy if exists "staff can read own profile" on public.staff_profiles;
create policy "staff can read own profile" on public.staff_profiles
for select to authenticated
using (user_id = (select auth.uid()));

create index if not exists rooms_room_type_id_idx on public.rooms(room_type_id);
create index if not exists reservations_created_by_idx on public.reservations(created_by);
create index if not exists room_blocks_created_by_idx on public.room_blocks(created_by);
create index if not exists reservation_services_reservation_id_idx on public.reservation_services(reservation_id);
create index if not exists reservation_services_service_id_idx on public.reservation_services(service_id);
create index if not exists payments_reservation_id_idx on public.payments(reservation_id);
create index if not exists media_assets_created_by_idx on public.media_assets(created_by);
create index if not exists audit_events_actor_user_id_idx on public.audit_events(actor_user_id);