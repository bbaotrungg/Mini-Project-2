import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
export const colors = { bg: '#F5F7F6', ink: '#182D29', muted: '#6D7E78', green: '#207B61', pale: '#E5F2EC', border: '#E2E9E5', red: '#B55449' };
export const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 22, gap: 18, width: '100%', maxWidth: 700, alignSelf: 'center' },
  title: { color: colors.ink, fontSize: 30, fontWeight: '800', letterSpacing: -1 },
  heading: { color: colors.ink, fontSize: 19, fontWeight: '700' },
  text: { color: colors.ink, fontSize: 15, lineHeight: 23 },
  muted: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  eyebrow: { color: colors.green, fontSize: 11, letterSpacing: 2, fontWeight: '800' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  card: { backgroundColor: 'white', borderRadius: 20, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  input: { backgroundColor: 'white', borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 15, fontSize: 16, color: colors.ink },
});
export function Button({ title, onPress, disabled = false, secondary = false, danger = false }: { title: string; onPress: () => void; disabled?: boolean; secondary?: boolean; danger?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => ({ padding: 16, borderRadius: 14, alignItems: 'center', backgroundColor: secondary ? colors.pale : danger ? colors.red : colors.green, opacity: disabled ? 0.45 : pressed ? 0.8 : 1 })}>
    <Text style={{ color: secondary ? colors.green : 'white', fontSize: 15, fontWeight: '700' }}>{title}</Text>
  </Pressable>;
}
export function Chip({ label, selected = false, onPress, style }: { label: string; selected?: boolean; onPress: () => void; style?: ViewStyle }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={[{ paddingVertical: 9, paddingHorizontal: 14, borderRadius: 12, backgroundColor: selected ? colors.green : 'white', borderWidth: 1, borderColor: selected ? colors.green : colors.border }, style]}>
    <Text style={{ color: selected ? 'white' : colors.muted, fontSize: 13, fontWeight: '600' }}>{label}</Text>
  </Pressable>;
}
export function Empty({ title, detail }: { title: string; detail: string }) {
  return <View style={{ padding: 35, alignItems: 'center', gap: 10 }}><Text style={{ fontSize: 34 }}>📖</Text><Text style={styles.heading}>{title}</Text><Text style={[styles.muted, { textAlign: 'center' }]}>{detail}</Text></View>;
}
const ClockContext = createContext(Date.now());
export function ClockProvider({ children }: { children: React.ReactNode }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 15000);
    const listener = AppState.addEventListener('change', state => { if (state === 'active') setNow(Date.now()); });
    return () => { clearInterval(timer); listener.remove(); };
  }, []);
  return <ClockContext.Provider value={now}>{children}</ClockContext.Provider>;
}
export const useNow = () => useContext(ClockContext);
