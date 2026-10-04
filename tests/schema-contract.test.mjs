import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const sql=fs.readFileSync(new URL('../supabase/migrations/202610040001_hotel_bhola_core.sql',import.meta.url),'utf8');
test('hotel schema defines database-enforced reservation overlap protection',()=>assert.match(sql,/reservations_room_no_overlap/));
test('hotel schema enables RLS on every exposed hotel table',()=>{for(const table of ['hotel_settings','staff_profiles','room_types','rooms','guests','reservations','room_blocks','services','reservation_services','payments','media_assets','audit_events','hotel_reviews']) assert.match(sql,new RegExp('alter table public\\.'+table+' enable row level security'));});
test('anonymous users can only create pending website reservations',()=>assert.match(sql,/status = 'pending' and source = 'website'/));
test('production admin authorization is staff-profile based',()=>assert.match(sql,/public\.is_hotel_staff\(\)/));
