import React, { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { rooms } from '../../data/rooms';
import { roomPhotos } from '../../data/photos';
import { dateLabel, nextSevenDays, slotConflict, slotTime, SLOTS } from '../../core';
import { useBookingStore } from '../../store/useBookingStore';
import { SERVER_URL } from '../../services/realtime';
import { BookingPass } from '../../components/BookingPass';
import { Button, Chip, colors, Empty, styles, useNow } from '../../ui';
export default function RoomDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const room = rooms.find(r => r.id === id);
  const bookings = useBookingStore(s => s.bookings);
  const busy = useBookingStore(s => s.busy);
  const connected = useBookingStore(s => s.connected);
  const synced = useBookingStore(s => s.synced);
  const book = useBookingStore(s => s.book);
  const now = useNow();
  const dates = nextSevenDays(new Date(now));
  const [date, setDate] = useState(dates[0]);
  const [slotId, setSlotId] = useState<string | null>(null);
  const [passId, setPassId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const activeDate = dates.includes(date) ? date : dates[0];
  if (!room) return <Empty title="Room not found" detail="Go back and select a room from Discover." />;
  const unavailable = !slotId || slotConflict(bookings, room.id, activeDate, slotId) || slotTime(activeDate, slotId) <= now;
  const offline = !!SERVER_URL && (!connected || !synced);
  const reserve = async () => {
    if (!slotId) return;
    setError('');
    try { const booking = await book(room.id, activeDate, slotId); setPassId(booking.id); setSlotId(null); }
    catch (e) { setError((e as Error).message); }
  };
  return <View style={styles.page}><ScrollView contentContainerStyle={[styles.content, { paddingTop: 8, paddingBottom: 40 }]}>
    <Image source={roomPhotos[room.id]} style={{ height: 210, width: '100%', borderRadius: 20, backgroundColor: colors.pale }} />
    <Text style={styles.eyebrow}>BUILDING {room.building} · FLOOR {room.floor} · {room.id.toUpperCase()}</Text>
    <Text style={styles.title}>{room.name}</Text><Text style={styles.text}>{room.description}</Text>
    <View style={styles.wrap}><Text style={{ backgroundColor: colors.pale, color: colors.green, padding: 10, borderRadius: 10, fontWeight: '700' }}>Up to {room.capacity} students</Text>{room.equipment.map(e => <Text key={e} style={{ padding: 10, backgroundColor: 'white', borderRadius: 10, color: colors.muted }}>{e}</Text>)}</View>
    <Text style={styles.heading}>1. Pick a day</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>{dates.map(day => <Chip key={day} label={dateLabel(day)} selected={day === activeDate} onPress={() => { setDate(day); setSlotId(null); setError(''); }} />)}</ScrollView>
    <Text style={styles.heading}>2. Find your two hours</Text>
    <Text style={styles.muted}>Vietnam campus time · GMT+7</Text>
    <View style={styles.wrap}>{SLOTS.map(slot => {
      const booked = slotConflict(bookings, room.id, activeDate, slot.id);
      const past = slotTime(activeDate, slot.id) <= now;
      const disabled = booked || past || offline;
      const selected = slot.id === slotId && !disabled;
      return <Pressable key={slot.id} accessibilityRole="button" accessibilityState={{ disabled, selected }} disabled={disabled} onPress={() => { setSlotId(slot.id); setError(''); }} style={{ width: '48%', padding: 18, borderRadius: 14, borderWidth: 1, borderColor: selected ? colors.green : colors.border, backgroundColor: selected ? colors.pale : 'white', opacity: disabled ? 0.5 : 1 }}><Text style={{ fontSize: 16, color: colors.ink, fontWeight: '700' }}>{slot.start}–{slot.end}</Text><Text style={{ fontSize: 12, marginTop: 6, color: booked ? colors.red : colors.green }}>{booked ? 'Booked' : past ? 'Already started' : offline ? 'Waiting for server' : selected ? '✓ Selected' : 'Available'}</Text></Pressable>;
    })}</View>
    {offline && <Text style={{ color: colors.red }}>Reconnecting to shared availability…</Text>}
    {!!error && <Text accessibilityRole="alert" style={{ color: colors.red }}>{error}</Text>}
    <Button title={busy ? 'Reserving your space…' : 'Reserve room →'} disabled={unavailable || busy || offline} onPress={() => void reserve()} />
    <Text style={[styles.muted, { textAlign: 'center' }]}>Free for VKU students. A reminder is scheduled 15 minutes before your session when notifications are enabled.</Text>
  </ScrollView><BookingPass booking={bookings.find(b => b.id === passId)} onClose={() => setPassId(null)} /></View>;
}
