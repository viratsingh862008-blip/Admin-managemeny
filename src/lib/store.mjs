const KEY = 'bhola-inn-admin-v1';
const seed = {
  reservations: [
    { id: 'BI-1001', guest: 'Rahul Kumar', phone: '+91 98xxxxxx21', roomId: 'deluxe-101', roomType: 'Deluxe Room', checkIn: '2026-10-05', checkOut: '2026-10-07', guests: 2, status: 'confirmed', amount: 4928, source: 'Website' },
    { id: 'BI-1002', guest: 'Priya Singh', phone: '+91 97xxxxxx62', roomId: 'suite-201', roomType: 'Suite Room', checkIn: '2026-10-06', checkOut: '2026-10-08', guests: 2, status: 'pending', amount: 7168, source: 'Phone' },
    { id: 'BI-1003', guest: 'Aman Verma', phone: '+91 91xxxxxx10', roomId: 'deluxe-102', roomType: 'Deluxe Room', checkIn: '2026-10-04', checkOut: '2026-10-05', guests: 1, status: 'checked-in', amount: 2464, source: 'Walk-in' },
  ],
  rooms: [
    ...Array.from({length: 8}, (_, i) => ({ id: 'deluxe-' + (101+i), number: String(101+i), typeId: 'deluxe', type: 'Deluxe Room', status: i === 1 ? 'cleaning' : 'clean', floor: 1 })),
    ...Array.from({length: 4}, (_, i) => ({ id: 'suite-' + (201+i), number: String(201+i), typeId: 'suite', type: 'Suite Room', status: i === 0 ? 'clean' : 'vacant', floor: 2 })),
  ],
  blocks: [],
  services: [
    { id: 'svc-breakfast', name: 'Breakfast', price: 350, mode: 'per guest' },
    { id: 'svc-transfer', name: 'Airport / station transfer', price: 600, mode: 'per booking' },
    { id: 'svc-laundry', name: 'Laundry', price: 150, mode: 'per quantity' },
  ],
  offers: [{ id: 'offer-direct', code: 'BHOLA10', label: 'Direct booking benefit', type: 'percent', value: 10, enabled: true }],
  audit: [],
};
function clone(value) { return JSON.parse(JSON.stringify(value)); }
export function loadStore() {
  try { const raw = localStorage.getItem(KEY); return raw ? { ...clone(seed), ...JSON.parse(raw) } : clone(seed); }
  catch { return clone(seed); }
}
export function saveStore(state) { localStorage.setItem(KEY, JSON.stringify(state)); }
export function appendAudit(state, action, actor = 'Admin') {
  state.audit.unshift({ id: crypto.randomUUID(), action, actor, at: new Date().toISOString() });
  state.audit = state.audit.slice(0, 100);
}
export function resetStore() { localStorage.removeItem(KEY); return clone(seed); }