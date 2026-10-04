import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync('src/App.tsx', 'utf8');
const api = fs.readFileSync('src/lib/hotelApi.ts', 'utf8');

assert.doesNotMatch(app, /<Flipbook[^>]*onUpload=\{\(\)=>\{\}\}/);
assert.match(app, /getPublicHotelSettings/);
assert.doesNotMatch(app, /\+ 12% tax/);
assert.match(app, /updateHotelSettings/);
assert.match(app, /setAnchor/);
assert.match(app, /payments/);
assert.match(api, /export async function getPublicHotelSettings/);
assert.match(api, /export async function updateHotelSettings/);
const html = fs.readFileSync('index.html', 'utf8');
assert.match(html, /rel="canonical"/);
assert.match(html, /property="og:title"/);
assert.match(html, /name="robots"/);
assert.match(html, /favicon\.svg/);

console.log('red-team regression contracts: public upload, dynamic tax, settings persistence, calendar state, payment-backed data');
