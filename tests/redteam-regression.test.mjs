import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync('src/App.tsx', 'utf8');
const api = fs.readFileSync('src/lib/hotelApi.ts', 'utf8');

assert.doesNotMatch(app, /<Flipbook[^>]*onUpload=\{\(\)=>\{\}\}/);
assert.match(app, /getPublicHotelSettings/);
assert.doesNotMatch(app, /\+ 12% tax/);
assert.match(app, /updateHotelSettings/);
assert.match(app, /setCalendarDate/);
assert.match(app, /payments/);
assert.match(api, /export async function getPublicHotelSettings/);
assert.match(api, /export async function updateHotelSettings/);

console.log('red-team regression contracts: public upload, dynamic tax, settings persistence, calendar state, payment-backed data');
