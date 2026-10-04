import assert from 'node:assert/strict';
import fs from 'node:fs';

const sql = fs.readFileSync('supabase/migrations/202610040003_public_availability_rpc.sql', 'utf8');

assert.match(sql, /create or replace function public\.get_available_room_types/i);
assert.match(sql, /security definer/i);
assert.match(sql, /p_check_in/i);
assert.match(sql, /p_check_out/i);
assert.match(sql, /p_guests/i);
assert.match(sql, /available_rooms/i);
assert.match(sql, /set search_path = public, pg_temp/i);
console.log('public availability RPC contract: 6/6 checks passed');