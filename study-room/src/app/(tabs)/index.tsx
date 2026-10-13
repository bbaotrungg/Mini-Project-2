import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, ListRenderItem, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { rooms } from '../../data/rooms';
import { Equipment, isOccupied, matchesFilters, Room } from '../../core';
import { useBookingStore } from '../../store/useBookingStore';
import { SERVER_URL } from '../../services/realtime';
import { RoomCard, ROOM_CARD_HEIGHT } from '../../components/RoomCard';
import { Button, Chip, colors, Empty, styles, useNow } from '../../ui';
const equipment: Equipment[] = ['Projector', 'Whiteboard', 'High-spec PC', 'AC'];
const keyExtractor = (room: Room) => room.id;
const getItemLayout = (_: unknown, index: number) => ({ length: ROOM_CARD_HEIGHT, offset: ROOM_CARD_HEIGHT * index, index });
export default function Discover() {
  const user = useBookingStore(s => s.user);
  const filters = useBookingStore(s => s.filters);
  const bookings = useBookingStore(s => s.bookings);
  const connected = useBookingStore(s => s.connected);
  const synced = useBookingStore(s => s.synced);
  const setFilters = useBookingStore(s => s.setFilters);
  const resetFilters = useBookingStore(s => s.resetFilters);
  const [showFilters, setShowFilters] = useState(false);
  const now = useNow();
  const filtered = useMemo(() => rooms.filter(room => matchesFilters(room, filters)), [filters]);
  const openRoom = useCallback((id: string) => router.push({ pathname: '/room/[id]', params: { id } }), []);
  const renderItem: ListRenderItem<Room> = useCallback(({ item }) => <RoomCard room={item} occupied={isOccupied(item.id, bookings, now)} onOpen={openRoom} />, [bookings, now, openRoom]);
  const filterCount = filters.equipment.length + (filters.capacity > 2 ? 1 : 0);
  return <SafeAreaView edges={['top']} style={styles.page}>
    <View style={[styles.content, { paddingBottom: 10, gap: 15 }]}>
      <View style={[styles.row, { justifyContent: 'space-between' }]}><Text style={styles.eyebrow}>VKU / STUDY SPACES</Text><Text style={{ color: colors.green, fontSize: 12, fontWeight: '700' }}>{SERVER_URL ? connected && synced ? '● Live' : '○ Reconnecting' : '● Local demo'}</Text></View>
      <View><Text style={styles.muted}>Hello, {user?.name.split(' ')[0]} 👋</Text><Text style={styles.title}>Find your focus.</Text></View>
      <View style={styles.row}><TextInput accessibilityLabel="Search rooms" style={[styles.input, { flex: 1 }]} placeholder="Search rooms, labs, spaces…" placeholderTextColor={colors.muted} value={filters.search} onChangeText={search => setFilters({ search })} /><Pressable accessibilityRole="button" accessibilityLabel="Capacity and equipment filters" onPress={() => setShowFilters(true)} style={{ padding: 16, borderRadius: 14, backgroundColor: colors.green }}><Text style={{ color: 'white', fontWeight: '700' }}>☷ {filterCount || ''}</Text></Pressable></View>
      <View style={styles.wrap}><Chip label="All buildings" selected={!filters.building} onPress={() => setFilters({ building: null })} />{['A', 'B', 'C', 'V'].map(building => <Chip key={building} label={building} selected={filters.building === building} onPress={() => setFilters({ building: filters.building === building ? null : building })} />)}</View>
      <View style={[styles.row, { justifyContent: 'space-between' }]}><Text style={styles.heading}>{filtered.length} study spaces</Text><Pressable accessibilityRole="button" onPress={resetFilters}><Text style={{ color: colors.green, fontSize: 13 }}>Reset filters</Text></Pressable></View>
    </View>
    <FlatList data={filtered} renderItem={renderItem} keyExtractor={keyExtractor} getItemLayout={getItemLayout} initialNumToRender={4} maxToRenderPerBatch={4} windowSize={5} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 8, paddingBottom: 16, maxWidth: 700, width: '100%', alignSelf: 'center' }} ListEmptyComponent={<Empty title="No rooms found" detail="Try another building or lower the minimum capacity." />} />
    <Modal visible={showFilters} transparent animationType="slide" onRequestClose={() => setShowFilters(false)}>
      <View style={{ flex: 1, backgroundColor: '#12291F99', justifyContent: 'flex-end' }}><ScrollView contentContainerStyle={{ padding: 25, gap: 22 }} style={{ flexGrow: 0, backgroundColor: colors.bg, borderTopLeftRadius: 25, borderTopRightRadius: 25, maxHeight: '85%' }}>
        <Text style={styles.title}>Your kind of space.</Text>
        <Text style={styles.muted}>Filters update instantly. Rooms must match every selected item.</Text>
        <Text style={styles.heading}>Minimum capacity · {filters.capacity} students</Text>
        <View style={styles.wrap}>{Array.from({ length: 19 }, (_, i) => i + 2).map(capacity => <Chip key={capacity} label={`${capacity}`} selected={capacity === filters.capacity} onPress={() => setFilters({ capacity })} />)}</View>
        <Text style={styles.heading}>Equipment</Text>
        <View style={styles.wrap}>{equipment.map(item => <Chip key={item} label={item} selected={filters.equipment.includes(item)} onPress={() => setFilters({ equipment: filters.equipment.includes(item) ? filters.equipment.filter(e => e !== item) : [...filters.equipment, item] })} />)}</View>
        <Button title={`Show ${filtered.length} rooms`} onPress={() => setShowFilters(false)} /><Button title="Reset all filters" secondary onPress={resetFilters} />
      </ScrollView></View>
    </Modal>
  </SafeAreaView>;
}
