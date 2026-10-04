import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('hotel project contains public, admin and flipbook surfaces',()=>{
  const app=fs.readFileSync('src/App.tsx','utf8');
  assert.ok(app.includes('Reservations'));
  assert.ok(app.includes('Housekeeping'));
  assert.ok(app.includes('Dining & Menu'));
  assert.ok(app.includes('Flipbook'));
  assert.ok(fs.existsSync('src/lib/booking.mjs'));
  assert.ok(fs.existsSync('src/lib/menuStore.mjs'));
});
