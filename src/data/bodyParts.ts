import type { BodyPartId, BodyPart } from '../store/types';

/** Fixed set of body parts an exercise can target. Not user-editable in v1. */
export const BODY_PARTS: BodyPart[] = [
  { id: 'legs', name: 'Ben' },
  { id: 'core', name: 'Core' },
  { id: 'back', name: 'Ryg' },
  { id: 'chest', name: 'Bryst' },
  { id: 'shoulders', name: 'Skuldre' },
  { id: 'arms', name: 'Arme' },
  { id: 'glutes', name: 'Balder' },
  { id: 'fullbody', name: 'Helkrop' },
  { id: 'cardio', name: 'Kondition' },
];

const BY_ID: Record<BodyPartId, BodyPart> = BODY_PARTS.reduce(
  (acc, part) => {
    acc[part.id] = part;
    return acc;
  },
  {} as Record<BodyPartId, BodyPart>,
);

export function bodyPartName(id: BodyPartId): string {
  return BY_ID[id]?.name ?? id;
}
