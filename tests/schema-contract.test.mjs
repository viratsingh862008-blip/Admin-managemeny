import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const sql=fs.readFileSync(new URL('../supabase/migrations/202610040001_hotel_bhola_core.sql',import.meta.url),'utf8');
test('hotel schema defines database-enforced reservation overlap protection',()=>assert.match(sql,/reservations_room_no_overlap/));
test('hotel schema enables RLS on every exposed hotel table',()=>{for(const table of ['hotel_settings','staff_profiles','room_types','rooms','guests','reservations','room_blocks','services','reservation_services','payments','media_assets','audit_events','hotel_reviews']) assert.match(sql,new RegExp('alter table public\\.'+table+' enable row level security'));});
test('website reservations are created through the validated RPC instead of direct table inserts',()=>{assert.match(sql,/status = 'pending' and source = 'website'/); const hardening=fs.readFileSync(new URL('../supabase/migrations/202610050001_reservation_rpc_only_security.sql',import.meta.url),'utf8'); assert.match(hardening,/drop policy if exists.*public can create reservations/i); assert.match(hardening,/revoke insert on public\.reservations from anon, authenticated/i); assert.match(hardening,/grant execute on function public\.create_website_reservation/i);});
test('production admin authorization is staff-profile based',()=>assert.match(sql,/public\.is_hotel_staff\(\)/));
