import React, { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from '../services/localNotifications';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useBookingStore } from '../store/useBookingStore';
import { connectRealtime, SERVER_URL } from '../services/realtime';
import { Button, ClockProvider, colors, styles } from '../ui';

function SessionGate({ children }: { children: React.ReactNode }) {
  const user = useBookingStore(s => s.user);
  const hydrated = useBookingStore(s => s.hydrated);
  const signIn = useBookingStore(s => s.signIn);
  const bookings = useBookingStore(s => s.bookings);
  const synced = useBookingStore(s => s.synced);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    if (!hydrated || Platform.OS === 'web' || (SERVER_URL && !synced)) return;
    // Remove reminders cancelled on another device, or left behind after an OS error.
    void Notifications.getAllScheduledNotificationsAsync().then(scheduled => {
      for (const notification of scheduled) {
        const id = notification.content.data?.bookingId;
        if (typeof id !== 'string') continue;
        const booking = bookings.find(b => b.id === id);
        if (!booking || booking.checkedIn) void Notifications.cancelScheduledNotificationAsync(notification.identifier).catch(() => {});
      }
    }).catch(() => {});
  }, [hydrated, bookings, synced]);
  useEffect(() => {
    if (!hydrated || !user || !SERVER_URL) return;
    return connectRealtime(user, bookings => useBookingStore.getState().receiveSnapshot(bookings), connected => useBookingStore.getState().setConnected(connected));
  }, [hydrated, user]);
  useEffect(() => {
    if (!hydrated || !user || Platform.OS === 'web') return;
    const open = (response: Notifications.NotificationResponse) => {
      const bookingId = response.notification.request.content.data?.bookingId;
      if (typeof bookingId === 'string') router.push({ pathname: '/bookings', params: { pass: bookingId } });
    };
    const subscription = Notifications.addNotificationResponseReceivedListener(open);
    void Notifications.getLastNotificationResponseAsync().then(response => { if (response) { open(response); void Notifications.clearLastNotificationResponseAsync().catch(() => {}); } }).catch(() => {});
    return () => subscription.remove();
  }, [hydrated, user]);
  if (!hydrated) return <View style={[styles.page, { justifyContent: 'center' }]}><ActivityIndicator color={colors.green} /></View>;
  if (user) return <>{children}</>;
  return <SafeAreaView style={styles.page}><KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView contentContainerStyle={[styles.content, { flexGrow: 1, justifyContent: 'center', gap: 24 }]} keyboardShouldPersistTaps="handled">
      <View style={{ backgroundColor: colors.green, width: 64, height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}><Text style={{ fontSize: 30 }}>📚</Text></View>
      <Text style={styles.eyebrow}>VKU STUDY SPACES</Text>
      <Text style={[styles.title, { fontSize: 42 }]}>A little space.{'\n'}A lot of progress.</Text>
      <Text style={styles.text}>Find your focus, bring your group, and book a room in a few taps.</Text>
      <View style={{ gap: 10 }}>
        <Text style={styles.heading}>What should we call you?</Text>
        <TextInput accessibilityLabel="Student name" value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={colors.muted} maxLength={40} style={styles.input} autoCapitalize="words" onSubmitEditing={() => { try { signIn(name); } catch (e) { setError((e as Error).message); } }} />
        {!!error && <Text style={{ color: colors.red }}>{error}</Text>}
        <Button title="Find my study space →" onPress={() => { try { signIn(name); } catch (e) { setError((e as Error).message); } }} />
      </View>
      <Text style={styles.muted}>Student demo session · saved on this device{SERVER_URL ? '\nShared room availability enabled' : '\nLocal demo · connect the included server for shared availability'}</Text>
    </ScrollView>
  </KeyboardAvoidingView></SafeAreaView>;
}
export default function RootLayout() {
  return <SafeAreaProvider><ClockProvider><StatusBar style="dark" /><SessionGate><Stack screenOptions={{ headerStyle: { backgroundColor: colors.bg }, headerTintColor: colors.ink, headerShadowVisible: false, contentStyle: { backgroundColor: colors.bg } }}><Stack.Screen name="(tabs)" options={{ headerShown: false }} /><Stack.Screen name="room/[id]" options={{ title: 'Your study space' }} /></Stack></SessionGate></ClockProvider></SafeAreaProvider>;
}
