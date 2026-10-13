import React, { memo } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Room } from '../core';
import { roomPhotos } from '../data/photos';
import { colors, styles } from '../ui';
export const ROOM_CARD_HEIGHT = 318;
export const RoomCard = memo(function RoomCard({ room, occupied, onOpen }: { room: Room; occupied: boolean; onOpen: (id: string) => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`${room.name}, ${occupied ? 'Occupied' : 'Available Now'}, ${room.capacity} students`} onPress={() => onOpen(room.id)} style={[styles.card, { height: ROOM_CARD_HEIGHT - 16, marginBottom: 16 }]}>
    <Image source={roomPhotos[room.id]} style={{ height: 146, width: '100%', backgroundColor: colors.pale }} accessibilityLabel="Illustrative study space photo" />
    <View style={{ position: 'absolute', top: 12, left: 12, backgroundColor: 'white', borderRadius: 9, padding: 8 }}><Text style={{ color: occupied ? colors.red : colors.green, fontSize: 11, fontWeight: '800' }}>● {occupied ? 'Occupied' : 'Available Now'}</Text></View>
    <View style={{ padding: 16, gap: 8 }}>
      <View style={[styles.row, { justifyContent: 'space-between' }]}><Text style={styles.heading}>{room.name}</Text><Text style={{ color: colors.green, fontSize: 23 }}>↗</Text></View>
      <Text style={styles.muted}>Building {room.building} · Floor {room.floor} · {room.id.toUpperCase()}</Text>
      <View style={styles.row}><Text style={{ color: colors.green, backgroundColor: colors.pale, padding: 6, borderRadius: 7, fontSize: 12, fontWeight: '700' }}>{room.capacity} students</Text><Text numberOfLines={1} style={[styles.muted, { flex: 1, fontSize: 12 }]}>{room.equipment.join(' · ')}</Text></View>
    </View>
  </Pressable>;
});
