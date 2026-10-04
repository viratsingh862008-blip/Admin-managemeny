import assert from 'node:assert/strict';
import fs from 'node:fs';

const sql = fs.readFileSync('supabase/migrations/202610040002_website_booking_rpc.sql', 'utf8');

assert.match(sql, /create or replace function public\.create_website_reservation/i);
assert.match(sql, /security definer/i);
assert.match(sql, /for update skip locked/i);
assert.match(sql, /p_room_type_id/i);
assert.match(sql, /p_check_in/i);
assert.match(sql, /p_check_out/i);
assert.match(sql, /raise exception 'No rooms available'/i);
assert.match(sql, /set search_path = public, pg_temp/i);
console.log('website booking RPC contract: 6/6 checks passed');