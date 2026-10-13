import test from 'node:test';
import assert from 'node:assert/strict';
import { Booking, bookingError, campusDate, checkInError, emptyFilters, isOccupied, matchesFilters, nextSevenDays, slotTime } from '../src/core';
import { rooms } from '../src/data/rooms';
const now = new Date('2026-10-13T06:00:00+07:00').getTime();
const booking: Booking = { id: 'pass', userId: 'student', userName: 'Student', roomId: 'a201', date: '2026-10-13', slotId: 'morning-1', checkedIn: false };
test('campus dates use Vietnam time and roll over month/year correctly', () => {
  assert.equal(campusDate(new Date('2026-12-31T18:00:00Z')), '2027-01-01');
  const dates = nextSevenDays(new Date('2026-12-29T12:00:00+07:00'));
  assert.equal(dates.length, 7); assert.equal(dates[6], '2027-01-04');
});
test('conflicts block the same room/date/slot but allow another room, date, or slot', () => {
  assert.match(bookingError([booking], rooms, 'a201', booking.date, booking.slotId, now)!, /just booked/);
  assert.equal(bookingError([booking], rooms, 'b101', booking.date, booking.slotId, now), null);
  assert.equal(bookingError([booking], rooms, 'a201', '2026-10-14', booking.slotId, now), null);
  assert.equal(bookingError([booking], rooms, 'a201', booking.date, 'morning-2', now), null);
});
test('rejects past slots, invalid room/slot, and dates outside the seven-day window', () => {
  assert.match(bookingError([], rooms, 'a201', booking.date, booking.slotId, slotTime(booking.date, booking.slotId))!, /already started/);
  assert.match(bookingError([], rooms, 'a201', '2026-10-20', booking.slotId, now)!, /seven days/);
  assert.match(bookingError([], rooms, 'fake', booking.date, booking.slotId, now)!, /Room not found/);
  assert.match(bookingError([], rooms, 'a201', booking.date, 'fake', now)!, /valid time slot/);
});
test('occupancy is based on current time, using an exclusive end boundary', () => {
  assert.equal(isOccupied('a201', [booking], now), false);
  assert.equal(isOccupied('a201', [booking], slotTime(booking.date, booking.slotId)), true);
  assert.equal(isOccupied('a201', [booking], slotTime(booking.date, booking.slotId, true)), false);
});
test('check-in opens fifteen minutes before and closes at the session end', () => {
  const start = slotTime(booking.date, booking.slotId);
  assert.match(checkInError(booking, start - 900001)!, /opens/);
  assert.equal(checkInError(booking, start - 900000), null);
  assert.match(checkInError(booking, slotTime(booking.date, booking.slotId, true))!, /ended/);
  assert.match(checkInError({ ...booking, checkedIn: true }, start)!, /Already/);
});
test('search, building, capacity, and all equipment filters combine', () => {
  const filters = { ...emptyFilters, search: 'code', building: 'B', capacity: 20, equipment: ['High-spec PC', 'AC'] as const };
  assert.equal(matchesFilters(rooms[2], { ...filters, equipment: [...filters.equipment] }), true);
  assert.equal(matchesFilters(rooms[0], { ...filters, equipment: [...filters.equipment] }), false);
  assert.equal(matchesFilters(rooms[2], { ...emptyFilters, equipment: ['Whiteboard'] }), false);
});
