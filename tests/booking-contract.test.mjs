import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
const schema=fs.readFileSync('supabase/migrations/202610050001_sports_arena.sql','utf8')
assert.match(schema,/booking_date date not null/)
assert.match(schema,/bookings_slot_unique/)
assert.match(schema,/status in\('pending','confirmed','checked_in'\)/)
assert.match(schema,/Participant count exceeds capacity/)
assert.match(schema,/Booking date cannot be in the past/)
assert.match(schema,/Selected slot is unavailable/)
console.log('booking safety contracts passed')