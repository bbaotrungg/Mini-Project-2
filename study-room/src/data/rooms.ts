import { Room } from '../core';

// Sample campus inventory. Photos illustrate room types, not actual VKU rooms.
export const rooms: Room[] = [
  { id: 'a201', name: 'The Quiet Corner', building: 'A', floor: 2, capacity: 4, equipment: ['Whiteboard', 'AC'], photo: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&q=80', description: 'A calm spot for focused work and small study groups.' },
  { id: 'a302', name: 'Collaboration Studio', building: 'A', floor: 3, capacity: 8, equipment: ['Projector', 'Whiteboard', 'AC'], photo: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80', description: 'Spread out, share ideas, and prepare your next presentation.' },
  { id: 'b101', name: 'Code Lab', building: 'B', floor: 1, capacity: 20, equipment: ['High-spec PC', 'Projector', 'AC'], photo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80', description: 'A computer lab for coding sessions and team projects.' },
  { id: 'b204', name: 'Pair Study', building: 'B', floor: 2, capacity: 2, equipment: ['Whiteboard', 'AC'], photo: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&q=80', description: 'Your little space for a productive study session.' },
  { id: 'c301', name: 'Ideas Room', building: 'C', floor: 3, capacity: 12, equipment: ['Projector', 'Whiteboard', 'AC'], photo: 'https://images.unsplash.com/photo-1497366858526-0766cadbe8fa?w=800&q=80', description: 'A bright room for workshops and group discussions.' },
  { id: 'v102', name: 'Digital Workshop', building: 'V', floor: 1, capacity: 16, equipment: ['High-spec PC', 'Projector', 'Whiteboard', 'AC'], photo: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80', description: 'Everything your group needs to build something together.' },
  { id: 'c102', name: 'Focus Nook', building: 'C', floor: 1, capacity: 6, equipment: ['Whiteboard'], photo: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&q=80', description: 'An informal room for revision and reading.' },
  { id: 'v203', name: 'Presentation Room', building: 'V', floor: 2, capacity: 10, equipment: ['Projector', 'AC'], photo: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80', description: 'Practice your pitch in a comfortable group space.' },
];
