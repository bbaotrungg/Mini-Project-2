import React, { useState } from 'react';
import { FlatList, Modal, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { dateLabel, slotLabel, slotTime } from '../../core';
import { rooms } from '../../data/rooms';
import { useBookingStore } from '../../store/useBookingStore';
import { BookingPass } from '../../components/BookingPass';
import { Button, colors, Empty, styles, useNow } from '../../ui';
const reminderText = { scheduled: 'Reminder set · 15 minutes before', denied: 'Notifications disabled · enable in device settings', 'too-late': 'Less than 15 minutes away · reminder not scheduled', unsupported: 'Reminders are available on Android and iOS', failed: 'Reminder could not be scheduled · tap to retry' };
export default function MyBookings() {
  const { pass } = useLocalSearchParams<{ pass?: string }>();
  const user = useBookingStore(s => s.user);
  const bookings = useBookingStore(s => s.bookings);
  const reminders = useBookingStore(s => s.reminders);
  const cancel = useBookingStore(s => s.cancel);
  const retryReminder = useBookingStore(s => s.retryReminder);
  const busy = useBookingStore(s => s.busy);
  const now = useNow();
  const [passId, setPassId] = useState<string | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const mine = bookings.filter(b => b.userId === user?.id).sort((a, b) => slotTime(a.date, a.slotId) - slotTime(b.date, b.slotId));
  return <SafeAreaView edges={['top']} style={styles.page}>
    <View style={styles.content}><Text style={styles.eyebrow}>MAKE TIME FOR PROGRESS</Text><Text style={styles.title}>My bookings.</Text><Text style={styles.muted}>Your space is saved. Bring your ideas.</Text>{!!error && <Text style={{ color: colors.red }}>{error}</Text>}</View>
    <FlatList data={mine} keyExtractor={b => b.id} contentContainerStyle={[styles.content, { paddingTop: 0 }]} ListEmptyComponent={<View style={{ gap: 15 }}><Empty title="Your next session starts here" detail="Reserve a room and your booking pass will appear here." /><Button title="Explore study spaces" onPress={() => router.navigate('/')} /></View>} renderItem={({ item }) => {
      const room = rooms.find(r => r.id === item.roomId)!;
      const ended = slotTime(item.date, item.slotId, true) <= now;
      return <View style={[styles.card, { padding: 20, gap: 13 }]}>
        <View style={[styles.row, { justifyContent: 'space-between' }]}><Text style={styles.eyebrow}>{ended ? 'COMPLETED' : item.checkedIn ? 'CHECKED IN' : 'CONFIRMED'}</Text><Text style={styles.muted}>{room.id.toUpperCase()}</Text></View>
        <Text style={styles.heading}>{room.name}</Text><Text style={styles.text}>{dateLabel(item.date)} · {slotLabel(item.slotId)}</Text><Text style={styles.muted}>Building {room.building} · Floor {room.floor}</Text>
        {!ended && !item.checkedIn && <Text style={[styles.muted, { fontSize: 12 }]}>{reminders[item.id] ? reminderText[reminders[item.id].status] : 'No reminder on this device'}</Text>}
        {!ended && !item.checkedIn && reminders[item.id]?.status !== 'scheduled' && <Button title="Set reminder" secondary disabled={busy} onPress={() => void retryReminder(item.id)} />}
        {!ended && <Button title="Open booking pass" onPress={() => setPassId(item.id)} />}
        <Button title={ended ? 'Remove from history' : 'Cancel reservation'} secondary disabled={busy} onPress={() => { setError(''); setCancelId(item.id); }} />
      </View>;
    }} />
    <BookingPass booking={bookings.find(b => b.id === (pass || passId) && b.userId === user?.id)} onClose={() => { setPassId(null); router.setParams({ pass: '' }); }} />
    <Modal visible={!!cancelId} transparent animationType="fade" onRequestClose={() => setCancelId(null)}><View style={{ flex: 1, padding: 30, justifyContent: 'center', backgroundColor: '#12291F99' }}><View style={[styles.card, { padding: 24, gap: 18, maxWidth: 440, width: '100%', alignSelf: 'center' }]}><Text style={styles.heading}>Remove this reservation?</Text><Text style={styles.muted}>Your room slot will be released and its reminder cancelled.</Text><Button title={busy ? 'Removing…' : 'Yes, remove reservation'} danger disabled={busy} onPress={() => { if (cancelId) void cancel(cancelId).then(() => setCancelId(null)).catch(e => { setError(e.message); setCancelId(null); }); }} /><Button title="Keep reservation" secondary disabled={busy} onPress={() => setCancelId(null)} /></View></View></Modal>
  </SafeAreaView>;
}
