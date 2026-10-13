import React, { useState } from 'react';
import { Modal, ScrollView, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Booking, checkInError, dateLabel, slotLabel } from '../core';
import { rooms } from '../data/rooms';
import { useBookingStore } from '../store/useBookingStore';
import { Button, colors, styles, useNow } from '../ui';
export function BookingPass({ booking, onClose }: { booking: Booking | undefined; onClose: () => void }) {
  const checkIn = useBookingStore(s => s.checkIn);
  const busy = useBookingStore(s => s.busy);
  const [error, setError] = useState('');
  const now = useNow();
  if (!booking) return null;
  const room = rooms.find(r => r.id === booking.roomId)!;
  const blocked = checkInError(booking, now);
  return <Modal visible transparent animationType="slide" onRequestClose={onClose}>
    <View style={{ flex: 1, backgroundColor: '#12291FCC', justifyContent: 'center', padding: 24 }}>
      <ScrollView style={{ flexGrow: 0, borderRadius: 24, backgroundColor: 'white', maxWidth: 440, width: '100%', alignSelf: 'center' }} contentContainerStyle={{ padding: 25, gap: 16, alignItems: 'center' }}>
        <Text style={styles.eyebrow}>VKU · YOUR BOOKING PASS</Text>
        <Text style={styles.heading}>{room.name}</Text>
        <Text style={styles.muted}>{dateLabel(booking.date)} · {slotLabel(booking.slotId)}</Text>
        <View style={{ padding: 18, backgroundColor: 'white', borderWidth: 1, borderColor: colors.border, borderRadius: 18 }}>
          <QRCode value={JSON.stringify({ version: 1, bookingId: booking.id, roomId: booking.roomId, date: booking.date, slotId: booking.slotId })} size={190} color={colors.ink} />
        </View>
        <Text selectable style={{ fontFamily: 'monospace', fontSize: 10, color: colors.muted }}>{booking.id}</Text>
        <Text style={[styles.muted, { textAlign: 'center' }]}>{booking.checkedIn ? '✓ You’re checked in. Have a productive session!' : 'Show this pass at your room. Use the button below to check in during the check-in window.'}</Text>
        {blocked && !booking.checkedIn && <Text style={[styles.muted, { textAlign: 'center' }]}>{blocked}</Text>}
        {!!error && <Text accessibilityRole="alert" style={{ color: colors.red }}>{error}</Text>}
        <View style={{ width: '100%', gap: 10 }}>
          <Button title={booking.checkedIn ? 'Checked in ✓' : busy ? 'Checking in…' : 'Check in'} disabled={!!blocked || busy} onPress={() => { setError(''); void checkIn(booking.id).catch(e => setError(e.message)); }} />
          <Button title="Close pass" secondary onPress={() => { setError(''); onClose(); }} />
        </View>
      </ScrollView>
    </View>
  </Modal>;
}
