export const STATUSES = Object.freeze({
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CHECKED_IN: 'checked-in',
  IN_HOUSE: 'in-house',
  CHECKED_OUT: 'checked-out',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no-show',
});
const BLOCKING = new Set([STATUSES.PENDING, STATUSES.CONFIRMED, STATUSES.CHECKED_IN, STATUSES.IN_HOUSE]);
export function nightsBetween(checkIn, checkOut) {
  const a = new Date(checkIn + 'T12:00:00Z');
  const b = new Date(checkOut + 'T12:00:00Z');
  const days = Math.round((b - a) / 86400000);
  if (!Number.isFinite(days) || days <= 0) throw new Error('Check-out must be after check-in');
  return days;
}
export function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return new Date(aStart + 'T12:00:00Z') < new Date(bEnd + 'T12:00:00Z')
    && new Date(bStart + 'T12:00:00Z') < new Date(aEnd + 'T12:00:00Z');
}
export function isBlockingStatus(status) { return BLOCKING.has(status); }
export function isRoomAvailable(roomId, checkIn, checkOut, reservations, blocks = []) {
  nightsBetween(checkIn, checkOut);
  const reservationConflict = reservations.some((r) =>
    r.roomId === roomId && isBlockingStatus(r.status) && rangesOverlap(checkIn, checkOut, r.checkIn, r.checkOut),
  );
  if (reservationConflict) return false;
  return !blocks.some((b) => b.roomId === roomId && rangesOverlap(checkIn, checkOut, b.startDate, b.endDate));
}
export function calculateBookingTotal(pricePerNight, checkIn, checkOut, rooms = 1, taxPercent = 12) {
  const nights = nightsBetween(checkIn, checkOut);
  const subtotal = pricePerNight * nights * rooms;
  const tax = Math.round(subtotal * (taxPercent / 100));
  return { nights, subtotal, tax, total: subtotal + tax };
}
export function transitionReservation(current, next) {
  const allowed = {
    [STATUSES.PENDING]: new Set([STATUSES.CONFIRMED, STATUSES.CANCELLED]),
    [STATUSES.CONFIRMED]: new Set([STATUSES.CHECKED_IN, STATUSES.CANCELLED, STATUSES.NO_SHOW]),
    [STATUSES.CHECKED_IN]: new Set([STATUSES.IN_HOUSE, STATUSES.CHECKED_OUT]),
    [STATUSES.IN_HOUSE]: new Set([STATUSES.CHECKED_OUT]),
    [STATUSES.CHECKED_OUT]: new Set(),
    [STATUSES.CANCELLED]: new Set(),
    [STATUSES.NO_SHOW]: new Set(),
  };
  if (current === next) return current;
  if (!allowed[current]?.has(next)) throw new Error('Invalid reservation transition: ' + current + ' → ' + next);
  return next;
}