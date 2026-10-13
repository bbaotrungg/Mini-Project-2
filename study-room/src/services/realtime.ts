import { io, Socket } from 'socket.io-client';
import { Booking, User } from '../core';

export const SERVER_URL = process.env.EXPO_PUBLIC_BOOKING_SERVER_URL?.trim();
let socket: Socket | undefined;
type Result = { bookings?: Booking[]; booking?: Booking; error?: string };
export function connectRealtime(user: User, onSnapshot: (bookings: Booking[]) => void, onStatus: (connected: boolean) => void) {
  socket?.disconnect();
  socket = io(SERVER_URL!, { auth: { user }, transports: ['websocket'], reconnection: true });
  socket.on('snapshot', onSnapshot);
  socket.on('connect', () => onStatus(true));
  socket.on('disconnect', () => onStatus(false));
  socket.on('connect_error', () => onStatus(false));
  return () => { socket?.disconnect(); socket = undefined; };
}
export function request(event: string, payload: object): Promise<Result> {
  return new Promise((resolve, reject) => {
    if (!socket?.connected) return reject(new Error('The booking server is offline. Please reconnect before booking.'));
    socket.timeout(8000).emit(event, payload, (error: Error | null, result: Result) => {
      if (error) reject(new Error('The server did not respond. Check My Bookings before trying again.'));
      else if (result.error) reject(new Error(result.error));
      else resolve(result);
    });
  });
}
