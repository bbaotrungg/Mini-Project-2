import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Booking } from '../src/core';
import { createBookingServer } from './app';

const directory = resolve('server/data');
mkdirSync(directory, { recursive: true });
const file = resolve(directory, 'bookings.json');
const initial = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) as Booking[] : [];
if (!Array.isArray(initial)) throw new Error('Invalid bookings file. Restore a valid backup before starting.');
const { http } = createBookingServer(initial, bookings => {
  const temp = resolve(directory, 'bookings.tmp');
  writeFileSync(temp, JSON.stringify(bookings, null, 2));
  renameSync(temp, file);
});
const port = Number(process.env.PORT ?? 3001);
http.listen(port, '0.0.0.0', () => console.log(`Study room server listening on port ${port}. Set EXPO_PUBLIC_BOOKING_SERVER_URL to your computer's LAN address.`));
