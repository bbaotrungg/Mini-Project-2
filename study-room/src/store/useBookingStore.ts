import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Booking, Filters, User, emptyFilters, bookingError, checkInError } from '../core';
import { rooms } from '../data/rooms';
import { request, SERVER_URL } from '../services/realtime';
import { cancelReminder, Reminder, scheduleReminder } from '../services/reminders';

type State = {
  user: User | null; bookings: Booking[]; filters: Filters; reminders: Record<string, Reminder>;
  hydrated: boolean; connected: boolean; synced: boolean; busy: boolean;
  signIn: (name: string) => void; signOut: () => Promise<void>;
  setFilters: (changes: Partial<Filters>) => void; resetFilters: () => void;
  receiveSnapshot: (bookings: Booking[]) => void; setConnected: (connected: boolean) => void;
  book: (roomId: string, date: string, slotId: string) => Promise<Booking>;
  cancel: (id: string) => Promise<void>; checkIn: (id: string) => Promise<void>;
  retryReminder: (id: string) => Promise<void>;
};
export const useBookingStore = create<State>()(persist((set, get) => ({
  user: null, bookings: [], filters: { ...emptyFilters }, reminders: {}, hydrated: false, connected: false, synced: false, busy: false,
  signIn: name => {
    const trimmed = name.trim();
    if (trimmed.length < 2) throw new Error('Please enter at least two characters.');
    set({ user: { id: Crypto.randomUUID(), name: trimmed.slice(0, 40) }, synced: false });
  },
  signOut: async () => {
    if (get().busy) throw new Error('Please wait for your current action to finish.');
    if (get().bookings.some(b => b.userId === get().user?.id)) throw new Error('Cancel your reservations before ending this demo session.');
    set({ user: null, filters: { ...emptyFilters }, reminders: {}, connected: false, synced: false });
  },
  setFilters: changes => set({ filters: { ...get().filters, ...changes } }),
  resetFilters: () => set({ filters: { ...emptyFilters } }),
  receiveSnapshot: bookings => set({ bookings, synced: true }),
  setConnected: connected => set({ connected, ...(!connected ? { synced: false } : {}) }),
  book: async (roomId, date, slotId) => {
    if (get().busy) throw new Error('Please wait for your current action.');
    const user = get().user;
    if (!user) throw new Error('Start a student session first.');
    if (SERVER_URL && !get().synced) throw new Error('Waiting for the latest availability.');
    const error = bookingError(get().bookings, rooms, roomId, date, slotId);
    if (error) throw new Error(error);
    set({ busy: true });
    try {
      let booking: Booking;
      if (SERVER_URL) {
        const result = await request('book', { roomId, date, slotId });
        if (!result.booking || !result.bookings) throw new Error('Invalid server response.');
        booking = result.booking;
        set({ bookings: result.bookings });
      } else {
        // Synchronous check-and-insert: no await between conflict validation and reservation.
        booking = { id: Crypto.randomUUID(), userId: user.id, userName: user.name, roomId, date, slotId, checkedIn: false };
        set({ bookings: [...get().bookings, booking] });
      }
      const reminder = await scheduleReminder(booking, rooms.find(r => r.id === roomId)!.name);
      set({ reminders: { ...get().reminders, [booking.id]: reminder } });
      return booking;
    } finally { set({ busy: false }); }
  },
  cancel: async id => {
    if (get().busy) throw new Error('Please wait for your current action.');
    const booking = get().bookings.find(b => b.id === id && b.userId === get().user?.id);
    if (!booking) throw new Error('Reservation not found.');
    set({ busy: true });
    try {
      if (SERVER_URL) {
        const result = await request('cancel', { id });
        if (result.bookings) set({ bookings: result.bookings });
      } else set({ bookings: get().bookings.filter(b => b.id !== id) });
      // Cancellation remains successful even if the OS fails to remove its reminder.
      try { await cancelReminder(get().reminders[id]?.id); } catch { /* cleaned up on next app startup */ }
      const reminders = { ...get().reminders }; delete reminders[id]; set({ reminders });
    } finally { set({ busy: false }); }
  },
  checkIn: async id => {
    if (get().busy) throw new Error('Please wait for your current action.');
    const booking = get().bookings.find(b => b.id === id && b.userId === get().user?.id);
    if (!booking) throw new Error('Reservation not found.');
    const error = checkInError(booking); if (error) throw new Error(error);
    set({ busy: true });
    try {
      if (SERVER_URL) {
        const result = await request('check-in', { id });
        if (result.bookings) set({ bookings: result.bookings });
      } else set({ bookings: get().bookings.map(b => b.id === id ? { ...b, checkedIn: true } : b) });
      try { await cancelReminder(get().reminders[id]?.id); } catch { /* OS may already have delivered it */ }
    } finally { set({ busy: false }); }
  },
  retryReminder: async id => {
    const booking = get().bookings.find(b => b.id === id && b.userId === get().user?.id);
    if (!booking || booking.checkedIn) return;
    const reminder = await scheduleReminder(booking, rooms.find(r => r.id === booking.roomId)!.name);
    set({ reminders: { ...get().reminders, [id]: reminder } });
  },
}), {
  name: SERVER_URL ? 'vku-bookings-shared-v1' : 'vku-bookings-local-v1',
  storage: createJSONStorage(() => AsyncStorage),
  partialize: state => ({ user: state.user, bookings: state.bookings, filters: state.filters, reminders: state.reminders }),
  onRehydrateStorage: () => (_state, error) => {
    // A storage error should not leave the app on its loading screen forever.
    if (error) console.warn('Could not restore saved bookings:', error);
    useBookingStore.setState({ hydrated: true });
  },
}));
