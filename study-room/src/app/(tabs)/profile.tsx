import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBookingStore } from '../../store/useBookingStore';
import { SERVER_URL } from '../../services/realtime';
import { Button, colors, styles } from '../../ui';
export default function Profile() {
  const user = useBookingStore(s => s.user);
  const signOut = useBookingStore(s => s.signOut);
  const busy = useBookingStore(s => s.busy);
  const [error, setError] = useState('');
  return <SafeAreaView edges={['top']} style={styles.page}><ScrollView contentContainerStyle={styles.content}>
    <Text style={styles.eyebrow}>YOUR CAMPUS COMPANION</Text><Text style={styles.title}>My session.</Text>
    <View style={[styles.card, { padding: 24, gap: 12 }]}><Text style={{ fontSize: 35 }}>🎓</Text><Text style={styles.heading}>{user?.name}</Text><Text style={styles.muted}>VKU student demo session</Text></View>
    <Text style={styles.heading}>A simpler way to study</Text><Text style={styles.text}>Choose from buildings A, B, C, and V. Reserve a two-hour slot up to seven days ahead. Check in from 15 minutes before the session until it ends.</Text>
    <Text style={styles.heading}>Availability</Text><Text style={styles.text}>{SERVER_URL ? 'Shared mode: the included server broadcasts reservations to every connected device and validates each booking.' : 'Local demo mode: reservations are saved on this device. Start the included server and configure its URL to share availability across devices.'}</Text>
    <Text style={styles.heading}>Reminders</Text><Text style={styles.text}>Allow notifications to receive a check-in reminder 15 minutes before your session. If a session starts sooner, open your pass directly. Web previews do not send local notifications.</Text>
    <Text style={styles.muted}>Sample room inventory and illustrative photos. Name-based sessions and self check-in are for this mini-project demonstration.</Text>
    {!!error && <Text style={{ color: colors.red }}>{error}</Text>}<Button title="End student session" secondary disabled={busy} onPress={() => void signOut().catch(e => setError(e.message))} /><Text style={styles.muted}>Remove your reservations first so you don’t lose access to their passes.</Text>
  </ScrollView></SafeAreaView>;
}
