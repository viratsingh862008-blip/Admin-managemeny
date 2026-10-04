import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
const app=fs.readFileSync('src/App.tsx','utf8')
const schema=fs.readFileSync('supabase/migrations/202610050001_sports_arena.sql','utf8')
assert.doesNotMatch(app,/Hotel Bhola|Bhola Inn|hotel_bhola|menu_pdf/)
assert.match(app,/Weekly schedule/)
assert.match(app,/Date overrides/)
assert.match(app,/Aryan/)
assert.match(app,/Create reservation/)
assert.match(app,/Live database/)
assert.match(schema,/get_public_slots/)
assert.match(schema,/create_public_booking/)
assert.match(schema,/row level security/)
console.log('sports arena contract checks passed')