export type Equipment = 'Projector' | 'Whiteboard' | 'High-spec PC' | 'AC';
export type Room = { id: string; name: string; building: string; floor: number; capacity: number; equipment: Equipment[]; photo: string; description: string };
export type User = { id: string; name: string };
export type Booking = { id: string; userId: string; userName: string; roomId: string; date: string; slotId: string; checkedIn: boolean };
export type Filters = { search: string; building: string | null; capacity: number; equipment: Equipment[] };
export const emptyFilters: Filters = { search: '', building: null, capacity: 2, equipment: [] };
export const SLOTS = [
  { id: 'morning-1', start: '07:30', end: '09:30' },
  { id: 'morning-2', start: '09:30', end: '11:30' },
  { id: 'afternoon-1', start: '13:00', end: '15:00' },
  { id: 'afternoon-2', start: '15:00', end: '17:00' },
] as const;
export const campusDate = (now = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
export function nextSevenDays(now = new Date()): string[] {
  const day = new Date(`${campusDate(now)}T12:00:00+07:00`);
  return Array.from({ length: 7 }, (_, i) => campusDate(new Date(day.getTime() + i * 86400000)));
}
export function slotTime(date: string, slotId: string, end = false): number {
  const slot = SLOTS.find(s => s.id === slotId);
  return slot ? new Date(`${date}T${end ? slot.end : slot.start}:00+07:00`).getTime() : NaN;
}
export function slotConflict(bookings: Booking[], roomId: string, date: string, slotId: string) {
  return bookings.some(b => b.roomId === roomId && b.date === date && b.slotId === slotId);
}
export function bookingError(bookings: Booking[], rooms: Room[], roomId: string, date: string, slotId: string, now = Date.now()): string | null {
  if (!rooms.some(r => r.id === roomId)) return 'Room not found.';
  if (!SLOTS.some(s => s.id === slotId)) return 'Choose a valid time slot.';
  if (!nextSevenDays(new Date(now)).includes(date)) return 'Choose a date within the next seven days.';
  if (slotTime(date, slotId) <= now) return 'This time slot has already started.';
  if (slotConflict(bookings, roomId, date, slotId)) return 'Someone just booked this slot. Please choose another.';
  return null;
}
export function checkInError(booking: Booking, now = Date.now()): string | null {
  if (booking.checkedIn) return 'Already checked in.';
  if (now < slotTime(booking.date, booking.slotId) - 15 * 60000) return 'Check-in opens 15 minutes before your session.';
  if (now >= slotTime(booking.date, booking.slotId, true)) return 'This session has ended.';
  return null;
}
export function isOccupied(roomId: string, bookings: Booking[], now = Date.now()) {
  return bookings.some(b => b.roomId === roomId && slotTime(b.date, b.slotId) <= now && now < slotTime(b.date, b.slotId, true));
}
export function matchesFilters(room: Room, filters: Filters) {
  const query = filters.search.trim().toLowerCase();
  return (!query || `${room.name} ${room.building} ${room.description}`.toLowerCase().includes(query)) &&
    (!filters.building || room.building === filters.building) && room.capacity >= filters.capacity &&
    filters.equipment.every(e => room.equipment.includes(e));
}
export function dateLabel(date: string) {
  return new Date(`${date}T12:00:00+07:00`).toLocaleDateString('en-GB', { timeZone: 'Asia/Ho_Chi_Minh', day: 'numeric', month: 'short', weekday: 'short' });
}
export function slotLabel(id: string) {
  const slot = SLOTS.find(s => s.id === id);
  return slot ? `${slot.start}–${slot.end}` : '';
}
