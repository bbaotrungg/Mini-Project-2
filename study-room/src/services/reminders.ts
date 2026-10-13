import { Platform } from 'react-native';
import * as Notifications from './localNotifications';
import { Booking, slotTime, slotLabel } from '../core';

Notifications.setNotificationHandler({ handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }) });
export type Reminder = { id?: string; status: 'scheduled' | 'denied' | 'too-late' | 'unsupported' | 'failed' };
export async function scheduleReminder(booking: Booking, roomName: string): Promise<Reminder> {
  if (Platform.OS === 'web') return { status: 'unsupported' };
  const date = new Date(slotTime(booking.date, booking.slotId) - 15 * 60000);
  if (date.getTime() <= Date.now()) return { status: 'too-late' };
  try {
    if (Platform.OS === 'android') await Notifications.setNotificationChannelAsync('check-in', { name: 'Study room check-in', importance: Notifications.AndroidImportance.HIGH });
    let permission = await Notifications.getPermissionsAsync();
    if (!permission.granted) permission = await Notifications.requestPermissionsAsync();
    if (!permission.granted) return { status: 'denied' };
    const id = await Notifications.scheduleNotificationAsync({
      identifier: `study-room-${booking.id}`,
      content: { title: 'Time to check in 📚', body: `${roomName} starts in 15 minutes (${slotLabel(booking.slotId)}). Open your booking pass.`, data: { bookingId: booking.id }, sound: true },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date, channelId: 'check-in' },
    });
    return { id, status: 'scheduled' };
  } catch { return { status: 'failed' }; }
}
export async function cancelReminder(id?: string) {
  if (id && Platform.OS !== 'web') await Notifications.cancelScheduledNotificationAsync(id);
}
