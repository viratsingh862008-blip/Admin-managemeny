import assert from 'node:assert/strict';
import fs from 'node:fs';

const sql = fs.readFileSync('supabase/migrations/202610040005_storage.sql', 'utf8');
assert.match(sql, /bhola-media/i);
assert.match(sql, /storage\.buckets/i);
assert.match(sql, /create policy/i);
assert.match(sql, /public\.is_hotel_staff\(\)/i);
assert.match(sql, /bucket_id = 'bhola-media'/i);
console.log('storage contract: 5/5 checks passed');