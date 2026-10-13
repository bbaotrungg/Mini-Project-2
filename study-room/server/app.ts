import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { Server } from 'socket.io';
import { Booking, User, bookingError, checkInError } from '../src/core';
import { rooms } from '../src/data/rooms';

// A single server process owns the authoritative reservations.
// Validation, durable write, and publication run synchronously with no await gap.
export function createBookingServer(initial: Booking[] = [], persist: (bookings: Booking[]) => void = () => {}) {
  let bookings = initial;
  const http = createServer((req, res) => {
    if (req.url === '/health') { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ ok: true })); }
    else { res.writeHead(404); res.end('Not found'); }
  });
  const io = new Server(http, { cors: { origin: '*' }, maxHttpBufferSize: 10000 });
  io.use((socket, next) => {
    const user = socket.handshake.auth.user as User | undefined;
    if (!user || typeof user.id !== 'string' || typeof user.name !== 'string' || !user.name.trim() || user.name.length > 40 || !/^[a-f0-9-]{36}$/i.test(user.id)) return next(new Error('Invalid demo session.'));
    socket.data.user = user;
    next();
  });
  function commit(next: Booking[]) {
    persist(next); // Throw on disk failure so an unpersisted booking is never acknowledged.
    bookings = next;
    io.emit('snapshot', bookings);
  }
  io.on('connection', socket => {
    const user = socket.data.user as User;
    socket.emit('snapshot', bookings);
    type Reply = (result: { bookings?: Booking[]; booking?: Booking; error?: string }) => void;
    const handle = (event: string, action: (payload: Record<string, unknown>) => Booking | undefined) => {
      socket.on(event, (payload: unknown, reply: Reply) => {
        if (typeof reply !== 'function') return;
        try {
          if (!payload || typeof payload !== 'object') throw new Error('Invalid request.');
          const booking = action(payload as Record<string, unknown>);
          reply({ bookings, ...(booking ? { booking } : {}) });
        } catch (error) { reply({ error: (error as Error).message }); }
      });
    };
    handle('book', payload => {
      const { roomId, date, slotId } = payload;
      if (typeof roomId !== 'string' || typeof date !== 'string' || typeof slotId !== 'string') throw new Error('Invalid booking request.');
      const error = bookingError(bookings, rooms, roomId, date, slotId);
      if (error) throw new Error(error);
      const booking: Booking = { id: randomUUID(), userId: user.id, userName: user.name, roomId, date, slotId, checkedIn: false };
      commit([...bookings, booking]);
      return booking;
    });
    handle('cancel', payload => {
      const booking = bookings.find(b => b.id === payload.id && b.userId === user.id);
      if (!booking) throw new Error('Reservation not found for this student.');
      commit(bookings.filter(b => b.id !== booking.id));
      return undefined;
    });
    handle('check-in', payload => {
      const booking = bookings.find(b => b.id === payload.id && b.userId === user.id);
      if (!booking) throw new Error('Reservation not found for this student.');
      const error = checkInError(booking); if (error) throw new Error(error);
      commit(bookings.map(b => b.id === booking.id ? { ...b, checkedIn: true } : b));
      return undefined;
    });
  });
  return { http, io };
}
