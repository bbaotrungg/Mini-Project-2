import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { AddressInfo } from 'node:net';
import { io, Socket } from 'socket.io-client';
import { createBookingServer } from '../server/app';
import { Booking, nextSevenDays } from '../src/core';
type Result = { booking?: Booking; bookings?: Booking[]; error?: string };
const emit = (socket: Socket, event: string, payload: object): Promise<Result> => new Promise((resolve, reject) => socket.timeout(2000).emit(event, payload, (error: Error | null, result: Result) => error ? reject(error) : resolve(result)));
test('two clients cannot reserve one slot; snapshots, ownership, cancellation, and restart work', async () => {
  let persisted: Booking[] = [];
  const server = createBookingServer([], next => { persisted = next; });
  await new Promise<void>(resolve => server.http.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${(server.http.address() as AddressInfo).port}`;
  const clients: Socket[] = [];
  try {
    const connect = async () => {
      const socket = io(url, { auth: { user: { id: randomUUID(), name: 'Student' } }, transports: ['websocket'], reconnection: false });
      clients.push(socket);
      await new Promise<void>((resolve, reject) => { socket.once('snapshot', () => resolve()); socket.once('connect_error', reject); });
      return socket;
    };
    const a = await connect(); const b = await connect();
    let latest: Booking[] = [];
    b.on('snapshot', bookings => { latest = bookings; });
    const payload = { roomId: 'a201', date: nextSevenDays()[1], slotId: 'morning-1' };
    const results = await Promise.all([emit(a, 'book', payload), emit(b, 'book', payload)]);
    assert.equal(results.filter(r => r.booking).length, 1);
    assert.equal(results.filter(r => r.error?.includes('just booked')).length, 1);
    assert.equal(persisted.length, 1);
    await new Promise(resolve => setTimeout(resolve, 20));
    assert.equal(latest.length, 1);
    const winner = results[0].booking ? a : b; const loser = winner === a ? b : a;
    const id = persisted[0].id;
    assert.match((await emit(loser, 'cancel', { id })).error!, /not found/);
    assert.match((await emit(winner, 'check-in', { id })).error!, /opens/);
    assert.equal((await emit(winner, 'cancel', { id })).bookings?.length, 0);
    assert.ok((await emit(loser, 'book', payload)).booking);
    const restored = createBookingServer(persisted);
    await new Promise<void>(resolve => restored.http.listen(0, '127.0.0.1', resolve));
    const c = io(`http://127.0.0.1:${(restored.http.address() as AddressInfo).port}`, { auth: { user: { id: randomUUID(), name: 'Other' } }, transports: ['websocket'], reconnection: false });
    clients.push(c);
    await new Promise<void>((resolve, reject) => { c.once('snapshot', data => { assert.equal(data.length, 1); resolve(); }); c.once('connect_error', reject); });
    assert.match((await emit(c, 'book', payload)).error!, /just booked/);
    c.disconnect(); await new Promise<void>(resolve => restored.io.close(() => resolve()));
  } finally { clients.forEach(client => client.disconnect()); await new Promise<void>(resolve => server.io.close(() => resolve())); }
});
test('a failed durable write never publishes or acknowledges a reservation', async () => {
  const server = createBookingServer([], () => { throw new Error('Disk unavailable'); });
  await new Promise<void>(resolve => server.http.listen(0, '127.0.0.1', resolve));
  const client = io(`http://127.0.0.1:${(server.http.address() as AddressInfo).port}`, { auth: { user: { id: randomUUID(), name: 'Student' } }, transports: ['websocket'], reconnection: false });
  try {
    await new Promise<void>((resolve, reject) => { client.once('snapshot', () => resolve()); client.once('connect_error', reject); });
    const result = await emit(client, 'book', { roomId: 'a201', date: nextSevenDays()[1], slotId: 'morning-1' });
    assert.equal(result.error, 'Disk unavailable'); assert.equal(result.booking, undefined);
  } finally { client.disconnect(); await new Promise<void>(resolve => server.io.close(() => resolve())); }
});
